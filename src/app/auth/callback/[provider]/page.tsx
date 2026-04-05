"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const ALLOWED_OAUTH_PROVIDERS = ["github"];

function AuthCallbackContent({ provider }: { provider: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ALLOWED_OAUTH_PROVIDERS.includes(provider)) {
      setError("Invalid OAuth provider");
      return;
    }

    const hash = window.location.hash;
    console.log("[DEBUG] Full URL:", window.location.href);
    console.log("[DEBUG] Hash:", hash);

    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const csrfToken = params.get("csrf_token");
      console.log("[DEBUG] accessToken:", accessToken ? "present" : "missing");
      console.log("[DEBUG] refreshToken:", refreshToken ? "present" : "missing");

      if (accessToken && refreshToken) {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        if (csrfToken) {
          localStorage.setItem("csrf_token", csrfToken);
        }
        router.push("/dashboard");
        return;
      }
    }

    const code = searchParams?.get("code");
    const state = searchParams?.get("state");
    const errorParam = searchParams?.get("error");
    console.log("[DEBUG] code:", code ? "present" : "missing");
    console.log("[DEBUG] state:", state ? "present" : "missing");

    if (errorParam) {
      setError("OAuth authorization was denied");
      return;
    }

    if (!code || !state) {
      setError("Missing code or state parameter");
      console.log("[DEBUG] Missing code or state - ending up in error state");
      return;
    }

    async function handleCallback() {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.routing.run";
        const encodedProvider = encodeURIComponent(provider);
        const encodedCode = encodeURIComponent(code || "");
        const encodedState = encodeURIComponent(state || "");
        const response = await fetch(
          `${apiUrl}/auth/callback/${encodedProvider}?code=${encodedCode}&state=${encodedState}`,
          { credentials: "include" }
        );

        if (!response.ok) {
          throw new Error("Authentication failed");
        }

        const data = await response.json();

        if (typeof window !== "undefined") {
          localStorage.setItem("access_token", data.access_token);
          localStorage.setItem("refresh_token", data.refresh_token);
          if (data.csrf_token) {
            localStorage.setItem("csrf_token", data.csrf_token);
          }
        }

        router.push("/dashboard");
      } catch {
        setError("Authentication failed. Please try again.");
      }
    }

    handleCallback();
  }, [provider, searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-red-200">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold text-red-600 mb-2">Authentication Failed</h2>
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
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-brand-amber" />
          <h2 className="text-xl font-bold mb-2">Completing sign in...</h2>
          <p className="text-muted-foreground">Please wait while we redirect you.</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthCallbackPage({ params }: { params: Promise<{ provider: string }> }) {
  const [provider, setProvider] = useState<string>("");

  useEffect(() => {
    params.then(p => setProvider(p.provider));
  }, [params]);

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-brand-amber" />
            <h2 className="text-xl font-bold mb-2">Loading...</h2>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-brand-amber" />
            <h2 className="text-xl font-bold mb-2">Loading...</h2>
          </CardContent>
        </Card>
      </div>
    }>
      <AuthCallbackContent provider={provider} />
    </Suspense>
  );
}