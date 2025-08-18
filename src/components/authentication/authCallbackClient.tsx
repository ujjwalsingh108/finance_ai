"use client"; // ✅ must be first line

import { useEffect } from "react";
import { Card } from "@/components/ui/card";
import { createClient as createBrowserClient } from "@/utils/supabase/client";
import { postAuthSetup } from "@/components/authentication/postAuthSetup";

export default function AuthCallbackClient({ mode }: { mode: string }) {
  useEffect(() => {
    const finish = async () => {
      const supabase = createBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      try {
        await postAuthSetup(
          supabase,
          user,
          mode as "individual" | "organization"
        );
        window.location.href = "/home";
      } catch (err) {
        console.error("Post-auth setup failed:", err);
        window.location.href = "/error";
      }
    };

    finish();
  }, [mode]);

  return <Card className="w-full max-w-sm">Finishing signin...</Card>;
}
