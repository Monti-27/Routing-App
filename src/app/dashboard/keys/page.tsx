"use client";

import { useEffect, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Eye,
  EyeOff,
  Key,
  Loader2,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";

import {
  PageHeader,
  StatCard,
  SurfaceCard,
} from "@/components/dashboard/page-ui";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api, type ApiKey } from "@/lib/api";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    void fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.keys.list();
      setKeys(response.data);
    } catch {
      setError("Failed to load API keys. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateKey = async () => {
    try {
      setIsCreating(true);
      setError(null);
      const newKey = await api.keys.create(newKeyName || undefined);
      setCreatedKey(newKey.key);
      setNewKeyName("");
      await fetchKeys();
    } catch {
      setError("Failed to create API key. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyKey = () => {
    if (!createdKey) return;
    void navigator.clipboard.writeText(createdKey);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      await api.keys.revoke(keyId);
      await fetchKeys();
    } catch {
      setError("Failed to revoke API key. Please try again.");
    }
  };

  const resetDialog = () => {
    setCreatedKey(null);
    setNewKeyName("");
    setShowKey(false);
    setCopied(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Keys"
        description="Create environment-specific keys, rotate access, and keep production credentials isolated."
        action={
          <Dialog onOpenChange={(open: boolean) => !open && resetDialog()}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create key
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              {createdKey ? (
                <>
                  <DialogHeader>
                    <DialogTitle>API key created</DialogTitle>
                    <DialogDescription>
                      Copy this key now. It will not be shown again after you
                      close the dialog.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="flex items-center gap-2">
                      <Input
                        className="font-mono"
                        readOnly
                        value={
                          showKey ? createdKey : "rk_live_".padEnd(32, "x")
                        }
                      />
                      <Button
                        onClick={() => setShowKey((current) => !current)}
                        size="icon"
                        type="button"
                        variant="outline"
                      >
                        {showKey ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <Button className="w-full" onClick={handleCopyKey}>
                      {copied ? (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy API key
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <DialogHeader>
                    <DialogTitle>Create new API key</DialogTitle>
                    <DialogDescription>
                      Use a clear name so production, staging, and local
                      credentials stay separate.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Key name</Label>
                      <Input
                        id="name"
                        onChange={(event) => setNewKeyName(event.target.value)}
                        placeholder="Production API"
                        value={newKeyName}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button disabled={isCreating} onClick={handleCreateKey}>
                      {isCreating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Create key
                    </Button>
                  </DialogFooter>
                </>
              )}
            </DialogContent>
          </Dialog>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Active keys"
          value={
            isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              keys.length
            )
          }
        />
        <StatCard
          label="Most recent key"
          value={keys[0]?.name || "No keys yet"}
        />
        <StatCard label="Default endpoint" value="/v1/chat/completions" />
      </div>

      {error ? (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      ) : null}

      <SurfaceCard
        title="Key inventory"
        description="All active keys with their plan tier and usage recency."
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : keys.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-border/70 bg-background">
              <Key className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              No API keys yet
            </p>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              Create your first key to start sending requests through the
              routing API.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-border/70 text-muted-foreground">
                <tr>
                  <th className="pb-3 font-medium">Name</th>
                  <th className="pb-3 font-medium">Key</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 font-medium">Created</th>
                  <th className="pb-3 font-medium">Last used</th>
                  <th className="pb-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => (
                  <tr
                    className="border-b border-border/60 last:border-b-0"
                    key={key.id}
                  >
                    <td className="py-4 font-medium text-foreground">
                      {key.name || "Unnamed key"}
                    </td>
                    <td className="py-4">
                      <code className="rounded-md border border-border/70 bg-background px-2 py-1 font-mono text-xs text-foreground">
                        {key.key_prefix}...
                      </code>
                    </td>
                    <td className="py-4">
                      <Badge variant="outline">{key.plan_tier}</Badge>
                    </td>
                    <td className="py-4 text-muted-foreground">
                      {new Date(key.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-4 text-muted-foreground">
                      {key.last_used_at
                        ? new Date(key.last_used_at).toLocaleDateString()
                        : "Never"}
                    </td>
                    <td className="py-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy key prefix
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => void handleRevokeKey(key.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Revoke key
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SurfaceCard>

      <SurfaceCard
        title="Integration reference"
        description="Everything needed to make your first authenticated request."
      >
        <div className="space-y-4 text-sm">
          <div className="rounded-lg border border-border/70 bg-background px-4 py-4">
            <p className="font-medium text-foreground">Base URL</p>
            <code className="mt-2 block font-mono text-muted-foreground">
              https://api.routing.run/v1/chat/completions
            </code>
          </div>
          <div className="rounded-lg border border-border/70 bg-background px-4 py-4">
            <p className="font-medium text-foreground">Headers</p>
            <pre className="mt-2 overflow-x-auto font-mono text-muted-foreground">{`Authorization: Bearer YOUR_API_KEY
Content-Type: application/json`}</pre>
          </div>
          <div className="rounded-lg border border-border/70 bg-background px-4 py-4">
            <p className="font-medium text-foreground">Example request</p>
            <pre className="mt-2 overflow-x-auto font-mono text-muted-foreground">{`curl -X POST https://api.routing.run/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}</pre>
          </div>
        </div>
      </SurfaceCard>
    </div>
  );
}
