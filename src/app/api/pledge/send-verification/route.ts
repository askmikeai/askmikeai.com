import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { getStripe, getBaseUrl } from "@/lib/stripe";
import { signPledgeToken } from "@/lib/pledge";
import { recordPledge } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ error: "Missing session." }, { status: 400 });
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Payments not configured." }, { status: 503 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid" && session.status !== "complete") {
      return NextResponse.json({ error: "Payment not completed." }, { status: 402 });
    }

    const email = session.customer_details?.email || session.customer_email;
    if (!email) {
      return NextResponse.json({ error: "No email on this pledge." }, { status: 400 });
    }

    const amount = Number(session.metadata?.pledgedMonthly || 0);
    const painPoint = session.metadata?.painPoint || "";

    // Collect the pledge (price paid + the problem) in the database. Best-effort.
    await recordPledge({ email, amount, painPoint, stripeSessionId: sessionId });

    const token = signPledgeToken({ email, amount, painPoint });
    const verifyUrl = `${getBaseUrl()}/pledge/verify?token=${encodeURIComponent(token)}`;

    if (!process.env.RESEND_API_KEY) {
      // Email isn't wired yet — return the link so the flow is still testable.
      return NextResponse.json({ sent: false, email, verifyUrl });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const from = process.env.RESEND_FROM_EMAIL || "AskMikeAI <onboarding@resend.dev>";

    await resend.emails.send({
      from,
      to: email,
      subject: "Confirm your pledge & book time with Mike",
      html: `
        <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:520px;margin:0 auto;color:#1f2937">
          <h2 style="font-size:22px">You're in. Let's build it. 🛠️</h2>
          <p>Thanks for backing the build at <strong>$${amount}/month</strong>. One last step: confirm this email is yours, then grab time with me to talk through your pain point.</p>
          <p style="margin:28px 0">
            <a href="${verifyUrl}" style="background:#db2777;color:#fff;padding:14px 28px;border-radius:9999px;text-decoration:none;font-weight:600">Confirm &amp; book my call</a>
          </p>
          <p style="color:#6b7280;font-size:13px">This link is valid for 7 days. If you didn't make this pledge, you can ignore this email.</p>
          <p style="color:#6b7280;font-size:13px">— Mike, AskMikeAI</p>
        </div>
      `,
    });

    return NextResponse.json({ sent: true, email });
  } catch (error) {
    console.error("send-verification error:", error);
    return NextResponse.json(
      { error: "Could not send the confirmation email." },
      { status: 500 }
    );
  }
}
