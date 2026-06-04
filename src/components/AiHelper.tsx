"use client";

import { useEffect, useRef, useState } from "react";

interface Msg {
  id: string;
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
}

// Shown so visitors know what's powering the assist (friendly phrasing).
const MODEL_LABEL = "Powered by open-source AI (gpt-oss) — your words stay yours.";

/**
 * Optional AI assist. A "magic button" that opens a small chat which fills the
 * form via onFill (the server extracts a structured profile from the chat).
 * Used on both the home form and /pledge.
 */
export default function AiHelper({
  onFill,
  label = "✨ Describe it with AI",
}: {
  onFill: (profile: Record<string, string>) => void;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = prompt.trim();
    if (!text || loading) return;

    const userMsg: Msg = { id: Date.now().toString(), role: "user", content: text };
    const aId = (Date.now() + 1).toString();
    const updated = [...messages, userMsg];
    setMessages([...updated, { id: aId, role: "assistant", content: "", isTyping: true }]);
    setPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updated.map((m) => ({ role: m.role, content: m.content })) }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        setMessages((prev) =>
          prev.map((m) =>
            m.id === aId ? { ...m, isTyping: false, content: d.message || "I'm having trouble right now." } : m
          )
        );
        setLoading(false);
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
            setMessages((prev) => prev.map((m) => (m.id === aId ? { ...m, isTyping: false } : m)));
            continue;
          }
          try {
            const j = JSON.parse(data);
            if (j.content) {
              acc += j.content;
              const c = acc;
              setMessages((prev) => prev.map((m) => (m.id === aId ? { ...m, content: c } : m)));
            } else if (j.profile && typeof j.profile === "object") {
              onFill(j.profile as Record<string, string>);
            }
          } catch {
            /* skip */
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) => (m.id === aId ? { ...m, isTyping: false, content: "I'm having trouble right now." } : m))
      );
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-pink-400/40 bg-pink-500/10 px-4 py-2.5 text-sm font-medium text-pink-500 transition-colors hover:bg-pink-500/20"
      >
        {label}
      </button>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-800 shadow-xl">
      <div className="flex items-center justify-between bg-gray-900 px-4 py-2.5 text-white">
        <span className="text-sm font-semibold">✨ AI assistant</span>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="text-gray-300 hover:text-white">
          ✕
        </button>
      </div>
      <div ref={scrollRef} className="max-h-56 space-y-2 overflow-y-auto p-3 text-sm">
        {messages.length === 0 && (
          <p className="text-gray-500">
            Tell me the problem in your own words — I&apos;ll fill the form for you.
          </p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "text-right" : "text-left"}>
            <span
              className={`inline-block rounded-2xl px-3 py-1.5 ${
                m.role === "user" ? "bg-pink-600 text-white" : "bg-gray-100 text-gray-800"
              }`}
            >
              {m.content || (m.isTyping ? "…" : "")}
            </span>
          </div>
        ))}
      </div>
      <form onSubmit={send} className="border-t border-gray-200 p-2.5">
        <div className="flex items-center gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. I lose hours each week reconciling invoices…"
            disabled={loading}
            className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-gray-900 focus:border-pink-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || loading}
            className="rounded-xl bg-pink-600 px-3 py-2 text-sm text-white disabled:opacity-50"
          >
            Send
          </button>
        </div>
        <p className="mt-1.5 text-center text-[11px] text-gray-400">{MODEL_LABEL}</p>
      </form>
    </div>
  );
}
