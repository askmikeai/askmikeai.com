import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { recordPledge } from "@/lib/db";

function esc(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

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
    // setup-mode session: the card is saved but NOTHING has been charged.
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["setup_intent"],
    });

    if (session.status !== "complete") {
      return NextResponse.json({ error: "Card setup not completed." }, { status: 402 });
    }

    const customerId =
      typeof session.customer === "string" ? session.customer : session.customer?.id ?? null;
    const email = session.customer_details?.email || "";
    const m = session.metadata || {};
    const amount = Number(m.pledgedMonthly || 0);
    const painPoint = m.painPoint || "";

    // Make the saved card the customer's default so accepting later just works.
    const si = session.setup_intent as Stripe.SetupIntent | string | null;
    const pm =
      si && typeof si !== "string"
        ? typeof si.payment_method === "string"
          ? si.payment_method
          : si.payment_method?.id ?? null
        : null;
    if (customerId && pm) {
      await stripe.customers.update(customerId, {
        ...(email ? { email } : {}),
        invoice_settings: { default_payment_method: pm },
      });
    }

    // Record a PENDING pledge — card saved, not charged.
    await recordPledge({
      email,
      amount,
      painPoint,
      stripeSessionId: sessionId,
      name: m.name || session.customer_details?.name || "",
      company: m.company || "",
      role: m.role || "",
      frequency: m.frequency || "",
      cost: m.cost || "",
      status: "pending",
      stripeCustomerId: customerId,
    });

    // Notify Mike with everything needed to accept (and charge) the request.
    if (process.env.RESEND_API_KEY && process.env.CONTACT_NOTIFY_EMAIL) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const from = process.env.RESEND_FROM_EMAIL || "AskMikeAI <onboarding@resend.dev>";
      await resend.emails.send({
        from,
        to: process.env.CONTACT_NOTIFY_EMAIL,
        subject: `New pledge request — $${amount}/mo`,
        html: `
          <div style="font-family:ui-sans-serif,system-ui,sans-serif;max-width:560px;color:#1f2937">
            <h2 style="font-size:18px">New pledge request (card saved, not charged)</h2>
            <p><strong>Price:</strong> $${esc(amount)}/mo</p>
            <p><strong>Email:</strong> ${esc(email)}</p>
            <p><strong>Problem:</strong> ${esc(painPoint)}</p>
            ${m.company ? `<p><strong>Company:</strong> ${esc(m.company)}</p>` : ""}
            <p><strong>Stripe customer:</strong> ${esc(customerId)}</p>
            <p style="color:#6b7280;font-size:13px">To accept: create a subscription for this customer
            at $${esc(amount)}/mo (their card is already the default payment method). To decline, do
            nothing — they're never charged.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ received: true, email });
  } catch (error) {
    console.error("pledge record error:", error);
    return NextResponse.json(
      { error: "Could not record your request." },
      { status: 500 }
    );
  }
}
