"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { GithubLogoIcon, SpinnerIcon } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const [isEmailLoading, setIsEmailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SpinnerIcon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleGithubOAuth = async () => {
    setIsOAuthLoading("github");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.routing.run";
    window.location.href = `${apiUrl}/auth/oauth/github`;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsEmailLoading(true);

    try {
      await api.auth.login(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-[#E3A514]/5 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="mb-8 space-y-1 px-6 text-left">
          <h1 className="font-medium text-2xl text-foreground">Welcome back</h1>
          <p className="text-muted-foreground text-sm">
            Sign in to your account
          </p>
        </div>

        <div className="relative px-6">
          <div className="relative z-10">
            <div className="space-y-6">
              <Button
                className="relative w-full"
                disabled={isOAuthLoading !== null}
                onClick={handleGithubOAuth}
                size="lg"
                type="button"
                variant="secondary"
              >
                <GithubLogoIcon className="size-4" />
                GitHub
                {isOAuthLoading === "github" && (
                  <SpinnerIcon className="ml-2 size-4 animate-spin" />
                )}
              </Button>

              <div className="relative flex w-full items-center justify-center gap-3">
                <Separator className="flex-1 opacity-70" />
                <p className="text-nowrap font-medium text-muted-foreground/50 text-sm">
                  Or
                </p>
                <Separator className="flex-1 opacity-70" />
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isEmailLoading}
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isEmailLoading}
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-500 text-center">{error}</p>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isEmailLoading || !email || !password}
                >
                  {isEmailLoading ? (
                    <SpinnerIcon className="size-4 animate-spin" />
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-medium text-accent-foreground hover:text-accent-foreground/80">
            Sign up with GitHub
          </Link>
        </p>
      </div>
    </div>
  );
}