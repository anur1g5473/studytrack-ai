import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

// Get the correct redirect URL based on environment
function getRedirectURL() {
  // Check if we're on the server or client
  if (typeof window !== "undefined") {
    return `${window.location.origin}/auth/callback`;
  }
  
  // For server-side, use environment variable
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl) {
    return `${siteUrl}/auth/callback`;
  }
  
  // Fallback to localhost for development
  return "http://localhost:3000/auth/callback";
}

export async function signInWithGoogle() {
  const supabase = createClient();
  return await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: getRedirectURL(),
    },
  });
}

export async function signInWithEmail(email: string, password: string) {
  const supabase = createClient();
  return await supabase.auth.signInWithPassword({
    email,
    password,
  });
}

export async function signUpWithEmail(email: string, password: string, fullName: string) {
  const supabase = createClient();
  return await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
      emailRedirectTo: getRedirectURL(),
    },
  });
}

export async function signOut() {
  const supabase = createClient();
  return await supabase.auth.signOut();
}

export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}