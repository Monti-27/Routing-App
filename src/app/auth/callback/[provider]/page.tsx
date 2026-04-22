"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { AuthLoadingScreen } from "@/components/ui/auth-loading-screen";

const ALLOWED_OAUTH_PROVIDERS = ["github", "discord"];

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

    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      const csrfToken = params.get("csrf_token");

      if (accessToken && refreshToken) {
        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
        localStorage.setItem("session_start", String(Date.now()));
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

    if (errorParam) {
      setError("OAuth authorization was denied");
      return;
    }

    if (!code || !state) {
      setError("Missing code or state parameter");
      return;
    }

    async function handleCallback() {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_API_URL || "https://api.routing.run";
        const encodedProvider = encodeURIComponent(provider);
        const encodedCode = encodeURIComponent(code || "");
        const encodedState = encodeURIComponent(state || "");

        const response = await fetch(
          `${apiUrl}/auth/callback/${encodedProvider}?code=${encodedCode}&state=${encodedState}`,
          { credentials: "include" },
        );

        if (!response.ok) {
          throw new Error(
            `Authentication failed with status ${response.status}`,
          );
        }

        const data = await response.json();

        if (data.user) {
          // Store tokens in localStorage
          if (data.access_token && data.refresh_token) {
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("refresh_token", data.refresh_token);
            localStorage.setItem("session_start", String(Date.now()));
            if (data.csrf_token) {
              localStorage.setItem("csrf_token", data.csrf_token);
            }
          }
          // Store user in sessionStorage for dashboard to pick up
          sessionStorage.setItem("oauth_user", JSON.stringify(data.user));
          // Redirect to dashboard
          window.location.href = "/dashboard";
        } else {
          throw new Error("No user data in response");
        }
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

export default function AuthCallbackPage({
  params,
}: {
  params: Promise<{ provider: string }>;
}) {
  const [provider, setProvider] = useState<string>("");

  useEffect(() => {
    params.then((p) => setProvider(p.provider));
  }, [params]);

  if (!provider) {
    return <AuthLoadingScreen mode="loading" title="Loading..." />;
  }

  return (
    <Suspense
      fallback={<AuthLoadingScreen mode="loading" title="Loading..." />}
    >
      <AuthCallbackContent provider={provider} />
    </Suspense>
  );
}
