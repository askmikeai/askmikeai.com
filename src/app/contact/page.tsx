"use client";

import { useState, useEffect } from "react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  // Calendly bot protection state
  const [verificationState, setVerificationState] = useState<"idle" | "verifying" | "verified">("idle");
  const [showCalendly, setShowCalendly] = useState(false);
  const [lastClickTime, setLastClickTime] = useState(0);

  const handleVerification = () => {
    const now = Date.now();

    // Rate limiting: if clicking too fast, it's likely a bot
    if (lastClickTime > 0 && now - lastClickTime < 300) {
      return;
    }

    setLastClickTime(now);
    setVerificationState("verifying");

    // Simulate verification delay (bots often can't wait)
    setTimeout(() => {
      setVerificationState("verified");
      // Additional delay before showing Calendly
      setTimeout(() => {
        setShowCalendly(true);
      }, 500);
    }, 1500);
  };

  // Load Calendly widget script when verified
  useEffect(() => {
    if (showCalendly) {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.body.appendChild(script);

      return () => {
        document.body.removeChild(script);
      };
    }
  }, [showCalendly]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSubmitted(true);
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
              Have a question or ready to start your AI journey? We&apos;d love to hear from you.
              Drop us a line and we&apos;ll get back to you faster than a Miami sunset.
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
              <h2 className="text-2xl font-bold text-gray-900">Send us a message</h2>
              <p className="mt-4 text-gray-600">
                Fill out the form below and we&apos;ll get back to you within 24 hours.
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
                    We&apos;ve received your message and will get back to you shortly.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-700"
                    >
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
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-700"
                    >
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
                    <label
                      htmlFor="company"
                      className="block text-sm font-medium text-gray-700"
                    >
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
                    <label
                      htmlFor="message"
                      className="block text-sm font-medium text-gray-700"
                    >
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

                  <button
                    type="submit"
                    className="w-full rounded-full bg-gradient-to-r from-pink-600 to-coral-600 px-6 py-4 text-lg font-semibold text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="lg:pl-8">
              <h2 className="text-2xl font-bold text-gray-900">Contact Information</h2>
              <p className="mt-4 text-gray-600">
                Prefer to reach out directly? Here&apos;s how you can contact us.
              </p>

              <div className="mt-8 space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-600 to-coral-600 flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
                      />
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
                    <svg
                      className="h-6 w-6 text-white"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
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
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Location</h3>
                    <p className="mt-1 text-gray-600">Miami, FL</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-ocean-600 to-teal-600 flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">Office Hours</h3>
                    <p className="mt-1 text-gray-600">
                      Monday - Friday: 9:00 AM - 6:00 PM EST
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ */}
              <div className="mt-12 p-8 bg-gray-50 rounded-3xl border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900">
                  Frequently Asked Questions
                </h3>
                <div className="mt-6 space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      How long does a typical project take?
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Project timelines vary based on scope. Strategy engagements can be
                      completed in weeks, while full implementations may take several months.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      Do you work with small businesses?
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      Yes! We work with businesses of all sizes, from startups to enterprises.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      What industries do you serve?
                    </h4>
                    <p className="mt-1 text-sm text-gray-600">
                      We have experience across many industries including healthcare, finance,
                      retail, manufacturing, and technology.
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
            <p className="text-teal-600 font-semibold tracking-wide uppercase">Book a Meeting</p>
            <h2 className="mt-2 text-3xl font-display tracking-wide text-gray-900 sm:text-4xl">
              SCHEDULE A FREE CONSULTATION
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Prefer to talk? Book a 30-minute call to discuss your AI needs.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            {!showCalendly ? (
              <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-200 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-600 to-coral-600 flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>

                {verificationState === "idle" && (
                  <>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Ready to schedule?
                    </h3>
                    <p className="text-gray-600 mb-6">
                      Click below to access the booking calendar.
                    </p>
                    <button
                      onClick={handleVerification}
                      className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-600 to-ocean-600 px-8 py-4 text-lg font-semibold text-white shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      I&apos;m Ready to Book
                    </button>
                    <p className="mt-4 text-xs text-gray-400">
                      This verification helps us prevent spam
                    </p>
                  </>
                )}

                {verificationState === "verifying" && (
                  <div className="py-4">
                    <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Preparing your calendar...</p>
                  </div>
                )}

                {verificationState === "verified" && !showCalendly && (
                  <div className="py-4">
                    <div className="w-12 h-12 rounded-full bg-teal-600 flex items-center justify-center mx-auto mb-4">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-gray-600">Loading calendar...</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-200">
                <div
                  className="calendly-inline-widget"
                  data-url="https://calendly.com/askmikeai/30min?hide_gdpr_banner=1&background_color=ffffff&text_color=1f2937&primary_color=db2777"
                  style={{ minWidth: "320px", height: "700px" }}
                ></div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
