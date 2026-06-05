"use client";

import { useState } from "react";
import Link from "next/link";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [booking, setBooking] = useState(false);
  const [bookError, setBookError] = useState<string | null>(null);

  const startBooking = async () => {
    if (booking) return;
    setBooking(true);
    setBookError(null);
    try {
      const res = await fetch("/api/book", { method: "POST" });
      const data = await res.json();
      if (!res.ok || !data.url) throw new Error(data.error || "Could not start booking.");
      window.location.href = data.url;
    } catch (e) {
      setBookError(e instanceof Error ? e.message : "Something went wrong.");
      setBooking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Could not send your message.");
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} You can also email me at askmikeai@gmail.com.`
          : "Something went wrong. Please email me at askmikeai@gmail.com."
      );
    } finally {
      setSending(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-700 via-pink-800 to-coral-800 py-24">
        <div className="absolute top-20 right-20 w-72 h-72 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-pink-200 font-semibold tracking-wide uppercase mb-4">Let&apos;s Talk</p>
            <h1 className="text-5xl font-display tracking-wide text-white sm:text-6xl">
              GET IN TOUCH
            </h1>
            <p className="mt-6 text-xl text-pink-100">
              Got a pain point, an idea, or just want to talk shop? Drop me a line and I&apos;ll get
              back to you faster than a Miami sunset.
            </p>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-24 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Send me a message</h2>
              <p className="mt-4 text-gray-600">
                Fill out the form below and I&apos;ll get back to you within 24 hours.
              </p>

              {submitted ? (
                <div className="mt-8 p-8 bg-teal-50 rounded-3xl border border-teal-200">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-teal-800 text-center">
                    Thank you for reaching out!
                  </h3>
                  <p className="mt-2 text-teal-700 text-center">
                    I&apos;ve got your message and will get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-2xl border border-gray-300 px-4 py-3 shadow-sm focus:border-pink-600 focus:ring-pink-600 focus:ring-2 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-2xl border border-gray-300 px-4 py-3 shadow-sm focus:border-pink-600 focus:ring-pink-600 focus:ring-2 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="company" className="block text-sm font-medium text-gray-700">
                      Company (optional)
                    </label>
                    <input
                      type="text"
                      name="company"
                      id="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-2xl border border-gray-300 px-4 py-3 shadow-sm focus:border-pink-600 focus:ring-pink-600 focus:ring-2 focus:outline-none transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Message
                    </label>
                    <textarea
                      name="message"
                      id="message"
                      required
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-2xl border border-gray-300 px-4 py-3 shadow-sm focus:border-pink-600 focus:ring-pink-600 focus:ring-2 focus:outline-none transition-colors"
                    />
                  </div>

                  {error && <p className="text-sm text-coral-600">{error}</p>}

                  <button
                    type="submit"
                    disabled={sending}
                    className="w-full rounded-full bg-gradient-to-r from-pink-600 to-coral-600 px-6 py-4 text-lg font-semibold text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {sending ? "Sending…" : "Send Message"}
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="lg:pl-8">
              <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
              <p className="mt-4 text-gray-600">
                Prefer to reach out directly? Here&apos;s how you can reach me.
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-600 to-coral-600 flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Email</h3>
                    <a href="mailto:askmikeai@gmail.com" className="mt-1 text-gray-600 hover:text-pink-600 transition-colors">
                      askmikeai@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-600 to-ocean-600 flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">WhatsApp</h3>
                    <a href="https://wa.me/17542959900" className="mt-1 text-gray-600 hover:text-teal-600 transition-colors">
                      +1 (754) 295-9900
                    </a>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-coral-600 to-pink-600 flex items-center justify-center">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                    <p className="mt-1 text-gray-600">Miami, FL</p>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div className="mt-12 p-8 bg-gray-50 rounded-3xl border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h3>
                <div className="mt-6 space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      How does the &ldquo;name your price&rdquo; thing work?
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      You describe your pain point and set what a monthly fix is worth to you. If I take
                      it on, I build and own the software; you license it at the price you set.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Are you a consultant?</h4>
                    <p className="mt-1 text-sm text-gray-600">
                      No. I&apos;m a builder, educator, and member of the AI community. I ship software
                      that solves real problems — I don&apos;t sell strategy by the hour.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">What if my problem is too niche?</h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Niche is good. The best tools start from one specific, nagging problem. Tell me
                      yours — if it resonates, I&apos;ll build it.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Schedule a Call Section */}
      <section className="py-16 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-teal-600 font-semibold tracking-wide uppercase">Book a Call</p>
            <h2 className="mt-2 text-3xl font-display tracking-wide text-gray-900 sm:text-4xl">
              GRAB 30 MINUTES WITH MIKE
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              My time is limited, so I keep the calendar for serious conversations.
            </p>
          </div>

          <div className="mx-auto max-w-xl rounded-3xl border border-gray-200 bg-white p-8 text-center shadow-lg">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-ocean-600">
              <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Book a 30-minute Zoom</h3>
            <p className="mt-2 text-gray-600">
              Booking takes a <strong>$50 donation</strong> — and it goes{" "}
              <strong>in full to a local AI community</strong>, not to me. It&apos;s how I keep the
              calendar for people who are serious.
            </p>
            <button
              onClick={startBooking}
              disabled={booking}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-600 to-ocean-600 px-8 py-4 text-lg font-semibold text-white shadow-xl transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
            >
              {booking ? "Taking you to checkout…" : "Donate $50 & book"}
            </button>
            {bookError && <p className="mt-3 text-sm text-coral-600">{bookError}</p>}
            <p className="mt-3 text-xs text-gray-400">Secured by Stripe. You pick your time right after.</p>

            <div className="mt-6 border-t border-gray-100 pt-5 text-sm text-gray-600">
              Want your money to go toward an actual solution instead? It can cover the{" "}
              <strong>first month of a build</strong>.{" "}
              <Link href="/pledge" className="font-semibold text-pink-600 hover:text-pink-700">
                Back the build →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
