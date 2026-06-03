import Stripe from "stripe";

let cached: Stripe | null = null;

/** Lazily construct the Stripe client so the app still boots without keys set. */
export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY is not configured");
  }
  cached = new Stripe(key);
  return cached;
}

/** Absolute base URL for building Stripe redirect + email links. */
export function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  );
}
