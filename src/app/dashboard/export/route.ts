import { NextRequest, NextResponse } from "next/server";
import { listPledges } from "@/lib/db";

export const dynamic = "force-dynamic";

function csvCell(v: unknown): string {
  const s = v == null ? "" : String(v);
  // Quote and escape per RFC 4180 if needed.
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export async function GET(request: NextRequest) {
  const required = process.env.DASHBOARD_TOKEN;
  if (required && request.nextUrl.searchParams.get("token") !== required) {
    return new NextResponse("Not authorized", { status: 401 });
  }

  const pledges = await listPledges();
  const headers = [
    "id",
    "created_at",
    "name",
    "email",
    "company",
    "role",
    "amount_monthly",
    "frequency",
    "cost",
    "pain_point",
  ];
  const lines = [
    headers.join(","),
    ...pledges.map((p) =>
      [
        p.id,
        p.created_at,
        p.name,
        p.email,
        p.company,
        p.role,
        p.amount_monthly,
        p.frequency,
        p.cost,
        p.pain_point,
      ]
        .map(csvCell)
        .join(",")
    ),
  ];

  return new NextResponse(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="pledges.csv"`,
    },
  });
}
