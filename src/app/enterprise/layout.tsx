import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Enterprise - AskMikeAI",
  description:
    "Production AI software your security and legal teams can sign off on. Annual licensing, MSA/DPA, SLA, procurement-friendly invoicing. Talk to sales.",
  alternates: { canonical: "/enterprise" },
  openGraph: {
    title: "AskMikeAI for Enterprise",
    description:
      "Production AI software that passes procurement and legal. Annual licensing, MSA/DPA, SLA. Talk to sales.",
    url: "/enterprise",
  },
};

export default function EnterpriseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
