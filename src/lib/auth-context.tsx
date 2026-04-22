"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { api, type User } from "@/lib/api";

const PLAN_TIER_PRIORITY = {
  free: 0,
  lite: 1,
  premium: 2,
  max: 3,
} as const;

type PlanTier = keyof typeof PLAN_TIER_PRIORITY;

function normalizePlanTier(value: string | null | undefined): PlanTier | null {
  const tier = value?.toLowerCase();

  if (!tier) {
    return null;
  }

  return tier in PLAN_TIER_PRIORITY ? (tier as PlanTier) : null;
}

function inferPlanTierFromLimit(
  limit: number | null | undefined,
): PlanTier | null {
  if (typeof limit !== "number") {
    return null;
  }

  if (limit >= 2500) {
    return "max";
  }

  if (limit >= 1000) {
    return "premium";
  }

  if (limit >= 400) {
    return "lite";
  }

  return "free";
}

async function withEffectivePlanTier(userData: User): Promise<User> {
  try {
    const requestsData = await api.requests.get();
    const candidates = [
      normalizePlanTier(userData.plan_tier),
      normalizePlanTier(requestsData.plan_tier),
      inferPlanTierFromLimit(requestsData.requests_limit_today),
    ].filter((tier): tier is PlanTier => tier !== null);

    const effectiveTier = candidates.reduce<PlanTier>(
      (highestTier, tier) =>
        PLAN_TIER_PRIORITY[tier] > PLAN_TIER_PRIORITY[highestTier]
          ? tier
          : highestTier,
      "free",
    );

    if (effectiveTier === userData.plan_tier.toLowerCase()) {
      return userData;
    }

    return {
      ...userData,
      plan_tier: effectiveTier,
    };
  } catch {
    return userData;
  }
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDevBypassEnabled: boolean;
  login: (email: string, otp: string) => Promise<void>;
  register: (
    email: string,
    otp: string,
    password: string,
    name?: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";")?.shift() || null;
  return null;
}

function getAccessToken(): string | null {
  return getCookie("access_token") || localStorage.getItem("access_token");
}

function getRefreshToken(): string | null {
  return getCookie("refresh_token") || localStorage.getItem("refresh_token");
}

const isDevBypassEnabled = process.env.NEXT_PUBLIC_DEV_AUTH_BYPASS === "true";

const TOKEN_REFRESH_INTERVAL_MS = 4 * 60 * 1000; // refresh every 4 minutes

async function refreshAccessToken(): Promise<boolean> {
  const refreshToken =
    getCookie("refresh_token") || localStorage.getItem("refresh_token");
  if (!refreshToken) return false;

  try {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "https://api.routing.run";
    const response = await fetch(`${apiUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    if (data.csrf_token) {
      localStorage.setItem("csrf_token", data.csrf_token);
    }
    return true;
  } catch {
    return false;
  }
}

const devBypassUser: User = {
  id: "dev-bypass-user",
  email: "dev@routing.run",
  name: "Dev User",
  plan_tier: "max",
  email_verified: true,
  credits: 999,
  is_upgraded: true,
  upgrade_expires_at: null,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const hasStoredSession =
    !isDevBypassEnabled &&
    typeof window !== "undefined" &&
    Boolean(getAccessToken() && getRefreshToken());

  const [user, setUser] = useState<User | null>(
    isDevBypassEnabled ? devBypassUser : null,
  );
  const [isLoading, setIsLoading] = useState(hasStoredSession);

  useEffect(() => {
    if (isDevBypassEnabled) {
      return;
    }

    // Clean URL of any OAuth params on mount
    if (
      typeof window !== "undefined" &&
      window.location.search.includes("user=")
    ) {
      window.history.replaceState({}, "", window.location.pathname);
    }

    // Check if we just completed OAuth login (user data in sessionStorage)
    if (typeof window !== "undefined") {
      const oauthUser = sessionStorage.getItem("oauth_user");
      if (oauthUser) {
        sessionStorage.removeItem("oauth_user");
        try {
          const userData = JSON.parse(oauthUser);
          void withEffectivePlanTier(userData)
            .then((normalizedUser) => {
              setUser(normalizedUser);
            })
            .finally(() => {
              setIsLoading(false);
            });
          return;
        } catch (e) {
          console.error("Failed to parse oauth_user:", e);
        }
      }
    }

    const accessToken = getAccessToken();
    const refreshToken = getRefreshToken();

    if (accessToken && refreshToken) {
      api.auth
        .me()
        .then(withEffectivePlanTier)
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("csrf_token");
          }
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, []);

  useEffect(() => {
    if (isDevBypassEnabled || !user) return;

    const interval = setInterval(async () => {
      const success = await refreshAccessToken();
      if (!success) {
        setUser(null);
      }
    }, TOKEN_REFRESH_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [user]);

  const login = async (email: string, otp: string) => {
    if (isDevBypassEnabled) {
      setUser(devBypassUser);
      return;
    }

    const { user: userData } = await api.auth.login(email, otp);
    const normalizedUser = await withEffectivePlanTier(userData);
    setUser(normalizedUser);
  };

  const register = async (
    email: string,
    otp: string,
    password: string,
    name?: string,
  ) => {
    if (isDevBypassEnabled) {
      setUser({
        ...devBypassUser,
        email,
        name: name || devBypassUser.name,
      });
      return;
    }

    const { user: userData } = await api.auth.register(
      email,
      otp,
      password,
      name,
    );
    const normalizedUser = await withEffectivePlanTier(userData);
    setUser(normalizedUser);
  };

  const logout = async () => {
    if (isDevBypassEnabled) {
      setUser(devBypassUser);
      return;
    }

    await api.auth.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    if (isDevBypassEnabled) {
      setUser(devBypassUser);
      return;
    }

    try {
      const userData = await api.auth.me();
      const normalizedUser = await withEffectivePlanTier(userData);
      setUser(normalizedUser);
    } catch {}
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isDevBypassEnabled,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
