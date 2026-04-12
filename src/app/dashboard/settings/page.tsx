"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Coins,
  CreditCard,
  Loader2,
  Shield,
  UserRound,
} from "lucide-react";

import {
  PageHeader,
  StatCard,
  SurfaceCard,
} from "@/components/dashboard/page-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.routing.run";

const CREDITS_PACKAGES = [
  { amount: 5, price: 5.0 },
  { amount: 10, price: 9.5 },
  { amount: 25, price: 22.0 },
  { amount: 50, price: 40.0 },
] as const;

const PLANS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceDetail: "forever",
    requestsPerDay: 50,
    features: [
      "50 requests per day",
      "Basic model access",
      "Standard routing",
      "Community support",
    ],
  },
  {
    id: "lite",
    name: "Lite",
    price: "$10",
    priceDetail: "/month",
    requestsPerDay: 400,
    features: [
      "400 requests per day",
      "Extended model access",
      "Priority routing",
      "Email support",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: "$20",
    priceDetail: "/month",
    requestsPerDay: 1000,
    features: [
      "1,000 requests per day",
      "All Lite models + more",
      "Fastest routing",
      "Priority support",
    ],
  },
  {
    id: "max",
    name: "Max",
    price: "$50",
    priceDetail: "/month",
    requestsPerDay: 2500,
    features: [
      "2,500 requests per day",
      "All models access",
      "Fastest routing",
      "Dedicated support",
    ],
  },
] as const;

function getAccessToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return localStorage.getItem("access_token");
}

function planTone(planTier: string): string {
  if (planTier === "max") return "border-[#8350e8]/30 bg-[#8350e8]/10";
  if (planTier === "premium") return "border-[#1470e3]/30 bg-[#1470e3]/10";
  if (planTier === "lite") return "border-[#1470e3]/18 bg-[#1470e3]/7";
  return "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#181818]";
}

function ModalShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <Card className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-[#181818]">
        <CardHeader>
          <CardTitle className="text-xl text-foreground">{title}</CardTitle>
          <CardDescription className="leading-6">{description}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  );
}

function SettingRow({
  label,
  description,
  action,
  danger = false,
}: {
  label: string;
  description: string;
  action: React.ReactNode;
  danger?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-[#181818] md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <p
          className={`text-sm font-medium ${danger ? "text-red-400" : "text-foreground"}`}
        >
          {label}
        </p>
        <p className="max-w-xl text-sm leading-6 text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
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

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [credits] = useState(0);
  const [isPayg] = useState(false);
  const [isAddingCredits, setIsAddingCredits] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

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
    if (!user) return;
    setName(user.name || "");
    setEmail(user.email);
  }, [user]);

  const activePlan = useMemo(
    () =>
      PLANS.find((plan) => plan.id === user?.plan_tier?.toLowerCase()) ||
      PLANS[0],
    [user?.plan_tier],
  );

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsSaving(false);
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  const handleAddCredits = async (pkg: { amount: number; price: number }) => {
    setIsAddingCredits(true);
    setSelectedPackage(pkg.amount);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsAddingCredits(false);
    setSelectedPackage(null);
    toast.success(`Queued ${pkg.amount} credits for checkout`);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
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
      toast.success("Password changed successfully");
      closePasswordModal();
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
      toast.success("All API keys deleted successfully");
      setShowDeleteKeysModal(false);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete API keys",
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
      toast.success("Account deleted successfully");
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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="space-y-6">
        <PageHeader
          title="Settings"
          description="Manage your profile, plan, notifications, and security from a single place."
          meta={
            isDevBypassEnabled ? (
              <Badge
                className="rounded-md border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-[#181818] dark:text-zinc-100"
                variant="outline"
              >
                Dev auth bypass enabled
              </Badge>
            ) : null
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            icon={UserRound}
            label="Account"
            value={user.name || "Unnamed user"}
            hint={user.email}
          />
          <StatCard
            icon={CreditCard}
            label="Current plan"
            value={activePlan.name}
            hint={`${activePlan.requestsPerDay} requests per day`}
          />
          <StatCard
            icon={Shield}
            label="Email status"
            value={user.email_verified ? "Verified" : "Unverified"}
            hint="Account verification state"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <SurfaceCard
            title="Profile"
            description="Keep your account details current. Email stays tied to your sign-in identity."
          >
            <div className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    value={name}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    className="opacity-70"
                    disabled
                    id="email"
                    type="email"
                    value={email}
                  />
                </div>
              </div>

              <div
                className={`rounded-xl border px-4 py-4 ${planTone(user.plan_tier)}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {activePlan.name} plan
                  </p>
                  <Badge className="rounded-md" variant="outline">
                    {user.plan_tier.toUpperCase()}
                  </Badge>
                  {user.email_verified ? (
                    <Badge
                      className="rounded-md border-[#1470e3]/25 bg-[#1470e3]/10 text-[#8ebcf3] dark:border-[#1470e3]/30 dark:bg-[#1470e3]/10 dark:text-[#9dc4f4]"
                      variant="outline"
                    >
                      Verified
                    </Badge>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Your current workspace is configured for{" "}
                  {activePlan.requestsPerDay} requests per day.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button disabled={isSaving} onClick={handleSave}>
                  {isSaving ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {isSaving ? "Saving" : saved ? "Saved" : "Save changes"}
                </Button>
                {saved ? (
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    Profile updated locally
                  </span>
                ) : null}
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard
            title="Plan summary"
            description="A concise view of what your current tier unlocks."
          >
            <div className="space-y-4">
              <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-[#181818]">
                <p className="text-sm text-muted-foreground">Active tier</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-foreground">
                  {activePlan.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activePlan.price} {activePlan.priceDetail}
                </p>
              </div>

              <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-[#181818]">
                <p className="text-sm font-medium text-foreground">
                  Included features
                </p>
                <div className="mt-3 space-y-2">
                  {activePlan.features.map((feature) => (
                    <div
                      className="flex items-start gap-3 text-sm text-muted-foreground"
                      key={feature}
                    >
                      <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SurfaceCard>
        </div>

        <SurfaceCard
          title="Billing & plans"
          description="Review available plans and compare request limits before changing your subscription."
        >
          <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-4">
              {PLANS.map((plan) => {
                const isCurrentPlan = user.plan_tier.toLowerCase() === plan.id;

                return (
                  <div
                    className={cn(
                      "rounded-xl border px-4 py-4 transition-colors",
                      isCurrentPlan
                        ? "border-zinc-300 bg-white dark:border-zinc-700 dark:bg-[#181818]"
                        : "border-zinc-200 bg-white hover:border-zinc-300 dark:border-zinc-800 dark:bg-[#181818] dark:hover:border-zinc-700",
                    )}
                    key={plan.id}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-foreground">
                        {plan.name}
                      </p>
                      {isCurrentPlan ? (
                        <Badge
                          className="rounded-md border-zinc-300 bg-white text-zinc-900 dark:border-zinc-700 dark:bg-[#181818] dark:text-zinc-100"
                          variant="outline"
                        >
                          Current
                        </Badge>
                      ) : null}
                    </div>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="text-2xl font-semibold text-foreground">
                        {plan.price}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {plan.priceDetail}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {plan.requestsPerDay} requests/day
                    </p>
                    <div className="mt-4 space-y-2">
                      {plan.features.map((feature) => (
                        <div
                          className="flex items-start gap-3 text-sm text-muted-foreground"
                          key={feature}
                        >
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            {isPayg ? (
              <div className="rounded-xl border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-[#181818]">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-[#181818] dark:text-zinc-200">
                    <Coins className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Credits balance
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ${credits.toFixed(2)} available
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-4">
                  {CREDITS_PACKAGES.map((pkg) => (
                    <button
                      className="rounded-xl border border-zinc-200 bg-white px-3 py-3 text-left transition-colors hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-800 dark:bg-[#181818] dark:hover:bg-zinc-900"
                      disabled={isAddingCredits}
                      key={pkg.amount}
                      onClick={() => void handleAddCredits(pkg)}
                      type="button"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {pkg.amount} credits
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        ${pkg.price.toFixed(2)}
                      </p>
                      {isAddingCredits && selectedPackage === pkg.amount ? (
                        <Loader2 className="mt-3 h-4 w-4 animate-spin text-zinc-400" />
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </SurfaceCard>

        <div className="grid gap-6 xl:grid-cols-2">
          <SurfaceCard
            title="Notifications"
            description="Choose what the team sends to your inbox."
          >
            <div className="space-y-4">
              <SettingRow
                action={<Switch defaultChecked />}
                description="Receive usage reports and important account alerts via email."
                label="Email notifications"
              />
              <SettingRow
                action={<Switch defaultChecked />}
                description="Get warned when request limits are close to being exhausted."
                label="Usage alerts"
              />
              <SettingRow
                action={<Switch />}
                description="Receive announcements about product updates and new features."
                label="Marketing emails"
              />
            </div>
          </SurfaceCard>

          <SurfaceCard
            title="Security"
            description="Manage the controls that protect your account and sessions."
          >
            <div className="space-y-4">
              <SettingRow
                action={
                  <Button disabled variant="outline">
                    Coming soon
                  </Button>
                }
                description="Add a second factor to protect access to your workspace."
                label="Two-factor authentication"
              />
              <SettingRow
                action={
                  <Button
                    onClick={() => setShowPasswordModal(true)}
                    variant="outline"
                  >
                    Change password
                  </Button>
                }
                description="Update the password used for account sign-in."
                label="Password"
              />
              <SettingRow
                action={
                  <Button
                    onClick={() => {
                      void logout();
                      router.push("/auth/login");
                    }}
                    variant="outline"
                  >
                    Log out all devices
                  </Button>
                }
                description="Clear active sessions across your devices and browsers."
                label="Active sessions"
              />
            </div>
          </SurfaceCard>
        </div>

        <SurfaceCard
          className="border-red-500/20 dark:border-red-500/20"
          title="Danger zone"
          description="These actions are destructive and should be used carefully."
        >
          <div className="space-y-4">
            <SettingRow
              action={
                <Button
                  onClick={() => setShowDeleteKeysModal(true)}
                  variant="destructive"
                >
                  Delete all keys
                </Button>
              }
              danger
              description="Permanently revoke every API key tied to this account."
              label="Delete all API keys"
            />
            <SettingRow
              action={
                <Button
                  onClick={() => setShowDeleteAccountModal(true)}
                  variant="destructive"
                >
                  Delete account
                </Button>
              }
              danger
              description="Permanently delete your account and all associated data."
              label="Delete account"
            />
          </div>
        </SurfaceCard>
      </div>

      {showPasswordModal ? (
        <ModalShell
          description="Enter your current password and confirm the new one before saving."
          title="Change password"
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                onChange={(event) => setCurrentPassword(event.target.value)}
                type="password"
                value={currentPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                onChange={(event) => setNewPassword(event.target.value)}
                type="password"
                value={newPassword}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                id="confirm-password"
                onChange={(event) => setConfirmPassword(event.target.value)}
                type="password"
                value={confirmPassword}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button onClick={closePasswordModal} variant="outline">
                Cancel
              </Button>
              <Button
                disabled={isChangingPassword}
                onClick={handleChangePassword}
              >
                {isChangingPassword ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Change password
              </Button>
            </div>
          </div>
        </ModalShell>
      ) : null}

      {showDeleteKeysModal ? (
        <ModalShell
          description="This revokes every API key immediately. Requests using deleted keys will stop working."
          title="Delete all API keys"
        >
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setShowDeleteKeysModal(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={isDeletingKeys}
              onClick={handleDeleteAllKeys}
              variant="destructive"
            >
              {isDeletingKeys ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete all keys
            </Button>
          </div>
        </ModalShell>
      ) : null}

      {showDeleteAccountModal ? (
        <ModalShell
          description="Your data will be retained for 30 days before permanent deletion. Contact support within that window if you need restoration."
          title="Delete account"
        >
          <div className="flex justify-end gap-2">
            <Button
              onClick={() => setShowDeleteAccountModal(false)}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              disabled={isDeletingAccount}
              onClick={handleDeleteAccount}
              variant="destructive"
            >
              {isDeletingAccount ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Delete account
            </Button>
          </div>
        </ModalShell>
      ) : null}
    </>
  );
}
