import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Facehash } from "@/components/ui/facehash";
import { Spinner } from "@/components/ui/spinner";

type AuthLoadingScreenProps = {
  title: string;
  description?: string;
  mode?: "loading" | "thinking";
};

export function AuthLoadingScreen({
  title,
  description,
  mode = "loading",
}: AuthLoadingScreenProps) {
  const mouth = (): ReactNode => (
    <Spinner className="h-6 w-6 animate-spin text-white" />
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f7f7] p-4 dark:bg-[#0f0f10]">
      <Card className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white shadow-none dark:border-zinc-800 dark:bg-[#18181b]">
        <CardContent className="flex flex-col items-center gap-5 px-6 py-8 text-center">
          <Facehash
            enableBlink={mode === "thinking"}
            name={mode}
            onRenderMouth={mouth}
            size={96}
          />
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-foreground">{title}</h2>
            {description ? (
              <p className="text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
