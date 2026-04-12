import type { Viewport } from "next";

import ComponentOrderingGraph from "@/app/demo/ComponentOrderingGraph";

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  width: "device-width",
};

export default function ModelsPage() {
  return <ComponentOrderingGraph />;
}
