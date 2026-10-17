import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";
import { SmoothScroll } from "@/components/SmoothScroll";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono", display: "swap" });
const serif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

// Absolute base for the OG image: set NEXT_PUBLIC_SITE_URL once you have a custom domain;
// on Vercel the production URL is picked up automatically.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Hari Krishna | AI Engineer",
  description:
    "AI Engineer building production multi-agent systems, hybrid RAG, n8n automations, agent evaluation and LLM-Ops with Langfuse, LangSmith and Ragas. Open to full-time roles and freelance.",
  keywords: [
    "AI Engineer", "LangGraph", "Multi-agent systems", "Hybrid RAG", "n8n automation", "Ragas",
    "Langfuse", "LangSmith", "LLMOps", "Freelance AI engineer", "Hari Krishna Thota",
  ],
  authors: [{ name: "Hari Krishna T" }],
  openGraph: {
    title: "Hari Krishna | AI Engineer",
    description: "I build AI agents, RAG systems and automations that ship, and I measure them.",
    type: "website",
    images: ["/og.png"],
  },
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#0a0a0c", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${serif.variable}`} suppressHydrationWarning>
      <head>
        {/* Before first paint: hide the intro overlay for visitors who already saw it this session, or who
            prefer reduced motion, so they never get a flash of black. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{if(sessionStorage.getItem('hk-intro-seen')==='1'||matchMedia('(prefers-reduced-motion: reduce)').matches)document.documentElement.classList.add('intro-seen')}catch(e){}",
          }}
        />
      </head>
      <body className="grain font-sans">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
