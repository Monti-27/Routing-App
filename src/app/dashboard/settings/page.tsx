"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Coins } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { api, fetchApi } from "@/lib/api";
import { toast } from "sonner";

const CREDITS_PACKAGES = [
  { amount: 5, price: 5.00 },
  { amount: 10, price: 9.50 },
  { amount: 25, price: 22.00 },
  { amount: 50, price: 40.00 },
];

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceDetail: "forever",
    badge: "bg-zinc-600",
    requestsPerHour: 5,
    features: ["5 requests per hour", "Basic model access", "Standard routing", "Community support"],
  },
  {
    id: "lite",
    name: "Lite",
    price: "$10",
    priceDetail: "/month",
    badge: "bg-blue-600",
    requestsPerHour: 40,
    features: ["40 requests per hour", "Extended model access", "Priority routing", "Email support"],
  },
  {
    id: "premium",
    name: "Pro",
    price: "$20",
    priceDetail: "/month",
    badge: "bg-indigo-600",
    requestsPerHour: 100,
    features: ["100 requests per hour", "All Lite models + more", "Fastest routing", "Priority support"],
  },
  {
    id: "max",
    name: "Max",
    price: "$50",
    priceDetail: "/month",
    badge: "bg-violet-600",
    requestsPerHour: 250,
    features: ["250 requests per hour", "All models access", "Fastest routing", "Dedicated support"],
  },
];

export default function SettingsPage() {
  const { user, isLoading: authLoading, isAuthenticated, refreshUser, logout } = useAuth();
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [credits, setCredits] = useState(0);
  const [isPayg, setIsPayg] = useState(false);
  const [isAddingCredits, setIsAddingCredits] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [showDeleteKeysModal, setShowDeleteKeysModal] = useState(false);
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingKeys, setIsDeletingKeys] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (scrollRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
        const isAtTop = scrollTop === 0;
        const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

        if (e.key === "ArrowDown" && !isAtBottom) {
          e.preventDefault();
          scrollRef.current.scrollTop += 50;
        } else if (e.key === "ArrowUp" && !isAtTop) {
          e.preventDefault();
          scrollRef.current.scrollTop -= 50;
        } else if (e.key === "PageDown" && !isAtBottom) {
          e.preventDefault();
          scrollRef.current.scrollTop += clientHeight;
        } else if (e.key === "PageUp" && !isAtTop) {
          e.preventDefault();
          scrollRef.current.scrollTop -= clientHeight;
        } else if (e.key === "Home") {
          e.preventDefault();
          scrollRef.current.scrollTop = 0;
        } else if (e.key === "End") {
          e.preventDefault();
          scrollRef.current.scrollTop = scrollHeight;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsAddingCredits(false);
    setSelectedPackage(null);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      await fetchApi(`${process.env.NEXT_PUBLIC_API_URL || "https://api.routing.run"}/v1/user/password`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      toast.success("Password changed successfully");
      setShowPasswordModal(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAllKeys = async () => {
    setIsDeletingKeys(true);
    try {
      await fetchApi(`${process.env.NEXT_PUBLIC_API_URL || "https://api.routing.run"}/v1/user/keys/revoke-all`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("All API keys deleted successfully");
      setShowDeleteKeysModal(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete API keys");
    } finally {
      setIsDeletingKeys(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await fetchApi(`${process.env.NEXT_PUBLIC_API_URL || "https://api.routing.run"}/v1/user`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      toast.success("Account deleted successfully");
      logout();
      router.push("/auth/login");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account");
    } finally {
      setIsDeletingAccount(false);
    }
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
    <ScrollArea className="h-[calc(100vh-120px)]" ref={scrollRef}>
    <div className="space-y-6 pr-4">
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
              {PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`rounded-lg border p-4 transition-colors ${
                    user.plan_tier.toLowerCase() === plan.id.toLowerCase() || 
                    (user.plan_tier === "premium" && plan.id === "premium") ||
                    (user.plan_tier === "max" && plan.id === "max")
                      ? "border-brand-purple bg-brand-purple/5"
                      : "hover:border-brand-purple/50"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full ${plan.badge}`} />
                    <p className="font-medium">{plan.name}</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.priceDetail}</span>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {plan.requestsPerHour} requests/hour
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-muted-foreground" />
                        {f}
                      </li>
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
            <Button variant="outline" disabled>Coming Soon</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Password</Label>
              <p className="text-sm text-muted-foreground">
                Change your account password.
              </p>
            </div>
            <Button variant="outline" onClick={() => setShowPasswordModal(true)}>Change Password</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Active Sessions</Label>
              <p className="text-sm text-muted-foreground">
                Manage your active sessions across devices.
              </p>
            </div>
            <Button variant="outline" onClick={() => { logout(); router.push("/auth/login"); }}>Logout All Devices</Button>
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
            <Button variant="destructive" onClick={() => setShowDeleteKeysModal(true)}>Delete All Keys</Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Delete Account</Label>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all associated data.
              </p>
            </div>
            <Button variant="destructive" onClick={() => setShowDeleteAccountModal(true)}>Delete Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>

    {showPasswordModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Enter your current password and new password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => {
                setShowPasswordModal(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}>Cancel</Button>
              <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )}

    {showDeleteKeysModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-destructive">Delete All API Keys</CardTitle>
            <CardDescription>Are you sure you want to delete all your API keys? This action cannot be undone.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteKeysModal(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteAllKeys} disabled={isDeletingKeys}>
                {isDeletingKeys && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete All Keys
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )}

    {showDeleteAccountModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <Card className="w-full max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-destructive">Delete Account</CardTitle>
            <CardDescription>Are you sure you want to delete your account? Your data will be retained for 30 days before permanent deletion. You can contact support to restore your account within this period.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteAccountModal(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteAccount} disabled={isDeletingAccount}>
                {isDeletingAccount && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )}
    </ScrollArea>
  );
}
