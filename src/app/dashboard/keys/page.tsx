"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Key,
  Plus,
  MoreHorizontal,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Label } from "@/components/ui/label";
import { api, ApiKey } from "@/lib/api";

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
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.keys.list();
      setKeys(response.data);
    } catch (err) {
      setError("Failed to load API keys. Please try again.");
      console.error(err);
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
    } catch (err) {
      setError("Failed to create API key. Please try again.");
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyKey = () => {
    if (createdKey) {
      navigator.clipboard.writeText(createdKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      await api.keys.revoke(keyId);
      await fetchKeys();
    } catch (err) {
      setError("Failed to revoke API key. Please try again.");
      console.error(err);
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">API Keys</h2>
          <p className="text-muted-foreground">
            Manage your API keys for accessing the routing API.
          </p>
        </div>

        <Dialog onOpenChange={(open: boolean) => !open && resetDialog()}>
          <DialogTrigger asChild>
            <Button><Plus className="mr-2 h-4 w-4" />Create API Key</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            {createdKey ? (
              <>
                <DialogHeader>
                  <DialogTitle>API Key Created</DialogTitle>
                  <DialogDescription>
                    Copy your API key now. You will not be able to see it again.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-2">
                    <Input
                      value={showKey ? createdKey : "rk_live_".padEnd(32, "x")}
                      readOnly
                      className="font-mono"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setShowKey(!showKey)}
                    >
                      {showKey ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <Button onClick={handleCopyKey} className="w-full">
                    {copied ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy API Key
                      </>
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    Create an API key to start making requests to the routing API.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Key Name (Optional)</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Production Key"
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleCreateKey}
                    disabled={isCreating}
                  >
                    {isCreating && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Key
                  </Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-4 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Your API Keys
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : keys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Key className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-medium">No API keys yet</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Create your first API key to start using the routing API.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell className="font-medium">
                      {key.name || "Unnamed Key"}
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                        {key.key_prefix}...
                      </code>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="secondary"
                        className={
                          key.plan_tier === "premium"
                            ? "bg-brand-purple/10 text-brand-purple"
                            : ""
                        }
                      >
                        {key.plan_tier}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(key.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {key.last_used_at
                        ? new Date(key.last_used_at).toLocaleDateString()
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy Key Prefix
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleRevokeKey(key.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Revoke Key
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-muted p-4">
            <p className="font-medium mb-2">Base URL</p>
            <code className="text-sm text-muted-foreground">
              https://api.routing.run/v1/chat/completions
            </code>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Headers</p>
            <pre className="rounded-lg bg-muted p-4 text-sm">
{`Authorization: Bearer YOUR_API_KEY
Content-Type: application/json`}
            </pre>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium">Example Request</p>
            <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto">
{`curl -X POST https://api.routing.run/v1/chat/completions \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "gpt-4o",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
