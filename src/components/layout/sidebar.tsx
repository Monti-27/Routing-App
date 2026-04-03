"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth-context";
import {
  LayoutDashboard,
  Key,
  BarChart3,
  Settings,
  ChevronRight,
  Zap,
  User,
  Bot,
  Activity,
} from "lucide-react";

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "API Keys",
    href: "/dashboard/keys",
    icon: Key,
  },
  {
    name: "Models",
    href: "/dashboard/models",
    icon: Bot,
  },
  {
    name: "Usage",
    href: "/dashboard/usage",
    icon: BarChart3,
  },
  {
    name: "Status",
    href: "/dashboard/status",
    icon: Activity,
  },
  {
    name: "Pricing",
    href: "/dashboard/pricing",
    icon: Zap,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <div className="flex h-full w-[280px] flex-col border-r bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 shrink-0 items-center border-b px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <img
            src="/logo_trans_black.png"
            alt="Routing.run"
            className="h-8 w-auto object-contain"
          />
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.name}
              {isActive && (
                <ChevronRight className="ml-auto h-4 w-4" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User profile */}
      <div className="border-t p-3">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-lg bg-muted/50 p-3 transition-all hover:bg-sidebar-accent/50"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sidebar-accent-foreground text-sm font-medium">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || "user@example.com"}
            </p>
          </div>
          <User className="h-4 w-4 text-muted-foreground shrink-0" />
        </Link>
      </div>
    </div>
  );
}