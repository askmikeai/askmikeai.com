import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

// Neon connection string. On Vercel this is the (sensitive) NEON_US_DSN var;
// DATABASE_URL is accepted as a fallback for local/other setups.
function getDsn(): string | null {
  return process.env.NEON_US_DSN || process.env.DATABASE_URL || null;
}

let cached: NeonQueryFunction<false, false> | null = null;

function getDb(): NeonQueryFunction<false, false> | null {
  if (cached) return cached;
  const dsn = getDsn();
  if (!dsn) return null;
  cached = neon(dsn);
  return cached;
}

let tableReady = false;

async function ensurePledgeTable(sql: NeonQueryFunction<false, false>) {
  if (tableReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS pledges (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      email TEXT,
      amount_monthly INTEGER NOT NULL,
      pain_point TEXT,
      stripe_session_id TEXT UNIQUE
    )
  `;
  // Validation-profile columns (added idempotently so existing tables upgrade).
  await sql`ALTER TABLE pledges ADD COLUMN IF NOT EXISTS name TEXT`;
  await sql`ALTER TABLE pledges ADD COLUMN IF NOT EXISTS company TEXT`;
  await sql`ALTER TABLE pledges ADD COLUMN IF NOT EXISTS role TEXT`;
  await sql`ALTER TABLE pledges ADD COLUMN IF NOT EXISTS frequency TEXT`;
  await sql`ALTER TABLE pledges ADD COLUMN IF NOT EXISTS cost TEXT`;
  tableReady = true;
}

export interface PledgeRecord {
  email?: string | null;
  amount: number; // dollars / month
  painPoint: string;
  stripeSessionId?: string | null;
  name?: string | null;
  company?: string | null;
  role?: string | null;
  frequency?: string | null;
  cost?: string | null;
}

export interface PledgeRow {
  id: number;
  created_at: string;
  email: string | null;
  amount_monthly: number;
  pain_point: string | null;
  name: string | null;
  company: string | null;
  role: string | null;
  frequency: string | null;
  cost: string | null;
}

/** Is a database configured at all? (used by the dashboard for messaging) */
export function isDbConfigured(): boolean {
  return getDsn() !== null;
}

/** Read all pledges, newest first. Returns [] if the DB isn't configured. */
export async function listPledges(): Promise<PledgeRow[]> {
  const sql = getDb();
  if (!sql) return [];
  try {
    await ensurePledgeTable(sql);
    const rows = await sql`
      SELECT id, created_at, email, amount_monthly, pain_point,
             name, company, role, frequency, cost
      FROM pledges
      ORDER BY created_at DESC
    `;
    return rows as unknown as PledgeRow[];
  } catch (error) {
    console.error("listPledges failed:", error);
    return [];
  }
}

/**
 * Persist a completed pledge (price paid + the problem). Best-effort: if the
 * database isn't configured or the write fails, we log and return false rather
 * than breaking the pledge flow. Idempotent on stripe_session_id.
 */
export async function recordPledge(p: PledgeRecord): Promise<boolean> {
  const sql = getDb();
  if (!sql) {
    console.warn("recordPledge: no database configured (NEON_US_DSN unset)");
    return false;
  }
  try {
    await ensurePledgeTable(sql);
    await sql`
      INSERT INTO pledges
        (email, amount_monthly, pain_point, stripe_session_id, name, company, role, frequency, cost)
      VALUES (
        ${p.email ?? null}, ${p.amount}, ${p.painPoint}, ${p.stripeSessionId ?? null},
        ${p.name ?? null}, ${p.company ?? null}, ${p.role ?? null}, ${p.frequency ?? null}, ${p.cost ?? null}
      )
      ON CONFLICT (stripe_session_id) DO NOTHING
    `;
    return true;
  } catch (error) {
    console.error("recordPledge failed:", error);
    return false;
  }
}
