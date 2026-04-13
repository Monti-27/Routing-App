"use client";

import { useState } from "react";

import ComponentOrderingGraph from "@/app/demo/ComponentOrderingGraph";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { LegacyModelsView } from "./legacy-models-view";

type ModelsView = "graph" | "catalog";

export function ModelsViewSwitcher() {
  const [view, setView] = useState<ModelsView>("graph");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button
          className={cn(
            view === "graph"
              ? ""
              : "border-zinc-300 bg-transparent text-foreground hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900",
          )}
          onClick={() => setView("graph")}
          size="sm"
          variant={view === "graph" ? "default" : "outline"}
        >
          Graph view
        </Button>
        <Button
          className={cn(
            view === "catalog"
              ? ""
              : "border-zinc-300 bg-transparent text-foreground hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-900",
          )}
          onClick={() => setView("catalog")}
          size="sm"
          variant={view === "catalog" ? "default" : "outline"}
        >
          Classic view
        </Button>
      </div>

      {view === "graph" ? <ComponentOrderingGraph /> : <LegacyModelsView />}
    </div>
  );
}
