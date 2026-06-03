# AskMikeAI

Personal site for Mike — **builder, educator, and member of the AI community**. Not a
consultancy. The centerpiece is a "name your price" pledge funnel: a visitor describes a pain
point, sets what a monthly fix is worth, backs it through Stripe, verifies their email, and books
a Zoom. Mike builds and owns the software; the backer licenses it at the price they set.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Payments**: Stripe (subscription Checkout, customer-set price)
- **Email**: Resend (signed email-verification links, no database)
- **Scheduling**: Calendly (configured to create Zoom meetings)
- **Chat**: Ollama (local LLM)

## The pledge flow

1. **Homepage** (`/`) — visitor describes their pain point in the chat box and sets a monthly
   price with the money-bar slider, then hits **Back the Build**.
2. **`POST /api/pledge`** — creates a Stripe subscription Checkout Session at the chosen price
   (pain point saved in metadata) and redirects to Stripe.
3. **`/pledge/success`** — after payment, calls **`POST /api/pledge/send-verification`**, which
   emails a signed confirmation link via Resend.
4. **`/pledge/verify`** — validates the signed token and shows the Calendly/Zoom scheduler.

The verification token is a self-contained HMAC-signed value (see `src/lib/pledge.ts`), so no
database is required.

## Getting Started

```bash
npm install
cp .env.example .env.local   # then fill in the values below
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

See `.env.example`. To exercise the full pledge flow you need:

- `NEXT_PUBLIC_BASE_URL` — e.g. `http://localhost:3000`
- `STRIPE_SECRET_KEY` — start with a **test** key (`sk_test_…`)
- `PLEDGE_SECRET` — any long random string (`openssl rand -hex 32`)
- `RESEND_API_KEY` + `RESEND_FROM_EMAIL` — for the verification email
- `NEXT_PUBLIC_CALENDLY_URL` — the Calendly event (set it to auto-create Zoom meetings)

If `STRIPE_SECRET_KEY` is unset the pledge button returns a clear error; if `RESEND_API_KEY` is
unset the success page surfaces the verification link directly (handy for local testing).

Use Stripe's test card `4242 4242 4242 4242` (any future expiry / CVC) to complete a test pledge.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm start` — start the production server
- `npm run lint` — run ESLint
