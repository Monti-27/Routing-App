import { Facehash, stringHash } from "facehash";

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

const getOpenEyeSeed = (seed: string) => {
  const preferredFaceIndexes = new Set([0, 1]);

  for (let index = 0; index < 8; index += 1) {
    const candidate = `${seed}:${index}`;
    const faceIndex = stringHash(candidate) % 4;

    if (preferredFaceIndexes.has(faceIndex)) {
      return candidate;
    }
  }

  return `${seed}:0`;
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
  const avatarSeed = getOpenEyeSeed(baseSeed);

  return (
    <Facehash
      className={cn("rounded-lg text-white", className)}
      colors={[...colors]}
      intensity3d="subtle"
      name={avatarSeed}
      showInitial={false}
      size={size}
      variant="solid"
    />
  );
}
