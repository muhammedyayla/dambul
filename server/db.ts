import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

/** Neon / Postgres URI — tek satır; `psql '...'` sarmalayıcısı yok. */
function normalizeConnectionString(raw: string): string {
  let s = raw.replace(/\r/g, "").trim();
  if (
    (s.startsWith('"') && s.endsWith('"')) ||
    (s.startsWith("'") && s.endsWith("'"))
  ) {
    s = s.slice(1, -1).trim();
  }
  if (s.toLowerCase().startsWith("psql ")) {
    const m = s.match(/['"](postgres(ql)?:\/\/[^'"]+)['"]/);
    if (m) s = m[1];
  }
  return s;
}

function hostHint(cs: string): string | null {
  const i = cs.indexOf("@");
  if (i === -1) return null;
  const after = cs.slice(i + 1);
  const slash = after.indexOf("/");
  const q = after.indexOf("?");
  let end = after.length;
  if (slash >= 0) end = Math.min(end, slash);
  if (q >= 0) end = Math.min(end, q);
  const hostPort = after.slice(0, end);
  return hostPort.split(":")[0] || null;
}

function resolveConnectionString(): string {
  let raw = normalizeConnectionString(
    process.env.neon_connection_string || process.env.DATABASE_URL || ""
  );
  if (!raw) {
    console.error(
      "[db] Eksik: neon_connection_string veya DATABASE_URL\n" +
        "Neon: Connection details → URI (postgresql://...@ep-....neon.tech/...)"
    );
    process.exit(1);
  }

  if (hostHint(raw) === "base") {
    console.error("[db] Yer tutucu host 'base' kullanılmış; Neon URI’sini düzeltin.");
    process.exit(1);
  }

  return raw;
}

const connectionString = resolveConnectionString();

export const pool = new pg.Pool({ connectionString });

/** Eski projelerde users.id integer olabiliyor; UUID şemasıyla uyumsuz. Geliştirme DB’sinde tabloları sıfırlar. */
async function resetSchemaIfUserIdNotUuid(): Promise<void> {
  const { rows } = await pool.query<{ udt_name: string }>(
    `SELECT c.udt_name::text AS udt_name
     FROM information_schema.columns c
     WHERE c.table_schema = 'public' AND c.table_name = 'users' AND c.column_name = 'id'`
  );
  if (rows.length === 0) return;
  if (rows[0].udt_name === "uuid") return;
  console.warn(
    `[db] users.id tipi "${rows[0].udt_name}" (uuid değil). Tablolar UUID şeması için yeniden oluşturulacak; mevcut veriler silinir.`
  );
  await pool.query(`
    DROP TABLE IF EXISTS messages CASCADE;
    DROP TABLE IF EXISTS chat_threads CASCADE;
    DROP TABLE IF EXISTS vibe_posts CASCADE;
    DROP TABLE IF EXISTS notifications CASCADE;
    DROP TABLE IF EXISTS likes CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);
}

export async function initSchema(): Promise<void> {
  await resetSchemaIfUserIdNotUuid();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      google_id TEXT UNIQUE NOT NULL,
      email TEXT,
      name TEXT NOT NULL DEFAULT '',
      avatar_url TEXT,
      city TEXT,
      lat DOUBLE PRECISION,
      lng DOUBLE PRECISION,
      height INTEGER,
      gender TEXT,
      bio TEXT,
      tags JSONB DEFAULT '[]'::jsonb,
      personality_humor INT DEFAULT 50,
      personality_energy INT DEFAULT 50,
      personality_lifestyle INT DEFAULT 50,
      personality_first_step INT DEFAULT 50,
      personality_love_language INT DEFAULT 50,
      personality_weekend INT DEFAULT 50,
      show_on_map BOOLEAN DEFAULT TRUE,
      pref_gender TEXT DEFAULT 'everyone',
      pref_age_min INT DEFAULT 18,
      pref_age_max INT DEFAULT 100,
      pref_distance_km INT DEFAULT 50,
      pref_height_min INT DEFAULT 130,
      pref_height_max INT DEFAULT 230,
      vibration_enabled BOOLEAN DEFAULT TRUE,
      notifications_enabled BOOLEAN DEFAULT TRUE,
      birth_date DATE,
      extra_photos JSONB DEFAULT '[]'::jsonb,
      abstract_qa JSONB DEFAULT '[]'::jsonb,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS likes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      from_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      to_user UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(from_user, to_user)
    );
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      read BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS chat_threads (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_a UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      user_b UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      CONSTRAINT chat_users_ordered CHECK (user_a::text < user_b::text),
      UNIQUE(user_a, user_b)
    );
    CREATE TABLE IF NOT EXISTS messages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      thread_id UUID NOT NULL REFERENCES chat_threads(id) ON DELETE CASCADE,
      sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS vibe_posts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      location_tag TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}
