"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[App Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white flex flex-col items-center justify-center px-6 text-center gap-5">
      <p className="text-3xl">Warning:</p>
      <h1 className="text-lg font-bold text-white/90">Something went wrong</h1>
      <p className="text-sm text-white/50 font-mono break-all max-w-sm">
        {error?.message || "Unknown error"}
      </p>
      {error?.digest && (
        <p className="text-xs text-white/25 font-mono">digest: {error.digest}</p>
      )}
      <button
        onClick={reset}
        className="mt-2 px-5 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold"
      >
        Try again
      </button>
    </div>
  );
}
