"use client";

import { useState } from "react";

import ComponentOrderingGraph from "@/app/demo/ComponentOrderingGraph";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { LegacyModelsView } from "./legacy-models-view";
import { ModelsCardView } from "./models-card-view";

type ModelsView = "cards" | "list" | "graph";

export function ModelsViewSwitcher() {
  const [view, setView] = useState<ModelsView>("cards");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Tabs
          onValueChange={(v) => setView(v as ModelsView)}
          value={view}
        >
          <TabsList>
            <TabsTrigger value="cards">Cards</TabsTrigger>
            <TabsTrigger value="list">List</TabsTrigger>
            <TabsTrigger value="graph">Graph</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === "cards" && <ModelsCardView />}
      {view === "list" && <LegacyModelsView />}
      {view === "graph" && <ComponentOrderingGraph />}
    </div>
  );
}
