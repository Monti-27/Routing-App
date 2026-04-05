const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.routing.run";

const CSRF_TOKEN_COOKIE = "csrf_token";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
}

interface ApiKey {
  id: string;
  key_prefix: string;
  name: string | null;
  plan_tier: string;
  created_at: string;
  last_used_at: string | null;
}

interface UsageResponse {
  total_requests: number;
  total_input_tokens: number;
  total_output_tokens: number;
  total_cost: number;
  models: Record<string, Record<string, number>>;
}

interface User {
  id: string;
  email: string;
  name: string | null;
  plan_tier: string;
  email_verified: boolean;
  credits: number;
}

interface CreditsResponse {
  credits: number;
  credits_monthly: number;
  credits_used: number;
  plan_tier: string;
  payg_enabled: boolean;
}

interface ProviderStatus {
  name: string;
  status: string;
  latency_ms: number | null;
}

interface ModelStatus {
  id: string;
  name: string;
  provider: string;
  tier: string;
  status: string;
}

interface IncidentReport {
  id: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  created_at: string;
  resolved_at: string | null;
}

interface StatusResponse {
  providers: ProviderStatus[];
  models: ModelStatus[];
  incidents: IncidentReport[];
  last_updated: string;
}

interface PublicSettings {
  cost_multiplier: number;
}

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

function getCsrfToken(): string | null {
  return getCookie(CSRF_TOKEN_COOKIE);
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const csrfToken = getCsrfToken();
  const isMutation = ["POST", "PUT", "DELETE", "PATCH"].includes(options.method || "");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(isMutation && csrfToken ? { "X-CSRF-Token": csrfToken } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    credentials: "include",
    headers,
  });

  if (response.status === 401) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          if (typeof window !== "undefined") {
            localStorage.setItem("access_token", data.access_token);
            localStorage.setItem("refresh_token", data.refresh_token);
            if (data.csrf_token) {
              localStorage.setItem("csrf_token", data.csrf_token);
            }
          }
          onTokenRefreshed(data.access_token);
          
          const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            credentials: "include",
            headers: {
              ...headers,
              Authorization: `Bearer ${data.access_token}`,
              "X-CSRF-Token": data.csrf_token || "",
            },
          });

          if (!retryResponse.ok) {
            const error = await retryResponse.json().catch(() => ({ message: "An error occurred" }));
            throw new ApiError(error.message || "An error occurred", retryResponse.status);
          }

          return retryResponse.json();
        } else if (refreshResponse.status === 401) {
          window.location.href = "/auth/login";
          throw new Error("Session expired");
        }
      } catch (e) {
        if (e instanceof Error && e.message === "Session expired") {
          throw e;
        }
      } finally {
        isRefreshing = false;
      }
    } else {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh(async (newToken) => {
          try {
            const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
              ...options,
              credentials: "include",
              headers: {
                ...headers,
                Authorization: `Bearer ${newToken}`,
              },
            });

            if (!retryResponse.ok) {
              const error = await retryResponse.json().catch(() => ({ message: "An error occurred" }));
              reject(new ApiError(error.message || "An error occurred", retryResponse.status));
            }

            resolve(retryResponse.json());
          } catch (err) {
            reject(err);
          }
        });
      });
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new ApiError(error.message || "An error occurred", response.status);
  }

  return response.json();
}

export { fetchApi };

export const api = {
  auth: {
    login: async (email: string, otp: string): Promise<{ user: User }> => {
      const loginResponse = await fetchApi<TokenResponse & { user: User }>("/auth/login/verify", {
        method: "POST",
        body: JSON.stringify({ email, otp }),
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", loginResponse.access_token);
        localStorage.setItem("refresh_token", loginResponse.refresh_token);
      }
      return { user: loginResponse.user };
    },

    register: async (email: string, otp: string, password: string, name?: string): Promise<{ user: User }> => {
      const loginResponse = await fetchApi<TokenResponse & { user: User }>("/auth/signup/verify", {
        method: "POST",
        body: JSON.stringify({ email, otp, password, name }),
      });
      if (typeof window !== "undefined") {
        localStorage.setItem("access_token", loginResponse.access_token);
        localStorage.setItem("refresh_token", loginResponse.refresh_token);
      }
      return { user: loginResponse.user };
    },

    sendSignupOtp: async (email: string): Promise<void> => {
      await fetchApi<{ message: string }>("/auth/signup/init", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
    },

    sendLoginOtp: async (email: string, password: string): Promise<void> => {
      await fetchApi<{ message: string }>("/auth/login/init", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
    },

    logout: async (): Promise<void> => {
      await fetchApi<{ message: string }>("/auth/logout", {
        method: "POST",
      });
    },

    me: async (): Promise<User> => {
      return fetchApi<User>("/auth/me");
    },
  },

  keys: {
    list: async (): Promise<{ data: ApiKey[] }> => {
      return fetchApi<{ data: ApiKey[] }>("/v1/user/keys");
    },

    create: async (name?: string): Promise<ApiKey & { key: string }> => {
      return fetchApi<ApiKey & { key: string }>("/v1/user/keys", {
        method: "POST",
        body: JSON.stringify({ name }),
      });
    },

    revoke: async (keyId: string): Promise<{ message: string }> => {
      return fetchApi<{ message: string }>(`/v1/user/keys/${keyId}`, {
        method: "DELETE",
      });
    },
  },

  usage: {
    get: async (period: "daily" | "hourly" | "monthly" = "daily"): Promise<UsageResponse> => {
      return fetchApi<UsageResponse>(`/v1/user/usage?period=${period}`);
    },
  },

  models: {
    list: async () => {
      return fetchApi<{ data: Array<{ id: string; name: string; provider: string }> }>("/v1/models");
    },
  },

  credits: {
    get: async (): Promise<CreditsResponse> => {
      return fetchApi<CreditsResponse>("/v1/user/credits");
    },

    add: async (amount: number, transactionId?: string): Promise<{ credits: number; added: number }> => {
      return fetchApi<{ credits: number; added: number }>("/v1/user/credits/add", {
        method: "POST",
        body: JSON.stringify({ amount, transaction_id: transactionId }),
      });
    },
  },

  status: {
    get: async (): Promise<StatusResponse> => {
      return fetchApi<StatusResponse>("/v1/status");
    },
  },

  settings: {
    get: async (): Promise<PublicSettings> => {
      return fetchApi<PublicSettings>("/v1/settings");
    },
  },
};

export type { ApiKey, UsageResponse, User, CreditsResponse, StatusResponse, ProviderStatus, ModelStatus, IncidentReport };