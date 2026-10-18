"use client";

import { useEffect } from "react";

// Device layout is derived from the browser, never from a user-facing toggle.
export function AndroidModeApplier() {
  useEffect(() => {
    try {
      const ua = navigator.userAgent;
      const isIOS = /iPad|iPhone|iPod/.test(ua) ||
        (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
      const isAndroid = /Android/.test(ua);
      const device = isIOS ? "ios" : isAndroid ? "android" : "other";

      document.documentElement.dataset.device = device;
      if (isAndroid) {
        document.documentElement.setAttribute("data-android-mode", "true");
      } else {
        document.documentElement.removeAttribute("data-android-mode");
      }
      localStorage.removeItem("ryc-android-mode");
    } catch { /**/ }
  }, []);

  return null;
}
