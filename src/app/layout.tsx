import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

const SITE_URL = "https://www.askmikeai.com";
const SITE_TITLE = "AskMikeAI — Builder, Educator & AI Community";
const SITE_DESCRIPTION =
  "Mike builds AI-powered software that solves real problems. Describe your pain point, name your price, and back the build.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "AskMikeAI - Builder, Educator & AI Community",
  description: SITE_DESCRIPTION,
  keywords: ["AI builder", "AI educator", "build in public", "AI software", "name your price"],
  // Open Graph tags — power the WhatsApp / iMessage / social link preview.
  openGraph: {
    type: "website",
    siteName: "AskMikeAI",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: "/mike.jpg",
        width: 800,
        height: 800,
        alt: "Mike Friedberg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ["/mike.jpg"],
  },
  alternates: { canonical: SITE_URL },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen flex flex-col`}>
        <Header />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
