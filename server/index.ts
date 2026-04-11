import express from "express";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import multer from "multer";
import { Rest as AblyRest } from "ably";
import { put } from "@vercel/blob";
import dotenv from "dotenv";
import { pool, initSchema } from "./db.js";
import type { Request, Response, NextFunction } from "express";

dotenv.config();

const FRONTEND_ORIGIN = "http://localhost:5173";
const API_PORT = Number(process.env.PORT) || 3001;
const CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:3001/api/auth/google/callback";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export type DbUser = {
  id: string;
  google_id: string;
  email: string | null;
  name: string;
  avatar_url: string | null;
  city: string | null;
  lat: number | null;
  lng: number | null;
  height: number | null;
  gender: string | null;
  bio: string | null;
  tags: unknown;
  personality_humor: number;
  personality_energy: number;
  personality_lifestyle: number;
  personality_first_step: number;
  personality_love_language: number;
  personality_weekend: number;
  show_on_map: boolean;
  pref_gender: string;
  pref_age_min: number;
  pref_age_max: number;
  pref_distance_km: number;
  pref_height_min: number;
  pref_height_max: number;
  vibration_enabled: boolean;
  notifications_enabled: boolean;
  birth_date: string | null;
  extra_photos: unknown;
  abstract_qa: unknown;
  created_at: Date;
  updated_at: Date;
};

function rowToUser(row: Record<string, unknown>): DbUser {
  return row as unknown as DbUser;
}

function publicUser(u: DbUser) {
  return {
    id: u.id,
    name: u.name,
    avatar_url: u.avatar_url,
    city: u.city,
    lat: u.lat,
    lng: u.lng,
    height: u.height,
    gender: u.gender,
    bio: u.bio,
    tags: u.tags,
    personality_humor: u.personality_humor,
    personality_energy: u.personality_energy,
    personality_lifestyle: u.personality_lifestyle,
    personality_first_step: u.personality_first_step,
    personality_love_language: u.personality_love_language,
    personality_weekend: u.personality_weekend,
    show_on_map: u.show_on_map,
    pref_gender: u.pref_gender,
    pref_age_min: u.pref_age_min,
    pref_age_max: u.pref_age_max,
    pref_distance_km: u.pref_distance_km,
    pref_height_min: u.pref_height_min,
    pref_height_max: u.pref_height_max,
    vibration_enabled: u.vibration_enabled,
    notifications_enabled: u.notifications_enabled,
    birth_date: u.birth_date,
    extra_photos: u.extra_photos,
    abstract_qa: u.abstract_qa,
    email: u.email,
  };
}

function publicOtherUser(u: DbUser) {
  const { google_id: _g, email: _e, ...rest } = u;
  return rest;
}

function sortPair(a: string, b: string): [string, string] {
  return a < b ? [a, b] : [b, a];
}

function ageFromBirth(birth: string | null): number | null {
  if (!birth) return null;
  const d = new Date(birth);
  const diff = Date.now() - d.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

declare global {
  namespace Express {
    interface User extends DbUser {}
  }
}

passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const r = await pool.query<Record<string, unknown>>("SELECT * FROM users WHERE id = $1", [id]);
    if (!r.rows[0]) return done(null, false);
    done(null, rowToUser(r.rows[0]));
  } catch (e) {
    done(e);
  }
});

const clientId = process.env.google_oauth_client_id;
const clientSecret = process.env.google_oauth_client_secret;

if (clientId && clientSecret) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: clientId,
        clientSecret: clientSecret,
        callbackURL: CALLBACK_URL,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const googleId = profile.id;
          const email = profile.emails?.[0]?.value ?? null;
          const name = profile.displayName || profile.name?.givenName || "Kullanıcı";
          const avatar = profile.photos?.[0]?.value ?? null;

          const existing = await pool.query("SELECT * FROM users WHERE google_id = $1", [googleId]);
          if (existing.rows[0]) {
            await pool.query(
              `UPDATE users SET email = COALESCE($1, email), name = $2, avatar_url = COALESCE($3, avatar_url), updated_at = NOW() WHERE google_id = $4`,
              [email, name, avatar, googleId]
            );
            const u = await pool.query("SELECT * FROM users WHERE google_id = $1", [googleId]);
            return done(null, rowToUser(u.rows[0]));
          }

          const ins = await pool.query(
            `INSERT INTO users (google_id, email, name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *`,
            [googleId, email, name, avatar]
          );
          return done(null, rowToUser(ins.rows[0]));
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );
}

const app = express();
app.set("trust proxy", 1);
app.use(
  cors({
    origin: FRONTEND_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(
  session({
    name: "dambul.sid",
    secret: process.env.SESSION_SECRET || "dev-session-secret-change",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: false,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

function requireLogin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Giriş gerekli" });
  next();
}

app.get("/api/auth/google", (req, res, next) => {
  if (!clientId || !clientSecret) {
    return res.status(503).json({ error: "Google OAuth yapılandırılmadı" });
  }
  passport.authenticate("google", { scope: ["profile", "email"] })(req, res, next);
});

app.get(
  "/api/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${FRONTEND_ORIGIN}/login`,
    session: true,
  }),
  (_req, res) => {
    res.redirect(`${FRONTEND_ORIGIN}/map`);
  }
);

app.get("/api/auth/me", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Giriş gerekli" });
  res.json(publicUser(req.user));
});

app.post("/api/auth/logout", (req, res) => {
  req.logout((err) => {
    if (err) return res.status(500).json({ error: "Çıkış başarısız" });
    req.session.destroy((destroyErr) => {
      if (destroyErr) return res.status(500).json({ error: "Çıkış başarısız" });
      res.clearCookie("dambul.sid", { path: "/" });
      res.json({ ok: true });
    });
  });
});

app.post("/api/upload", requireLogin, upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: "Dosya yok" });
    const token = process.env.BLOB_READ_WRITE_TOKEN;
    if (token) {
      const blob = await put(file.originalname || `upload-${Date.now()}`, file.buffer, {
        access: "public",
        token,
      });
      return res.json({ url: blob.url });
    }
    const dir = path.join(process.cwd(), "uploads");
    await fs.mkdir(dir, { recursive: true });
    const ext = path.extname(file.originalname || "");
    const safeExt = ext && /^\.(jpe?g|png|gif|webp|avif)$/i.test(ext) ? ext.toLowerCase() : ".jpg";
    const name = `${randomUUID()}${safeExt}`;
    await fs.writeFile(path.join(dir, name), file.buffer);
    const base = process.env.PUBLIC_API_URL || `http://localhost:${API_PORT}`;
    res.json({ url: `${base}/uploads/${name}` });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Yükleme başarısız" });
  }
});

app.patch("/api/users/me", requireLogin, async (req, res) => {
  try {
    const b = req.body as Record<string, unknown>;
    const allowed = [
      "name",
      "avatar_url",
      "city",
      "lat",
      "lng",
      "height",
      "gender",
      "bio",
      "tags",
      "personality_humor",
      "personality_energy",
      "personality_lifestyle",
      "personality_first_step",
      "personality_love_language",
      "personality_weekend",
      "show_on_map",
      "pref_gender",
      "pref_age_min",
      "pref_age_max",
      "pref_distance_km",
      "pref_height_min",
      "pref_height_max",
      "vibration_enabled",
      "notifications_enabled",
      "birth_date",
      "extra_photos",
      "abstract_qa",
    ] as const;
    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    for (const key of allowed) {
      if (key in b) {
        sets.push(`${key} = $${i++}`);
        vals.push(b[key]);
      }
    }
    const me = req.user!;
    if (sets.length === 0) return res.json(publicUser(me));
    sets.push(`updated_at = NOW()`);
    vals.push(me.id);
    const q = `UPDATE users SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`;
    const r = await pool.query(q, vals);
    const u = rowToUser(r.rows[0]);
    req.login(u, (err) => {
      if (err) return res.status(500).json({ error: "Oturum güncellenemedi" });
      res.json(publicUser(u));
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Güncelleme başarısız" });
  }
});

app.get("/api/users/map", requireLogin, async (req, res) => {
  if (!req.user) return res.status(401).end();
  const r = await pool.query(
    `SELECT id, name, avatar_url, lat, lng FROM users
     WHERE show_on_map = true AND lat IS NOT NULL AND lng IS NOT NULL AND id != $1`,
    [req.user.id]
  );
  res.json(r.rows);
});

app.get("/api/users/swipe", requireLogin, async (req, res) => {
  if (!req.user) return res.status(401).end();
  const gender = (req.query.gender as string) || "all";
  const params: unknown[] = [req.user.id];
  let genderFilter = "";
  if (gender === "female" || gender === "Kadın") {
    genderFilter = " AND gender = 'female' ";
  } else if (gender === "male" || gender === "Erkek") {
    genderFilter = " AND gender = 'male' ";
  } else if (gender === "other" || gender === "Diğer") {
    genderFilter = " AND gender = 'other' ";
  }
  const r = await pool.query(
    `SELECT u.* FROM users u
     WHERE u.id != $1
     AND u.id NOT IN (SELECT to_user FROM likes WHERE from_user = $1)
     ${genderFilter}
     ORDER BY RANDOM()
     LIMIT 50`,
    params
  );
  const out = r.rows.map((row) => {
    const u = rowToUser(row);
    return {
      ...publicOtherUser(u),
      age: ageFromBirth(u.birth_date),
    };
  });
  res.json(out);
});

app.post("/api/likes", requireLogin, async (req, res) => {
  if (!req.user) return res.status(401).end();
  const { to_user, type } = req.body as { to_user?: string; type?: string };
  if (!to_user || !type) return res.status(400).json({ error: "Eksik parametre" });
  if (to_user === req.user.id) return res.status(400).json({ error: "Geçersiz" });

  await pool.query(
    `INSERT INTO likes (from_user, to_user, type) VALUES ($1, $2, $3)
     ON CONFLICT (from_user, to_user) DO UPDATE SET type = EXCLUDED.type`,
    [req.user.id, to_user, type]
  );

  await pool.query(
    `INSERT INTO notifications (user_id, actor_id, action) VALUES ($1, $2, $3)`,
    [to_user, req.user.id, "seni beğendi"]
  );

  const mutual = await pool.query(
    `SELECT 1 FROM likes WHERE from_user = $1 AND to_user = $2`,
    [to_user, req.user.id]
  );

  let threadId: string | null = null;
  if (mutual.rows.length > 0) {
    const [a, b] = sortPair(req.user.id, to_user);
    const th = await pool.query(
      `INSERT INTO chat_threads (user_a, user_b) VALUES ($1, $2)
       ON CONFLICT (user_a, user_b) DO NOTHING
       RETURNING id`,
      [a, b]
    );
    if (th.rows[0]) threadId = String(th.rows[0].id);
    else {
      const ex = await pool.query(`SELECT id FROM chat_threads WHERE user_a = $1 AND user_b = $2`, [a, b]);
      threadId = ex.rows[0] ? String(ex.rows[0].id) : null;
    }
  }

  res.json({ ok: true, matched: mutual.rows.length > 0, thread_id: threadId });
});

app.get("/api/chat/threads", requireLogin, async (req, res) => {
  if (!req.user) return res.status(401).end();
  const uid = req.user.id;
  const r = await pool.query(
    `SELECT t.id, t.created_at,
            CASE WHEN t.user_a = $1 THEN t.user_b ELSE t.user_a END AS other_id
     FROM chat_threads t
     WHERE t.user_a = $1 OR t.user_b = $1
     ORDER BY t.created_at DESC`,
    [uid]
  );
  const out = [];
  for (const row of r.rows) {
    const otherId = row.other_id as string;
    const u = await pool.query("SELECT id, name, avatar_url, city FROM users WHERE id = $1", [otherId]);
    const last = await pool.query(
      `SELECT body, created_at FROM messages WHERE thread_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [row.id]
    );
    out.push({
      thread_id: row.id,
      other: u.rows[0],
      last_message: last.rows[0]?.body ?? null,
      last_at: last.rows[0]?.created_at ?? null,
    });
  }
  res.json(out);
});

app.get("/api/chat/:threadId/messages", requireLogin, async (req, res) => {
  if (!req.user) return res.status(401).end();
  const { threadId } = req.params;
  const p = await pool.query(
    `SELECT id FROM chat_threads WHERE id = $1 AND (user_a = $2 OR user_b = $2)`,
    [threadId, req.user.id]
  );
  if (!p.rows.length) return res.status(403).json({ error: "Erişim yok" });
  const m = await pool.query(
    `SELECT id, sender_id, body, created_at FROM messages WHERE thread_id = $1 ORDER BY created_at ASC`,
    [threadId]
  );
  res.json(m.rows);
});

app.post("/api/chat/:threadId/messages", requireLogin, async (req, res) => {
  if (!req.user) return res.status(401).end();
  const { threadId } = req.params;
  const { body } = req.body as { body?: string };
  if (!body?.trim()) return res.status(400).json({ error: "Mesaj boş" });
  const p = await pool.query(
    `SELECT id FROM chat_threads WHERE id = $1 AND (user_a = $2 OR user_b = $2)`,
    [threadId, req.user.id]
  );
  if (!p.rows.length) return res.status(403).json({ error: "Erişim yok" });
  const ins = await pool.query(
    `INSERT INTO messages (thread_id, sender_id, body) VALUES ($1, $2, $3) RETURNING *`,
    [threadId, req.user.id, body.trim()]
  );
  const ablyKey = process.env.ably_token;
  if (ablyKey) {
    try {
      const rest = new AblyRest({ key: ablyKey });
      const channel = rest.channels.get(`chat:${threadId}`);
      await channel.publish("message", ins.rows[0]);
    } catch (e) {
      console.error("Ably publish", e);
    }
  }
  res.json(ins.rows[0]);
});

app.post("/api/chat/threads", requireLogin, async (req, res) => {
  if (!req.user) return res.status(401).end();
  const { other_user_id } = req.body as { other_user_id?: string };
  if (!other_user_id) return res.status(400).json({ error: "Eksik" });
  const [a, b] = sortPair(req.user.id, other_user_id);
  const th = await pool.query(
    `INSERT INTO chat_threads (user_a, user_b) VALUES ($1, $2)
     ON CONFLICT (user_a, user_b) DO NOTHING
     RETURNING id`,
    [a, b]
  );
  if (th.rows[0]) return res.json({ thread_id: th.rows[0].id });
  const ex = await pool.query(`SELECT id FROM chat_threads WHERE user_a = $1 AND user_b = $2`, [a, b]);
  res.json({ thread_id: ex.rows[0].id });
});

app.get("/api/ably/token", requireLogin, async (req, res) => {
  try {
    const key = process.env.ably_token;
    if (!key) return res.status(500).json({ error: "Ably yapılandırması eksik" });
    const rest = new AblyRest({ key });
    const auth = rest.auth as unknown as {
      createTokenRequest: (
        params: { clientId: string },
        cb: (err: Error | null, result?: Record<string, unknown>) => void
      ) => void;
    };
    const tokenRequest = await new Promise<Record<string, unknown>>((resolve, reject) => {
      auth.createTokenRequest({ clientId: req.user!.id }, (err, result) => {
        if (err || !result) reject(err || new Error("token"));
        else resolve(result);
      });
    });
    res.json(tokenRequest);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Token alınamadı" });
  }
});

app.get("/api/scene/posts", requireLogin, async (_req, res) => {
  const r = await pool.query(
    `SELECT p.*, u.name AS author_name, u.avatar_url AS author_avatar, u.city AS author_city
     FROM scene_posts p
     JOIN users u ON u.id = p.user_id
     ORDER BY p.created_at DESC`
  );
  res.json(r.rows);
});

app.post("/api/scene/posts", requireLogin, async (req, res) => {
  if (!req.user) return res.status(401).end();
  const { title, location_tag } = req.body as { title?: string; location_tag?: string };
  if (!title?.trim()) return res.status(400).json({ error: "Başlık gerekli" });
  const ins = await pool.query(
    `INSERT INTO scene_posts (user_id, title, location_tag) VALUES ($1, $2, $3) RETURNING *`,
    [req.user.id, title.trim(), location_tag ?? null]
  );
  res.json(ins.rows[0]);
});

app.get("/api/scene/posts/:postId", requireLogin, async (req, res) => {
  const r = await pool.query(
    `SELECT p.*, u.name AS author_name, u.avatar_url AS author_avatar, u.city AS author_city, u.tags AS author_tags
     FROM scene_posts p
     JOIN users u ON u.id = p.user_id
     WHERE p.id = $1`,
    [req.params.postId]
  );
  if (!r.rows.length) return res.status(404).json({ error: "Bulunamadı" });
  res.json(r.rows[0]);
});

app.get("/api/notifications", requireLogin, async (req, res) => {
  if (!req.user) return res.status(401).end();
  const r = await pool.query(
    `SELECT n.*, u.name AS actor_name, u.avatar_url AS actor_avatar
     FROM notifications n
     LEFT JOIN users u ON u.id = n.actor_id
     WHERE n.user_id = $1
     ORDER BY n.created_at DESC`,
    [req.user.id]
  );
  res.json(r.rows);
});

app.patch("/api/notifications/read", requireLogin, async (req, res) => {
  if (!req.user) return res.status(401).end();
  await pool.query(`UPDATE notifications SET read = true WHERE user_id = $1`, [req.user.id]);
  res.json({ ok: true });
});

app.get("/api/notifications/unread-count", requireLogin, async (req, res) => {
  if (!req.user) return res.status(401).end();
  const c = await pool.query(
    `SELECT COUNT(*)::int AS n FROM notifications WHERE user_id = $1 AND read = false`,
    [req.user.id]
  );
  res.json({ count: c.rows[0].n });
});

app.get("/api/users/:userId", requireLogin, async (req, res) => {
  const r = await pool.query("SELECT * FROM users WHERE id = $1", [req.params.userId]);
  if (!r.rows.length) return res.status(404).json({ error: "Bulunamadı" });
  const u = rowToUser(r.rows[0]);
  res.json({
    ...publicOtherUser(u),
    age: ageFromBirth(u.birth_date),
    email: req.user?.id === u.id ? u.email : undefined,
  });
});

app.post("/api/profile-views", requireLogin, async (req, res) => {
  if (!req.user) return res.status(401).end();
  const { viewed_id } = req.body as { viewed_id?: string };
  if (!viewed_id || viewed_id === req.user.id) return res.json({ ok: true });
  await pool.query(
    `INSERT INTO notifications (user_id, actor_id, action) VALUES ($1, $2, $3)`,
    [viewed_id, req.user.id, "profilini görüntüledi"]
  );
  res.json({ ok: true });
});

async function start() {
  await initSchema();
  app.listen(API_PORT, () => {
    console.log(`API http://localhost:${API_PORT}`);
    if (clientId && clientSecret) {
      console.log(
        `Google OAuth — bu adresi Cloud Console → OAuth istemcisi → "Yetkilendirilmiş yönlendirme URI'leri"ne ekleyin:\n  ${CALLBACK_URL}`
      );
    }
  });
}

start().catch((e) => {
  console.error(e);
  process.exit(1);
});
