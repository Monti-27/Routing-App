import type { Viewport } from "next";

import { ModelsViewSwitcher } from "./models-view-switcher";

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  width: "device-width",
};

export default function ModelsPage() {
  return <ModelsViewSwitcher />;
}
