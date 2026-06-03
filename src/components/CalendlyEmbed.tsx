"use client";

import { useEffect } from "react";

const DEFAULT_URL =
  process.env.NEXT_PUBLIC_CALENDLY_URL ||
  "https://calendly.com/askmikeai/30min?hide_gdpr_banner=1&background_color=ffffff&text_color=1f2937&primary_color=db2777";

export default function CalendlyEmbed({ url = DEFAULT_URL }: { url?: string }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-200">
      <div
        className="calendly-inline-widget"
        data-url={url}
        style={{ minWidth: "320px", height: "700px" }}
      />
    </div>
  );
}
