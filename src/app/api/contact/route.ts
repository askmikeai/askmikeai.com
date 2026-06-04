import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const { name, email, company, message } = await request.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json({ error: "Please fill in your name, email, and message." }, { status: 400 });
    }

    const to = process.env.CONTACT_NOTIFY_EMAIL;
    if (!process.env.RESEND_API_KEY || !to) {
      // Don't fake success — tell the client it couldn't be delivered.
      return NextResponse.json(
        { error: "Messaging isn't configured yet." },
        { status: 503 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM_EMAIL || "AskMikeAI <onboarding@resend.dev>";

    await resend.emails.send({
      from,
      to,
      replyTo: String(email).trim(),
      subject: `New contact from ${String(name).trim()}`,
      html: `
        <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:560px;color:#1f2937">
          <h2 style="font-size:18px">New message via askmikeai.com</h2>
          <p><strong>Name:</strong> ${escapeHtml(name)}</p>
          <p><strong>Email:</strong> ${escapeHtml(email)}</p>
          ${company ? `<p><strong>Company:</strong> ${escapeHtml(company)}</p>` : ""}
          <p><strong>Message:</strong></p>
          <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("contact error:", error);
    return NextResponse.json({ error: "Could not send your message." }, { status: 500 });
  }
}

function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
