"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { GithubLogoIcon, SpinnerIcon } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";

type Step = "credentials" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.routing.run";
      await fetch(`${apiUrl}/auth/login/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      toast.success("OTP resent to your email");
      setResendCooldown(60);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SpinnerIcon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.routing.run";
      const response = await fetch(`${apiUrl}/auth/login/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      toast.success("OTP sent to your email");
      setStep("otp");
      setResendCooldown(60);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, otp);
      router.push("/dashboard");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubOAuth = async () => {
    setIsOAuthLoading("github");
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.routing.run";
    window.location.href = `${apiUrl}/auth/oauth/github`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-[#E3A514]/5 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="mb-8 space-y-1 px-6 text-left">
          <h1 className="font-medium text-2xl text-foreground">Welcome back</h1>
          <p className="text-muted-foreground text-sm">
            {step === "credentials" ? "Sign in to your account" : "Enter the code from your email"}
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

              {step === "credentials" ? (
                <form onSubmit={handleCredentialsSubmit} className="space-y-5">
                  <div className="space-y-3">
                    <Label className="font-medium text-foreground" htmlFor="email">
                      Email<span className="text-primary">*</span>
                    </Label>
                    <Input
                      autoComplete="email"
                      id="email"
                      name="email"
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      required
                      type="email"
                      value={email}
                    />
                  </div>
                  <div className="space-y-3">
                    <Label className="font-medium text-foreground" htmlFor="password">
                      Password<span className="text-primary">*</span>
                    </Label>
                    <Input
                      autoComplete="current-password"
                      id="password"
                      name="password"
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      required
                      type="password"
                      value={password}
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={isLoading}
                    type="submit"
                  >
                    {isLoading ? (
                      <>
                        <SpinnerIcon className="mr-2 size-4 animate-spin" />
                        Sending code...
                      </>
                    ) : (
                      "Continue"
                    )}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleOtpSubmit} className="space-y-5">
                  <div className="space-y-3">
                    <Label className="font-medium text-foreground" htmlFor="otp">
                      Verification Code<span className="text-primary">*</span>
                    </Label>
                    <Input
                      id="otp"
                      name="otp"
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="Enter 6-digit code"
                      required
                      type="text"
                      maxLength={6}
                      value={otp}
                    />
                  </div>
                  <Button
                    className="w-full"
                    disabled={isLoading}
                    type="submit"
                  >
                    {isLoading ? (
                      <>
                        <SpinnerIcon className="mr-2 size-4 animate-spin" />
                        Verifying...
                      </>
                    ) : (
                      "Verify & Sign In"
                    )}
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={handleResendOtp}
                      disabled={isLoading || resendCooldown > 0}
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex-1"
                      onClick={() => setStep("credentials")}
                    >
                      Use different email
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="font-medium text-accent-foreground hover:text-accent-foreground/80">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
