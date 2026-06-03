import { NextRequest, NextResponse } from "next/server";
import { getStripe, getBaseUrl } from "@/lib/stripe";
import { clampAmount } from "@/lib/pledge";

export async function POST(request: NextRequest) {
  try {
    const { amount, painPoint } = await request.json();
    const dollars = clampAmount(amount);
    const summary = String(painPoint || "").trim().slice(0, 480);

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Payments aren't configured yet. Add STRIPE_SECRET_KEY." },
        { status: 503 }
      );
    }

    const stripe = getStripe();
    const baseUrl = getBaseUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      // The visitor sets the price — create an ad-hoc recurring price at checkout.
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            recurring: { interval: "month" },
            unit_amount: dollars * 100,
            product_data: {
              name: "AskMikeAI Founding License",
              description:
                "Back the build. Mike builds the software that solves your pain point; you license it at the price you set.",
            },
          },
        },
      ],
      // Stripe collects + we later verify ownership of this email.
      billing_address_collection: "auto",
      allow_promotion_codes: false,
      subscription_data: {
        metadata: { painPoint: summary, pledgedMonthly: String(dollars) },
      },
      metadata: { painPoint: summary, pledgedMonthly: String(dollars) },
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
