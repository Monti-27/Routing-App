import type { Icon } from "@phosphor-icons/react";
import {
  Desktop,
  DotsThree,
  GearSix,
  Moon,
  SignOut,
  Sun,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { UserAvatar } from "@/components/ui/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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

type SidebarWithSubmenuProps = {
  navigation?: SidebarMenuItem[];
  footerItems?: SidebarMenuItem[];
  billingItems?: SidebarMenuItem[];
  profile?: SidebarProfile;
  onLogout?: () => void;
};

const sectionTitleClassName =
  "px-3 text-[11px] font-medium text-zinc-400 dark:text-zinc-500";

function NavItem({ item, active }: { item: SidebarMenuItem; active: boolean }) {
  const IconComponent = item.icon;

  return (
    <Link
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-colors",
        active
          ? "border border-[#1470e3]/20 bg-[#1470e3]/10 text-[#0f5fc0] dark:border-[#8350e8]/25 dark:bg-[#8350e8]/12 dark:text-[#c7aff8]"
          : "border border-transparent text-zinc-600 hover:bg-zinc-200/70 hover:text-zinc-950 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100",
      )}
      href={item.href}
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
}: {
  title: string;
  items: SidebarMenuItem[];
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
  onLogout,
}: SidebarWithSubmenuProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme, theme } = useTheme();

  return (
    <aside className="flex h-full w-full flex-col bg-[#f7f7f7] p-3 dark:bg-[#141414]">
      <div className="px-2 pb-4 pt-1">
        <div className="flex items-center gap-2 rounded-xl px-2 py-2 transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-900">
          <Link
            className="flex min-w-0 flex-1 items-center gap-3"
            href="/dashboard"
          >
            <UserAvatar email={profile.email} name={profile.name} size={36} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-zinc-950 dark:text-zinc-100">
                {profile.name}
              </p>
              <p className="truncate text-xs text-zinc-500 dark:text-zinc-500">
                {profile.plan}
              </p>
            </div>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                aria-label="Open sidebar settings"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-200/80 hover:text-zinc-950 dark:text-zinc-500 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
                type="button"
              >
                <DotsThree className="h-4 w-4" weight="bold" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="space-y-1">
                  <p className="truncate text-sm font-medium text-foreground">
                    {profile.name}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {profile.email}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {profile.plan}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => router.push("/dashboard/settings")}
              >
                <GearSix className="h-4 w-4" weight="duotone" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  {resolvedTheme === "dark" ? (
                    <Moon className="h-4 w-4" weight="duotone" />
                  ) : (
                    <Sun className="h-4 w-4" weight="duotone" />
                  )}
                  Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuRadioGroup
                    onValueChange={(value) => setTheme(value)}
                    value={theme ?? "system"}
                  >
                    <DropdownMenuRadioItem value="light">
                      <Sun className="h-4 w-4" weight="duotone" />
                      Light
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="dark">
                      <Moon className="h-4 w-4" weight="duotone" />
                      Dark
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="system">
                      <Desktop className="h-4 w-4" weight="duotone" />
                      System
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              {onLogout ? (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout}>
                    <SignOut className="h-4 w-4" weight="duotone" />
                    Log out
                  </DropdownMenuItem>
                </>
              ) : null}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-1 pb-4">
        <NavSection items={navigation} title="Workspace" />
        <NavSection items={billingItems} title="Billing" />
        <NavSection items={footerItems} title="Preferences" />
      </div>
    </aside>
  );
}
