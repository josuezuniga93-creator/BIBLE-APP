"use client";

import { useEffect } from "react";

// Runs on the client after hydration to ensure data-android-mode is correct.
// Belt-and-suspenders alongside the inline script in layout.tsx.
export function AndroidModeApplier() {
  useEffect(() => {
    try {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (!isIOS) {
        document.documentElement.setAttribute("data-android-mode", "true");
        localStorage.setItem("ryc-android-mode", "true");
      } else {
        document.documentElement.removeAttribute("data-android-mode");
        localStorage.setItem("ryc-android-mode", "false");
      }
    } catch { /**/ }
  }, []);

  return null;
}
