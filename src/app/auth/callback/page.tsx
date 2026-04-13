"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { AuthLoadingScreen } from "@/components/ui/auth-loading-screen";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const provider = searchParams?.get("provider");
    const code = searchParams?.get("code");
    const errorParam = searchParams?.get("error");

    if (errorParam) {
      setError(errorParam);
      return;
    }

    if (!code || !provider) {
      setError("Missing callback parameters");
      return;
    }

    async function handleCallback() {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/callback/${provider}?code=${code}`,
        );

        if (!response.ok) {
          throw new Error("OAuth callback failed");
        }

        const data = await response.json();

        if (typeof window !== "undefined") {
          localStorage.setItem("token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
        }

        router.push("/dashboard");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Authentication failed");
      }
    }

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-red-200">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">
              Authentication Failed
            </h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => router.push("/auth/login")}
              className="text-brand-amber hover:underline"
            >
              Return to login
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <AuthLoadingScreen
      description="Please wait while we redirect you."
      mode="thinking"
      title="Completing sign in..."
    />
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={<AuthLoadingScreen mode="loading" title="Loading..." />}
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
