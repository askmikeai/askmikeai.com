import Link from "next/link";
import CalendlyEmbed from "@/components/CalendlyEmbed";
import { verifyPledgeToken } from "@/lib/pledge";

export const metadata = {
  title: "Confirm your pledge - AskMikeAI",
};

export default function PledgeVerifyPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const payload = searchParams.token ? verifyPledgeToken(searchParams.token) : null;

  if (!payload) {
    return (
      <section className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-gray-50">
        <div className="max-w-lg w-full bg-white rounded-3xl p-10 shadow-lg border border-gray-200 text-center">
          <h1 className="text-2xl font-bold text-gray-900">This link is invalid or expired.</h1>
          <p className="mt-3 text-gray-600">
            Confirmation links are valid for 7 days. If yours expired, get in touch and we&apos;ll
            send a fresh one.
          </p>
          <Link href="/contact" className="mt-6 inline-block text-pink-600 font-semibold underline">
            Contact Mike
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="bg-gray-50">
      <section className="px-4 pt-16 pb-8">
        <div className="max-w-3xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-teal-600 font-semibold tracking-wide uppercase">Email confirmed</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-display tracking-wide text-gray-900">
            LET&apos;S GET ON A CALL
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            You&apos;re backing the build at{" "}
            <strong className="text-gray-900">${payload.amount}/month</strong>. Grab a time below and
            we&apos;ll dig into your pain point together over Zoom.
          </p>
          {payload.painPoint && (
            <p className="mt-4 text-sm text-gray-500 italic max-w-xl mx-auto">
              &ldquo;{payload.painPoint}&rdquo;
            </p>
          )}
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="max-w-3xl mx-auto">
          <CalendlyEmbed />
        </div>
      </section>
    </div>
  );
}
