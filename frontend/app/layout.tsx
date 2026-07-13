import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { AppNav } from "./components/AppNav";
import { BottomNav } from "./components/BottomNav";
import { ThemeProvider } from "./components/ThemeProvider";
import { BadgeRuntime } from "./components/BadgeRuntime";
import { BackgroundCloudSync } from "./components/BackgroundCloudSync";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  style: ["normal", "italic"],
  display: "swap",
});

const verseDisplay = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-verse-display",
  weight: ["500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Bible",
  applicationName: "Bible",
  description:
    "Bible study app with Scripture, Matthew Henry Commentary, Strong's Concordance, family worship, and more. Free forever.",
  openGraph: {
    title: "Bible",
    description: "Bible study app with Scripture, Matthew Henry Commentary, Strong's Concordance, family worship, and more. Free forever.",
    type: "website",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Bible",
  },
  icons: {
    icon: [
      { url: "/icon-192.png?v=7", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png?v=7", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png?v=7",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0f0f0f",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${verseDisplay.variable}`}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Apply saved theme BEFORE first paint — eliminates the color flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ryc-theme');if(!t){var m=document.cookie.match(/(?:^|;\\s*)ryc-theme=([^;]+)/);if(m)t=decodeURIComponent(m[1]);}var valid=['gold-navy','white-noir'];document.documentElement.setAttribute('data-theme',valid.indexOf(t)>=0?t:'white-noir');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="antialiased">
        <ThemeProvider />
        <BackgroundCloudSync />
        <AppNav />
        {/* md:pt-14 = top nav height (hidden on mobile); pb-36 on mobile = bottom nav height */}
        <div className="layout-children md:pt-14 pb-36 md:pb-0">{children}</div>
        <BadgeRuntime />
        <BottomNav />
        {/* Service Worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(reg) {
                    // Re-schedule notifications if previously enabled
                    try {
                      if (localStorage.getItem('tulip_notif_enabled') === 'true' &&
                          typeof Notification !== 'undefined' &&
                          Notification.permission === 'granted') {
                        navigator.serviceWorker.ready.then(function(r) {
                          if (r.active) r.active.postMessage({ type: 'SCHEDULE_NOTIFICATIONS' });
                        });
                      }
                    } catch(e) {}
                  }).catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
