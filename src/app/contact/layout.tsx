import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Mike - AskMikeAI",
  description:
    "Message Mike, reach out on WhatsApp, or book a 30-minute Zoom to talk through your pain point.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact Mike — AskMikeAI",
    description: "Send a message, WhatsApp, or book a 30-minute Zoom.",
    url: "/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
