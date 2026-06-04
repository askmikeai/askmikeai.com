import { listPledges, isDbConfigured, type PledgeRow } from "@/lib/db";

// Always read fresh from the DB; never cache.
export const dynamic = "force-dynamic";

function money(n: number) {
  return `$${n.toLocaleString()}`;
}

function fmtDate(s: string) {
  try {
    return new Date(s).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return s;
  }
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
      {sub && <p className="mt-1 text-sm text-gray-500">{sub}</p>}
    </div>
  );
}

export default async function Dashboard({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  // Gate: if DASHBOARD_TOKEN is set (e.g. in production), require a matching
  // ?token=. Left unset locally so the dashboard "just works" via npm run dev.
  const required = process.env.DASHBOARD_TOKEN;
  if (required && searchParams?.token !== required) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">Not authorized</h1>
          <p className="mt-2 text-gray-600">
            Add <code className="rounded bg-gray-200 px-1.5 py-0.5">?token=…</code> to view this dashboard.
          </p>
        </div>
      </main>
    );
  }

  const configured = isDbConfigured();
  const pledges: PledgeRow[] = configured ? await listPledges() : [];

  const count = pledges.length;
  const totalMonthly = pledges.reduce((s, p) => s + (p.amount_monthly || 0), 0);
  const avg = count ? Math.round(totalMonthly / count) : 0;
  const companies = new Set(
    pledges.map((p) => (p.company || "").trim().toLowerCase()).filter(Boolean)
  ).size;
  const maxAmount = pledges.reduce((m, p) => Math.max(m, p.amount_monthly || 0), 0);
  const exportHref = `/dashboard/export${required ? `?token=${encodeURIComponent(required)}` : ""}`;

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-gray-900">Pledge dashboard</h1>
            <p className="mt-1 text-gray-600">Purchase-validation signals from the pledge funnel.</p>
          </div>
          {count > 0 && (
            <a
              href={exportHref}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              Export CSV
            </a>
          )}
        </div>

        {!configured ? (
          <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6 text-amber-900">
            <p className="font-medium">No database connected.</p>
            <p className="mt-1 text-sm">
              Set <code className="rounded bg-amber-100 px-1.5 py-0.5">NEON_US_DSN</code> (or{" "}
              <code className="rounded bg-amber-100 px-1.5 py-0.5">DATABASE_URL</code>) in your{" "}
              <code className="rounded bg-amber-100 px-1.5 py-0.5">.env</code> to a Neon Postgres
              connection string, then reload.
            </p>
          </div>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
              <Stat label="Pledges" value={String(count)} />
              <Stat label="Monthly pledged" value={money(totalMonthly)} sub="sum of all $/mo" />
              <Stat label="Avg price" value={money(avg)} sub="per pledge / mo" />
              <Stat label="Companies" value={String(companies)} sub="distinct" />
            </div>

            {count === 0 ? (
              <div className="mt-8 rounded-2xl border border-gray-200 bg-white p-10 text-center text-gray-500">
                No pledges yet. They appear here the moment someone completes a paid pledge.
              </div>
            ) : (
              <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 text-left text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Name</th>
                      <th className="px-4 py-3 font-medium">Company</th>
                      <th className="px-4 py-3 font-medium">Role</th>
                      <th className="px-4 py-3 font-medium">Email</th>
                      <th className="px-4 py-3 font-medium">$/mo</th>
                      <th className="px-4 py-3 font-medium">Frequency</th>
                      <th className="px-4 py-3 font-medium">Cost</th>
                      <th className="px-4 py-3 font-medium">Problem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {pledges.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="whitespace-nowrap px-4 py-3 text-gray-500">{fmtDate(p.created_at)}</td>
                        <td className="whitespace-nowrap px-4 py-3 font-medium text-gray-900">{p.name || "—"}</td>
                        <td className="whitespace-nowrap px-4 py-3">{p.company || "—"}</td>
                        <td className="whitespace-nowrap px-4 py-3">{p.role || "—"}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-gray-500">{p.email || "—"}</td>
                        <td className="whitespace-nowrap px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">{money(p.amount_monthly)}</span>
                            <span
                              className="h-1.5 rounded-full bg-gradient-to-r from-teal-500 to-pink-500"
                              style={{ width: `${maxAmount ? (p.amount_monthly / maxAmount) * 64 : 0}px` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3">{p.frequency || "—"}</td>
                        <td className="px-4 py-3">{p.cost || "—"}</td>
                        <td className="px-4 py-3 max-w-xs truncate" title={p.pain_point || ""}>
                          {p.pain_point || "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
