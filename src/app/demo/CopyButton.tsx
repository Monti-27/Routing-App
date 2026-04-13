"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            aria-label={copied ? "Copied" : "Copy to clipboard"}
            className="size-6 border-zinc-300 bg-white/90 disabled:opacity-100 dark:border-zinc-700 dark:bg-[#141414]/90"
            disabled={copied}
            onClick={handleCopy}
            size="icon"
            variant="outline"
          >
            <div
              className={cn(
                "transition-all",
                copied ? "scale-100 opacity-100" : "scale-0 opacity-0",
              )}
            >
              <Check
                aria-hidden="true"
                className="stroke-emerald-500"
                size={16}
                strokeWidth={2}
              />
            </div>
            <div
              className={cn(
                "absolute transition-all",
                copied ? "scale-0 opacity-0" : "scale-100 opacity-100",
              )}
            >
              <Copy aria-hidden="true" size={16} strokeWidth={2} />
            </div>
          </Button>
        </TooltipTrigger>
        <TooltipContent className="px-2 py-1 text-xs">
          {copied ? "Copied" : "Click to copy"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
