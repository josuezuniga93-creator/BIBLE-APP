"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
// Date-dependent screens hydrate the same placeholder, then use the device's date.
export function useClientReady() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
