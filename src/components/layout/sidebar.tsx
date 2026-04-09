"use client";

import {
  BarChart3,
  Bot,
  Key,
  LayoutDashboard,
  Receipt,
  Settings,
  Zap,
} from "lucide-react";

import { useAuth } from "@/lib/auth-context";
import SidebarWithSubmenu, {
  type SidebarMenuItem,
} from "@/components/ui/sidebar-with-submenu";

const navigation: SidebarMenuItem[] = [
  { href: "/dashboard", name: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/keys", name: "API Keys", icon: Key },
  { href: "/dashboard/models", name: "Models", icon: Bot },
  { href: "/dashboard/usage", name: "Usage", icon: BarChart3 },
  { href: "/dashboard/pricing", name: "Plans", icon: Zap },
];

const billingItems: SidebarMenuItem[] = [
  { href: "/dashboard/pricing", name: "Plans", icon: Receipt },
  { href: "/dashboard/usage", name: "Usage", icon: BarChart3 },
  { href: "/dashboard/status", name: "Transactions", icon: Receipt },
];

const footerItems: SidebarMenuItem[] = [
  { href: "/dashboard/settings", name: "Settings", icon: Settings },
];

export function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <SidebarWithSubmenu
      billingItems={billingItems}
      footerItems={footerItems}
      navigation={navigation}
      onLogout={() => void logout()}
      profile={{
        email: user?.email || "dev@routing.run",
        name: user?.name || "Dev User",
        plan: `${(user?.plan_tier || "free").toUpperCase()} Plan`,
      }}
    />
  );
}
