"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Eye, EyeOff, Loader } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AuthLoadingScreen } from "@/components/ui/auth-loading-screen";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.routing.run";
const EMAIL_PATTERN = /\S+@\S+\.\S+/;
const OTP_LENGTH = 6;
type AuthStep = "email" | "password" | "otp";

const GitHubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z" fill="currentColor" />
  </svg>
);

const DiscordIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg">
    <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.19 12.19 0 0 0-3.658 0 8.3 8.3 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032c.001.014.01.028.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019c.308-.42.582-.863.846-1.327a.05.05 0 0 0-.028-.07 8.9 8.9 0 0 1-1.248-.595.05.05 0 0 1-.005-.085c.084-.063.168-.129.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007c.08.066.164.132.248.195a.05.05 0 0 1-.004.085c-.399.233-.813.43-1.248.596a.05.05 0 0 0-.028.07c.264.464.538.887.846 1.327a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019zm-8.198 7.307c-.789 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612zm5.316 0c-.788 0-1.438-.724-1.438-1.612 0-.889.637-1.613 1.438-1.613.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612z" fill="currentColor" />
  </svg>
);

async function getErrorMessage(response: Response, fallback: string) {
  const ct = response.headers.get("content-type");
  if (!ct?.includes("application/json")) return fallback + " (" + response.status + ")";
  try {
    const err = (await response.json()) as { detail?: string; error?: string; message?: string };
    return err.message || err.detail || err.error || fallback;
  } catch {
    return fallback + " (" + response.status + ")";
  }
}

type AuthComponentLiteProps = { logo?: React.ReactNode; brandName?: string };

export function AuthComponentLite({ logo, brandName = "Routing.run" }: AuthComponentLiteProps) {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [authStep, setAuthStep] = useState<AuthStep>("email");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGithubLoading, setIsGithubLoading] = useState(false);
  const [isDiscordLoading, setIsDiscordLoading] = useState(false);
  const passwordRef = useRef<HTMLInputElement>(null);
  const otpRef = useRef<HTMLInputElement>(null);
  const isEmailValid = EMAIL_PATTERN.test(email);
  const isPasswordValid = password.length >= 1;
  const isOtpValid = otp.trim().length >= OTP_LENGTH;

  useEffect(() => {
    if (isAuthenticated && !authLoading) router.replace("/dashboard");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (authStep === "password") window.setTimeout(() => passwordRef.current?.focus(), 100);
    if (authStep === "otp") window.setTimeout(() => otpRef.current?.focus(), 100);
  }, [authStep]);

  const sendLoginCode = async () => {
    const res = await fetch(API_URL + "/auth/login/init", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) throw new Error(await getErrorMessage(res, "Unable to send sign-in code"));
  };

  const handleEmailSubmit = () => { if (!isEmailValid) return; setError(""); setAuthStep("password"); };

  const handlePasswordSubmit = async () => {
    if (!isPasswordValid || isSubmitting) return;
    setIsSubmitting(true); setError("");
    try { await sendLoginCode(); toast.success("Verification code sent to your email"); setOtp(""); setAuthStep("otp"); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to send sign-in code"); }
    finally { setIsSubmitting(false); }
  };

  const handleOtpSubmit = async () => {
    if (!isOtpValid || isSubmitting) return;
    setIsSubmitting(true); setError("");
    try { await login(email, otp.trim()); toast.success("Signed in successfully"); router.push("/dashboard"); }
    catch (err) { setError(err instanceof Error ? err.message : "Unable to verify your sign-in code"); }
    finally { setIsSubmitting(false); }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    if (authStep === "email") handleEmailSubmit();
    else if (authStep === "password") await handlePasswordSubmit();
    else if (authStep === "otp") await handleOtpSubmit();
  };

  const handleGoBack = () => {
    setError("");
    if (authStep === "otp") { setAuthStep("password"); setOtp(""); }
    else if (authStep === "password") setAuthStep("email");
  };

  if (authLoading || isAuthenticated) {
    return <AuthLoadingScreen description="Please wait while we log you in." mode="thinking" title="Logging you in..." />;
  }

  const titles: Record<AuthStep, string> = { email: "Welcome back", password: "Enter your password", otp: "Check your inbox" };
  const descs: Record<AuthStep, string> = {
    email: "Sign in to your account",
    password: "We’ll email a verification code to " + email,
    otp: "Enter the 6-digit code we sent to " + email,
  };
  const busy = isSubmitting || isGithubLoading || isDiscordLoading;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex items-center gap-2">{logo}<span className="text-base font-bold">{brandName}</span></div>
          <CardTitle className="text-xl">{titles[authStep]}</CardTitle>
          <CardDescription>{descs[authStep]}</CardDescription>
        </CardHeader>
        <CardContent>
          <fieldset className="space-y-4" disabled={busy}>
            {authStep === "email" && (<>
              <div className="flex gap-3">
                <Button className="flex-1 gap-2" onClick={() => { setIsGithubLoading(true); window.location.href = API_URL + "/auth/oauth/github"; }} variant="outline">
                  {isGithubLoading ? <Loader className="h-4 w-4 animate-spin" /> : <GitHubIcon className="h-4 w-4" />} GitHub
                </Button>
                <Button className="flex-1 gap-2" onClick={() => { setIsDiscordLoading(true); window.location.href = API_URL + "/auth/oauth/discord"; }} variant="outline">
                  {isDiscordLoading ? <Loader className="h-4 w-4 animate-spin" /> : <DiscordIcon className="h-4 w-4" />} Discord
                </Button>
              </div>
              <div className="flex items-center gap-3"><Separator className="flex-1" /><span className="text-xs text-muted-foreground">OR</span><Separator className="flex-1" /></div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input autoComplete="email" id="email" onChange={(e) => setEmail(e.target.value)} onKeyDown={handleKeyDown} placeholder="you@example.com" type="email" value={email} />
              </div>
              <Button className="w-full" disabled={!isEmailValid} onClick={handleEmailSubmit}>Continue</Button>
              <p className="text-center text-xs text-muted-foreground">Email signups are temporarily disabled. Use GitHub or Discord to create an account.</p>
            </>)}

            {authStep === "password" && (<>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input autoComplete="current-password" id="password" onChange={(e) => setPassword(e.target.value)} onKeyDown={handleKeyDown} placeholder="Enter your password" ref={passwordRef} type={showPassword ? "text" : "password"} value={password} />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground" onClick={() => setShowPassword((v) => !v)} tabIndex={-1} type="button">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" disabled={!isPasswordValid} onClick={() => void handlePasswordSubmit()}>
                {isSubmitting ? <Loader className="h-4 w-4 animate-spin" /> : "Send verification code"}
              </Button>
              <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground" onClick={handleGoBack} type="button"><ArrowLeft className="h-3.5 w-3.5" /> Back</button>
            </>)}

            {authStep === "otp" && (<>
              <div className="space-y-2">
                <Label htmlFor="otp">Verification code</Label>
                <div className="relative">
                  <Input id="otp" inputMode="numeric" maxLength={OTP_LENGTH} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} onKeyDown={handleKeyDown} placeholder="000000" ref={otpRef} type={showOtp ? "text" : "password"} value={otp} />
                  <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground" onClick={() => setShowOtp((v) => !v)} tabIndex={-1} type="button">
                    {showOtp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button className="w-full" disabled={!isOtpValid} onClick={() => void handleOtpSubmit()}>
                {isSubmitting ? <Loader className="h-4 w-4 animate-spin" /> : "Sign in"}
              </Button>
              <div className="flex items-center justify-between text-sm">
                <button className="flex items-center gap-1 text-muted-foreground hover:text-foreground" onClick={handleGoBack} type="button"><ArrowLeft className="h-3.5 w-3.5" /> Back</button>
                <button className="text-muted-foreground hover:text-foreground" onClick={() => void handlePasswordSubmit()} type="button">Resend code</button>
              </div>
            </>)}
          </fieldset>
        </CardContent>
      </Card>
    </div>
  );
}
