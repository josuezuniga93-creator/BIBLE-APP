// app/lib/supabase/client.ts
// Browser-side Supabase client (uses @supabase/ssr for cookie-based sessions)

import { createBrowserClient } from "@supabase/ssr";

function createDisabledClient() {
  const disabledError = new Error("Supabase is not configured.");
  const emptyQuery = {
    select: () => emptyQuery,
    eq: () => emptyQuery,
    in: () => emptyQuery,
    order: () => emptyQuery,
    single: async () => ({ data: null, error: disabledError }),
    maybeSingle: async () => ({ data: null, error: null }),
    then: (resolve: (value: { data: null; error: Error }) => void) => resolve({ data: null, error: disabledError }),
  };

  return {
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signOut: async () => ({ error: null }),
      signInWithOAuth: async () => ({ data: null, error: disabledError }),
    },
    from: () => ({
      ...emptyQuery,
      upsert: async () => ({ data: null, error: disabledError }),
      insert: async () => ({ data: null, error: disabledError }),
      update: () => emptyQuery,
      delete: () => emptyQuery,
    }),
    storage: {
      from: () => ({
        upload: async () => ({ data: null, error: disabledError }),
        getPublicUrl: () => ({ data: { publicUrl: "" } }),
      }),
    },
  } as unknown as ReturnType<typeof createBrowserClient>;
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return createDisabledClient();
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}
