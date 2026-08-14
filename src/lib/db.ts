import { Pool } from "pg";
import type { Meal, Settings, WeightEntry } from "./types";
import { seedMeals, seedWeightLog } from "./seed";

declare global {
  var __pgPool: Pool | undefined;
  var __pgInit: Promise<void> | undefined;
}

function createPool(): Pool {
  const connectionString =
    process.env.DATABASE_URL || "postgresql://fitness:fitness_dev_pw@localhost:5432/fitness_dashboard";
  // Managed providers (Neon, Supabase, RDS, ...) require TLS and use certs
  // not in Node's default trust store; local/self-hosted Postgres doesn't
  // need this. Set DATABASE_SSL=disable to force it off if a provider
  // needs a different setup.
  const isLocal = /localhost|127\.0\.0\.1/.test(connectionString);
  const sslDisabled = process.env.DATABASE_SSL === "disable";
  return new Pool({
    connectionString,
    ssl: !isLocal && !sslDisabled ? { rejectUnauthorized: false } : undefined,
    max: 5,
  });
}

async function ensureSchema(pool: Pool): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS meals (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      name TEXT NOT NULL,
      calories INTEGER NOT NULL,
      protein INTEGER NOT NULL,
      carbs INTEGER NOT NULL,
      fat INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS weight_log (
      date TEXT PRIMARY KEY,
      weight_kg DOUBLE PRECISION NOT NULL
    );

    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      sex TEXT NOT NULL,
      age INTEGER NOT NULL,
      height_cm INTEGER NOT NULL,
      weight_kg DOUBLE PRECISION NOT NULL,
      activity_level TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS strava_tokens (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      access_token TEXT NOT NULL,
      refresh_token TEXT NOT NULL,
      expires_at BIGINT NOT NULL,
      athlete_id BIGINT,
      athlete_name TEXT
    );
  `);

  const { rows: mealCountRows } = await pool.query("SELECT COUNT(*)::int as c FROM meals");
  if (mealCountRows[0].c === 0) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const m of seedMeals()) {
        await client.query(
          "INSERT INTO meals (id, date, time, name, calories, protein, carbs, fat) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
          [m.id, m.date, m.time, m.name, m.calories, m.protein, m.carbs, m.fat]
        );
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  const { rows: weightCountRows } = await pool.query("SELECT COUNT(*)::int as c FROM weight_log");
  if (weightCountRows[0].c === 0) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const w of seedWeightLog()) {
        await client.query("INSERT INTO weight_log (date, weight_kg) VALUES ($1, $2)", [w.date, w.weightKg]);
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  const { rows: settingsRows } = await pool.query("SELECT id FROM settings WHERE id = 1");
  if (settingsRows.length === 0) {
    await pool.query(
      "INSERT INTO settings (id, sex, age, height_cm, weight_kg, activity_level) VALUES (1, 'M', 29, 180, 82.4, 'moderate')"
    );
  }
}

async function getPool(): Promise<Pool> {
  if (!globalThis.__pgPool) {
    globalThis.__pgPool = createPool();
  }
  if (!globalThis.__pgInit) {
    globalThis.__pgInit = ensureSchema(globalThis.__pgPool);
  }
  await globalThis.__pgInit;
  return globalThis.__pgPool;
}

// ---- Meals ----

export async function listMeals(): Promise<Meal[]> {
  const pool = await getPool();
  const { rows } = await pool.query(
    "SELECT id, date, time, name, calories, protein, carbs, fat FROM meals ORDER BY date, time"
  );
  return rows;
}

export async function insertMeal(meal: Meal): Promise<void> {
  const pool = await getPool();
  await pool.query(
    "INSERT INTO meals (id, date, time, name, calories, protein, carbs, fat) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
    [meal.id, meal.date, meal.time, meal.name, meal.calories, meal.protein, meal.carbs, meal.fat]
  );
}

export async function deleteMeal(id: string): Promise<void> {
  const pool = await getPool();
  await pool.query("DELETE FROM meals WHERE id = $1", [id]);
}

// ---- Weight log ----

export async function listWeightLog(): Promise<WeightEntry[]> {
  const pool = await getPool();
  const { rows } = await pool.query("SELECT date, weight_kg FROM weight_log ORDER BY date ASC");
  return rows.map((r) => ({ date: r.date, weightKg: Number(r.weight_kg) }));
}

export async function upsertWeightEntry(entry: WeightEntry): Promise<void> {
  const pool = await getPool();
  await pool.query(
    "INSERT INTO weight_log (date, weight_kg) VALUES ($1, $2) ON CONFLICT (date) DO UPDATE SET weight_kg = excluded.weight_kg",
    [entry.date, entry.weightKg]
  );
}

// ---- Settings ----

function mapSettingsRow(r: {
  sex: string;
  age: number;
  height_cm: number;
  weight_kg: number;
  activity_level: string;
}): Settings {
  return {
    sex: r.sex as Settings["sex"],
    age: r.age,
    heightCm: r.height_cm,
    weightKg: Number(r.weight_kg),
    activityLevel: r.activity_level as Settings["activityLevel"],
  };
}

export async function getSettings(): Promise<Settings> {
  const pool = await getPool();
  const { rows } = await pool.query(
    "SELECT sex, age, height_cm, weight_kg, activity_level FROM settings WHERE id = 1"
  );
  return mapSettingsRow(rows[0]);
}

export async function updateSettings(partial: Partial<Settings>): Promise<Settings> {
  const pool = await getPool();
  const current = await getSettings();
  const next: Settings = { ...current, ...partial };
  const { rows } = await pool.query(
    `UPDATE settings SET sex = $1, age = $2, height_cm = $3, weight_kg = $4, activity_level = $5
     WHERE id = 1
     RETURNING sex, age, height_cm, weight_kg, activity_level`,
    [next.sex, next.age, next.heightCm, next.weightKg, next.activityLevel]
  );
  return mapSettingsRow(rows[0]);
}

// ---- Strava tokens ----

export type StravaTokenRow = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  athleteId: number | null;
  athleteName: string | null;
};

export async function getStravaTokens(): Promise<StravaTokenRow | null> {
  const pool = await getPool();
  const { rows } = await pool.query(
    "SELECT access_token, refresh_token, expires_at, athlete_id, athlete_name FROM strava_tokens WHERE id = 1"
  );
  if (rows.length === 0) return null;
  const r = rows[0];
  return {
    accessToken: r.access_token,
    refreshToken: r.refresh_token,
    expiresAt: Number(r.expires_at),
    athleteId: r.athlete_id === null ? null : Number(r.athlete_id),
    athleteName: r.athlete_name,
  };
}

export async function saveStravaTokens(tokens: StravaTokenRow): Promise<void> {
  const pool = await getPool();
  await pool.query(
    `INSERT INTO strava_tokens (id, access_token, refresh_token, expires_at, athlete_id, athlete_name)
     VALUES (1, $1, $2, $3, $4, $5)
     ON CONFLICT (id) DO UPDATE SET
       access_token = excluded.access_token,
       refresh_token = excluded.refresh_token,
       expires_at = excluded.expires_at,
       athlete_id = excluded.athlete_id,
       athlete_name = excluded.athlete_name`,
    [tokens.accessToken, tokens.refreshToken, tokens.expiresAt, tokens.athleteId, tokens.athleteName]
  );
}

export async function clearStravaTokens(): Promise<void> {
  const pool = await getPool();
  await pool.query("DELETE FROM strava_tokens WHERE id = 1");
}
