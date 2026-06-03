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
  tableReady = true;
}

export interface PledgeRecord {
  email?: string | null;
  amount: number; // dollars / month
  painPoint: string;
  stripeSessionId?: string | null;
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
      INSERT INTO pledges (email, amount_monthly, pain_point, stripe_session_id)
      VALUES (${p.email ?? null}, ${p.amount}, ${p.painPoint}, ${p.stripeSessionId ?? null})
      ON CONFLICT (stripe_session_id) DO NOTHING
    `;
    return true;
  } catch (error) {
    console.error("recordPledge failed:", error);
    return false;
  }
}
