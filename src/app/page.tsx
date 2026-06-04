"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
}

// Visitor sets the price within this range (kept in sync with src/lib/pledge.ts).
const PLEDGE_MIN = 5;
const PLEDGE_MAX = 500;
const PLEDGE_DEFAULT = 49;

// The pledge unlocks once the chat has captured the pain point. Name + email
// are collected later (at Stripe checkout), so they don't gate here.
const REQUIRED_FIELDS: { key: string; label: string }[] = [
  { key: "problem", label: "your pain point" },
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
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Pledge state
  const [pledge, setPledge] = useState(PLEDGE_DEFAULT);
  const [pledging, setPledging] = useState(false);
  const [pledgeError, setPledgeError] = useState<string | null>(null);
  // Validation profile the chat bot fills in; gates the pledge button.
  const [profile, setProfile] = useState<Record<string, string>>({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: prompt.trim(),
    };

    const assistantId = (Date.now() + 1).toString();
    const assistantMessage: Message = {
      id: assistantId,
      role: "assistant",
      content: "",
      isTyping: true,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages([...updatedMessages, assistantMessage]);
    setPrompt("");
    setIsLoading(true);

    if (textareaRef.current) {
      textareaRef.current.style.height = "56px";
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.fallback) {
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantId
                ? { ...msg, content: errorData.message, isTyping: false }
                : msg
            )
          );
          setIsLoading(false);
          return;
        }
        throw new Error("Failed to get response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No reader available");

      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.trim());

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === assistantId ? { ...msg, isTyping: false } : msg
                )
              );
              continue;
            }

            try {
              const json = JSON.parse(data);
              if (json.content) {
                accumulatedContent += json.content;
                const contentToShow = accumulatedContent;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantId ? { ...msg, content: contentToShow } : msg
                  )
                );
              } else if (json.profile && typeof json.profile === "object") {
                // Server's running extraction of the validation fields.
                setProfile(json.profile);
              }
            } catch {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error) {
      console.error("Chat error:", error);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantId
            ? {
                ...msg,
                content:
                  "I apologize, but I encountered an error. Please try again, or reach out directly.",
                isTyping: false,
              }
            : msg
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    e.target.style.height = "56px";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  const handlePledge = async () => {
    if (pledging || !profileComplete) return;
    setPledging(true);
    setPledgeError(null);

    // Prefer the bot's extracted problem; fall back to the raw chat history.
    const fromChat = messages
      .filter((m) => m.role === "user")
      .map((m) => m.content)
      .join(" — ");
    const painPoint = profile.problem || [fromChat, prompt.trim()].filter(Boolean).join(" — ");

    try {
      const res = await fetch("/api/pledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: pledge, painPoint, profile }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Could not start the pledge.");
      }
      window.location.href = data.url;
    } catch (err) {
      setPledgeError(err instanceof Error ? err.message : "Something went wrong.");
      setPledging(false);
    }
  };

  const hasMessages = messages.length > 0;
  const missingFields = REQUIRED_FIELDS.filter((f) => !(profile[f.key] || "").trim());
  const profileComplete = missingFields.length === 0;
  const clampPledge = (v: number) =>
    Math.min(PLEDGE_MAX, Math.max(PLEDGE_MIN, Math.round(v)));
  const pledgePct = Math.min(
    100,
    Math.max(0, ((pledge - PLEDGE_MIN) / (PLEDGE_MAX - PLEDGE_MIN)) * 100)
  );

  return (
    <div>
      {/* Hero - Pain point intake */}
      <section className="relative overflow-hidden h-[calc(100vh-4rem)]">
        <div className="absolute inset-0 bg-[#212121]"></div>

        <div className="relative mx-auto max-w-3xl px-4 flex flex-col h-full">
          {/* Persistent title — stays put, outside the scrolling chat window */}
          <div className="flex flex-col items-center pt-6 pb-3 text-center shrink-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-coral-500 flex items-center justify-center mb-3 shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" />
              </svg>
            </div>
            <h1 className="text-3xl sm:text-5xl font-medium text-white text-center">
              Have a pain point?
            </h1>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto py-4">
            {!hasMessages ? (
              <div className="flex flex-col items-center justify-center pt-2 text-center">
                <p className="text-base sm:text-lg text-gray-400 text-center max-w-xl">
                  I&apos;m Mike. I build software for a living — and my next product won&apos;t come from a
                  boardroom. It&apos;ll come from a real problem that&apos;s genuinely costing someone time,
                  money, or sleep. Tell me what that is for you. If it resonates, I&apos;ll build it.
                </p>

                <div className="flex flex-wrap justify-center gap-2 max-w-xl mt-8">
                  {[
                    "I waste hours every week on…",
                    "There's no good tool for…",
                    "My team keeps getting stuck on…",
                    "I'd pay anything to never again…",
                  ].map((label) => (
                    <button
                      key={label}
                      onClick={() => {
                        setPrompt(label + " ");
                        textareaRef.current?.focus();
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2f2f2f] text-gray-300 text-sm border border-[#424242] hover:bg-[#3f3f3f] transition-colors"
                    >
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 pb-4 pt-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-4">
                    <div className="flex-shrink-0">
                      {message.role === "assistant" ? (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-coral-500 flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                          </svg>
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#5a5a5a] flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-400 mb-1">
                        {message.role === "assistant" ? "Mike's assistant" : "You"}
                      </p>
                      <div className="text-white prose prose-invert prose-sm max-w-none">
                        {message.content.split("\n").map((line, i) => {
                          const parts = line.split(/(\*\*.*?\*\*)/g);
                          return (
                            <p key={i} className={line === "" ? "h-4" : "mb-2"}>
                              {parts.map((part, j) => {
                                if (part.startsWith("**") && part.endsWith("**")) {
                                  return <strong key={j}>{part.slice(2, -2)}</strong>;
                                }
                                return <span key={j}>{part}</span>;
                              })}
                            </p>
                          );
                        })}
                        {message.isTyping && (
                          <span className="inline-block w-2 h-4 bg-gray-400 animate-pulse ml-1"></span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input + pledge - sticky at bottom */}
          <div className="sticky bottom-0 pb-6 pt-4 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent">
            {/* Step guide — lights up as you progress */}
            <div className="mb-3 flex items-center justify-center gap-1.5 sm:gap-3 text-xs">
              {[
                { n: 1, label: "Describe your pain point", state: profileComplete ? "done" : "active" },
                { n: 2, label: "Name your price", state: profileComplete ? "active" : "todo" },
                { n: 3, label: "Back the build", state: "todo" },
              ].map((s, i) => (
                <div key={s.n} className="flex items-center gap-1.5 sm:gap-3">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold ${
                        s.state === "done"
                          ? "bg-teal-500 text-white"
                          : s.state === "active"
                          ? "bg-pink-500 text-white"
                          : "bg-[#424242] text-gray-400"
                      }`}
                    >
                      {s.state === "done" ? "✓" : s.n}
                    </span>
                    <span
                      className={`hidden sm:inline ${
                        s.state === "todo" ? "text-gray-500" : "text-gray-200"
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < 2 && <span className="text-gray-600">→</span>}
                </div>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              <div className="relative bg-[#2f2f2f] rounded-2xl border border-[#424242] shadow-xl">
                <textarea
                  ref={textareaRef}
                  value={prompt}
                  onChange={handleTextareaChange}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  placeholder="Describe your pain point…"
                  rows={1}
                  disabled={isLoading}
                  className="w-full px-4 py-4 pr-12 bg-transparent text-white placeholder-gray-400 focus:outline-none resize-none text-base disabled:opacity-50"
                  style={{ minHeight: "56px", maxHeight: "200px" }}
                />
                <button
                  type="submit"
                  disabled={!prompt.trim() || isLoading}
                  className={`absolute right-2 bottom-2 p-2 rounded-lg transition-all ${
                    prompt.trim() && !isLoading
                      ? "bg-white text-black hover:bg-gray-200"
                      : "bg-[#676767] text-[#2f2f2f] cursor-not-allowed"
                  }`}
                >
                  {isLoading ? (
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                    </svg>
                  )}
                </button>
              </div>
            </form>

            {/* Pledge / name-your-price */}
            <div className="mt-4 bg-[#2f2f2f] rounded-2xl border border-[#424242] shadow-xl p-5">
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
                    onChange={(e) =>
                      setPledge(e.target.value === "" ? PLEDGE_MIN : Number(e.target.value))
                    }
                    onBlur={(e) =>
                      setPledge(clampPledge(Number(e.target.value) || PLEDGE_DEFAULT))
                    }
                    aria-label="Set your monthly price"
                    className="w-[3.2ch] bg-transparent text-3xl font-display tracking-wide text-white focus:outline-none rounded-md [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                  <span className="text-gray-400 text-sm">/mo</span>
                </div>
              </div>

              {/* Money bar */}
              <div className="mt-4">
                <div className="relative h-11 flex items-center">
                  <div className="h-4 w-full rounded-full bg-[#424242] overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-500 via-pink-500 to-coral-500"
                      style={{ width: `${pledgePct}%` }}
                    ></div>
                  </div>
                  {/* Draggable handle: white circle with a $ riding the end of the fill */}
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
                disabled={pledging || !profileComplete}
                title={!profileComplete ? "Describe your pain point in the chat to unlock" : undefined}
                className="mt-4 w-full rounded-xl bg-gradient-to-r from-pink-600 to-coral-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg hover:shadow-pink-600/40 hover:scale-[1.01] transition-all disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-lg"
              >
                {pledging
                  ? "Taking you to checkout…"
                  : profileComplete
                  ? `Back the build — $${pledge}/mo`
                  : "Describe your pain point to unlock"}
              </button>

              {!profileComplete && (
                <p className="mt-2 text-center text-xs text-gray-400">
                  Tell me your pain point in the chat above and the pledge unlocks. You&apos;ll add
                  your details at checkout.
                </p>
              )}

              {pledgeError && (
                <p className="mt-2 text-sm text-coral-400 text-center">{pledgeError}</p>
              )}
              <p className="mt-3 text-center text-xs text-gray-500">
                You set the price. I build and own the software; you license it at your price. After you
                pledge, you&apos;ll confirm your email and book a Zoom with me.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What I do - pillars */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-pink-600 font-semibold tracking-wide uppercase">Who I Am</p>
            <h2 className="mt-2 text-4xl font-display tracking-wide text-gray-900 sm:text-5xl">
              NOT A CONSULTANT. A MAKER.
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
