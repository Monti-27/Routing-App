"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Loader2, Coins } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

const CREDITS_PACKAGES = [
  { amount: 5, price: 5.00 },
  { amount: 10, price: 9.50 },
  { amount: 25, price: 22.00 },
  { amount: 50, price: 40.00 },
];

export default function SettingsPage() {
  const { user, isLoading: authLoading, isAuthenticated, refreshUser } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [credits, setCredits] = useState(0);
  const [isPayg, setIsPayg] = useState(false);
  const [isAddingCredits, setIsAddingCredits] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email);
    }
  }, [user]);

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddCredits = async (pkg: { amount: number; price: number }) => {
    setIsAddingCredits(true);
    setSelectedPackage(pkg.amount);
    // TODO: Integrate with Whop for checkout
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsAddingCredits(false);
    setSelectedPackage(null);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Manage your account settings and preferences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Update your personal information and profile settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                disabled
                className="opacity-60"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan">Plan</Label>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary"
                className={
                  user.plan_tier === "premium" || user.plan_tier === "max"
                    ? "bg-brand-purple/10 text-brand-purple"
                    : user.plan_tier === "lite"
                    ? "bg-brand-amber/10 text-brand-amber"
                    : ""
                }
              >
                {user.plan_tier.charAt(0).toUpperCase() + user.plan_tier.slice(1)}
              </Badge>
              {user.email_verified && (
                <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                  Verified
                </Badge>
              )}
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {saved && <span className="mr-2">✓</span>}
            {isSaving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Plan & Billing</CardTitle>
          <CardDescription>
            Manage your subscription and billing information.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-brand-purple to-brand-coral">
                <span className="text-xl font-bold text-white">
                  {user.plan_tier.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium">Current Plan: {user.plan_tier.charAt(0).toUpperCase() + user.plan_tier.slice(1)}</p>
                  <Badge variant="secondary">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Manage your subscription through Whop
                </p>
              </div>
            </div>
            <Button variant="outline">Upgrade Plan</Button>
          </div>
          <Separator />
          {isPayg && (
            <>
              <div className="rounded-lg border border-brand-amber/50 bg-brand-amber/5 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-amber/20">
                      <Coins className="h-5 w-5 text-brand-amber" />
                    </div>
                    <div>
                      <p className="font-medium">Credits Balance</p>
                      <p className="text-2xl font-bold text-brand-amber">${credits.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
                <Separator className="my-4" />
                <p className="mb-3 text-sm font-medium">Add Credits</p>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {CREDITS_PACKAGES.map((pkg) => (
                    <button
                      key={pkg.amount}
                      onClick={() => handleAddCredits(pkg)}
                      disabled={isAddingCredits}
                      className="rounded-lg border border-brand-amber/30 bg-background p-3 text-center transition-all hover:border-brand-amber hover:bg-brand-amber/5 disabled:opacity-50"
                    >
                      <p className="text-lg font-bold">{pkg.amount} Credits</p>
                      <p className="text-sm text-muted-foreground">${pkg.price.toFixed(2)}</p>
                      {isAddingCredits && selectedPackage === pkg.amount && (
                        <Loader2 className="mx-auto mt-2 h-4 w-4 animate-spin" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <Separator />
            </>
          )}
          <div className="space-y-3">
            <p className="font-medium">Available Plans</p>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { name: "Free", price: "$0", features: ["60 req/min", "1000 req/day"] },
                { name: "Lite", price: "$19", features: ["200 req/min", "50K req/day"] },
                { name: "Premium", price: "$49", features: ["500 req/min", "200K req/day"] },
                { name: "Max", price: "$99", features: ["2000 req/min", "1M req/day"] },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-lg border p-4 transition-colors ${
                    user.plan_tier.toLowerCase() === plan.name.toLowerCase()
                      ? "border-brand-purple bg-brand-purple/5"
                      : "hover:border-brand-purple/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{plan.name}</p>
                    <span className="text-lg font-bold">{plan.price}</span>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {plan.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure how you receive notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive usage reports and alerts via email.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Usage Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when approaching rate limits.
              </p>
            </div>
            <Switch defaultChecked />
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Marketing Emails</Label>
              <p className="text-sm text-muted-foreground">
                Receive updates about new features and promotions.
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>
            Manage your account security settings.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account.
              </p>
            </div>
            <Button variant="outline">Enable</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Password</Label>
              <p className="text-sm text-muted-foreground">
                Change your account password.
              </p>
            </div>
            <Button variant="outline">Change Password</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Active Sessions</Label>
              <p className="text-sm text-muted-foreground">
                Manage your active sessions across devices.
              </p>
            </div>
            <Button variant="outline">View Sessions</Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible and destructive actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Delete All API Keys</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete all your API keys. This cannot be undone.
              </p>
            </div>
            <Button variant="destructive">Delete All Keys</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Delete Account</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <Button variant="destructive">Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
