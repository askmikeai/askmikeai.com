import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Let's Connect - AskMikeAI",
  description:
    "Builder, founder, or AI-curious? Share your details and stay in touch with Mike.",
  alternates: { canonical: "/lets-connect" },
  openGraph: {
    title: "Let's Connect — AskMikeAI",
    description: "Share your details and stay in touch with Mike.",
    url: "/lets-connect",
  },
};

export default function LetsConnectLayout({ children }: { children: React.ReactNode }) {
  return children;
}
