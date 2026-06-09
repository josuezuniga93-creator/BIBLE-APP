// app/auth/callback/route.ts
// Handles the OAuth redirect from Google (and email confirmation links).
// Exchanges the code for a session, then redirects to the app.

import { NextResponse } from "next/server";
import { createClient } from "../../lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/more";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth error — redirect to login with error flag
  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
