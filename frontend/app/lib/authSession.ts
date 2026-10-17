"use client";

import type { Session, User } from "@supabase/supabase-js";
import { createClient } from "./supabase/client";

export const AUTH_CHANGE_EVENT = "tulip-auth-change";
let user: User | null = null;
let session: Session | null = null;
let pending: Promise<User | null> | null = null;
let subscribed = false;

function update(next: Session | null) {
  const changed = session?.access_token !== next?.access_token || user?.id !== next?.user.id;
  session = next;
  user = next?.user ?? null;
  if (changed) window.dispatchEvent(new CustomEvent(AUTH_CHANGE_EVENT, { detail: user }));
}

function subscribe() {
  if (subscribed || typeof window === "undefined") return;
  subscribed = true;
  // Defer application work until Supabase has released its auth lock.
  createClient().auth.onAuthStateChange((_event, next) => {
    window.setTimeout(() => update(next), 0);
  });
}

/** UI session state only; Supabase RLS still authorizes every cloud operation. */
export function getSessionUser(): Promise<User | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  subscribe();
  if (pending) return pending;
  pending = createClient().auth.getSession().then(({ data, error }) => {
    if (error) {
      // A transient network failure is not a sign-out. Keep a valid session.
      if (session && (session.expires_at ?? 0) * 1000 > Date.now()) return user;
      throw error;
    }
    update(data.session);
    return user;
  }).finally(() => { pending = null; });
  return pending;
}
