"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { ChevronDown, LogOut } from "lucide-react";

import { cn } from "@/lib/utils";

export type SidebarMenuItem = {
  name: string;
  href: string;
  icon?: LucideIcon;
};

export type SidebarProfile = {
  name: string;
  plan: string;
  email: string;
};

type SidebarWithSubmenuProps = {
  navigation?: SidebarMenuItem[];
  footerItems?: SidebarMenuItem[];
  billingItems?: SidebarMenuItem[];
  profile?: SidebarProfile;
  onLogout?: () => void;
};

type MenuProps = {
  label: string;
  icon?: LucideIcon;
  items: SidebarMenuItem[];
};

const NavItem = ({
  item,
  active,
}: {
  item: SidebarMenuItem;
  active: boolean;
}) => {
  const Icon = item.icon;

  return (
    <Link
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-white text-black"
          : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
      )}
      href={item.href}
    >
      {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
      <span className="truncate">{item.name}</span>
    </Link>
  );
};

const Menu = ({ label, icon: Icon, items }: MenuProps) => {
  const pathname = usePathname();
  const [isOpened, setIsOpened] = useState(
    items.some((item) => pathname === item.href),
  );

  return (
    <div className="space-y-1">
      <button
        aria-expanded={isOpened}
        className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm text-zinc-400 transition-colors hover:bg-zinc-900 hover:text-zinc-100"
        onClick={() => setIsOpened((current) => !current)}
        type="button"
      >
        <div className="flex items-center gap-3">
          {Icon ? <Icon className="h-4 w-4 shrink-0" /> : null}
          <span>{label}</span>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 transition-transform",
            isOpened && "rotate-180",
          )}
        />
      </button>

      {isOpened ? (
        <div className="ml-5 space-y-1 border-l border-zinc-800 pl-3">
          {items.map((item, index) => (
            <NavItem
              active={pathname === item.href}
              item={item}
              key={`${item.href}-${item.name}-${index}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const defaultProfile: SidebarProfile = {
  name: "Dev User",
  plan: "MAX Plan",
  email: "dev@routing.run",
};

export default function SidebarWithSubmenu({
  navigation = [],
  footerItems = [],
  billingItems = [],
  profile = defaultProfile,
  onLogout,
}: SidebarWithSubmenuProps) {
  const pathname = usePathname();

  const initials = useMemo(
    () =>
      profile.name
        .split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase(),
    [profile.name],
  );

  return (
    <aside className="flex h-full w-full flex-col rounded-r-3xl border-r border-zinc-900 bg-black">
      <div className="border-b border-zinc-900 px-5 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-sm font-semibold text-zinc-100">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-zinc-100">
              {profile.name}
            </p>
            <p className="truncate text-xs text-zinc-500">{profile.plan}</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item, index) => (
            <NavItem
              active={pathname === item.href}
              item={item}
              key={`${item.href}-${item.name}-${index}`}
            />
          ))}
        </div>

        {billingItems.length > 0 ? (
          <div className="mt-5">
            <Menu
              icon={billingItems[0]?.icon}
              items={billingItems}
              label="Billing"
            />
          </div>
        ) : null}

        {footerItems.length > 0 ? (
          <div className="mt-5 border-t border-zinc-900 pt-4">
            <div className="space-y-1">
              {footerItems.map((item, index) => (
                <NavItem
                  active={pathname === item.href}
                  item={item}
                  key={`${item.href}-${item.name}-${index}`}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="border-t border-zinc-900 px-4 py-4">
        <div className="flex items-center gap-3 rounded-xl border border-zinc-900 bg-zinc-950 px-3 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-black text-sm font-semibold text-zinc-100">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-100">
              {profile.name}
            </p>
            <p className="truncate text-xs text-zinc-500">{profile.email}</p>
          </div>
          <button
            aria-label="Log out"
            className="rounded-md p-1.5 text-zinc-500 transition-colors hover:bg-black hover:text-zinc-100"
            onClick={onLogout}
            type="button"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
