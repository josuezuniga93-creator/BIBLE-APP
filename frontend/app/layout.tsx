import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Rebuttal Your Church — Theological Discernment Tool",
  description:
    "Analyze sermons against historic biblical Christianity. Test every teaching against Scripture, the creeds, and the confessions of the Reformation.",
  openGraph: {
    title: "Rebuttal Your Church",
    description: "Analyze sermons against historic biblical Christianity.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased bg-[#0f0f0f] text-white">{children}</body>
    </html>
  );
}
