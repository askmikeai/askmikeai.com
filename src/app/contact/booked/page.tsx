"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import CalendlyEmbed from "@/components/CalendlyEmbed";

function BookedInner() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");

  useEffect(() => {
    if (!sessionId) {
      setState("error");
      return;
    }
    fetch("/api/book/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    })
      .then(async (r) => {
        const data = await r.json();
        setState(data.paid ? "ok" : "error");
      })
      .catch(() => setState("error"));
  }, [sessionId]);

  return (
    <main className="min-h-screen bg-gray-50 py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {state === "loading" && (
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center text-gray-600">
            Confirming your donation…
          </div>
        )}

        {state === "error" && (
          <div className="rounded-3xl border border-amber-200 bg-amber-50 p-10 text-center">
            <h1 className="text-2xl font-bold text-amber-900">We couldn&apos;t confirm your booking</h1>
            <p className="mt-2 text-amber-800">
              If you completed the donation and still see this, refresh in a moment — or start again.
            </p>
            <Link
              href="/contact"
              className="mt-6 inline-block rounded-full bg-gradient-to-r from-teal-600 to-ocean-600 px-8 py-3 font-semibold text-white"
            >
              Back to contact
            </Link>
          </div>
        )}

        {state === "ok" && (
          <>
            <div className="text-center">
              <p className="font-semibold uppercase tracking-wide text-teal-600">You&apos;re in</p>
              <h1 className="mt-2 text-3xl font-display tracking-wide text-gray-900 sm:text-4xl">
                PICK YOUR TIME
              </h1>
              <p className="mx-auto mt-3 max-w-xl text-gray-600">
                Thank you — your $50 donation goes to a local AI community. Grab a 30-minute slot below.
              </p>
            </div>
            <div className="mt-8">
              <CalendlyEmbed />
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function BookedPage() {
  return (
    <Suspense fallback={null}>
      <BookedInner />
    </Suspense>
  );
}
