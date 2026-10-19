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
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import { pool, initSchema } from "./db.js";
import type { Request, Response, NextFunction } from "express";

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || "dambul-jwt-secret-change-in-prod";

function signToken(userId: string): string {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "30d" });
}

function verifyToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { sub: string };
    return payload.sub;
  } catch {
    return null;
  }
}

const FRONTEND_ORIGIN =
  process.env.FRONTEND_ORIGIN ||
  (process.env.NODE_ENV === "production"
    ? "https://dambul.onrender.com"
    : "http://localhost:5173");
const CLOUDINARY_CLOUD =
  process.env.cloudinary_cloud_name || process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_KEY = process.env.cloudinary_api_key || process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_SECRET =
  process.env.cloudinary_api_secret || process.env.CLOUDINARY_API_SECRET;

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD,
  api_key: CLOUDINARY_KEY,
  api_secret: CLOUDINARY_SECRET,
});

const API_PORT = Number(process.env.PORT) || 3001;
const CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:3001/api/auth/google/callback";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_UPLOAD_BYTES },
});

function isCloudinaryReady(): boolean {
  return Boolean(CLOUDINARY_CLOUD && CLOUDINARY_KEY && CLOUDINARY_SECRET);
}

function publicBaseUrl(req: Request): string {
  const forwarded = req.headers["x-forwarded-proto"];
  const proto =
    (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim() ||
    req.protocol ||
    "http";
  const host = req.get("host") || `localhost:${API_PORT}`;
  return `${proto}://${host}`;
}

function isLoopbackUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
  } catch {
    return false;
  }
}

function getGoogleCallbackUrl(req?: Request, mobile = false): string {
  const configuredCallbackUrl = process.env.GOOGLE_CALLBACK_URL;
  if (mobile) {
    return configuredCallbackUrl || "https://dambul.onrender.com/api/auth/google/callback";
  }
  if (req && isLoopbackUrl(`${req.protocol}://${req.hostname}`)) {
    return `http://localhost:${API_PORT}/api/auth/google/callback`;
  }
  if (configuredCallbackUrl) {
    return configuredCallbackUrl;
  }
  if (req) {
    return `${publicBaseUrl(req)}/api/auth/google/callback`;
  }
  return configuredCallbackUrl || CALLBACK_URL;
}

function getFrontendOrigin(req?: Request): string {
  if (req && isLoopbackUrl(`${req.protocol}://${req.hostname}`)) {
    return "http://localhost:5173";
  }
  return FRONTEND_ORIGIN;
}

async function persistImageBuffer(
  req: Request,
  buffer: Buffer,
  mime = "image/jpeg"
): Promise<{ url: string; public_id: string | null }> {
  if (!buffer?.length) {
    throw new Error("empty");
  }
  if (buffer.length > MAX_UPLOAD_BYTES) {
    throw new Error("too_large");
  }

  if (isCloudinaryReady()) {
    try {
      const result = await new Promise<{ secure_url: string; public_id: string }>(
        (resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: "dambull",
              resource_type: "image",
              format: "jpg",
              transformation: [
                { width: 1600, height: 1600, crop: "limit", quality: "auto:good" },
              ],
            },
            (err, uploaded) => {
              if (err || !uploaded?.secure_url) {
                reject(err || new Error("Cloudinary yanıtı boş"));
                return;
              }
              resolve({
                secure_url: uploaded.secure_url,
                public_id: uploaded.public_id,
              });
            }
          );
          stream.end(buffer);
        }
      );
      return { url: result.secure_url, public_id: result.public_id };
    } catch (err) {
      console.error("[upload] Cloudinary başarısız, yerel depolama:", err);
    }
  }

  const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
  const filename = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), buffer);
  return {
    url: `${publicBaseUrl(req)}/uploads/${filename}`,
    public_id: `local/${filename}`,
  };
}

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

const clientId = process.env.google_oauth_client_id || process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.google_oauth_client_secret || process.env.GOOGLE_CLIENT_SECRET;

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
          await pool.query(
            `INSERT INTO user_profiles (user_id, preferred_gender) VALUES ($1, 'everyone') ON CONFLICT (user_id) DO NOTHING`,
            [ins.rows[0].id]
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
    origin: (origin, callback) => callback(null, true),
    credentials: true,
  })
);
app.use(express.json({ limit: "8mb" }));
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
      secure: process.env.NODE_ENV === "production",
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());

/** Global middleware: check Bearer token when no session cookie */
async function resolveTokenUser(req: Request, _res: Response, next: NextFunction) {
  if (req.user) return next(); // already resolved via session
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    const token = auth.slice(7);
    const userId = verifyToken(token);
    if (userId) {
      try {
        const r = await pool.query<Record<string, unknown>>("SELECT * FROM users WHERE id = $1", [userId]);
        if (r.rows[0]) {
          (req as any).user = rowToUser(r.rows[0]);
        }
      } catch { /* ignore */ }
    }
  }
  next();
}

app.use(resolveTokenUser);

function requireLogin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) return res.status(401).json({ error: "Giriş gerekli" });
  next();
}

app.post("/api/auth/dev-login", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(403).json({ error: "Test girişi canlı ortamda kapalıdır" });
  }
  try {
    let r = await pool.query("SELECT * FROM users ORDER BY created_at ASC LIMIT 1");

    // Kullanıcı yoksa otomatik seed kullanıcısı oluştur
    if (!r.rows[0]) {
      console.log("[dev-login] Kullanıcı bulunamadı — otomatik test kullanıcısı oluşturuluyor...");
      const devGoogleId = "dev-test-user-001";
      const ins = await pool.query(
        `INSERT INTO users (google_id, email, name, avatar_url, city, lat, lng, gender, bio, show_on_map)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (google_id) DO UPDATE SET name = EXCLUDED.name
         RETURNING *`,
        [
          devGoogleId,
          "dev@dambul.app",
          "Dev Kullanıcı",
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&auto=format&fit=crop&q=80",
          "İstanbul",
          41.015137,
          28.979530,
          "male",
          "Geliştirici test hesabı 🚀",
          true,
        ]
      );
      await pool.query(
        `INSERT INTO user_profiles (user_id, preferred_gender) VALUES ($1, 'everyone') ON CONFLICT (user_id) DO NOTHING`,
        [ins.rows[0].id]
      );
      r = await pool.query("SELECT * FROM users WHERE google_id = $1", [devGoogleId]);
      console.log(`[dev-login] Test kullanıcısı oluşturuldu: ${r.rows[0].id}`);
    }

    const user = rowToUser(r.rows[0]);
    await pool.query(
      `INSERT INTO user_profiles (user_id, preferred_gender) VALUES ($1, 'everyone') ON CONFLICT (user_id) DO NOTHING`,
      [user.id]
    );
    const token = signToken(user.id);
    req.login(user, (err) => {
      if (err) return res.status(500).json({ error: "Giriş başarısız" });
      res.json({ ok: true, user: publicUser(user), token });
    });
  } catch (e) {
    console.error("[dev-login] Hata:", e);
    res.status(500).json({ error: "Sunucu hatası" });
  }
});

app.get("/api/auth/google", (req, res, next) => {
  if (!clientId || !clientSecret) {
    return res.status(503).json({ error: "Google OAuth yapılandırılmadı" });
  }
  // mobile_redirect_uri: Expo'nun Linking.createURL() çıktısı (exp://... veya dambul://...)
  const mobileRedirectUri = req.query.mobile_redirect_uri as string | undefined;
  const callbackURL = getGoogleCallbackUrl(req, Boolean(mobileRedirectUri));
  if (mobileRedirectUri) {
    let callback: URL;
    try {
      callback = new URL(callbackURL);
    } catch {
      console.error(`[google-auth] Geçersiz mobil callback URI: ${callbackURL}`);
      return res.status(400).json({
        error: "Mobil Google OAuth callback adresi geçersiz. HTTPS tünel adresi kullanın.",
      });
    }
    if (callback.protocol !== "https:" || isLoopbackUrl(callbackURL)) {
      console.error(
        `[google-auth] Mobil OAuth için HTTPS ve localhost olmayan public callback gerekli. ` +
          `Mevcut URI: ${callbackURL}. GOOGLE_CALLBACK_URL değerini HTTPS tünel adresinizle ayarlayın.`
      );
      return res.status(400).json({
        error:
          "Mobil Google OAuth için HTTPS ve localhost olmayan bir public callback adresi gerekli. " +
          "localhost veya yerel ağ IP adresi kullanmayın; HTTPS tünel adresinizi GOOGLE_CALLBACK_URL olarak ayarlayın.",
      });
    }
    console.info(`[google-auth] Mobil callback URI: ${callbackURL}`);
  }

  // State içine mobile_redirect_uri ve kullanılan callbackURL'i encode ediyoruz
  const statePayload = JSON.stringify({
    mobileUri: mobileRedirectUri,
    callbackURL,
    frontendOrigin: getFrontendOrigin(req),
  });
  const state = Buffer.from(statePayload).toString("base64url");

  passport.authenticate("google", {
    scope: ["profile", "email"],
    callbackURL,
    state,
  } as any)(req, res, next);
});

app.get(
  "/api/auth/google/callback",
  (req, res, next) => {
    let callbackURL = getGoogleCallbackUrl(req);
    let frontendOrigin = getFrontendOrigin(req);
    let mobileUri: string | null = null;
    const stateRaw = req.query.state as string | undefined;

    if (stateRaw) {
      try {
        const parsed = JSON.parse(Buffer.from(stateRaw, "base64url").toString("utf8"));
        if (parsed.callbackURL) callbackURL = parsed.callbackURL;
        if (parsed.mobileUri) mobileUri = parsed.mobileUri;
        if (parsed.frontendOrigin) frontendOrigin = parsed.frontendOrigin;
      } catch {
        try {
          mobileUri = decodeURIComponent(stateRaw);
        } catch {}
      }
    }

    (req as any)._mobileRedirectUri = mobileUri;
    (req as any)._frontendOrigin = frontendOrigin;

    passport.authenticate("google", {
      callbackURL,
      failureRedirect: `${frontendOrigin}/login?error=auth_failed`,
      session: true,
    } as any)(req, res, next);
  },
  (req, res) => {
    const user = req.user as DbUser;
    const token = signToken(user.id);
    const mobileUri = (req as any)._mobileRedirectUri;
    const frontendOrigin = (req as any)._frontendOrigin as string;

    if (mobileUri) {
      const separator = mobileUri.includes("?") ? "&" : "?";
      return res.redirect(`${mobileUri}${separator}token=${token}`);
    }
    res.redirect(`${frontendOrigin}/map`);
  }
);

/**
 * Mobil Google OAuth (expo-auth-session):
 * Frontend, Google'dan aldığı access_token veya id_token'ı buraya gönderir.
 * Backend token'ı doğrular, kullanıcıyı bulur/oluşturur ve JWT döner.
 */
app.post("/api/auth/google/mobile", async (req, res) => {
  const { access_token, id_token } = req.body as { access_token?: string; id_token?: string };
  if (!access_token && !id_token) {
    return res.status(400).json({ error: "access_token veya id_token gerekli" });
  }
  try {
    let googleId = "";
    let email: string | null = null;
    let name = "Kullanıcı";
    let avatar: string | null = null;

    if (id_token) {
      const gRes = await fetch(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(id_token)}`
      );
      if (!gRes.ok) {
        return res.status(401).json({ error: "Geçersiz Google id_token" });
      }
      const payload = (await gRes.json()) as any;
      googleId = payload.sub;
      email = payload.email ?? null;
      name = payload.name || payload.given_name || "Kullanıcı";
      avatar = payload.picture ?? null;
    } else if (access_token) {
      const gRes = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${encodeURIComponent(access_token)}`
      );
      if (!gRes.ok) {
        return res.status(401).json({ error: "Geçersiz Google access_token" });
      }
      const gUser = (await gRes.json()) as any;
      googleId = gUser.id;
      email = gUser.email ?? null;
      name = gUser.name || "Kullanıcı";
      avatar = gUser.picture ?? null;
    }

    if (!googleId) {
      return res.status(401).json({ error: "Google profil bilgisi alınamadı" });
    }

    // Kullanıcıyı bul veya oluştur
    const existing = await pool.query("SELECT * FROM users WHERE google_id = $1", [googleId]);
    let user: DbUser;
    if (existing.rows[0]) {
      await pool.query(
        `UPDATE users SET email = COALESCE($1, email), name = $2, avatar_url = COALESCE($3, avatar_url), updated_at = NOW() WHERE google_id = $4`,
        [email, name, avatar, googleId]
      );
      const u = await pool.query("SELECT * FROM users WHERE google_id = $1", [googleId]);
      user = rowToUser(u.rows[0]);
    } else {
      const ins = await pool.query(
        `INSERT INTO users (google_id, email, name, avatar_url) VALUES ($1, $2, $3, $4) RETURNING *`,
        [googleId, email, name, avatar]
      );
      await pool.query(
        `INSERT INTO user_profiles (user_id, preferred_gender) VALUES ($1, 'everyone') ON CONFLICT (user_id) DO NOTHING`,
        [ins.rows[0].id]
      );
      user = rowToUser(ins.rows[0]);
    }

    const token = signToken(user.id);
    req.login(user, (err) => {
      if (err) {
        // Oturum hatası olsa bile JWT ile devam et
        console.warn("[mobile-auth] req.login hatası (JWT ile devam):", err?.message);
      }
      res.json({ ok: true, user: publicUser(user), token });
    });
  } catch (err) {
    console.error("[mobile-auth] Hata:", err);
    res.status(500).json({ error: "Kimlik doğrulama başarısız" });
  }
});


app.get("/api/auth/me", async (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Giriş gerekli" });
  const u = req.user;
  
  // Calculate completion
  const photoCountRes = await pool.query("SELECT COUNT(*) FROM user_photos WHERE user_id = $1", [u.id]);
  const photoCount = parseInt(photoCountRes.rows[0].count);

  const profRes = await pool.query("SELECT * FROM user_profiles WHERE user_id = $1", [u.id]);
  const profile = profRes.rows[0] || {};
  
  const tags = Array.isArray(u.tags) ? (u.tags as string[]) : [];
  const personalityFields = [
    u.personality_humor, u.personality_energy, u.personality_lifestyle,
    u.personality_first_step, u.personality_love_language, u.personality_weekend
  ];
  const hasPersonality = personalityFields.some(v => v !== 50);

  let score = 0;
  if (u.avatar_url) score += 20;
  if (photoCount >= 2) score += 20;
  if (u.bio && u.bio.trim().length > 0) score += 15;
  if (tags.length >= 1) score += 15;
  if (u.city) score += 10;
  if (hasPersonality) score += 10;
  if (u.birth_date) score += 10;

  const missingPhotosCount = Math.max(0, 2 - photoCount);

  res.json({
    ...publicUser(u),
    preferred_gender: profile.preferred_gender || u.pref_gender || "everyone",
    languages: profile.languages || [],
    looking_for: profile.looking_for || null,
    live_vibe: profile.live_vibe || null,
    personality_type: profile.personality_type || null,
    alcohol_habit: profile.alcohol_habit || null,
    smoking_habit: profile.smoking_habit || null,
    education_level: profile.education_level || null,
    family_plans: profile.family_plans || null,
    communication_style: profile.communication_style || null,
    pets: profile.pets || null,
    zodiac_sign: profile.zodiac_sign || null,
    lifestyle_tags: profile.lifestyle_tags || [],
    favorite_activities: profile.favorite_activities || [],
    sports: profile.sports || [],
    completionPercent: score,
    missingPhotosCount
  });
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

app.post("/api/upload", requireLogin, (req, res, next) => {
  const ct = String(req.headers["content-type"] || "");
  if (ct.includes("multipart/form-data")) {
    return upload.single("photo")(req, res, next);
  }
  next();
}, async (req, res) => {
  try {
    let buffer: Buffer | null = null;
    let mime = "image/jpeg";

    if (req.file?.buffer) {
      buffer = req.file.buffer;
      mime = req.file.mimetype || mime;
    } else {
      const body = req.body as { image_base64?: string; mime?: string };
      const raw = body?.image_base64;
      if (!raw || typeof raw !== "string") {
        return res.status(400).json({ error: "Dosya yok" });
      }
      mime = body.mime || mime;
      const cleaned = raw.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, "");
      buffer = Buffer.from(cleaned, "base64");
    }

    const saved = await persistImageBuffer(req, buffer, mime);
    res.json(saved);
  } catch (e) {
    console.error(e);
    const msg = e instanceof Error && e.message === "too_large" ? "Dosya çok büyük (max 5MB)" : "Yükleme başarısız";
    res.status(500).json({ error: msg });
  }
});

app.patch("/api/users/me", requireLogin, async (req, res) => {
  try {
    const b = req.body as Record<string, unknown>;
    if (
      "languages" in b &&
      (!Array.isArray(b.languages) ||
        b.languages.length > 3 ||
        b.languages.some((language) => typeof language !== "string"))
    ) {
      return res.status(400).json({ error: "En fazla 3 dil seçebilirsiniz" });
    }

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

    const profileAllowed = [
      "preferred_gender",
      "live_vibe",
      "languages",
      "looking_for",
      "personality_type",
      "alcohol_habit",
      "smoking_habit",
      "education_level",
      "family_plans",
      "communication_style",
      "pets",
      "zodiac_sign",
      "lifestyle_tags",
      "favorite_activities",
      "sports",
    ] as const;

    const me = req.user!;

    if (b.preferred_gender && !b.pref_gender) {
      b.pref_gender = b.preferred_gender;
    } else if (b.pref_gender && !b.preferred_gender) {
      b.preferred_gender = b.pref_gender;
    }

    const sets: string[] = [];
    const vals: unknown[] = [];
    let i = 1;
    for (const key of allowed) {
      if (key in b) {
        sets.push(`${key} = $${i++}`);
        vals.push(b[key]);
      }
    }

    let updatedUser = me;
    if (sets.length > 0) {
      sets.push(`updated_at = NOW()`);
      vals.push(me.id);
      const q = `UPDATE users SET ${sets.join(", ")} WHERE id = $${i} RETURNING *`;
      const r = await pool.query(q, vals);
      updatedUser = rowToUser(r.rows[0]);
    }

    const pSets: string[] = [];
    const pVals: unknown[] = [];
    let pi = 1;
    const arrayCols = new Set(["languages", "lifestyle_tags", "favorite_activities", "sports"]);
    for (const key of profileAllowed) {
      if (key in b) {
        let val = b[key];
        if (!arrayCols.has(key) && Array.isArray(val)) {
          val = val.join(", ");
        }
        pSets.push(key + " = $" + (pi++));
        pVals.push(val);
      }
    }

    if (pSets.length > 0) {
      pSets.push(`updated_at = NOW()`);
      pVals.push(me.id);
      await pool.query(
        `INSERT INTO user_profiles (user_id) VALUES ($1) ON CONFLICT (user_id) DO NOTHING`,
        [me.id]
      );
      await pool.query(
        `UPDATE user_profiles SET ${pSets.join(", ")} WHERE user_id = $${pi}`,
        pVals
      );
    }

    const profRes = await pool.query("SELECT * FROM user_profiles WHERE user_id = $1", [me.id]);
    const profile = profRes.rows[0] || {};

    req.login(updatedUser, (err) => {
      if (err) return res.status(500).json({ error: "Oturum güncellenemedi" });
      res.json({
        ...publicUser(updatedUser),
        preferred_gender: profile.preferred_gender || updatedUser.pref_gender || "everyone",
        languages: profile.languages || [],
        looking_for: profile.looking_for || null,
        live_vibe: profile.live_vibe || null,
        personality_type: profile.personality_type || null,
        alcohol_habit: profile.alcohol_habit || null,
        smoking_habit: profile.smoking_habit || null,
        education_level: profile.education_level || null,
        family_plans: profile.family_plans || null,
        communication_style: profile.communication_style || null,
        pets: profile.pets || null,
        zodiac_sign: profile.zodiac_sign || null,
        lifestyle_tags: profile.lifestyle_tags || [],
        favorite_activities: profile.favorite_activities || [],
        sports: profile.sports || [],
      });
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Güncelleme başarısız" });
  }
});

const handleNearbyUsers = async (req: express.Request, res: express.Response) => {
  if (!req.user) return res.status(401).end();

  const prefRes = await pool.query(
    `SELECT COALESCE(p.preferred_gender, u.pref_gender, 'everyone') as preferred_gender
     FROM users u
     LEFT JOIN user_profiles p ON p.user_id = u.id
     WHERE u.id = $1`,
    [req.user.id]
  );
  const pref = (prefRes.rows[0]?.preferred_gender || "everyone").toLowerCase().trim();

  let genderClause = "";
  if (pref === "female" || pref === "kadın" || pref === "kadin") {
    genderClause = " AND LOWER(gender) IN ('female', 'kadın', 'kadin')";
  } else if (pref === "male" || pref === "erkek") {
    genderClause = " AND LOWER(gender) IN ('male', 'erkek')";
  }

  const r = await pool.query(
    `SELECT u.id, u.name, u.avatar_url, u.lat, u.lng, u.gender, u.city, u.birth_date,
            (SELECT url FROM user_photos WHERE user_id = u.id ORDER BY order_index ASC LIMIT 1) as first_photo
     FROM users u
     WHERE u.show_on_map = true 
       AND u.lat IS NOT NULL 
       AND u.lng IS NOT NULL 
       AND u.id != $1
       ${genderClause}`,
    [req.user.id]
  );
  const out = r.rows.map((row) => ({
    id: row.id,
    name: row.name,
    avatar_url: row.first_photo || row.avatar_url,
    lat: row.lat,
    lng: row.lng,
    gender: row.gender,
    city: row.city,
    age: ageFromBirth(row.birth_date) || 24,
  }));
  res.json(out);
};

app.get("/api/users/nearby", requireLogin, handleNearbyUsers);
app.get("/api/users/map", requireLogin, handleNearbyUsers);

app.get("/api/users/swipe", requireLogin, async (req, res) => {
  if (!req.user) return res.status(401).end();
  const userPref = req.user.pref_gender || "everyone";
  const genderQuery = req.query.gender as string | undefined;
  const gender = genderQuery && genderQuery !== "all" ? genderQuery : userPref;
  const params: unknown[] = [req.user.id];
  let genderFilter = "";
  if (gender === "female" || gender === "Kadın" || gender === "kadin") {
    genderFilter = " AND LOWER(u.gender) IN ('female', 'kadın', 'kadin') ";
  } else if (gender === "male" || gender === "Erkek" || gender === "erkek") {
    genderFilter = " AND LOWER(u.gender) IN ('male', 'erkek') ";
  } else if (gender === "other" || gender === "Diğer" || gender === "diger") {
    genderFilter = " AND LOWER(u.gender) IN ('other', 'diğer', 'diger') ";
  }
  const r = await pool.query(
    `SELECT u.*, 
            p.preferred_gender, p.languages, p.looking_for, p.live_vibe, p.personality_type,
            p.alcohol_habit, p.smoking_habit, p.education_level, p.family_plans,
            p.communication_style, p.pets, p.zodiac_sign, p.lifestyle_tags,
            p.favorite_activities, p.sports,
            (SELECT url FROM user_photos WHERE user_id = u.id ORDER BY order_index ASC LIMIT 1) as first_photo,
            (SELECT COALESCE(json_agg(url ORDER BY order_index ASC), '[]'::json) FROM user_photos WHERE user_id = u.id) as photos
     FROM users u
     LEFT JOIN user_profiles p ON p.user_id = u.id
     WHERE u.id != $1
     AND u.id NOT IN (SELECT to_user FROM likes WHERE from_user = $1)
     ${genderFilter}
     ORDER BY RANDOM()
     LIMIT 50`,
    params
  );
  const out = r.rows.map((row) => {
    const u = rowToUser(row);
    const photosArr = Array.isArray(row.photos) && row.photos.length > 0
      ? row.photos
      : (row.first_photo ? [row.first_photo] : (u.avatar_url ? [u.avatar_url] : []));
    return {
      ...publicOtherUser(u),
      age: ageFromBirth(u.birth_date),
      first_photo: photosArr[0] || u.avatar_url,
      photos: photosArr,
      preferred_gender: row.preferred_gender,
      languages: row.languages || [],
      looking_for: row.looking_for,
      live_vibe: row.live_vibe,
      personality_type: row.personality_type,
      alcohol_habit: row.alcohol_habit,
      smoking_habit: row.smoking_habit,
      education_level: row.education_level,
      family_plans: row.family_plans,
      communication_style: row.communication_style,
      pets: row.pets,
      zodiac_sign: row.zodiac_sign,
      lifestyle_tags: row.lifestyle_tags,
      favorite_activities: row.favorite_activities,
      sports: row.sports,
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

app.get("/api/vibe/posts", requireLogin, async (_req, res) => {
  const r = await pool.query(
    `SELECT p.*, u.name AS author_name, u.avatar_url AS author_avatar, u.city AS author_city
     FROM vibe_posts p
     JOIN users u ON u.id = p.user_id
     ORDER BY p.created_at DESC`
  );
  res.json(r.rows);
});

app.post("/api/vibe/posts", requireLogin, async (req, res) => {
  if (!req.user) return res.status(401).end();
  const { title, location_tag } = req.body as { title?: string; location_tag?: string };
  if (!title?.trim()) return res.status(400).json({ error: "Başlık gerekli" });
  const ins = await pool.query(
    `INSERT INTO vibe_posts (user_id, title, location_tag) VALUES ($1, $2, $3) RETURNING *`,
    [req.user.id, title.trim(), location_tag ?? null]
  );
  res.json(ins.rows[0]);
});

app.get("/api/vibe/posts/:postId", requireLogin, async (req, res) => {
  const r = await pool.query(
    `SELECT p.*, u.name AS author_name, u.avatar_url AS author_avatar, u.city AS author_city, u.tags AS author_tags
     FROM vibe_posts p
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

app.post("/api/wave", requireLogin, async (req, res) => {
  if (!req.user) return res.status(401).end();
  const { target_user_id } = req.body as { target_user_id?: string };
  if (!target_user_id) return res.status(400).json({ error: "target_user_id gerekli" });
  if (target_user_id === req.user.id) return res.status(400).json({ error: "Kendine el sallayamazsın" });

  const target = await pool.query(`SELECT id, name FROM users WHERE id = $1`, [target_user_id]);
  if (!target.rows.length) return res.status(404).json({ error: "Kullanıcı bulunamadı" });

  await pool.query(
    `INSERT INTO notifications (user_id, actor_id, action) VALUES ($1, $2, $3)`,
    [target_user_id, req.user.id, "sana el salladı! 👋"]
  );

  res.json({ ok: true, message: "El sallandı! 👋" });
});

app.get("/api/users/:userId", requireLogin, async (req, res) => {
  const currentUserId = req.user!.id;
  const targetUserId = req.params.userId;
  const r = await pool.query(
    `SELECT u.*, 
            p.preferred_gender, p.languages, p.looking_for, p.live_vibe, p.personality_type,
            p.alcohol_habit, p.smoking_habit, p.education_level, p.family_plans,
            p.communication_style, p.pets, p.zodiac_sign, p.lifestyle_tags,
            p.favorite_activities, p.sports,
            (SELECT type FROM likes WHERE from_user = $1 AND to_user = $2) as existing_vote,
            (SELECT COALESCE(json_agg(url ORDER BY order_index ASC), '[]'::json) FROM user_photos WHERE user_id = u.id) as photos
     FROM users u
     LEFT JOIN user_profiles p ON p.user_id = u.id
     WHERE u.id = $2`,
    [currentUserId, targetUserId]
  );
  if (!r.rows.length) return res.status(404).json({ error: "Bulunamadı" });
  const row = r.rows[0];
  const u = rowToUser(row);
  const photosArr = Array.isArray(row.photos) && row.photos.length > 0
    ? row.photos
    : (u.avatar_url ? [u.avatar_url] : []);
  res.json({
    ...publicOtherUser(u),
    age: ageFromBirth(u.birth_date),
    photos: photosArr,
    existing_vote: row.existing_vote || null,
    preferred_gender: row.preferred_gender,
    languages: row.languages || [],
    looking_for: row.looking_for,
    live_vibe: row.live_vibe,
    personality_type: row.personality_type,
    alcohol_habit: row.alcohol_habit,
    smoking_habit: row.smoking_habit,
    education_level: row.education_level,
    family_plans: row.family_plans,
    communication_style: row.communication_style,
    pets: row.pets,
    zodiac_sign: row.zodiac_sign,
    lifestyle_tags: row.lifestyle_tags || [],
    favorite_activities: row.favorite_activities || [],
    sports: row.sports || [],
  });
});

app.post("/api/reports", requireLogin, async (req, res) => {
  try {
    const { target_user_id, reason } = req.body as { target_user_id?: string; reason?: string };
    if (!target_user_id || !reason) return res.status(400).json({ error: "Eksik parametre" });
    await pool.query(
      `INSERT INTO reports (reporter_id, target_user_id, reason) VALUES ($1, $2, $3)`,
      [req.user!.id, target_user_id, reason]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error("Report error:", e);
    res.status(500).json({ error: "Rapor kaydedilemedi" });
  }
});

app.post("/api/blocks", requireLogin, async (req, res) => {
  try {
    const { blocked_user_id } = req.body as { blocked_user_id?: string };
    if (!blocked_user_id) return res.status(400).json({ error: "Eksik parametre" });
    await pool.query(
      `INSERT INTO blocks (blocker_id, blocked_id) VALUES ($1, $2) ON CONFLICT (blocker_id, blocked_id) DO NOTHING`,
      [req.user!.id, blocked_user_id]
    );
    await pool.query(
      `INSERT INTO likes (from_user, to_user, type) VALUES ($1, $2, 'pass') ON CONFLICT (from_user, to_user) DO UPDATE SET type = 'pass'`,
      [req.user!.id, blocked_user_id]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error("Block error:", e);
    res.status(500).json({ error: "Engelleme kaydedilemedi" });
  }
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

// --- USER PHOTOS ---

app.post("/api/users/me/photos", requireLogin, async (req, res) => {
  try {
    const { url, order_index, public_id } = req.body as {
      url: string;
      order_index: number;
      public_id?: string | null;
    };
    const uid = req.user!.id;

    const countRes = await pool.query("SELECT COUNT(*) FROM user_photos WHERE user_id = $1", [uid]);
    if (parseInt(countRes.rows[0].count) >= 10) {
      return res.status(400).json({ error: "Maksimum 10 fotoğraf yükleyebilirsiniz" });
    }

    const ins = await pool.query(
      "INSERT INTO user_photos (user_id, url, public_id, order_index) VALUES ($1, $2, $3, $4) RETURNING *",
      [uid, url, public_id ?? null, order_index]
    );
    res.json(ins.rows[0]);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Fotoğraf eklenemedi" });
  }
});

app.get("/api/users/:userId/photos", requireLogin, async (req, res) => {
  try {
    const { userId } = req.params;
    const r = await pool.query(
      "SELECT * FROM user_photos WHERE user_id = $1 ORDER BY order_index ASC",
      [userId]
    );
    res.json(r.rows);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Fotoğraflar alınamadı" });
  }
});

app.delete("/api/users/me/photos/:photoId", requireLogin, async (req, res) => {
  try {
    const { photoId } = req.params;
    const uid = req.user!.id;

    const exist = await pool.query("SELECT * FROM user_photos WHERE id = $1 AND user_id = $2", [
      photoId,
      uid,
    ]);
    if (!exist.rows.length) return res.status(404).json({ error: "Fotoğraf bulunamadı" });

    const photo = exist.rows[0] as { url: string; public_id: string | null };
    await pool.query("DELETE FROM user_photos WHERE id = $1", [photoId]);

    try {
      const pid = photo.public_id;
      if (pid?.startsWith("local/")) {
        const filename = pid.slice("local/".length);
        await fs.unlink(path.join(process.cwd(), "uploads", filename)).catch(() => undefined);
      } else if (pid && isCloudinaryReady()) {
        await cloudinary.uploader.destroy(pid);
      } else if (photo.url?.includes("res.cloudinary.com") && isCloudinaryReady()) {
        const parts = photo.url.split("/");
        const last = parts[parts.length - 1];
        const publicId = last.split(".")[0];
        await cloudinary.uploader.destroy(`dambull/${publicId}`);
      }
    } catch (err) {
      console.warn("Fotoğraf depolama silme başarısız", err);
    }

    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Fotoğraf silinemedi" });
  }
});

app.patch("/api/users/me/photos/reorder", requireLogin, async (req, res) => {
  try {
    const { photos } = req.body as { photos: { id: string; order_index: number }[] };
    const uid = req.user!.id;

    for (const p of photos) {
      await pool.query(
        "UPDATE user_photos SET order_index = $1 WHERE id = $2 AND user_id = $3",
        [p.order_index, p.id, uid]
      );
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Sıralama güncellenemedi" });
  }
});

// Beklenmeyen Rejection ve İstisnaların sunucuyu düşürmesini önleme
process.on("unhandledRejection", (reason, promise) => {
  console.error("[server] Yakalanmamış Rejection (Unhandled Rejection):", reason);
});

process.on("uncaughtException", (err) => {
  console.error("[server] Yakalanmamış İstisna (Uncaught Exception):", err);
});

const distPath = path.join(process.cwd(), "dist");
app.use(express.static(distPath));

app.get("/{*path}", (req, res, next) => {
  if (
    req.path === "/api" ||
    req.path.startsWith("/api/") ||
    req.path === "/uploads" ||
    req.path.startsWith("/uploads/")
  ) {
    return next();
  }
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err && "code" in err && err.code === "ENOENT" && !res.headersSent) {
      res.status(200).json({ status: "ok", message: "Dambul API aktif (Web build bulunamadı)" });
    } else if (err) {
      next(err);
    }
  });
});

async function start() {
  try {
    await initSchema();
  } catch (err) {
    console.error("[server] initSchema hatası (sunucu yine de başlatılıyor):", err);
  }

  const server = app.listen(API_PORT, "0.0.0.0", () => {
    console.log(`API http://localhost:${API_PORT} (0.0.0.0:${API_PORT})`);
    if (!isCloudinaryReady()) {
      console.warn(
        "[upload] Cloudinary env yok; fotoğraflar yerel /uploads klasörüne yazılacak."
      );
    }
    if (clientId && clientSecret) {
      console.log(
        `Google OAuth — Cloud Console'daki Yetkilendirilmiş Yönlendirme URI'leri:\n` +
        `  Web / Localhost: http://localhost:${API_PORT}/api/auth/google/callback\n` +
        `  Mobil: GOOGLE_CALLBACK_URL içinde public HTTPS tünel adresini ayarlayın; URI mobil girişte doğrulanır.`
      );
    }
  });

  server.on("error", (err: any) => {
    if (err?.code === "EADDRINUSE") {
      console.error(`[server] Port ${API_PORT} zaten kullanımda! Başka bir sunucu işlemi açık kalmış olabilir.`);
    } else {
      console.error("[server] HTTP Sunucu Hatası:", err);
    }
  });
}

start().catch((e) => {
  console.error("[server] Başlatma hatası:", e);
});
