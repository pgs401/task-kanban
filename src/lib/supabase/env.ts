/**
 * Reads and validates the Supabase environment variables.
 *
 * All configuration comes from the environment — nothing is hardcoded. If a
 * value is missing (e.g. a fresh fork that hasn't set up `.env.local` yet) we
 * throw a clear, actionable error instead of letting the Supabase client fail
 * with a cryptic message.
 */
export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    const missing = [
      !url && "NEXT_PUBLIC_SUPABASE_URL",
      !anonKey && "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ]
      .filter(Boolean)
      .join(", ");

    throw new Error(
      `Missing Supabase environment variable(s): ${missing}. ` +
        "Copy .env.example to .env.local and fill in your project's URL and " +
        "anon key (Supabase dashboard → Project Settings → API)."
    );
  }

  return { url, anonKey };
}
