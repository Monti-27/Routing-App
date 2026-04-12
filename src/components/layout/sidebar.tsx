"use client";

import {
  ChartBar,
  CirclesThree,
  CreditCard,
  Gauge,
  GearSix,
  Key,
  Stack,
} from "@phosphor-icons/react";

import { useAuth } from "@/lib/auth-context";
import SidebarWithSubmenu, {
  type SidebarMenuItem,
} from "@/components/ui/sidebar-with-submenu";

const navigation: SidebarMenuItem[] = [
  { href: "/dashboard", name: "Overview", icon: Gauge },
  { href: "/dashboard/keys", name: "API Keys", icon: Key },
  { href: "/dashboard/models", name: "Models", icon: Stack },
];

const billingItems: SidebarMenuItem[] = [
  { href: "/dashboard/pricing", name: "Plans", icon: CreditCard },
  { href: "/dashboard/usage", name: "Usage", icon: ChartBar },
  { href: "/dashboard/status", name: "Status", icon: CirclesThree },
];

const footerItems: SidebarMenuItem[] = [
  { href: "/dashboard/settings", name: "Settings", icon: GearSix },
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
