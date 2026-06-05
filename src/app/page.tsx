"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import AiHelper from "@/components/AiHelper";

// Visitor sets the price within this range (kept in sync with src/lib/pledge.ts).
const PLEDGE_MIN = 5;
const PLEDGE_MAX = 500;
const PLEDGE_DEFAULT = 49;

const STARTERS = [
  "I waste hours every week on…",
  "There's no good tool for…",
  "My team keeps getting stuck on…",
  "I'd pay anything to never again…",
];

const pillars = [
  {
    title: "Builder",
    description:
      "I ship real software. The products I make start with a problem worth solving, not a pitch deck.",
    gradient: "from-pink-600 to-coral-600",
    icon: "M11.42 15.17L17.25 21A2.652 2.652 0 0021 17.25l-5.877-5.877M11.42 15.17l2.496-3.03c.317-.384.74-.626 1.208-.766M11.42 15.17l-4.655 5.653a2.548 2.548 0 11-3.586-3.586l6.837-5.63m5.108-.233c.55-.164 1.163-.188 1.743-.14a4.5 4.5 0 004.486-6.336l-3.276 3.277a3.004 3.004 0 01-2.25-2.25l3.276-3.276a4.5 4.5 0 00-6.336 4.486c.091 1.076-.071 2.264-.904 2.95l-.102.085m-1.745 1.437L5.909 7.5H4.5L2.25 3.75l1.5-1.5L7.5 4.5v1.409l4.26 4.26m-1.745 1.437l1.745-1.437m6.615 8.206L15.75 15.75M4.867 19.125h.008v.008h-.008v-.008z",
  },
  {
    title: "Educator",
    description:
      "I teach what I learn — breaking AI down so people can actually use it, not just nod along.",
    gradient: "from-teal-600 to-ocean-600",
    icon: "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5",
  },
  {
    title: "Community",
    description:
      "I'm in the room with the AI community — sharing, learning in the open, and building alongside other makers.",
    gradient: "from-coral-600 to-pink-600",
    icon: "M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z",
  },
  {
    title: "Writer",
    description:
      "I write about what I'm building and figuring out. Thinking out loud, in public, one post at a time.",
    gradient: "from-ocean-600 to-teal-600",
    icon: "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10",
  },
];

const steps = [
  {
    step: "01",
    title: "Describe the pain",
    description: "Tell me the problem that's genuinely costing you time, money, or sleep.",
  },
  {
    step: "02",
    title: "Name your price",
    description: "Slide to what making it disappear is worth to you each month. You set it.",
  },
  {
    step: "03",
    title: "Confirm & book",
    description: "Verify your email, then grab a Zoom with me so we can build the right thing.",
  },
];

export default function Home() {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [problem, setProblem] = useState("");
  const [pledge, setPledge] = useState(PLEDGE_DEFAULT);
  const [pledging, setPledging] = useState(false);
  const [pledgeError, setPledgeError] = useState<string | null>(null);
  // Extra fields the optional AI assist captures (carried to /pledge).
  const [profile, setProfile] = useState<Record<string, string>>({});

  const problemReady = problem.trim().length > 0;
  const clampPledge = (v: number) =>
    Math.min(PLEDGE_MAX, Math.max(PLEDGE_MIN, Math.round(v)));
  const pledgePct = Math.min(
    100,
    Math.max(0, ((pledge - PLEDGE_MIN) / (PLEDGE_MAX - PLEDGE_MIN)) * 100)
  );

  const handlePledge = () => {
    if (pledging || !problemReady) return;
    setPledging(true);
    setPledgeError(null);
    try {
      sessionStorage.setItem(
        "pledgeDraft",
        JSON.stringify({
          amount: pledge,
          painPoint: problem.trim(),
          profile: { ...profile, problem: problem.trim() },
        })
      );
      router.push("/pledge");
    } catch {
      setPledgeError("Could not continue. Please try again.");
      setPledging(false);
    }
  };

  // AI assist fills the form.
  const handleFill = (p: Record<string, string>) => {
    if (p.problem?.trim()) setProblem(p.problem.trim());
    setProfile((prev) => ({ ...prev, ...p }));
  };

  const stepState = (n: number) => {
    if (n === 1) return problemReady ? "done" : "active";
    if (n === 2) return problemReady ? "active" : "todo";
    return "todo";
  };

  return (
    <div>
      {/* Hero — pain-point form */}
      <section className="relative overflow-hidden bg-[#212121] py-12 sm:py-16">
        <div className="relative mx-auto max-w-2xl px-4">
          {/* Value prop */}
          <div className="flex flex-col items-center text-center">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-pink-500 to-coral-500 flex items-center justify-center mb-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-4xl font-medium text-white">Have a pain point?</h1>
            <p className="mt-2 max-w-xl text-sm sm:text-base text-gray-300">
              Tell me the problem costing you time, money, or sleep. If I take it on, you back the
              build at <span className="font-medium text-white">the price you set</span> — and
              you&apos;re not charged unless I accept it.
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] sm:text-xs text-gray-500">
              <span className="inline-flex items-center gap-1">
                <svg className="h-3.5 w-3.5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 0h10.5a1.5 1.5 0 011.5 1.5v6a1.5 1.5 0 01-1.5 1.5H6.75a1.5 1.5 0 01-1.5-1.5v-6a1.5 1.5 0 011.5-1.5z" />
                </svg>
                Secured by Stripe
              </span>
              <span className="text-gray-700">·</span>
              <span>Cancel anytime</span>
              <span className="text-gray-700">·</span>
              <span>From $5/mo — you set it</span>
            </div>
          </div>

          {/* Step guide */}
          <div className="mt-6 flex items-center justify-center gap-1.5 sm:gap-3 text-xs">
            {[
              { n: 1, label: "Describe your pain point" },
              { n: 2, label: "Name your price" },
              { n: 3, label: "Back the build" },
            ].map((s, i) => {
              const state = stepState(s.n);
              return (
                <div key={s.n} className="flex items-center gap-1.5 sm:gap-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                        state === "done"
                          ? "bg-teal-500 text-white"
                          : state === "active"
                          ? "bg-pink-500 text-white"
                          : "bg-[#424242] text-gray-400"
                      }`}
                    >
                      {state === "done" ? "✓" : s.n}
                    </span>
                    <span className={`hidden sm:inline ${state === "todo" ? "text-gray-500" : "text-gray-200"}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < 2 && <span className="text-gray-600">→</span>}
                </div>
              );
            })}
          </div>

          {/* The form */}
          <div className="mt-6 rounded-2xl border border-[#424242] bg-[#2f2f2f] p-5 shadow-xl">
            <label htmlFor="problem" className="block text-sm font-medium text-gray-200">
              What&apos;s the problem you want solved?
            </label>
            <textarea
              id="problem"
              ref={textareaRef}
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              rows={3}
              placeholder="Describe your pain point…"
              className="mt-2 w-full resize-none rounded-xl border border-[#424242] bg-[#212121] px-4 py-3 text-white placeholder-gray-500 focus:border-pink-500 focus:outline-none"
            />

            {/* Quick starters + AI assist */}
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {STARTERS.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setProblem((p) => (p ? p : label + " "));
                    textareaRef.current?.focus();
                  }}
                  className="rounded-lg border border-[#424242] bg-[#212121] px-3 py-1.5 text-xs text-gray-300 transition-colors hover:bg-[#3f3f3f]"
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mt-3">
              <AiHelper onFill={handleFill} />
            </div>

            {/* Money setter */}
            <div className="mt-6 border-t border-[#424242] pt-5">
              <div className="flex items-baseline justify-between">
                <label htmlFor="pledge" className="text-sm font-medium text-gray-300">
                  What&apos;s solving it worth, each month?
                </label>
                <div className="flex items-baseline gap-0.5">
                  <span className="text-3xl font-display tracking-wide text-white">$</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={pledge}
                    min={PLEDGE_MIN}
                    max={PLEDGE_MAX}
                    onChange={(e) => setPledge(e.target.value === "" ? PLEDGE_MIN : Number(e.target.value))}
                    onBlur={(e) => setPledge(clampPledge(Number(e.target.value) || PLEDGE_DEFAULT))}
                    aria-label="Set your monthly price"
                    className="w-[3.2ch] bg-transparent text-3xl font-display tracking-wide text-white focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <span className="text-gray-400 text-sm">/mo</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="relative flex h-11 items-center">
                  <div className="h-4 w-full overflow-hidden rounded-full bg-[#424242]">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 via-pink-500 to-coral-500"
                      style={{ width: `${pledgePct}%` }}
                    ></div>
                  </div>
                  <div
                    className="pointer-events-none absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lg ring-1 ring-black/10"
                    style={{ left: `${pledgePct}%` }}
                  >
                    <span className="text-lg font-bold text-pink-600">$</span>
                  </div>
                  <input
                    id="pledge"
                    type="range"
                    min={PLEDGE_MIN}
                    max={PLEDGE_MAX}
                    step={1}
                    value={Math.min(PLEDGE_MAX, Math.max(PLEDGE_MIN, pledge))}
                    onChange={(e) => setPledge(Number(e.target.value))}
                    className="absolute inset-0 h-11 w-full cursor-pointer opacity-0"
                    aria-label="Monthly pledge amount"
                  />
                </div>
                <div className="mt-1.5 flex justify-between text-xs text-gray-500">
                  <span>${PLEDGE_MIN}</span>
                  <span>${PLEDGE_MAX}/mo</span>
                </div>
              </div>

              <button
                onClick={handlePledge}
                disabled={pledging || !problemReady}
                title={!problemReady ? "Describe your pain point to continue" : undefined}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-pink-600 to-coral-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition-all hover:scale-[1.01] hover:shadow-pink-600/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg"
              >
                {pledging
                  ? "Continuing…"
                  : problemReady
                  ? `Back the build — $${pledge}/mo`
                  : "Describe your pain point to continue"}
              </button>

              {pledgeError && <p className="mt-2 text-center text-sm text-coral-400">{pledgeError}</p>}
              <p className="mt-3 text-center text-xs text-gray-500">
                You set the price. I review every request — if I don&apos;t take yours on,
                you&apos;re not charged. Next: confirm the details, then book a Zoom with me.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Segment: solo/SMB vs teams */}
      <section className="bg-[#1a1a1a] py-6">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-3 px-4 text-center sm:flex-row">
          <p className="text-sm text-gray-400">
            Buying for a team — with procurement, security review, and annual licensing?
          </p>
          <Link
            href="/enterprise"
            className="inline-flex shrink-0 items-center gap-1 rounded-full border border-teal-500/40 bg-teal-500/10 px-4 py-2 text-sm font-semibold text-teal-300 transition-colors hover:bg-teal-500/20"
          >
            AskMikeAI for Enterprise →
          </Link>
        </div>
      </section>

      {/* What I do - pillars */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-pink-600 font-semibold tracking-wide uppercase">Who I Am</p>
            <h2 className="mt-2 text-4xl font-display tracking-wide text-gray-900 sm:text-5xl">
              NOT A CONSULTANT.<br />A MAKER.
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              I build, I teach, I show up for the AI community, and I write about all of it.
              The pledge above is how I decide what to build next.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="group relative rounded-3xl border border-gray-200 p-8 hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${pillar.gradient} text-white shadow-lg`}>
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d={pillar.icon} />
                  </svg>
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">{pillar.title}</h3>
                <p className="mt-2 text-gray-600">{pillar.description}</p>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${pillar.gradient} rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How the pledge works */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-teal-600 font-semibold tracking-wide uppercase">How It Works</p>
            <h2 className="mt-2 text-4xl font-display tracking-wide text-gray-900 sm:text-5xl">
              YOU SET THE PRICE. I BUILD THE THING.
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              No quotes, no scopes of work, no consulting hours. You tell me what a solution is
              worth to you — and back it.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {steps.map((s) => (
              <div key={s.step} className="text-center group">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-pink-600 to-coral-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-display text-white">{s.step}</span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">{s.title}</h3>
                <p className="mt-2 text-gray-600">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Straight answers (objection-handling FAQ) */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-pink-600 font-semibold tracking-wide uppercase">Straight Answers</p>
            <h2 className="mt-2 text-4xl font-display tracking-wide text-gray-900 sm:text-5xl">
              BEFORE YOU PAY
            </h2>
          </div>
          <div className="mt-12 space-y-6">
            {[
              {
                q: "Am I buying a product or access?",
                a: "You're funding a fix for your specific problem. If I build it, you get access — a license — at the monthly price you set. I build and own the software.",
              },
              {
                q: "Can you decline my request?",
                a: "Yes. I review every submission and only take on problems I can genuinely solve well. If I decline, your first payment is refunded — you're never charged for a build I won't do.",
              },
              {
                q: "What if you never ship?",
                a: "Cancel anytime from Stripe. You're backing an active build, not a vague promise — and I work in public, so you can see progress.",
              },
              {
                q: "Who owns the software and my data?",
                a: "I build and own the software; you hold a license at your price. Your problem details are used to build and improve your tool — not sold.",
              },
              {
                q: "Why this instead of a contractor or SaaS?",
                a: "No hourly quotes, no shelf-ware you bend to fit. You name what solving your exact problem is worth — and only pay if I take it on.",
              },
            ].map((item) => (
              <div key={item.q} className="rounded-2xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900">{item.q}</h3>
                <p className="mt-2 text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-700 via-teal-600 to-ocean-700"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-display tracking-wide text-white sm:text-5xl">
            WHAT WOULD YOU PAY TO MAKE IT GO AWAY?
          </h2>
          <p className="mt-4 text-xl text-teal-100 max-w-2xl mx-auto">
            Scroll back up, describe your pain point, and name your price. Let&apos;s build the
            thing you actually need.
          </p>
          <Link
            href="/about"
            className="mt-8 inline-block rounded-full bg-white px-10 py-4 text-lg font-semibold text-teal-700 shadow-xl hover:bg-gray-100 hover:scale-105 transition-all"
          >
            More about Mike
          </Link>
        </div>
      </section>
    </div>
  );
}
