"use client";

import Image from "next/image";

import { AuthComponent } from "@/components/ui/sign-up";
import { AuthComponentLite } from "@/components/ui/sign-up-lite";
import { useCanRunShader } from "@/hooks/use-can-run-shader";
import { AuthLoadingScreen } from "@/components/ui/auth-loading-screen";

const logo = (
  <Image
    alt="Routing.run"
    className="h-7 w-auto"
    height={28}
    priority
    src="/transparent_white_logo.PNG"
    width={28}
  />
);

export default function LoginPage() {
  const canRunShader = useCanRunShader();

  if (canRunShader === null) {
    return <AuthLoadingScreen title="Loading..." />;
  }

  if (!canRunShader) {
    return <AuthComponentLite brandName="Routing.run" logo={logo} />;
  }

  return <AuthComponent brandName="Routing.run" logo={logo} />;
}
