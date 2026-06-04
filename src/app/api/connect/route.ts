import { NextRequest, NextResponse } from "next/server";
import { recordConnection } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim();

    if (!name || !email) {
      return NextResponse.json({ error: "Please include your name and email." }, { status: 400 });
    }

    const ok = await recordConnection({
      name,
      email,
      company: String(body.company || "").trim() || null,
      role: String(body.role || "").trim() || null,
      workingOn: String(body.workingOn || "").trim() || null,
      phone: String(body.phone || "").trim() || null,
      source: String(body.source || "").trim() || null,
    });

    if (!ok) {
      return NextResponse.json(
        { error: "Couldn't save your details right now." },
        { status: 503 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("connect error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
