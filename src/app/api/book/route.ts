import { NextResponse } from "next/server";
import { getStripe, getBaseUrl } from "@/lib/stripe";

// Booking donation (USD) — proceeds go to a local AI community. Filters the
// calendar for serious people without it being income for Mike.
const BOOKING_DONATION = 50;

export async function POST() {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: "Payments aren't configured yet." }, { status: 503 });
    }

    const stripe = getStripe();
    const baseUrl = getBaseUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            unit_amount: BOOKING_DONATION * 100,
            product_data: {
              name: "30-minute call with Mike",
              description: "Booking donation — proceeds go to a local AI community.",
            },
          },
        },
      ],
      billing_address_collection: "auto",
      metadata: { type: "call_booking", donationUsd: String(BOOKING_DONATION) },
      success_url: `${baseUrl}/contact/booked?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/contact?booking=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("book error:", error);
    return NextResponse.json({ error: "Could not start booking." }, { status: 500 });
  }
}
