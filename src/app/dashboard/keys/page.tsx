"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  EyeOff,
  Key,
  Loader2,
  Plus,
  Shield,
  Trash2,
  Zap,
} from "lucide-react";

import { PageHeader } from "@/components/dashboard/page-ui";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api, type ApiKey } from "@/lib/api";
import { cn } from "@/lib/utils";

/* ── helpers ─────────────────────────────────────── */

function timeAgo(date: string): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const ACCENT = {
  blue: "#2d9cdb",
  violet: "#8b5cf6",
  emerald: "#10b981",
} as const;

/* ── stat card (matches overview style) ──────────── */

function KeyStatCard({
  label,
  value,
  icon: Icon,
  hint,
  accentColor,
  loading,
}: {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<{ className?: string }>;
  hint?: string;
  accentColor: string;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-[#18181b]">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white px-5 py-4 dark:border-zinc-800 dark:bg-[#18181b]">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="text-[28px] font-semibold tracking-[-0.03em] text-foreground leading-none mb-2">
        {value}
      </div>
      {hint ? (
        <div className="flex items-center gap-1.5">
          <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accentColor }} />
          <span className="text-xs text-muted-foreground">{hint}</span>
        </div>
      ) : null}
    </div>
  );
}

/* ── key row ─────────────────────────────────────── */

function KeyRow({
  apiKey,
  onRevoke,
  isOnly,
}: {
  apiKey: ApiKey;
  onRevoke: (id: string) => void;
  isOnly: boolean;
}) {
  const [confirmRevoke, setConfirmRevoke] = useState(false);

  return (
    <div
      className={cn(
        "group flex flex-col gap-3 px-3 py-3 transition-colors sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-3.5",
        !isOnly && "border-b border-zinc-100 last:border-b-0 dark:border-zinc-800/60",
      )}
    >
      <div className="flex items-center gap-3 sm:gap-4">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${ACCENT.violet}14` }}
        >
          <Key className="h-4 w-4" style={{ color: ACCENT.violet }} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <p className="truncate text-sm font-semibold text-foreground">
              {apiKey.name || "Unnamed key"}
            </p>
            <Badge
              variant="outline"
              className="shrink-0 rounded-md border-zinc-200 bg-zinc-50 text-[10px] font-medium uppercase tracking-wide dark:border-zinc-800 dark:bg-zinc-900/50"
            >
              {apiKey.plan_tier}
            </Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <code className="font-mono">{apiKey.key_prefix}...</code>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {apiKey.last_used_at ? timeAgo(apiKey.last_used_at) : "Never used"}
            </span>
            <span className="hidden text-zinc-300 dark:text-zinc-700 sm:inline">
              Created {new Date(apiKey.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      <div className="shrink-0 self-end sm:self-center">
        {confirmRevoke ? (
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2.5 text-xs text-muted-foreground"
              onClick={() => setConfirmRevoke(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="h-7 px-2.5 text-xs"
              onClick={() => onRevoke(apiKey.id)}
            >
              Confirm
            </Button>
          </div>
        ) : (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 px-2.5 text-xs text-muted-foreground opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
            onClick={() => setConfirmRevoke(true)}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Revoke
          </Button>
        )}
      </div>
    </div>
  );
}

function KeyRowSkeleton() {
  return (
    <div className="flex items-center gap-4 border-b border-zinc-100 px-4 py-3.5 last:border-b-0 dark:border-zinc-800/60">
      <Skeleton className="h-9 w-9 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-52" />
      </div>
    </div>
  );
}

/* ── new key reveal ─────────────────────────────── */

function NewKeyReveal({
  fullKey,
  onDone,
}: {
  fullKey: string;
  onDone: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(fullKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 px-4 py-3 dark:border-emerald-800/40 dark:bg-emerald-950/20">
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="h-4 w-4" />
          Key created — copy it now, you won&apos;t see it again.
        </div>
      </div>

      <div className="flex items-center gap-2">
        <code className="flex-1 truncate rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-900/50">
          {visible ? fullKey : fullKey.slice(0, 12) + "•".repeat(24)}
        </code>
        <Button
          size="icon"
          variant="outline"
          className="h-9 w-9 shrink-0"
          onClick={() => setVisible((v) => !v)}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-9 w-9 shrink-0"
          onClick={handleCopy}
        >
          {copied ? (
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>

      <DialogFooter>
        <Button onClick={onDone}>Done</Button>
      </DialogFooter>
    </div>
  );
}

/* ── page ────────────────────────────────────────── */

export default function KeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const fetchKeys = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true);
      const res = await api.keys.list();
      setKeys(res.data);
      setError(null);
    } catch {
      setError("Failed to load API keys.");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchKeys();
  }, []);

  const handleCreateKey = async () => {
    setIsCreating(true);
    try {
      const res = await api.keys.create(newKeyName || undefined);
      setCreatedKey(res.key);
      void fetchKeys(false);
    } catch {
      setError("Failed to create key.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleRevokeKey = async (id: string) => {
    try {
      await api.keys.revoke(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch {
      setError("Failed to revoke key.");
    }
  };

  const resetDialog = () => {
    setDialogOpen(false);
    setNewKeyName("");
    setCreatedKey(null);
  };

  const mostRecent = keys[0];

  return (
    <div className="space-y-6">
      <PageHeader
        description="Create and manage API keys for authenticating requests."
        title="API Keys"
        action={
          <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) resetDialog(); else setDialogOpen(true); }}>
            <DialogTrigger asChild>
              <Button className="h-9 rounded-xl text-sm">
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                New key
              </Button>
            </DialogTrigger>
            <DialogContent>
              {createdKey ? (
                <NewKeyReveal fullKey={createdKey} onDone={resetDialog} />
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle>Create API key</DialogTitle>
                    <DialogDescription>
                      Give it a clear name so production, staging, and local keys stay separate.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-2 py-2">
                    <Label htmlFor="key-name">Key name</Label>
                    <Input
                      id="key-name"
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="Production API"
                      value={newKeyName}
                    />
                  </div>
                  <DialogFooter>
                    <Button disabled={isCreating} onClick={handleCreateKey}>
                      {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Create key
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <KeyStatCard
          label="Active keys"
          value={isLoading ? "—" : keys.length}
          icon={Key}
          hint={keys.length >= 3 ? "Consider revoking unused keys" : undefined}
          accentColor={ACCENT.violet}
          loading={isLoading}
        />
        <KeyStatCard
          label="Most recent"
          value={isLoading ? "—" : (mostRecent?.name || "No keys yet")}
          icon={Clock}
          hint={mostRecent ? `Created ${timeAgo(mostRecent.created_at)}` : undefined}
          accentColor={ACCENT.blue}
          loading={isLoading}
        />
        <KeyStatCard
          label="Endpoint"
          value="/v1/chat/completions"
          icon={Zap}
          hint="OpenAI-compatible"
          accentColor={ACCENT.emerald}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200/60 bg-red-50/50 px-4 py-3 text-sm text-red-700 dark:border-red-800/30 dark:bg-red-950/20 dark:text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Key list */}
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#18181b]">
        <div className="flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800">
          <div>
            <p className="text-sm font-semibold text-foreground">Key inventory</p>
            <p className="text-xs text-muted-foreground">
              {isLoading ? "Loading…" : `${keys.length} active key${keys.length !== 1 ? "s" : ""}`}
            </p>
          </div>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </div>

        {isLoading ? (
          <>
            <KeyRowSkeleton />
            <KeyRowSkeleton />
          </>
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50">
              <Key className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">No API keys yet</p>
            <p className="mt-1 max-w-xs text-sm text-muted-foreground">
              Create your first key to start sending requests.
            </p>
          </div>
        ) : (
          keys.map((k) => (
            <KeyRow
              apiKey={k}
              isOnly={keys.length === 1}
              key={k.id}
              onRevoke={handleRevokeKey}
            />
          ))
        )}
      </div>
    </div>
  );
}
