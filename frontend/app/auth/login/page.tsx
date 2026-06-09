"use client";

// app/auth/login/page.tsx
// Login page — Google OAuth + email/password sign-in and sign-up.

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../lib/supabase/client";
import { Suspense } from "react";

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

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  useEffect(() => {
    if (searchParams.get("error") === "auth_failed") {
      setMessage({ type: "error", text: "Sign-in failed. Please try again." });
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
    // On success the page redirects — no need to setLoading(false)
  }

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setMessage(null);

    if (mode === "signup") {
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

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6"
      style={{ background: "#0f0f0f" }}
    >
      {/* Logo / branding */}
      <div className="mb-8 text-center">
        <p className="text-[11px] font-bold tracking-[0.25em] uppercase mb-1" style={{ color: "rgba(201,169,97,0.6)" }}>
          Tulip Bible App
        </p>
        <h1 className="text-2xl font-bold text-white">
          {mode === "signup" ? "Create Account" : "Sign In"}
        </h1>
        <p className="text-sm mt-1.5" style={{ color: "rgba(255,255,255,0.45)" }}>
          {mode === "signup"
            ? "Sync your highlights and notes across devices"
            : "Access your saved highlights and notes"}
        </p>
      </div>

      <div className="w-full max-w-sm">

        {/* Google */}
        <button
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-3 rounded-2xl py-3.5 mb-4 font-semibold text-sm transition-all active:scale-95"
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

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
          <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>or</span>
          <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        </div>

        {/* Email/Password form */}
        <form onSubmit={handleEmailAuth} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none"
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
            className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.10)",
              fontSize: 16,
            }}
          />

          {message && (
            <p
              className="text-xs px-1 py-0.5"
              style={{ color: message.type === "error" ? "#f87171" : "#86efac" }}
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full rounded-xl py-3.5 font-bold text-sm transition-all active:scale-95"
            style={{
              background: "linear-gradient(135deg, #c9a961, #a8873a)",
              color: "#0f0f0f",
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? mode === "signup" ? "Creating account…" : "Signing in…"
              : mode === "signup" ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* Toggle signin/signup */}
        <p className="text-center text-sm mt-5" style={{ color: "rgba(255,255,255,0.4)" }}>
          {mode === "signin" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setMessage(null); }}
            className="font-semibold underline"
            style={{ color: "#c9a961" }}
          >
            {mode === "signin" ? "Sign up" : "Sign in"}
          </button>
        </p>

        {/* Back link */}
        <p className="text-center mt-4">
          <button
            onClick={() => router.back()}
            className="text-xs"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            ← Back to app
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
