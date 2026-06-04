"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import CalendlyEmbed from "@/components/CalendlyEmbed";

const PLEDGE_MIN = 5;
const PLEDGE_MAX = 500;
const PLEDGE_DEFAULT = 49;

interface HelperMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
}

export default function BackPage() {
  // Form fields (prefilled from the home page draft).
  const [problem, setProblem] = useState("");
  const [frequency, setFrequency] = useState("");
  const [cost, setCost] = useState("");
  const [price, setPrice] = useState(PLEDGE_DEFAULT);
  const [profileExtra, setProfileExtra] = useState<Record<string, string>>({});

  const [showCall, setShowCall] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Optional helper chat.
  const [helperOpen, setHelperOpen] = useState(false);
  const [hMessages, setHMessages] = useState<HelperMsg[]>([]);
  const [hPrompt, setHPrompt] = useState("");
  const [hLoading, setHLoading] = useState(false);
  const hScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem("pledgeDraft");
      if (!raw) return;
      const d = JSON.parse(raw);
      const p = d.profile || {};
      setProblem(p.problem || d.painPoint || "");
      setFrequency(p.frequency || "");
      setCost(p.cost || "");
      setProfileExtra(p);
      if (typeof d.amount === "number") setPrice(d.amount);
    } catch {
      /* no draft — empty form is fine */
    }
  }, []);

  useEffect(() => {
    const el = hScrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [hMessages]);

  const overMax = price > PLEDGE_MAX;
  const pledgePct = Math.min(
    100,
    Math.max(0, ((Math.min(PLEDGE_MAX, price) - PLEDGE_MIN) / (PLEDGE_MAX - PLEDGE_MIN)) * 100)
  );

  const onPriceInput = (raw: string) => {
    const n = raw === "" ? 0 : Number(raw);
    if (!Number.isFinite(n)) return;
    setPrice(n);
    if (n > PLEDGE_MAX) setShowCall(true);
  };

  const proceed = async () => {
    if (submitting) return;
    if (overMax) {
      setShowCall(true);
      return;
    }
    if (!problem.trim()) {
      setError("Tell us the problem you want solved first.");
      return;
    }
    const amount = Math.min(PLEDGE_MAX, Math.max(PLEDGE_MIN, Math.round(price)));
    setSubmitting(true);
    setError(null);
    try {
      const profile = { ...profileExtra, problem, frequency, cost };
      const res = await fetch("/api/pledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount, painPoint: problem, profile }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Could not start checkout.");
      window.location.href = data.url;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
      setSubmitting(false);
    }
  };

  const sendHelper = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = hPrompt.trim();
    if (!text || hLoading) return;

    const userMsg: HelperMsg = { id: Date.now().toString(), role: "user", content: text };
    const aId = (Date.now() + 1).toString();
    const updated = [...hMessages, userMsg];
    setHMessages([...updated, { id: aId, role: "assistant", content: "", isTyping: true }]);
    setHPrompt("");
    setHLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated.map((m) => ({ role: m.role, content: m.content })) }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setHMessages((prev) =>
          prev.map((m) =>
            m.id === aId ? { ...m, isTyping: false, content: d.message || "I'm having trouble right now." } : m
          )
        );
        setHLoading(false);
        return;
      }
      const reader = res.body?.getReader();
      if (!reader) throw new Error("no reader");
      const dec = new TextDecoder();
      let buffer = "";
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += dec.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          const t = line.trim();
          if (!t.startsWith("data:")) continue;
          const data = t.slice(5).trim();
          if (data === "[DONE]") {
            setHMessages((prev) => prev.map((m) => (m.id === aId ? { ...m, isTyping: false } : m)));
            continue;
          }
          try {
            const j = JSON.parse(data);
            if (j.content) {
              acc += j.content;
              const c = acc;
              setHMessages((prev) => prev.map((m) => (m.id === aId ? { ...m, content: c } : m)));
            } else if (j.profile && typeof j.profile === "object") {
              // Fill the form from what the helper understood.
              const p = j.profile as Record<string, string>;
              setProfileExtra((prev) => ({ ...prev, ...p }));
              if (p.problem?.trim()) setProblem(p.problem.trim());
              if (p.frequency?.trim()) setFrequency(p.frequency.trim());
              if (p.cost?.trim()) setCost(p.cost.trim());
            }
          } catch {
            /* skip */
          }
        }
      }
    } catch {
      setHMessages((prev) =>
        prev.map((m) => (m.id === aId ? { ...m, isTyping: false, content: "I'm having trouble right now." } : m))
      );
    } finally {
      setHLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        <Link href="/" className="text-sm text-gray-500 hover:text-pink-600">
          ← Back to home
        </Link>

        <div className="mt-6 rounded-3xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <h1 className="text-3xl font-display tracking-wide text-gray-900">BACK THE BUILD</h1>
          <p className="mt-2 text-gray-600">
            Confirm the problem and set your price. You&apos;ll be charged your{" "}
            <strong>first month today</strong>, then monthly — cancel anytime.
          </p>

          {/* Pain point (prefilled) */}
          <div className="mt-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">The problem to solve</label>
              <textarea
                value={problem}
                onChange={(e) => setProblem(e.target.value)}
                rows={3}
                placeholder="Describe the pain point…"
                className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
              />
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">How often it happens</label>
                <input
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  placeholder="e.g. every week"
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">What it costs you</label>
                <input
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="e.g. ~5 hours/week"
                  className="mt-1.5 w-full rounded-xl border border-gray-300 px-3 py-2.5 text-gray-900 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>
            </div>
          </div>

          {/* Money setter */}
          <div className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <div className="flex items-baseline justify-between">
              <label htmlFor="price" className="text-sm font-medium text-gray-700">
                Your price, each month
              </label>
              <div className="flex items-baseline gap-0.5">
                <span className="text-3xl font-display tracking-wide text-gray-900">$</span>
                <input
                  id="price"
                  type="number"
                  inputMode="numeric"
                  value={price}
                  min={PLEDGE_MIN}
                  onChange={(e) => onPriceInput(e.target.value)}
                  onBlur={(e) => {
                    const n = Number(e.target.value);
                    if (!Number.isFinite(n) || n < PLEDGE_MIN) setPrice(PLEDGE_MIN);
                  }}
                  aria-label="Set your monthly price"
                  className="w-[4ch] bg-transparent text-3xl font-display tracking-wide text-gray-900 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                />
                <span className="text-sm text-gray-500">/mo</span>
              </div>
            </div>

            <div className="mt-3">
              <div className="relative flex h-11 items-center">
                <div className="h-4 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 via-pink-500 to-coral-500"
                    style={{ width: `${pledgePct}%` }}
                  />
                </div>
                <div
                  className="pointer-events-none absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/10"
                  style={{ left: `${pledgePct}%` }}
                >
                  <span className="text-lg font-bold text-pink-600">$</span>
                </div>
                <input
                  type="range"
                  min={PLEDGE_MIN}
                  max={PLEDGE_MAX}
                  step={1}
                  value={Math.min(PLEDGE_MAX, Math.max(PLEDGE_MIN, price))}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="absolute inset-0 h-11 w-full cursor-pointer opacity-0"
                  aria-label="Monthly price slider"
                />
              </div>
              <div className="mt-1.5 flex justify-between text-xs text-gray-500">
                <span>${PLEDGE_MIN}</span>
                <span>${PLEDGE_MAX}/mo</span>
              </div>
            </div>

            {overMax && (
              <div className="mt-4 rounded-xl border border-pink-200 bg-pink-50 p-3 text-sm text-pink-800">
                For pledges above <strong>${PLEDGE_MAX}/mo</strong>, let&apos;s talk first.{" "}
                <button onClick={() => setShowCall(true)} className="font-semibold underline">
                  Schedule a call with Mike
                </button>
                .
              </div>
            )}
          </div>

          {error && <p className="mt-4 text-sm text-coral-600">{error}</p>}

          <button
            onClick={proceed}
            disabled={submitting}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-pink-600 to-coral-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.01] hover:shadow-pink-600/40 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          >
            {submitting
              ? "Taking you to checkout…"
              : overMax
              ? "Schedule a call with Mike"
              : `Continue to secure checkout — $${Math.max(PLEDGE_MIN, Math.round(price))}/mo`}
          </button>
          <p className="mt-3 text-center text-xs text-gray-500">
            Secure payment by Stripe. You confirm your email and book a Zoom with Mike right after.
          </p>
        </div>
      </div>

      {/* Optional helper chat */}
      {!helperOpen && (
        <button
          onClick={() => setHelperOpen(true)}
          className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-xl hover:bg-gray-800"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10.5h8M8 14h5m-9 7l3.5-2H17a3 3 0 003-3V7a3 3 0 00-3-3H7a3 3 0 00-3 3v14z" />
          </svg>
          Need help?
        </button>
      )}

      {helperOpen && (
        <div className="fixed bottom-5 right-5 z-40 flex h-[28rem] w-[22rem] max-w-[calc(100vw-2.5rem)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-200 bg-gray-900 px-4 py-3 text-white">
            <span className="text-sm font-semibold">Mike&apos;s assistant</span>
            <button onClick={() => setHelperOpen(false)} aria-label="Close" className="text-gray-300 hover:text-white">
              ✕
            </button>
          </div>
          <div ref={hScrollRef} className="flex-1 space-y-3 overflow-y-auto p-4 text-sm">
            {hMessages.length === 0 && (
              <p className="text-gray-500">
                Ask me anything about backing the build — or just tell me your problem and I&apos;ll fill
                the form for you.
              </p>
            )}
            {hMessages.map((m) => (
              <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
                <span
                  className={`inline-block rounded-2xl px-3 py-2 ${
                    m.role === "user" ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {m.content || (m.isTyping ? "…" : "")}
                </span>
              </div>
            ))}
          </div>
          <form onSubmit={sendHelper} className="border-t border-gray-200 p-3">
            <div className="flex items-center gap-2">
              <input
                value={hPrompt}
                onChange={(e) => setHPrompt(e.target.value)}
                placeholder="Type a message…"
                disabled={hLoading}
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-gray-900 focus:border-pink-500 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!hPrompt.trim() || hLoading}
                className="rounded-xl bg-pink-600 px-3 py-2 text-white disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Schedule-a-call modal (for > $500/mo) */}
      {showCall && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 py-10">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-display tracking-wide text-gray-900">LET&apos;S TALK</h2>
                <p className="mt-1 text-gray-600">
                  For pledges above ${PLEDGE_MAX}/mo, Mike likes to hop on a quick call first. Grab a time
                  below.
                </p>
              </div>
              <button
                onClick={() => setShowCall(false)}
                aria-label="Close"
                className="ml-4 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="mt-5">
              <CalendlyEmbed />
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
