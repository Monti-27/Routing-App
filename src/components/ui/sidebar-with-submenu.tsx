import type { Icon } from "@phosphor-icons/react";
import {
  CaretUpDown,
  DiscordLogo,
  Envelope,
  GearSix,
  Moon,
  SignOut,
  Sun,
} from "@phosphor-icons/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { UserAvatar } from "@/components/ui/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type SidebarMenuItem = {
  name: string;
  href: string;
  icon?: Icon;
};

export type SidebarProfile = {
  name: string;
  plan: string;
  email: string;
};

export type SidebarModelUsage = {
  id: string;
  name: string;
  logo?: string;
  requests: number;
};

type SidebarWithSubmenuProps = {
  navigation?: SidebarMenuItem[];
  footerItems?: SidebarMenuItem[];
  billingItems?: SidebarMenuItem[];
  profile?: SidebarProfile;
  topModels?: SidebarModelUsage[];
  requestsRemaining?: number;
  requestsLimit?: number;
  onNavigate?: () => void;
  onLogout?: () => void;
};

const sectionTitleClassName =
  "px-3 text-[11px] font-medium text-zinc-400 dark:text-zinc-500 uppercase tracking-wider";

function NavItem({
  item,
  active,
  onNavigate,
}: {
  item: SidebarMenuItem;
  active: boolean;
  onNavigate?: () => void;
}) {
  const IconComponent = item.icon;

  return (
    <Link
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
        active
          ? "border border-[#1470e3]/20 bg-[#1470e3]/10 text-[#0f5fc0] dark:border-[#8350e8]/25 dark:bg-[#8350e8]/12 dark:text-[#c7aff8]"
          : "border border-transparent text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-white/[0.06] dark:hover:text-zinc-200",
      )}
      href={item.href}
      onClick={onNavigate}
    >
      {IconComponent ? (
        <IconComponent className="h-4 w-4 shrink-0" weight="duotone" />
      ) : null}
      <span className="truncate">{item.name}</span>
    </Link>
  );
}

function NavSection({
  title,
  items,
  onNavigate,
}: {
  title: string;
  items: SidebarMenuItem[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <p className={sectionTitleClassName}>{title}</p>
      <div className="space-y-1">
        {items.map((item, index) => (
          <NavItem
            active={pathname === item.href}
            item={item}
            key={`${item.href}-${item.name}-${index}`}
            onNavigate={onNavigate}
          />
        ))}
      </div>
    </div>
  );
}

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
  topModels = [],
  requestsRemaining,
  requestsLimit,
  onNavigate,
  onLogout,
}: SidebarWithSubmenuProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <aside className="flex h-full w-full flex-col bg-[#f7f7f7] p-3 dark:bg-[#141416]">
      <div className="px-2 pb-4 pt-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
              type="button"
            >
              <UserAvatar
                email={profile.email}
                name={profile.name}
                size={40}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-semibold text-zinc-950 dark:text-zinc-100">
                  {profile.name}
                </p>
                <p className="truncate text-xs text-zinc-500">
                  {profile.email}
                </p>
              </div>
              <CaretUpDown className="h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="center"
            className="w-64 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-2xl p-1.5"
            side="top"
            sideOffset={8}
          >
            <div className="flex items-center gap-3 px-3 py-3">
              <UserAvatar
                email={profile.email}
                name={profile.name}
                size={44}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-950 dark:text-zinc-100">
                  {profile.name}
                </p>
                <p className="truncate text-xs text-zinc-500">
                  {profile.email}
                </p>
              </div>
            </div>
            {typeof requestsRemaining === "number" && typeof requestsLimit === "number" ? (
              <div className="mx-3 mb-1 rounded-lg bg-zinc-100 px-3 py-2.5 dark:bg-zinc-800">
                <div className="flex items-baseline justify-between">
                  <p className="text-xs text-zinc-500">Requests remaining</p>
                  <p className="text-xs text-zinc-500">
                    {requestsRemaining.toLocaleString()}{" "}
                    <span className="text-zinc-400">/ {requestsLimit.toLocaleString()}</span>
                  </p>
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all"
                    style={{
                      width: `${requestsLimit > 0 ? Math.min(100, (requestsRemaining / requestsLimit) * 100) : 0}%`,
                    }}
                  />
                </div>
              </div>
            ) : null}
            {topModels.length > 0 ? (
              <>
                <div className="flex items-center justify-between px-3 pb-1 pt-2.5">
                  <p className="text-[10.5px] font-semibold tracking-wider text-zinc-400 uppercase">
                    Top Models
                  </p>
                  <Link
                    className="text-[10.5px] font-semibold tracking-wider text-emerald-600 uppercase hover:text-emerald-500"
                    href="/dashboard/models"
                  >
                    View All
                  </Link>
                </div>
                <div className="space-y-0.5 px-1.5 pb-1">
                  {topModels.map((model) => (
                    <div
                      className="flex items-center gap-2.5 rounded-lg px-2 py-2 transition-colors hover:bg-zinc-100 dark:hover:bg-white/[0.06]"
                      key={model.id}
                    >
                      {model.logo ? (
                        <Image
                          alt=""
                          className="h-6 w-6 rounded-full object-contain"
                          height={24}
                          src={model.logo}
                          width={24}
                        />
                      ) : (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-[10px] font-bold text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400">
                          {model.name.charAt(0)}
                        </span>
                      )}
                      <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
                        {model.name}
                      </span>
                      <span className="tabular-nums text-[13px] text-zinc-500">
                        {model.requests.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-3 rounded-lg px-3 py-2.5 text-[13.5px]"
              onClick={() => router.push("/dashboard/settings")}
            >
              <GearSix className="h-[18px] w-[18px] shrink-0" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-3 rounded-lg px-3 py-2.5 text-[13.5px]"
              onClick={() => window.open("https://discord.gg/routing", "_blank")}
            >
              <DiscordLogo className="h-[18px] w-[18px] shrink-0" />
              Discord
            </DropdownMenuItem>
            <DropdownMenuItem
              className="gap-3 rounded-lg px-3 py-2.5 text-[13.5px]"
              onClick={() => window.open("mailto:support@routing.run")}
            >
              <Envelope className="h-[18px] w-[18px] shrink-0" />
              Email Support
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="gap-3 rounded-lg px-3 py-2.5 text-[13.5px]"
              onClick={() =>
                setTheme(resolvedTheme === "dark" ? "light" : "dark")
              }
            >
              {resolvedTheme === "dark" ? (
                <Moon className="h-[18px] w-[18px] shrink-0" />
              ) : (
                <Sun className="h-[18px] w-[18px] shrink-0" />
              )}
              Theme
            </DropdownMenuItem>
            {onLogout ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="gap-3 rounded-lg px-3 py-2.5 text-[13.5px] text-red-500 focus:text-red-500"
                  onClick={onLogout}
                >
                  <SignOut className="h-[18px] w-[18px] shrink-0" />
                  Logout
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-1 pb-4">
        <NavSection items={navigation} onNavigate={onNavigate} title="Workspace" />
        <NavSection items={billingItems} onNavigate={onNavigate} title="Billing" />
        <NavSection items={footerItems} onNavigate={onNavigate} title="Preferences" />
      </div>
    </aside>
  );
}
