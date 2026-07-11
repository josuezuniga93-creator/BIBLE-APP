"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PrivacyPage() {
  const router = useRouter();
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const theme = document.documentElement.getAttribute("data-theme");
    setIsLight(theme === "white-noir");
    const obs = new MutationObserver(() => {
      setIsLight(document.documentElement.getAttribute("data-theme") === "white-noir");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  const bg      = isLight ? "#ffffff" : "#08090f";
  const fg      = isLight ? "#0a0a0a" : "#ffffff";
  const fgMuted = isLight ? "rgba(0,0,0,0.50)" : "rgba(255,255,255,0.50)";
  const fgFaint = isLight ? "rgba(0,0,0,0.30)" : "rgba(255,255,255,0.30)";
  const border  = isLight ? "rgba(0,0,0,0.07)" : "rgba(255,255,255,0.07)";
  const cardBg  = isLight ? "rgba(0,0,0,0.03)" : "rgba(255,255,255,0.03)";
  const backBg  = isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)";

  const sections = [
    {
      title: "What we collect",
      body: "Your email address when you create an account. Reading highlights and notes you choose to save — these sync to your account so you can access them on any device. Your theme preference is stored locally on your device only.",
    },
    {
      title: "What we don't collect",
      body: "No ads. No tracking pixels. No selling of your data to anyone. No behavioral profiles. The only analytics we receive are basic server logs from Vercel (page visits, error rates) — we have no way to tie these to you personally.",
    },
    {
      title: "Google Sign-In",
      body: "We use Google OAuth only to verify your identity and create your account. We do not access your Gmail, Google Drive, contacts, calendar, or any other Google data. Your Google password is never seen or stored by us.",
    },
    {
      title: "Data storage",
      body: "Account data (email, highlights, notes) is stored securely via Supabase with encryption in transit. Data that stays only on your device: Bible tracker reading progress, fellowship gatherings, and local preferences.",
    },
    {
      title: "Deleting your data",
      body: "To delete your account and all associated data, email us at josuezuniga93@gmail.com. We will permanently remove your account and everything linked to it within 7 days.",
    },
    {
      title: "Contact",
      body: "Questions about this policy? Email josuezuniga93@gmail.com — we will respond.",
    },
  ];

  return (
    <div
      className="min-h-screen"
      style={{ background: bg, color: fg }}
    >
      <div className="max-w-lg mx-auto px-5 pt-6 pb-28">

        {/* Back button + header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all active:scale-90"
            style={{ background: backBg }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={fg} strokeWidth="2.2" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <div>
            <p className="text-[10px] font-black tracking-[0.20em] uppercase" style={{ color: fgFaint }}>
              Tulip Bible
            </p>
            <h1 className="text-xl font-bold leading-tight" style={{ color: fg }}>
              Privacy Policy
            </h1>
          </div>
        </div>

        <p className="text-xs mb-6" style={{ color: fgFaint }}>Last updated: July 2026</p>

        <p className="text-sm leading-relaxed mb-8" style={{ color: fgMuted }}>
          Tulip Bible is a free Reformed study app. We built it to serve the church, not to profit from your data. This policy explains plainly what we do and don't do with your information.
        </p>

        <div className="space-y-3">
          {sections.map((s) => (
            <div
              key={s.title}
              className="rounded-2xl p-5"
              style={{ background: cardBg, border: `1px solid ${border}` }}
            >
              <p className="text-sm font-bold mb-2" style={{ color: fg }}>{s.title}</p>
              <p className="text-sm leading-relaxed" style={{ color: fgMuted }}>{s.body}</p>
            </div>
          ))}
        </div>

        <p className="text-xs text-center mt-10" style={{ color: fgFaint }}>
          Tulip Bible · josuezuniga93@gmail.com
        </p>

      </div>
    </div>
  );
}
