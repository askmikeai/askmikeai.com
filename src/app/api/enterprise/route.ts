import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { recordEnterpriseLead } from "@/lib/db";

function esc(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function POST(request: NextRequest) {
  try {
    const b = await request.json();
    const name = String(b.name || "").trim();
    const workEmail = String(b.workEmail || "").trim();
    const company = String(b.company || "").trim();

    if (!name || !workEmail || !company) {
      return NextResponse.json(
        { error: "Please include your name, work email, and company." },
        { status: 400 }
      );
    }

    const lead = {
      name,
      workEmail,
      company,
      role: String(b.role || "").trim() || null,
      teamSize: String(b.teamSize || "").trim() || null,
      useCase: String(b.useCase || "").trim() || null,
      timeline: String(b.timeline || "").trim() || null,
      notes: String(b.notes || "").trim() || null,
    };

    const ok = await recordEnterpriseLead(lead);
    if (!ok) {
      return NextResponse.json({ error: "Couldn't save your request right now." }, { status: 503 });
    }

    // Notify (best-effort — don't fail the request if email isn't configured).
    const to = process.env.ENTERPRISE_NOTIFY_EMAIL || process.env.CONTACT_NOTIFY_EMAIL;
    if (process.env.RESEND_API_KEY && to) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const from = process.env.RESEND_FROM_EMAIL || "AskMikeAI <onboarding@resend.dev>";
        await resend.emails.send({
          from,
          to,
          replyTo: workEmail,
          subject: `Enterprise inquiry — ${company}`,
          html: `
            <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:560px;color:#1f2937">
              <h2 style="font-size:18px">New enterprise inquiry</h2>
              <p><strong>Name:</strong> ${esc(name)}</p>
              <p><strong>Work email:</strong> ${esc(workEmail)}</p>
              <p><strong>Company:</strong> ${esc(company)}</p>
              ${lead.role ? `<p><strong>Role:</strong> ${esc(lead.role)}</p>` : ""}
              ${lead.teamSize ? `<p><strong>Team size:</strong> ${esc(lead.teamSize)}</p>` : ""}
              ${lead.timeline ? `<p><strong>Timeline:</strong> ${esc(lead.timeline)}</p>` : ""}
              ${lead.useCase ? `<p><strong>Use case:</strong><br/>${esc(lead.useCase)}</p>` : ""}
              ${lead.notes ? `<p><strong>Notes:</strong><br/>${esc(lead.notes)}</p>` : ""}
            </div>
          `,
        });
      } catch (e) {
        console.error("enterprise notify failed:", e);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("enterprise error:", error);
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
