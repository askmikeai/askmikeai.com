import { NextRequest, NextResponse } from "next/server";
import { getStripe, getBaseUrl } from "@/lib/stripe";
import { clampAmount } from "@/lib/pledge";

export async function POST(request: NextRequest) {
  try {
    const { amount, painPoint, profile } = await request.json();
    const dollars = clampAmount(amount);
    const p: Record<string, string> =
      profile && typeof profile === "object" ? profile : {};
    const field = (v: unknown) => String(v || "").trim().slice(0, 480);
    const summary = field(painPoint || p.problem);

    // Validation profile collected by the chat bot — flows to send-verification.
    const meta: Record<string, string> = {
      painPoint: summary,
      pledgedMonthly: String(dollars),
      name: field(p.name),
      email: field(p.email),
      company: field(p.company),
      role: field(p.role),
      frequency: field(p.frequency),
      cost: field(p.cost),
    };

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payments aren't configured yet. Add STRIPE_SECRET_KEY." },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    const baseUrl = getBaseUrl();

    // Create a Customer to hold the saved card. NOTHING is charged here — we use
    // Checkout `setup` mode to save the card now, and only create the
    // subscription (first charge) if/when Mike accepts the request.
    const customer = await stripe.customers.create({
      email: meta.email || undefined,
      name: meta.name || undefined,
      metadata: meta,
    });

    const session = await stripe.checkout.sessions.create({
      mode: "setup",
      currency: "usd", // required for setup mode with dynamic payment methods
      customer: customer.id,
      metadata: meta,
      success_url: `${baseUrl}/pledge/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/?pledge=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Pledge error:", error);
    return NextResponse.json(
      { error: "Could not start the pledge. Please try again." },
      { status: 500 }
    );
  }
}
