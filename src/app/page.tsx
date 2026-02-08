"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
}

const services = [
  {
    title: "AI Strategy Consulting",
    description:
      "Develop a comprehensive AI roadmap tailored to your business goals and industry requirements.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
    gradient: "from-pink-600 to-coral-600",
  },
  {
    title: "Custom AI Solutions",
    description:
      "Build bespoke AI applications and integrations that solve your unique business challenges.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
      </svg>
    ),
    gradient: "from-teal-600 to-ocean-600",
  },
  {
    title: "AI Training & Workshops",
    description:
      "Empower your team with hands-on AI training and workshops designed for all skill levels.",
    icon: (
      <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
      </svg>
    ),
    gradient: "from-coral-600 to-pink-600",
  },
];

const testimonials = [
  {
    quote:
      "AskMikeAI transformed our approach to customer service. Their AI solutions reduced response times by 60% while improving satisfaction scores.",
    author: "Sarah Chen",
    role: "CTO, TechFlow Inc.",
  },
  {
    quote:
      "The strategic guidance we received was invaluable. Mike and his team truly understand how to align AI capabilities with business objectives.",
    author: "James Wilson",
    role: "CEO, DataDriven Co.",
  },
  {
    quote:
      "Their training workshops brought our entire team up to speed on AI fundamentals. We're now confidently implementing AI across departments.",
    author: "Maria Rodriguez",
    role: "VP of Innovation, FutureCorp",
  },
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = "56px";
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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

      // Handle streaming response
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
                    msg.id === assistantId
                      ? { ...msg, content: contentToShow }
                      : msg
                  )
                );
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
                  "I apologize, but I encountered an error. Please try again or contact us directly for assistance.",
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
    // Auto-resize textarea
    e.target.style.height = "56px";
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + "px";
  };

  const hasMessages = messages.length > 0;

  return (
    <div>
      {/* Hero Section - Chat Interface */}
      <section className="relative overflow-hidden min-h-screen">
        {/* Background */}
        <div className="absolute inset-0 bg-[#212121]"></div>

        <div className="relative mx-auto max-w-3xl px-4 flex flex-col min-h-screen">
          {/* Chat messages area */}
          <div className="flex-1 overflow-y-auto py-8">
            {!hasMessages ? (
              /* Empty state - centered greeting */
              <div className="flex flex-col items-center justify-center min-h-[60vh]">
                {/* Logo/Icon */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-pink-500 to-coral-500 flex items-center justify-center mb-6 shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>

                <h1 className="text-3xl sm:text-4xl font-medium text-white text-center mb-8">
                  How can I help you today?
                </h1>

                {/* Suggestion chips */}
                <div className="flex flex-wrap justify-center gap-2 max-w-xl">
                  {[
                    { label: "Tell me about AI Strategy", icon: "M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" },
                    { label: "What custom solutions do you offer?", icon: "M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" },
                    { label: "Do you offer team training?", icon: "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" },
                    { label: "How do I get started?", icon: "M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" },
                  ].map((item) => (
                    <button
                      key={item.label}
                      onClick={() => {
                        setPrompt(item.label);
                        textareaRef.current?.focus();
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#2f2f2f] text-gray-300 text-sm border border-[#424242] hover:bg-[#3f3f3f] transition-colors"
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                      </svg>
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Messages */
              <div className="space-y-6 pb-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex gap-4">
                    {/* Avatar */}
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

                    {/* Message content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-400 mb-1">
                        {message.role === "assistant" ? "AskMikeAI" : "You"}
                      </p>
                      <div className="text-white prose prose-invert prose-sm max-w-none">
                        {message.content.split("\n").map((line, i) => {
                          // Handle bold text
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

          {/* Input area - fixed at bottom */}
          <div className="sticky bottom-0 pb-6 pt-4 bg-gradient-to-t from-[#212121] via-[#212121] to-transparent">
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
                  placeholder="Message AskMikeAI..."
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
            <p className="text-center text-xs text-gray-500 mt-3">
              AskMikeAI can make mistakes. For important decisions, please{" "}
              <Link href="/contact" className="text-gray-400 hover:text-white underline">
                contact us directly
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-pink-600 font-semibold tracking-wide uppercase">What We Do</p>
            <h2 className="mt-2 text-4xl font-display tracking-wide text-gray-900 sm:text-5xl">
              HOW WE CAN HELP
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              We offer comprehensive AI services designed to meet your business where it is
              and take it where it needs to go.
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {services.map((service, index) => (
              <div
                key={index}
                className="group relative rounded-3xl border border-gray-200 p-8 hover:shadow-2xl hover:shadow-pink-500/10 transition-all duration-300 hover:-translate-y-1"
              >
                <div className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${service.gradient} text-white shadow-lg`}>
                  {service.icon}
                </div>
                <h3 className="mt-6 text-xl font-bold text-gray-900">{service.title}</h3>
                <p className="mt-2 text-gray-600">{service.description}</p>
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${service.gradient} rounded-b-3xl opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/services"
              className="inline-flex items-center text-pink-600 font-semibold hover:text-pink-700 transition-colors"
            >
              View all services
              <svg className="ml-2 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-teal-600 font-semibold tracking-wide uppercase">Why Us</p>
              <h2 className="mt-2 text-4xl font-display tracking-wide text-gray-900 sm:text-5xl">
                WHY CHOOSE ASKMIKEAI?
              </h2>
              <p className="mt-4 text-lg text-gray-600">
                With years of experience in AI implementation across industries, we bring
                both technical expertise and business acumen to every engagement.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  "Proven track record with Fortune 500 companies and startups alike",
                  "Hands-on approach from strategy through implementation",
                  "Commitment to ethical AI practices and responsible innovation",
                  "Ongoing support and partnership beyond initial engagement",
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mt-0.5">
                      <svg
                        className="h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M4.5 12.75l6 6 9-13.5"
                        />
                      </svg>
                    </div>
                    <span className="ml-3 text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-pink-600 via-pink-700 to-coral-700 rounded-3xl p-8 text-white shadow-2xl">
              <div className="grid grid-cols-2 gap-8 text-center">
                <div className="p-4">
                  <div className="text-5xl font-display tracking-wide">100+</div>
                  <div className="mt-2 text-pink-200">Projects Delivered</div>
                </div>
                <div className="p-4">
                  <div className="text-5xl font-display tracking-wide">50+</div>
                  <div className="mt-2 text-pink-200">Happy Clients</div>
                </div>
                <div className="p-4">
                  <div className="text-5xl font-display tracking-wide">95%</div>
                  <div className="mt-2 text-pink-200">Client Retention</div>
                </div>
                <div className="p-4">
                  <div className="text-5xl font-display tracking-wide">10+</div>
                  <div className="mt-2 text-pink-200">Years Experience</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-coral-600 font-semibold tracking-wide uppercase">Testimonials</p>
            <h2 className="mt-2 text-4xl font-display tracking-wide text-gray-900 sm:text-5xl">
              WHAT OUR CLIENTS SAY
            </h2>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="relative bg-gray-50 rounded-3xl p-8 border border-gray-100">
                <div className="absolute -top-4 left-8 text-6xl text-pink-300 font-serif">&ldquo;</div>
                <p className="relative text-gray-700 italic pt-4">{testimonial.quote}</p>
                <div className="mt-6 flex items-center">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-ocean-600 flex items-center justify-center text-white font-bold">
                    {testimonial.author.charAt(0)}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-teal-700 via-teal-600 to-ocean-700"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-display tracking-wide text-white sm:text-5xl">
            READY TO GET STARTED?
          </h2>
          <p className="mt-4 text-xl text-teal-100 max-w-2xl mx-auto">
            Let&apos;s discuss how AI can transform your business. Book a free consultation today.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-full bg-white px-10 py-4 text-lg font-semibold text-teal-700 shadow-xl hover:bg-gray-100 hover:scale-105 transition-all"
          >
            Schedule a Consultation
          </Link>
        </div>
      </section>
    </div>
  );
}
