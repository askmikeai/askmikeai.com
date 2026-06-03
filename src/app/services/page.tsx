import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What I Build - AskMikeAI",
  description:
    "Mike builds AI-powered software that solves real, specific problems — priced by the people who have the problem.",
};

const things = [
  {
    title: "AI Tools That Do One Job Well",
    description:
      "Focused software that takes a painful, repetitive task and just handles it. No bloat, no fifty features you'll never touch — the one thing you actually needed.",
    features: [
      "Automating the work you dread",
      "Turning a messy manual process into one click",
      "Pulling signal out of piles of documents or data",
      "Wiring AI into the tools you already use",
    ],
    gradient: "from-pink-600 to-coral-600",
  },
  {
    title: "Custom Builds From Your Pain Point",
    description:
      "You describe the problem; I build the fix. The product starts from your specific frustration, not a generic template — and you set what it's worth to you.",
    features: [
      "Built around your actual workflow",
      "Shipped, not slide-decked",
      "Priced by you, monthly",
      "Owned by me, licensed to you",
    ],
    gradient: "from-teal-600 to-ocean-600",
  },
  {
    title: "Teaching & Workshops",
    description:
      "I break AI down so you can actually use it. Plain language, hands-on, no jargon for its own sake — whether you're just starting or going deep.",
    features: [
      "Hands-on, build-along sessions",
      "AI literacy without the hype",
      "Practical prompting and tooling",
      "Learning in the open",
    ],
    gradient: "from-coral-600 to-pink-600",
  },
  {
    title: "Building In Public",
    description:
      "I share the process as it happens — what's working, what broke, what I'm learning. Follow along, steal what's useful, and build alongside the community.",
    features: [
      "Writing about real builds",
      "Sharing wins and failures",
      "Showing the actual work",
      "Community over gatekeeping",
    ],
    gradient: "from-ocean-600 to-teal-600",
  },
];

const steps = [
  { step: "01", title: "Describe the pain", description: "Tell me the problem that's genuinely costing you." },
  { step: "02", title: "Name your price", description: "Decide what a monthly fix is worth to you." },
  { step: "03", title: "Confirm & book", description: "Verify your email and grab a Zoom with me." },
  { step: "04", title: "I build it", description: "You license the software at the price you set." },
];

export default function WhatIBuildPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-800 to-ocean-800 py-24">
        <div className="absolute top-20 right-20 w-72 h-72 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-teal-200 font-semibold tracking-wide uppercase mb-4">What I Build</p>
            <h1 className="text-5xl font-display tracking-wide text-white sm:text-6xl">
              SOFTWARE, NOT SLIDE DECKS
            </h1>
            <p className="mt-6 text-xl text-teal-100">
              I build AI-powered tools that solve real, specific problems. I teach what I learn,
              I share the process in public, and I let the people with the problem set the price.
            </p>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Grid */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            {things.map((thing, index) => (
              <div
                key={index}
                className="group relative border border-gray-200 rounded-3xl p-8 hover:shadow-2xl transition-all duration-300"
              >
                <div className={`inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br ${thing.gradient} items-center justify-center shadow-lg`}>
                  <span className="text-2xl font-display text-white">{index + 1}</span>
                </div>
                <h3 className="mt-6 text-2xl font-bold text-gray-900">{thing.title}</h3>
                <p className="mt-4 text-gray-600">{thing.description}</p>
                <ul className="mt-6 space-y-2">
                  {thing.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <div className={`w-5 h-5 rounded-full bg-gradient-to-br ${thing.gradient} flex items-center justify-center mr-3`}>
                        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${thing.gradient} rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-teal-600 font-semibold tracking-wide uppercase">How It Works</p>
            <h2 className="mt-2 text-4xl font-display tracking-wide text-gray-900 sm:text-5xl">
              THE DEAL
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              You set the price. I build and own the software. You license it at your price.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-4">
            {steps.map((phase, index) => (
              <div key={index} className="text-center group">
                <div className="mx-auto h-20 w-20 rounded-full bg-gradient-to-br from-pink-600 to-coral-600 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <span className="text-2xl font-display text-white">{phase.step}</span>
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">{phase.title}</h3>
                <p className="mt-2 text-gray-600">{phase.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-700 via-pink-800 to-purple-900"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-display tracking-wide text-white sm:text-5xl">
            WHAT SHOULD I BUILD NEXT?
          </h2>
          <p className="mt-4 text-xl text-pink-200 max-w-2xl mx-auto">
            Maybe it&apos;s your problem. Describe your pain point and name your price.
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
