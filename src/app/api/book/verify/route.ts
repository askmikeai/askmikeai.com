import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    if (!sessionId) {
      return NextResponse.json({ paid: false, error: "Missing session." }, { status: 400 });
    }
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ paid: false, error: "Not configured." }, { status: 503 });
    }

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    const paid = session.payment_status === "paid" || session.status === "complete";

    return NextResponse.json({ paid });
  } catch (error) {
    console.error("book verify error:", error);
    return NextResponse.json({ paid: false }, { status: 500 });
  }
}
