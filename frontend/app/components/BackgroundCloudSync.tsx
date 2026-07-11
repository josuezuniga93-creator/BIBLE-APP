"use client";

import { useEffect } from "react";
import { startBackgroundCloudSync } from "../lib/cloudSync";

export function BackgroundCloudSync() {
  useEffect(() => {
    startBackgroundCloudSync();
  }, []);

  return null;
}
