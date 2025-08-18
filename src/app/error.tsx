"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 text-center">
      <h1 className="text-6xl font-bold text-red-600">Oops!</h1>
      <h2 className="mt-4 text-2xl font-semibold text-gray-800">
        Something went wrong
      </h2>
      <p className="mt-2 text-gray-500 max-w-md">
        We’re sorry, but an unexpected error occurred. Our team has been
        notified and is working to fix the issue.
      </p>

      {error?.message && (
        <p className="mt-2 text-sm text-gray-400 italic">{error.message}</p>
      )}

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Button
          variant="default"
          onClick={() => reset()} // Try to recover without full refresh
        >
          Try Again
        </Button>
        <Button
          variant="outline"
          onClick={() => router.push("/")} // Navigate without full reload
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}
