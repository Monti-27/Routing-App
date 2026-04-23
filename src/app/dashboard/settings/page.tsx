"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CreditCard,
  KeyRound,
  Loader2,
  Lock,
  LogOut,
  Shield,
  Trash2,
  User,
} from "lucide-react";

import { PageHeader, SurfaceCard } from "@/components/dashboard/page-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.routing.run";

const PLANS = [
  { id: "free", name: "Free", price: "$0", period: "forever", rpm: 20 },
  { id: "lite", name: "Lite", price: "$10", period: "/mo", rpm: 400 },
  { id: "premium", name: "Premium", price: "$20", period: "/mo", rpm: 1000 },
  { id: "max", name: "Max", price: "$50", period: "/mo", rpm: 2500 },
] as const;

const TABS = [
  { id: "general", label: "General", icon: User },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: Shield },
] as const;

type Tab = (typeof TABS)[number]["id"];

function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

export default function SettingsPage() {
  const {
    user,
    isLoading: authLoading,
    isAuthenticated,
    logout,
    isDevBypassEnabled,
  } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("general");

  const [isSaving, setIsSaving] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [deleteKeysOpen, setDeleteKeysOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);
  const [isDeletingKeys, setIsDeletingKeys] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/auth/login");
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!user) return;
    setName(user.name || "");
    setEmail(user.email);
  }, [user]);

  const activePlan = useMemo(
    () =>
      PLANS.find((p) => p.id === user?.plan_tier?.toLowerCase()) || PLANS[0],
    [user?.plan_tier],
  );

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 900));
    setIsSaving(false);
    toast.success("Profile updated");
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setIsChangingPassword(true);
    try {
      const token = getAccessToken();
      await fetch(`${API_URL}/v1/user/password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      toast.success("Password changed");
      setPasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to change password",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAllKeys = async () => {
    setIsDeletingKeys(true);
    try {
      const token = getAccessToken();
      await fetch(`${API_URL}/v1/user/key/revoke-all`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      toast.success("All API keys revoked");
      setDeleteKeysOpen(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete keys",
      );
    } finally {
      setIsDeletingKeys(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const token = getAccessToken();
      await fetch(`${API_URL}/v1/user`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      toast.success("Account deleted");
      await logout();
      router.push("/auth/login");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete account",
      );
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Settings" description="Manage your account, billing, and preferences." />
        <Skeleton className="h-11 w-full rounded-lg" />
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-[#18181b] space-y-4">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-4 w-40" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <Skeleton className="h-9 w-28 rounded-md" />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Manage your account, billing, and preferences."
          meta={
            isDevBypassEnabled ? (
              <Badge
                className="rounded-md border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-[#18181b] dark:text-zinc-100"
                variant="outline"
              >
                Dev bypass
              </Badge>
            ) : null
          }
        />

        {/* Tab bar */}
        <div className="overflow-x-auto -mx-1 px-1">
          <div className="flex gap-1 rounded-lg border border-zinc-200 bg-white p-1 dark:border-zinc-800 dark:bg-[#18181b]">
            {TABS.map((t) => {
              const Icon = t.icon;
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
                    active
                      ? "bg-zinc-100 text-foreground dark:bg-zinc-800"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* General tab */}
        {tab === "general" && (
          <div className="space-y-6">
            <SurfaceCard title="Profile" description="Your personal details.">
              <div className="space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
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
                      value={email}
                      disabled
                      className="opacity-60"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button disabled={isSaving} onClick={handleSave}>
                    {isSaving && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {isSaving ? "Saving..." : "Save changes"}
                  </Button>
                  {user.email_verified && (
                    <Badge
                      className="rounded-md border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      variant="outline"
                    >
                      Email verified
                    </Badge>
                  )}
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard
              title="Current plan"
              description="Your active subscription tier."
            >
              <div className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-200 dark:bg-zinc-800">
                    <CreditCard className="h-4 w-4 text-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {activePlan.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {activePlan.rpm} requests/day
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-foreground">
                    {activePlan.price}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activePlan.period}
                  </p>
                </div>
              </div>
            </SurfaceCard>
          </div>
        )}

        {/* Billing tab */}
        {tab === "billing" && (
          <SurfaceCard
            title="Plans"
            description="Compare tiers and choose the right fit."
          >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {PLANS.map((plan) => {
                const current =
                  user.plan_tier.toLowerCase() === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={cn(
                      "relative rounded-xl border p-4 transition-colors",
                      current
                        ? "border-zinc-400 bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-900/60"
                        : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-[#18181b] dark:hover:border-zinc-700",
                    )}
                  >
                    {current && (
                      <Badge
                        className="absolute right-3 top-3 rounded-md"
                        variant="outline"
                      >
                        Current
                      </Badge>
                    )}
                    <p className="text-sm font-medium text-foreground">
                      {plan.name}
                    </p>
                    <div className="mt-3 flex items-baseline gap-1">
                      <span className="text-2xl font-semibold text-foreground">
                        {plan.price}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {plan.period}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {plan.rpm.toLocaleString()} requests/day
                    </p>
                  </div>
                );
              })}
            </div>
          </SurfaceCard>
        )}

        {/* Notifications tab */}
        {tab === "notifications" && (
          <SurfaceCard
            title="Email preferences"
            description="Control what lands in your inbox."
          >
            <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {[
                {
                  id: "usage",
                  label: "Usage reports",
                  desc: "Weekly summaries and account alerts.",
                  on: true,
                },
                {
                  id: "limits",
                  label: "Limit warnings",
                  desc: "Alerts when you're close to daily caps.",
                  on: true,
                },
                {
                  id: "marketing",
                  label: "Product updates",
                  desc: "New features and announcements.",
                  on: false,
                },
              ].map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 py-4 first:pt-0 last:pb-0 sm:items-center"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.label}
                    </p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                  <Switch defaultChecked={item.on} />
                </div>
              ))}
            </div>
          </SurfaceCard>
        )}

        {/* Security tab */}
        {tab === "security" && (
          <div className="space-y-6">
            <SurfaceCard
              title="Authentication"
              description="Manage how you sign in."
            >
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Password
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Update your sign-in password.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPasswordOpen(true)}
                  >
                    Change
                  </Button>
                </div>
                <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Shield className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Two-factor authentication
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Add a second layer of protection.
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Coming soon
                  </Button>
                </div>
                <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <LogOut className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        Sessions
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Sign out of all devices.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      void logout();
                      router.push("/auth/login");
                    }}
                  >
                    Log out all
                  </Button>
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard
              title="Danger zone"
              description="Irreversible actions."
              className="border-red-500/20 dark:border-red-500/20"
            >
              <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                <div className="flex flex-col gap-3 pb-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <KeyRound className="h-4 w-4 shrink-0 text-red-400" />
                    <div>
                      <p className="text-sm font-medium text-red-400">
                        Revoke all API keys
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Immediately invalidates every key on this account.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteKeysOpen(true)}
                  >
                    Revoke
                  </Button>
                </div>
                <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <Trash2 className="h-4 w-4 shrink-0 text-red-400" />
                    <div>
                      <p className="text-sm font-medium text-red-400">
                        Delete account
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Permanently remove your account and all data.
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setDeleteAccountOpen(true)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </SurfaceCard>
          </div>
        )}
      </div>

      {/* Password dialog */}
      <Dialog open={passwordOpen} onOpenChange={setPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change password</DialogTitle>
            <DialogDescription>
              Enter your current password and choose a new one.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="current-pw">Current password</Label>
              <Input
                id="current-pw"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-pw">New password</Label>
              <Input
                id="new-pw"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-pw">Confirm password</Label>
              <Input
                id="confirm-pw"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={isChangingPassword}
              onClick={handleChangePassword}
            >
              {isChangingPassword && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Change password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete keys dialog */}
      <Dialog open={deleteKeysOpen} onOpenChange={setDeleteKeysOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke all API keys</DialogTitle>
            <DialogDescription>
              This immediately invalidates every API key. Requests using them
              will stop working.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteKeysOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeletingKeys}
              onClick={handleDeleteAllKeys}
            >
              {isDeletingKeys && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Revoke all keys
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete account dialog */}
      <Dialog open={deleteAccountOpen} onOpenChange={setDeleteAccountOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete account</DialogTitle>
            <DialogDescription>
              Your data will be retained for 30 days before permanent deletion.
              Contact support within that window to restore.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteAccountOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isDeletingAccount}
              onClick={handleDeleteAccount}
            >
              {isDeletingAccount && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
