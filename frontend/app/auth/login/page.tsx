"use client";

// app/auth/login/page.tsx
// Login / sign-up gate — YouVersion-style "Access the Full Experience" entry screen.

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { Suspense } from "react";

const AC = "#c9a961";

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // "gate" = full-experience landing; "email" = email form expanded
  const [view, setView] = useState<"gate" | "email">("gate");
  const [emailMode, setEmailMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    if (searchParams.get("error") === "auth_failed") {
      setMessage({ type: "error", text: "Sign-in failed. Please try again." });
      setView("email");
    }
  }, [searchParams]);

  async function handleGoogleSignIn() {
    setGoogleLoading(true);
    setMessage(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/more`,
      },
    });
    if (error) {
      setMessage({ type: "error", text: error.message });
      setGoogleLoading(false);
    }
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setMessage(null);

    if (emailMode === "signup") {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/more`,
        },
      });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({ type: "success", text: "Check your email for a confirmation link." });
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        router.push("/more");
        router.refresh();
      }
    }
    setLoading(false);
  }

  // ── Gate screen ────────────────────────────────────────────────────────────
  if (view === "gate") {
    return (
      <div
        className="flex flex-col overflow-hidden"
        style={{
          background: "#08090f",
          height: "100dvh",
          paddingTop: "env(safe-area-inset-top)",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}
      >
        {/* Top bar — back button */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 flex-shrink-0">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <p className="text-[10px] font-black tracking-[0.22em] uppercase" style={{ color: "rgba(201,169,97,0.5)" }}>
            Tulip Bible
          </p>
          <div className="w-9" />
        </div>

        {/* All content centered together — no gap between text and buttons */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center min-h-0">
          <div
            className="w-20 h-20 rounded-3xl flex items-center justify-center mb-5"
            style={{ background: "rgba(201,169,97,0.12)", border: "1px solid rgba(201,169,97,0.22)" }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8" r="4" stroke={AC} strokeWidth="1.8"/>
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke={AC} strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </div>
          <h1 className="text-[26px] font-bold text-white leading-tight mb-3">
            Access the Full Experience
          </h1>
          <p className="text-[14px] leading-relaxed mb-7" style={{ color: "rgba(255,255,255,0.5)", maxWidth: 280 }}>
            Sync your highlights, notes, and reading history across all your devices. Free forever — no ads.
          </p>

          <div className="w-full flex flex-col gap-3">
            <button
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 font-bold text-[15px] transition-all active:scale-95"
              style={{
                background: `linear-gradient(135deg, ${AC}, #a8873a)`,
                color: "#0f0f0f",
                opacity: googleLoading ? 0.7 : 1,
              }}
            >
              <GoogleIcon />
              {googleLoading ? "Redirecting…" : "Continue with Google"}
            </button>

            <button
              onClick={() => setView("email")}
              className="w-full rounded-2xl py-4 font-semibold text-[15px] transition-all active:scale-95"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              Sign In with Email
            </button>

            {message && (
              <p className="text-center text-xs" style={{ color: "#f87171" }}>
                {message.text}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Email form screen ──────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col overflow-hidden"
      style={{
        background: "#08090f",
        height: "100dvh",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Top bar */}
      <div className="flex items-center gap-3 px-5 pt-4 pb-2">
        <button
          onClick={() => { setView("gate"); setMessage(null); }}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ background: "rgba(255,255,255,0.06)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <h2 className="text-[16px] font-bold text-white">
          {emailMode === "signup" ? "Create Account" : "Sign In"}
        </h2>
      </div>

      {/* Form */}
      <div className="flex-1 px-6 pt-6 overflow-y-auto">
        {/* Google option at top */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 rounded-2xl py-3.5 mb-5 font-semibold text-sm transition-all active:scale-95"
          style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "white",
            opacity: googleLoading ? 0.6 : 1,
          }}
        >
          <GoogleIcon />
          {googleLoading ? "Redirecting…" : "Continue with Google"}
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            className="w-full rounded-xl px-4 py-3.5 text-white placeholder-white/30 outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              fontSize: 16,
            }}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded-xl px-4 py-3.5 text-white placeholder-white/30 outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              fontSize: 16,
            }}
          />

          {message && (
            <p className="text-xs px-1" style={{ color: message.type === "error" ? "#f87171" : "#86efac" }}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full rounded-xl py-4 font-bold text-sm transition-all active:scale-95"
            style={{
              background: `linear-gradient(135deg, ${AC}, #a8873a)`,
              color: "#0f0f0f",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? emailMode === "signup" ? "Creating account…" : "Signing in…"
              : emailMode === "signup" ? "Create Account" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm mt-5" style={{ color: "rgba(255,255,255,0.4)" }}>
          {emailMode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setEmailMode(emailMode === "signin" ? "signup" : "signin"); setMessage(null); }}
            className="font-semibold underline"
            style={{ color: AC }}
          >
            {emailMode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}
