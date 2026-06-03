"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SuccessInner() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState<"loading" | "sent" | "error">("loading");
  const [email, setEmail] = useState<string | null>(null);
  const [devLink, setDevLink] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionId) {
      setState("error");
      return;
    }
    fetch("/api/pledge/send-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (r) => {
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || "failed");
        setEmail(data.email ?? null);
        if (data.verifyUrl) setDevLink(data.verifyUrl); // email not wired yet
        setState("sent");
      })
      .catch(() => setState("error"));
  }, [sessionId]);

  return (
    <section className="min-h-[70vh] flex items-center justify-center px-4 py-20 bg-gray-50">
      <div className="max-w-lg w-full bg-white rounded-3xl p-10 shadow-lg border border-gray-200 text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {state === "loading" && (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Confirming your pledge…</h1>
            <p className="mt-3 text-gray-600">One moment while we set things up.</p>
          </>
        )}

        {state === "sent" && (
          <>
            <h1 className="text-2xl font-bold text-gray-900">Thank you for backing the build.</h1>
            <p className="mt-3 text-gray-600">
              We just sent a confirmation link{email ? ` to ${email}` : ""}. Open it to verify your
              email and book your call with Mike.
            </p>
            {devLink && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl text-left">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                  Email not configured yet — dev link
                </p>
                <Link href={devLink} className="text-sm text-pink-600 break-all underline">
                  {devLink}
                </Link>
              </div>
            )}
          </>
        )}

        {state === "error" && (
          <>
            <h1 className="text-2xl font-bold text-gray-900">We couldn&apos;t confirm that.</h1>
            <p className="mt-3 text-gray-600">
              Your pledge may still have gone through. Reach out and we&apos;ll sort it out.
            </p>
            <Link href="/contact" className="mt-6 inline-block text-pink-600 font-semibold underline">
              Contact Mike
            </Link>
          </>
        )}
      </div>
    </section>
  );
}

export default function PledgeSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[70vh]" />}>
      <SuccessInner />
    </Suspense>
  );
}
