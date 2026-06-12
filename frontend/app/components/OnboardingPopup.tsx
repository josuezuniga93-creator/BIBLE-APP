"use client";

import React, { useState, useEffect } from "react";

type Step = 1 | 2;
type Lang = "en" | "es";

function tx(lang: Lang, en: string, es: string) {
  return lang === "es" ? es : en;
}

interface OnboardingPopupProps {
  onComplete?: (name: string, lang: Lang) => void;
}

export function OnboardingPopup({ onComplete }: OnboardingPopupProps) {
  const [visible, setVisible]     = useState(false);
  const [step, setStep]           = useState<Step>(1);
  const [popupLang, setPopupLang] = useState<Lang>("en");
  const [name, setName]           = useState("");
  const [device, setDevice]       = useState<"ios" | "android" | null>(null);

  useEffect(() => {
    try {
      if (!localStorage.getItem("tulip_onboarded")) setVisible(true);
    } catch { /**/ }
  }, []);

  function toggleLang() {
    const next: Lang = popupLang === "en" ? "es" : "en";
    setPopupLang(next);
    try {
      localStorage.setItem("ryc-lang", next);
      const value = next === "es" ? "/en/es" : "/en/en";
      const exp   = next === "es" ? "" : `; expires=${new Date(0).toUTCString()}`;
      const host  = window.location.hostname;
      document.cookie = `googtrans=${value}; path=/${exp}`;
      document.cookie = `googtrans=${value}; path=/; domain=${host}${exp}`;
      document.cookie = `googtrans=${value}; path=/; domain=.${host}${exp}`;
      window.dispatchEvent(new CustomEvent("ryc-lang-change", { detail: next }));
    } catch { /**/ }
  }

  function handleNameContinue() {
    try {
      if (name.trim()) localStorage.setItem("tulip_user_name", name.trim());
    } catch { /**/ }
    setStep(2);
  }

  function handleGetStarted() {
    if (!device) return;
    try {
      localStorage.setItem("tulip_device_mode", device);
      const isIphone = device === "ios";
      localStorage.setItem("ryc-device-mode", isIphone ? "iphone" : "android");
      localStorage.setItem("ryc-android-mode", isIphone ? "false" : "true");
      if (isIphone) {
        document.documentElement.setAttribute("data-iphone-mode", "true");
        document.documentElement.removeAttribute("data-android-mode");
      } else {
        document.documentElement.removeAttribute("data-iphone-mode");
        document.documentElement.setAttribute("data-android-mode", "true");
      }
      localStorage.setItem("tulip_onboarded", "true");
    } catch { /**/ }
    setVisible(false);
    onComplete?.(name.trim(), popupLang);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-5">
      {/* Blur overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[12px]" />

      {/* Card */}
      <div
        className="relative w-full overflow-hidden text-center"
        style={{
          maxWidth: 320,
          background: "#071326",
          border: "1px solid rgba(201,169,97,0.25)",
          borderRadius: 24,
          padding: "32px 24px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Language toggle pill — top-right corner */}
        <button
          onClick={toggleLang}
          style={{
            position: "absolute",
            top: 12,
            right: 12,
            padding: "4px 8px",
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 700,
            background: "rgba(201,169,97,0.12)",
            color: "rgba(201,169,97,0.8)",
            border: "1px solid rgba(201,169,97,0.2)",
            cursor: "pointer",
            letterSpacing: "0.04em",
          }}
        >
          {popupLang === "en" ? "🇪🇸" : "🇺🇸"}
        </button>

        {/* Logo */}
        <img
          src="/tulip-logo.png"
          alt="Tulip"
          width={60}
          height={60}
          className="mx-auto mb-4 object-contain"
          style={{ filter: "drop-shadow(0 4px 12px rgba(201,169,97,0.35))" }}
        />

        {step === 1 && (
          <StepName
            lang={popupLang}
            name={name}
            setName={setName}
            onContinue={handleNameContinue}
            onSkip={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepDevice
            lang={popupLang}
            device={device}
            setDevice={setDevice}
            onGetStarted={handleGetStarted}
          />
        )}
      </div>
    </div>
  );
}

// ── Step 1 — Name ─────────────────────────────────────────────────────────────

function StepName({
  lang,
  name,
  setName,
  onContinue,
  onSkip,
}: {
  lang: Lang;
  name: string;
  setName: (v: string) => void;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const empty = name.trim().length === 0;

  return (
    <>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#d8b867", lineHeight: 1.25, marginBottom: 6 }}>
        {tx(lang, "Welcome to Tulip Bible App", "Bienvenido a Tulip Bible App")}
      </h2>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 4 }}>
        {tx(lang, "What should we call you?", "¿Cómo te llamamos?")}
      </p>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 20 }}>
        {tx(lang, "We'll greet you by name.", "Te saludaremos por tu nombre.")}
      </p>

      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && !empty) onContinue(); }}
        placeholder={tx(lang, "Your name...", "Tu nombre...")}
        maxLength={40}
        autoFocus
        style={{
          width: "100%",
          fontSize: 16,
          padding: "12px 14px",
          borderRadius: 12,
          border: "1px solid rgba(201,169,97,0.3)",
          background: "rgba(255,255,255,0.05)",
          color: "#fff",
          outline: "none",
          textAlign: "center",
          marginBottom: 16,
          boxSizing: "border-box",
          transition: "border-color 0.15s",
        }}
        onFocus={(e) => { e.target.style.borderColor = "rgba(201,169,97,0.8)"; }}
        onBlur={(e)  => { e.target.style.borderColor = "rgba(201,169,97,0.3)"; }}
      />

      <button
        onClick={onContinue}
        disabled={empty}
        style={{
          width: "100%",
          padding: "13px 0",
          borderRadius: 14,
          fontSize: 15,
          fontWeight: 700,
          background: empty ? "rgba(201,169,97,0.3)" : "#d8b867",
          color: empty ? "rgba(255,255,255,0.35)" : "#071326",
          border: "none",
          cursor: empty ? "default" : "pointer",
          transition: "background 0.15s, color 0.15s",
          marginBottom: 12,
        }}
      >
        {tx(lang, "Continue →", "Continuar →")}
      </button>

      <button
        onClick={onSkip}
        style={{
          background: "none",
          border: "none",
          fontSize: 12,
          color: "rgba(255,255,255,0.35)",
          cursor: "pointer",
          padding: "4px 8px",
        }}
      >
        {tx(lang, "Skip", "Omitir")}
      </button>
    </>
  );
}

// ── Step 2 — Device ───────────────────────────────────────────────────────────

function StepDevice({
  lang,
  device,
  setDevice,
  onGetStarted,
}: {
  lang: Lang;
  device: "ios" | "android" | null;
  setDevice: (v: "ios" | "android") => void;
  onGetStarted: () => void;
}) {
  return (
    <>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", lineHeight: 1.25, marginBottom: 6 }}>
        {tx(lang, "What device are you using?", "¿Qué dispositivo usas?")}
      </h2>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 24 }}>
        {tx(lang, "We'll optimize the experience for you.", "Optimizaremos la experiencia para ti.")}
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        {/* iPhone */}
        <button
          onClick={() => setDevice("ios")}
          style={{
            flex: 1,
            padding: "24px 8px",
            borderRadius: 16,
            border: device === "ios" ? "2px solid #d8b867" : "1px solid rgba(255,255,255,0.1)",
            background: device === "ios" ? "rgba(201,169,97,0.1)" : "rgba(255,255,255,0.04)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            transition: "border 0.15s, background 0.15s",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M19.2 14.8c0-2.8 2.3-4.1 2.4-4.2-1.3-1.9-3.3-2.2-4-2.2-1.7-.2-3.3 1-4.2 1-0.9 0-2.2-1-3.7-1-1.9 0-3.7 1.1-4.7 2.8-2 3.5-.5 8.6 1.4 11.4 1 1.4 2.1 2.9 3.5 2.9 1.4-.1 2-.9 3.7-.9 1.7 0 2.2.9 3.7.9 1.5 0 2.5-1.4 3.5-2.8.7-1 1.2-2.1 1.5-3.2-3.2-1.3-3.1-5.7-.1-4.7zM16.5 6.6c.8-1 1.3-2.3 1.2-3.6-1.2.1-2.6.8-3.4 1.8-.8.9-1.4 2.2-1.2 3.5 1.3.1 2.6-.6 3.4-1.7z"
              fill={device === "ios" ? "#d8b867" : "rgba(255,255,255,0.65)"}
            />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: device === "ios" ? "#d8b867" : "rgba(255,255,255,0.65)" }}>
            iPhone
          </span>
        </button>

        {/* Android */}
        <button
          onClick={() => setDevice("android")}
          style={{
            flex: 1,
            padding: "24px 8px",
            borderRadius: 16,
            border: device === "android" ? "2px solid #d8b867" : "1px solid rgba(255,255,255,0.1)",
            background: device === "android" ? "rgba(201,169,97,0.1)" : "rgba(255,255,255,0.04)",
            cursor: "pointer",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            transition: "border 0.15s, background 0.15s",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M8 17.5a1 1 0 100-2 1 1 0 000 2zm12 0a1 1 0 100-2 1 1 0 000 2z"
              fill={device === "android" ? "#d8b867" : "rgba(255,255,255,0.65)"}
            />
            <path
              d="M5.5 10.5C5.5 9.12 6.62 8 8 8h12c1.38 0 2.5 1.12 2.5 2.5v7C22.5 18.88 21.38 20 20 20H8c-1.38 0-2.5-1.12-2.5-1.5v-7zM9.5 6l-1.5-2.5M18.5 6l1.5-2.5M5.5 11h-2a1 1 0 000 2h2M22.5 11h2a1 1 0 010 2h-2M9 20v2.5M19 20v2.5"
              stroke={device === "android" ? "#d8b867" : "rgba(255,255,255,0.65)"}
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span style={{ fontSize: 13, fontWeight: 600, color: device === "android" ? "#d8b867" : "rgba(255,255,255,0.65)" }}>
            Android
          </span>
        </button>
      </div>

      <button
        onClick={onGetStarted}
        disabled={!device}
        style={{
          width: "100%",
          padding: "13px 0",
          borderRadius: 14,
          fontSize: 15,
          fontWeight: 700,
          background: !device ? "rgba(201,169,97,0.3)" : "#d8b867",
          color: !device ? "rgba(255,255,255,0.35)" : "#071326",
          border: "none",
          cursor: !device ? "default" : "pointer",
          transition: "background 0.15s, color 0.15s",
        }}
      >
        {tx(lang, "Get Started →", "Comenzar →")}
      </button>
    </>
  );
}
