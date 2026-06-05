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
  // Setup-mode pledges save a card without charging; track review status + the
  // Stripe customer so the subscription can be created on acceptance.
  await sql`ALTER TABLE pledges ADD COLUMN IF NOT EXISTS status TEXT`;
  await sql`ALTER TABLE pledges ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT`;
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
  status?: string | null; // "pending" until Mike accepts and charges
  stripeCustomerId?: string | null;
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
        (email, amount_monthly, pain_point, stripe_session_id, name, company, role,
         frequency, cost, status, stripe_customer_id)
      VALUES (
        ${p.email ?? null}, ${p.amount}, ${p.painPoint}, ${p.stripeSessionId ?? null},
        ${p.name ?? null}, ${p.company ?? null}, ${p.role ?? null}, ${p.frequency ?? null},
        ${p.cost ?? null}, ${p.status ?? null}, ${p.stripeCustomerId ?? null}
      )
      ON CONFLICT (stripe_session_id) DO NOTHING
    `;
    return true;
  } catch (error) {
    console.error("recordPledge failed:", error);
    return false;
  }
}

let connectionsReady = false;

async function ensureConnectionsTable(sql: NeonQueryFunction<false, false>) {
  if (connectionsReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS connections (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      name TEXT,
      email TEXT,
      company TEXT,
      role TEXT,
      working_on TEXT,
      phone TEXT,
      source TEXT
    )
  `;
  connectionsReady = true;
}

export interface ConnectionRecord {
  name: string;
  email: string;
  company?: string | null;
  role?: string | null;
  workingOn?: string | null;
  phone?: string | null;
  source?: string | null;
}

let enterpriseReady = false;

async function ensureEnterpriseLeadsTable(sql: NeonQueryFunction<false, false>) {
  if (enterpriseReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS enterprise_leads (
      id BIGSERIAL PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      name TEXT,
      work_email TEXT,
      company TEXT,
      role TEXT,
      team_size TEXT,
      use_case TEXT,
      timeline TEXT,
      notes TEXT
    )
  `;
  enterpriseReady = true;
}

export interface EnterpriseLeadRecord {
  name: string;
  workEmail: string;
  company: string;
  role?: string | null;
  teamSize?: string | null;
  useCase?: string | null;
  timeline?: string | null;
  notes?: string | null;
}

/** Capture an enterprise inquiry (sales-assisted). Best-effort. */
export async function recordEnterpriseLead(p: EnterpriseLeadRecord): Promise<boolean> {
  const sql = getDb();
  if (!sql) {
    console.warn("recordEnterpriseLead: no database configured (NEON_US_DSN unset)");
    return false;
  }
  try {
    await ensureEnterpriseLeadsTable(sql);
    await sql`
      INSERT INTO enterprise_leads (name, work_email, company, role, team_size, use_case, timeline, notes)
      VALUES (
        ${p.name}, ${p.workEmail}, ${p.company}, ${p.role ?? null}, ${p.teamSize ?? null},
        ${p.useCase ?? null}, ${p.timeline ?? null}, ${p.notes ?? null}
      )
    `;
    return true;
  } catch (error) {
    console.error("recordEnterpriseLead failed:", error);
    return false;
  }
}

/** Add a person to the personal CRM (connections table). Best-effort. */
export async function recordConnection(p: ConnectionRecord): Promise<boolean> {
  const sql = getDb();
  if (!sql) {
    console.warn("recordConnection: no database configured (NEON_US_DSN unset)");
    return false;
  }
  try {
    await ensureConnectionsTable(sql);
    await sql`
      INSERT INTO connections (name, email, company, role, working_on, phone, source)
      VALUES (
        ${p.name}, ${p.email}, ${p.company ?? null}, ${p.role ?? null},
        ${p.workingOn ?? null}, ${p.phone ?? null}, ${p.source ?? null}
      )
    `;
    return true;
  } catch (error) {
    console.error("recordConnection failed:", error);
    return false;
  }
}
