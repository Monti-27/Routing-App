"use client";

import { useRouter } from "next/navigation";
import { LogOut, Settings, CreditCard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth-context";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { UserAvatar } from "@/components/ui/user-avatar";

interface HeaderProps {
  user?: {
    email: string;
    name: string | null;
  } | null;
}

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const { logout, isDevBypassEnabled } = useAuth();

  const handleLogout = () => {
    logout();
    router.push("/auth/login");
  };

  return (
    <div className="flex items-center gap-2">
      {isDevBypassEnabled ? (
        <Badge
          variant="outline"
          className="rounded-md border-zinc-800 bg-zinc-950 text-xs text-zinc-100"
        >
          Dev Bypass
        </Badge>
      ) : null}

      <ThemeToggle />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            aria-label="Open account menu"
            className="relative h-9 w-9 rounded-lg border border-zinc-800 bg-[#141414]"
          >
            <UserAvatar email={user?.email} name={user?.name} size={36} />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.name || "User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || ""}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/dashboard/keys")}>
            <CreditCard className="mr-2 h-4 w-4" />
            API Keys
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600">
            <LogOut className="mr-2 h-4 w-4" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
