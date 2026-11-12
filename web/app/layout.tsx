import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ScrollToTop } from "@/components/ui/ScrollToTop";
import { routeMetadata } from "@/lib/seo";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = routeMetadata({
  title: "Pacten — Influencer Marketplace | Hire Content Creators & Social Media Professionals",
  description:
    "Pacten is an influencer marketplace for brand collaborations, creator campaigns and influencer partnerships. Hire content creators and social media professionals for influencer marketing.",
  path: "/",
  keywords: [
    "influencer marketplace",
    "hire content creators",
    "influencer marketing",
    "brand collaborations",
    "social media professionals",
    "creator campaigns",
    "influencer partnerships",
  ],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Theme bootstrap: applies the saved theme (light default) before
            first paint so there is no flash of the wrong theme. Runs
            before hydration (next/script beforeInteractive); the class it
            sets is why <html> carries suppressHydrationWarning. */}
        <Script
          id="pacten-theme"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('pacten-theme');if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="min-h-screen bg-white dark:bg-ink-950 font-sans text-ink-900 dark:text-ink-50 antialiased">
        <ScrollToTop />
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
