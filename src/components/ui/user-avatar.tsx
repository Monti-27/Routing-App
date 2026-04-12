import { cn } from "@/lib/utils";

const avatarPalettes = [
  ["#1470e3", "#8350e8", "#9dc4f4"],
  ["#0f766e", "#14b8a6", "#99f6e4"],
  ["#b45309", "#f59e0b", "#fde68a"],
  ["#be123c", "#f43f5e", "#fda4af"],
  ["#4338ca", "#6366f1", "#c7d2fe"],
  ["#166534", "#22c55e", "#bbf7d0"],
] as const;

const getPaletteIndex = (seed: string) => {
  let hash = 0;

  for (const char of seed) {
    hash = (hash << 5) - hash + char.charCodeAt(0);
    hash |= 0;
  }

  return Math.abs(hash) % avatarPalettes.length;
};

const getInitials = (name?: string | null, email?: string | null) => {
  const trimmedName = name?.trim();

  if (trimmedName) {
    const parts = trimmedName.split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "").join("");
  }

  const fallback = email?.trim() || "routing-user";
  return fallback.slice(0, 2).toUpperCase();
};

type UserAvatarProps = {
  email?: string | null;
  name?: string | null;
  size?: number;
  className?: string;
};

export function UserAvatar({
  email,
  name,
  size = 40,
  className,
}: UserAvatarProps) {
  const baseSeed = name?.trim() || email?.trim() || "routing-user";
  const colors = avatarPalettes[getPaletteIndex(baseSeed)];
  const initials = getInitials(name, email);

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-lg font-medium text-white",
        className,
      )}
      style={{
        background: `linear-gradient(135deg, ${colors[0]}, ${colors[1]}, ${colors[2]})`,
        height: size,
        width: size,
      }}
    >
      <span className="text-xs leading-none">{initials}</span>
    </span>
  );
}
