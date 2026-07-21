"use client";

import React, { useState, useEffect } from "react";
import { applyThemeAttributes } from "../lib/useTheme";

type Step = 1 | 2 | 3;
type Lang = "en" | "es";
type ThemeChoice = "white-noir" | "gold-navy";

function tx(lang: Lang, en: string, es: string) {
  return lang === "es" ? es : en;
}

interface OnboardingPopupProps {
  onComplete?: (name: string, lang: Lang) => void;
}

export function OnboardingPopup({ onComplete }: OnboardingPopupProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep]       = useState<Step>(1);
  const [lang, setLang]       = useState<Lang>("en");
  const [name, setName]       = useState("");
  const [theme, setTheme]     = useState<ThemeChoice>("white-noir");

  useEffect(() => {
    try {
      if (!localStorage.getItem("tulip_onboarded")) setVisible(true);
    } catch { /**/ }
  }, []);

  function handleSelectLang(next: Lang) {
    setLang(next);
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
    setStep(3);
  }

  function handleSelectTheme(next: ThemeChoice) {
    setTheme(next);
    try {
      localStorage.setItem("ryc-theme", next);
      document.cookie = `ryc-theme=${next};max-age=31536000;path=/;SameSite=Strict`;
      applyThemeAttributes(next);
      window.dispatchEvent(new CustomEvent("ryc-theme-change", { detail: next }));
    } catch { /**/ }
  }

  function handleGetStarted() {
    try {
      localStorage.setItem("tulip_onboarded", "true");
      // Always persist the selected theme — even when the user accepts the
      // pre-selected default without tapping a theme card. Otherwise ryc-theme
      // stays unset and components reading localStorage fall back to
      // dark-theme styling on a light page (invisible labels).
      localStorage.setItem("ryc-theme", theme);
      document.cookie = `ryc-theme=${theme};max-age=31536000;path=/;SameSite=Strict`;
      applyThemeAttributes(theme);
      window.dispatchEvent(new CustomEvent("ryc-theme-change", { detail: theme }));
    } catch { /**/ }
    setVisible(false);
    onComplete?.(name.trim(), lang);
  }

  if (!visible) return null;

  const isDark = theme === "gold-navy";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-5">
      {/* Overlay */}
      <div
        className="absolute inset-0 backdrop-blur-[12px]"
        style={{ background: isDark ? "rgba(0,0,0,0.7)" : "rgba(247,247,247,0.92)" }}
      />

      {/* Card */}
      <div
        className="relative w-full overflow-hidden text-center"
        style={{
          maxWidth: 340,
          background: isDark ? "#0e1018" : "#ffffff",
          border: isDark ? "1px solid rgba(201,169,97,0.25)" : "1px solid rgba(0,0,0,0.12)",
          borderRadius: 24,
          padding: "32px 24px",
          boxShadow: isDark ? "0 24px 60px rgba(0,0,0,0.5)" : "0 24px 60px rgba(0,0,0,0.12)",
          transition: "background 0.15s, border 0.15s, box-shadow 0.15s",
        }}>
        {step > 1 && (
          <BackButton isDark={isDark} onClick={() => setStep((s) => (s - 1) as Step)} />
        )}

        {/* Logo */}
        <img
          src="/tulip-logo.png"
          alt="Tulip"
          width={60}
          height={60}
          className="mx-auto mb-4 object-contain"
        />

        {step === 1 && (
          <StepLanguage lang={lang} isDark={isDark} onSelect={handleSelectLang} onContinue={() => setStep(2)} />
        )}

        {step === 2 && (
          <StepName
            lang={lang}
            isDark={isDark}
            name={name}
            setName={setName}
            onContinue={handleNameContinue}
          />
        )}

        {step === 3 && (
          <StepTheme
            lang={lang}
            theme={theme}
            setTheme={handleSelectTheme}
            onGetStarted={handleGetStarted}
          />
        )}
      </div>
    </div>
  );
}

// ── Step 1 — Language ──────────────────────────────────────────────────────────

function StepLanguage({
  lang,
  isDark,
  onSelect,
  onContinue,
}: {
  lang: Lang;
  isDark: boolean;
  onSelect: (l: Lang) => void;
  onContinue: () => void;
}) {
  return (
    <>
      <h2
        style={{
          fontSize: 20,
          fontWeight: 700,
          color: isDark ? "#ffffff" : "#0a0a0a",
          lineHeight: 1.25,
          marginBottom: 6,
          transition: "color 0.15s",
        }}
      >
        {tx(lang, "Welcome to Tulip Bible App", "Bienvenido a Tulip Bible App")}
      </h2>
      <p style={{ fontSize: 13, color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.5)", marginBottom: 24, transition: "color 0.15s" }}>
        {tx(lang, "Choose your language", "Elige tu idioma")}
      </p>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <LangCard label="English" selected={lang === "en"} isDark={isDark} onClick={() => onSelect("en")} />
        <LangCard label="Español" selected={lang === "es"} isDark={isDark} onClick={() => onSelect("es")} />
      </div>

      <button onClick={onContinue} style={primaryButtonStyle(false, isDark)}>
        {tx(lang, "Continue →", "Continuar →")}
      </button>
    </>
  );
}

function LangCard({
  label,
  selected,
  isDark,
  onClick,
}: {
  label: string;
  selected: boolean;
  isDark: boolean;
  onClick: () => void;
}) {
  const textColor = isDark ? "#ffffff" : "#0a0a0a";
  const border = isDark
    ? selected ? "2px solid #c9a961" : "1px solid rgba(255,255,255,0.12)"
    : selected ? "2px solid #0a0a0a" : "1px solid rgba(0,0,0,0.12)";
  const background = isDark
    ? selected ? "rgba(201,169,97,0.10)" : "#1a1d27"
    : selected ? "rgba(0,0,0,0.04)" : "#ffffff";

  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "28px 8px",
        borderRadius: 16,
        border,
        background,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "border 0.15s, background 0.15s",
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 600, color: textColor, transition: "color 0.15s" }}>{label}</span>
    </button>
  );
}

// ── Step 2 — Name ─────────────────────────────────────────────────────────────

function StepName({
  lang,
  isDark,
  name,
  setName,
  onContinue,
}: {
  lang: Lang;
  isDark: boolean;
  name: string;
  setName: (v: string) => void;
  onContinue: () => void;
}) {
  const empty = name.trim().length === 0;
  const borderIdle = isDark ? "rgba(255,255,255,0.18)" : "rgba(0,0,0,0.15)";
  const borderFocus = isDark ? "#c9a961" : "#0a0a0a";

  return (
    <>
      <h2 style={{ fontSize: 18, fontWeight: 700, color: isDark ? "#ffffff" : "#0a0a0a", lineHeight: 1.25, marginBottom: 6, transition: "color 0.15s" }}>
        {tx(lang, "What should we call you?", "¿Cómo te llamamos?")}
      </h2>
      <p style={{ fontSize: 12, color: isDark ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.4)", marginBottom: 20, transition: "color 0.15s" }}>
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
          border: `1px solid ${borderIdle}`,
          background: isDark ? "rgba(255,255,255,0.05)" : "#ffffff",
          color: isDark ? "#ffffff" : "#0a0a0a",
          outline: "none",
          textAlign: "center",
          marginBottom: 16,
          boxSizing: "border-box",
          transition: "border-color 0.15s, background 0.15s, color 0.15s",
        }}
        onFocus={(e) => { e.target.style.borderColor = borderFocus; }}
        onBlur={(e)  => { e.target.style.borderColor = borderIdle; }}
      />

      <button onClick={onContinue} disabled={empty} style={primaryButtonStyle(empty, isDark)}>
        {tx(lang, "Continue →", "Continuar →")}
      </button>
    </>
  );
}

// ── Step 3 — Theme ────────────────────────────────────────────────────────────

function StepTheme({
  lang,
  theme,
  setTheme,
  onGetStarted,
}: {
  lang: Lang;
  theme: ThemeChoice;
  setTheme: (t: ThemeChoice) => void;
  onGetStarted: () => void;
}) {
  const isDark = theme === "gold-navy";

  return (
    <>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: isDark ? "#ffffff" : "#0a0a0a",
          lineHeight: 1.25,
          marginBottom: 20,
          transition: "color 0.15s",
        }}
      >
        {tx(lang, "Choose your theme", "Elige tu tema")}
      </h2>

      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <ThemeCard
          label={tx(lang, "Light Mode", "Modo Claro")}
          badge={tx(lang, "Default", "Predeterminado")}
          selected={theme === "white-noir"}
          isDark={isDark}
          onClick={() => setTheme("white-noir")}
        />
        <ThemeCard
          label={tx(lang, "Dark Mode", "Modo Oscuro")}
          selected={theme === "gold-navy"}
          isDark={isDark}
          onClick={() => setTheme("gold-navy")}
        />
      </div>

      <button onClick={onGetStarted} style={primaryButtonStyle(false, isDark)}>
        {tx(lang, "Get Started →", "Comenzar →")}
      </button>
    </>
  );
}

function ThemeCard({
  label,
  badge,
  selected,
  isDark,
  onClick,
}: {
  label: string;
  badge?: string;
  selected: boolean;
  isDark: boolean;
  onClick: () => void;
}) {
  const textColor = isDark ? "#ffffff" : "#0a0a0a";
  const border = isDark
    ? selected ? "2px solid #c9a961" : "1px solid rgba(255,255,255,0.12)"
    : selected ? "2px solid #0a0a0a" : "1px solid rgba(0,0,0,0.12)";
  const background = isDark
    ? selected ? "rgba(201,169,97,0.10)" : "#1a1d27"
    : selected ? "rgba(0,0,0,0.04)" : "#ffffff";

  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        padding: "20px 8px",
        borderRadius: 16,
        border,
        background,
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
        transition: "border 0.15s, background 0.15s",
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 600, color: textColor, transition: "color 0.15s" }}>{label}</span>
      {badge && (
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: isDark ? "rgba(255,255,255,0.55)" : "rgba(0,0,0,0.45)",
            background: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
            padding: "2px 8px",
            borderRadius: 999,
            letterSpacing: "0.03em",
            transition: "color 0.15s, background 0.15s",
          }}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

// ── Back button ───────────────────────────────────────────────────────────────

function BackButton({ isDark, onClick }: { isDark: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Back"
      style={{
        position: "absolute",
        top: 16,
        left: 16,
        width: 32,
        height: 32,
        borderRadius: 8,
        border: "none",
        background: "transparent",
        color: isDark ? "#ffffff" : "#0a0a0a",
        fontSize: 18,
        lineHeight: 1,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "color 0.15s",
      }}
    >
      ←
    </button>
  );
}

// ── Shared styles ─────────────────────────────────────────────────────────────

function primaryButtonStyle(disabled: boolean, isDark = false): React.CSSProperties {
  return {
    width: "100%",
    padding: "13px 0",
    borderRadius: 14,
    fontSize: 15,
    fontWeight: 700,
    background: isDark
      ? disabled ? "rgba(201,169,97,0.3)" : "#c9a961"
      : disabled ? "rgba(10,10,10,0.3)" : "#0a0a0a",
    color: isDark ? "#0e1018" : "#ffffff",
    border: "none",
    cursor: disabled ? "default" : "pointer",
    transition: "background 0.15s, color 0.15s",
  };
}
