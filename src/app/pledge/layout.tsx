import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Back the Build - AskMikeAI",
  description:
    "Confirm the problem you want solved, set your monthly price, and back the build.",
  alternates: { canonical: "/pledge" },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Back the Build — AskMikeAI",
    description: "Set your price and back the build.",
    url: "/pledge",
  },
};

export default function PledgeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
