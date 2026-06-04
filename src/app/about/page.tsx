import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Mike - AskMikeAI",
  description:
    "Mike is a builder, educator, and member of the AI community who makes software that solves real problems.",
};

const pillars = [
  {
    title: "Builder",
    description:
      "I ship software. Real products that solve real problems — not slide decks, not roadmaps, not retainers. The work either runs in production or it doesn't.",
  },
  {
    title: "Educator",
    description:
      "I teach what I learn as I learn it. AI moves fast, and most people don't need a lecture — they need someone to make it usable. So I break it down in plain language.",
  },
  {
    title: "Community",
    description:
      "I'm part of the AI community, not above it. I learn in the open, share what works and what doesn't, and build alongside other makers who are figuring this out too.",
  },
  {
    title: "Writer",
    description:
      "I write to think. Notes on what I'm building, what's breaking, and what I'm starting to understand — published in public, one post at a time.",
  },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gray-900 py-24">
        <div className="absolute top-20 right-20 w-72 h-72 bg-pink-600/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-10 lg:gap-16 items-center">
            <div className="max-w-3xl">
              <p className="text-pink-400 font-semibold tracking-wide uppercase mb-4">About</p>
              <h1 className="text-5xl font-display tracking-wide text-white sm:text-6xl">
                HI, I&apos;M MIKE.
              </h1>
              <p className="mt-6 text-xl text-gray-300">
                I&apos;m a builder, an educator, and a member of the AI community. I&apos;m not a
                consultant — I don&apos;t sell strategy by the hour. I make software that solves real
                problems, and I let the people who have the problem decide what it&apos;s worth.
              </p>
            </div>
            <div className="relative mx-auto lg:mx-0 shrink-0">
              <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-pink-500/40 to-teal-500/30 blur-2xl"></div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mike.jpg"
                alt="Mike Friedberg"
                width={288}
                height={288}
                className="relative h-56 w-56 sm:h-72 sm:w-72 rounded-full object-cover ring-4 ring-white/10 shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-teal-600 font-semibold tracking-wide uppercase">How I Work</p>
              <h2 className="mt-2 text-4xl font-display tracking-wide text-gray-900">
                FIND THE PAIN. BUILD THE FIX.
              </h2>
              <div className="mt-6 space-y-4 text-gray-600">
                <p>
                  The best software starts with a problem that genuinely hurts — something that
                  costs a real person time, money, or sleep. Not a market opportunity on a slide.
                  An actual, specific, nagging pain.
                </p>
                <p>
                  So that&apos;s where I start. You tell me what&apos;s slowing you down. If it
                  resonates — if it&apos;s a problem worth solving for you and probably others — I
                  build the software to fix it.
                </p>
                <p>
                  And instead of quoting you a price, I let you set it. You decide what making the
                  problem disappear is worth each month. I build and own the tool; you license it at
                  your price. That&apos;s the whole deal.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-pink-700 via-pink-800 to-purple-900 rounded-3xl p-10 text-white shadow-2xl">
                <blockquote className="text-xl italic">
                  &ldquo;I&apos;d rather build one thing that genuinely fixes your problem than
                  consult on ten that never ship.&rdquo;
                </blockquote>
                <p className="mt-6 font-display text-2xl tracking-wide">— MIKE</p>
                <p className="text-pink-300">Builder · Educator · AI community</p>
              </div>
              <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-teal-500/30 rounded-full blur-2xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Currently building */}
      <section className="py-20 bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-teal-400 font-semibold tracking-wide uppercase">Currently Building</p>
            <h2 className="mt-2 text-4xl font-display tracking-wide text-white sm:text-5xl">
              WHAT I&apos;M SHIPPING NOW
            </h2>
            <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
              Two products in active development right now.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
            {[
              { name: "NextHello.ai", href: "https://nexthello.ai" },
              { name: "MergeRequest.ai", href: "https://mergerequest.ai" },
            ].map((product) => (
              <a
                key={product.name}
                href={product.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between rounded-3xl border border-white/10 bg-white/5 p-8 transition-colors hover:bg-white/10"
              >
                <div>
                  <h3 className="text-2xl font-bold text-white">{product.name}</h3>
                  <p className="mt-1 text-sm text-gray-400">{product.href.replace("https://", "")}</p>
                </div>
                <svg
                  className="h-6 w-6 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-coral-600 font-semibold tracking-wide uppercase">What I Do</p>
            <h2 className="mt-2 text-4xl font-display tracking-wide text-gray-900 sm:text-5xl">
              FOUR THINGS, ONE THREAD
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Everything I do comes back to the same idea: make AI useful, in public, for real people.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="bg-white rounded-3xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-600 to-coral-600 flex items-center justify-center text-white mb-4">
                  <span className="text-xl font-bold">{pillar.title.charAt(0)}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900">{pillar.title}</h3>
                <p className="mt-2 text-gray-600 text-sm">{pillar.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-700 via-pink-800 to-coral-800"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-display tracking-wide text-white sm:text-5xl">
            GOT A PROBLEM WORTH SOLVING?
          </h2>
          <p className="mt-4 text-xl text-pink-200 max-w-2xl mx-auto">
            Tell me your pain point and name what fixing it is worth. If it resonates, I&apos;ll build it.
          </p>
          <Link
            href="/"
            className="mt-8 inline-block rounded-full bg-white px-10 py-4 text-lg font-semibold text-pink-700 shadow-xl hover:bg-gray-100 hover:scale-105 transition-all"
          >
            Back the Build
          </Link>
        </div>
      </section>
    </div>
  );
}
