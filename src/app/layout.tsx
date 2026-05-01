import type { Metadata } from "next";
import { Syne, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nichepulse-teal.vercel.app"),
  title: "NichePulse | AI YouTube Niche Intelligence",
  description:
    "AI-powered YouTube niche intelligence for faceless creators. Discover untapped niches, score competition, and generate content ideas — all in one dashboard.",
  keywords: [
    "YouTube niche finder",
    "faceless YouTube",
    "niche research tool",
    "YouTube AI",
    "channel analyzer",
    "YouTube analytics",
    "content ideas",
    "faceless channel",
  ],
  alternates: {
    canonical: "https://nichepulse-teal.vercel.app",
  },
  openGraph: {
    title: "NichePulse — AI YouTube Niche Intelligence for Faceless Creators",
    description:
      "Score niches. Detect outliers. Generate content ideas. One dashboard for faceless YouTube research.",
    url: "https://nichepulse-teal.vercel.app",
    siteName: "NichePulse",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "NichePulse — AI YouTube Niche Intelligence",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "NichePulse — AI YouTube Niche Intelligence",
    description: "Score niches. Detect outliers. One dashboard for faceless YouTube research.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", syne.variable, jetbrainsMono.variable)}>
      <body className="font-sans antialiased bg-background text-foreground">
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}
