// app/auth/callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { postAuthSetup } from "@/components/authentication/postAuthSetup";

export async function GET(request: NextRequest) {
  const supabase = await createClient();

  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const mode = (url.searchParams.get("mode") ?? "individual") as
    | "individual"
    | "organization";

  // If no code, redirect to login
  if (!code) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Exchange OAuth code for a session
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code
  );
  if (exchangeError) {
    console.error("Exchange code error:", exchangeError);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Get the authenticated user
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (!user || userErr) {
    console.error("Get user error:", userErr);
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Run post-auth setup
  try {
    await postAuthSetup(supabase, user, mode);
  } catch (err) {
    console.error("Post-auth setup failed:", err);
    return NextResponse.redirect(new URL("/error", request.url));
  }

  // Redirect to home — session cookies are already handled by createClient()
  return NextResponse.redirect(new URL("/home", request.url));
}
