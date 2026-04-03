"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { GithubLogoIcon, SpinnerIcon, InfoIcon } from "@phosphor-icons/react";
import { useAuth } from "@/lib/auth-context";
import { toast } from "sonner";
import { api } from "@/lib/api";

type Step = "form" | "otp";

export default function RegisterPage() {
  const router = useRouter();
  const { register, isAuthenticated, isLoading: authLoading } = useAuth();
  const [step, setStep] = useState<Step>("form");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [otp, setOtp] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <SpinnerIcon className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (!acceptTerms) {
      toast.error("You must accept the terms and conditions");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    setIsLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.routing.run";
      await fetch(`${apiUrl}/auth/signup/init`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      setStep("otp");
      toast.success("Verification code sent to your email");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await register(formData.email, otp, formData.password, formData.name);
      toast.success("Account created successfully!");
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-[#453C7C]/5 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="mb-8 space-y-1 px-6 text-left">
          <h1 className="font-medium text-2xl text-foreground">
            {step === "form" ? "Create your account" : "Verify your email"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {step === "form" 
              ? "Sign up to start using Routing.Run" 
              : `Enter the code sent to ${formData.email}`}
          </p>
        </div>

        <div className="relative px-6">
          <div className="relative z-10">
            <div className="space-y-4">
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

              {step === "form" ? (
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div className="space-y-3">
                    <Label className="font-medium text-foreground" htmlFor="name">
                      Full name<span className="text-primary">*</span>
                    </Label>
                    <Input
                      autoComplete="name"
                      id="name"
                      name="name"
                      onChange={handleChange}
                      placeholder="Enter your name"
                      required
                      type="text"
                      value={formData.name}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="font-medium text-foreground" htmlFor="email">
                      Email address<span className="text-primary">*</span>
                    </Label>
                    <Input
                      autoComplete="email"
                      id="email"
                      name="email"
                      onChange={handleChange}
                      placeholder="Enter your email"
                      required
                      type="email"
                      value={formData.email}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Label className="font-medium text-foreground" htmlFor="password">
                        Password<span className="text-primary">*</span>
                      </Label>
                      <InfoIcon className="size-4 text-muted-foreground" />
                    </div>
                    <Input
                      autoComplete="new-password"
                      id="password"
                      name="password"
                      onChange={handleChange}
                      placeholder="Min. 8 characters"
                      required
                      minLength={8}
                      type="password"
                      value={formData.password}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="font-medium text-foreground" htmlFor="confirmPassword">
                      Confirm password<span className="text-primary">*</span>
                    </Label>
                    <Input
                      autoComplete="new-password"
                      id="confirmPassword"
                      name="confirmPassword"
                      onChange={handleChange}
                      placeholder="Confirm your password"
                      required
                      minLength={8}
                      type="password"
                      value={formData.confirmPassword}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={acceptTerms}
                        className="cursor-pointer"
                        id="terms"
                        onCheckedChange={(checked: boolean) => setAcceptTerms(checked)}
                      />
                      <Label className="text-sm text-muted-foreground" htmlFor="terms">
                        I agree to the{" "}
                        <Link className="font-medium text-accent-foreground hover:underline" href="/terms">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link className="font-medium text-accent-foreground hover:underline" href="/privacy">
                          Privacy Policy
                        </Link>
                      </Label>
                    </div>
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
                        Creating account...
                      </>
                    ) : (
                      "Create account"
                    )}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => setStep("form")}
                  >
                    Use different email
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-medium text-accent-foreground hover:text-accent-foreground/80">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
