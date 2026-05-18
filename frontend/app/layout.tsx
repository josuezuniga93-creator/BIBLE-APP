import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppNav } from "./components/AppNav";
import { BottomNav } from "./components/BottomNav";
import { GoogleTranslate } from "./components/GoogleTranslate";
import { ThemeProvider } from "./components/ThemeProvider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TULIP Bible App — Theological Discernment Tool",
  description:
    "Analyze sermons against historic biblical Christianity. Test every teaching against Scripture, the creeds, and the confessions of the Reformation.",
  openGraph: {
    title: "TULIP Bible App",
    description: "Analyze sermons against historic biblical Christianity.",
    type: "website",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TULIP Bible App",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  themeColor: "#0f0f0f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className="antialiased bg-[#0f0f0f] text-white">
        <ThemeProvider />
        <GoogleTranslate />
        <AppNav />
        {/* md:pt-14 = top nav height (hidden on mobile); pb-36 on mobile = bottom nav height */}
        <div className="md:pt-14 pb-36 md:pb-0">{children}</div>
        <BottomNav />
        {/* Service Worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
