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

pool.on("error", (err) => {
  console.error("[db] Beklenmeyen veritabanı bağlantı hatası (idle client error):", err?.message || err);
});

export async function initSchema(): Promise<void> {
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
    CREATE TABLE IF NOT EXISTS user_photos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      public_id TEXT,
      order_index INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_user_photos_user_id ON user_photos(user_id);
    ALTER TABLE user_photos ADD COLUMN IF NOT EXISTS public_id TEXT;
    CREATE TABLE IF NOT EXISTS user_profiles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
      preferred_gender VARCHAR(20),
      languages TEXT[],
      looking_for VARCHAR(50),
      personality_type VARCHAR(100),
      alcohol_habit VARCHAR(50),
      smoking_habit VARCHAR(50),
      education_level VARCHAR(100),
      family_plans VARCHAR(100),
      communication_style VARCHAR(100),
      pets VARCHAR(50),
      zodiac_sign VARCHAR(20),
      lifestyle_tags TEXT[], 
      favorite_activities TEXT[],
      sports TEXT[],
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
    CREATE TABLE IF NOT EXISTS reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      reason TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS blocks (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      blocker_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      blocked_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      UNIQUE(blocker_id, blocked_id)
    );
  `);

  // Eski şemadaki eksik kolonları güvenli şekilde tek tek ekle
  // (pg, tek query'de birden fazla ALTER TABLE'ı desteklemez)
  const migrations = [
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS birth_date DATE`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS height INTEGER`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS gender TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS personality_humor INT DEFAULT 50`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS personality_energy INT DEFAULT 50`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS personality_lifestyle INT DEFAULT 50`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS personality_first_step INT DEFAULT 50`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS personality_love_language INT DEFAULT 50`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS personality_weekend INT DEFAULT 50`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS show_on_map BOOLEAN DEFAULT TRUE`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS pref_gender TEXT DEFAULT 'everyone'`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS pref_age_min INT DEFAULT 18`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS pref_age_max INT DEFAULT 100`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS pref_distance_km INT DEFAULT 50`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS pref_height_min INT DEFAULT 130`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS pref_height_max INT DEFAULT 230`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS vibration_enabled BOOLEAN DEFAULT TRUE`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS extra_photos JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS abstract_qa JSONB DEFAULT '[]'::jsonb`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW()`,
    `ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`,
  ];
  for (const sql of migrations) {
    try {
      await pool.query(sql);
    } catch (e: any) {
      // Kolon zaten varsa (42701) veya IF NOT EXISTS kullanılıyorsa sessizce geç
      if (e.code !== "42701") {
        console.warn(`[db] Migration uyarısı (${e.code}): ${sql.slice(0, 60)}...`);
      }
    }
  }
}
