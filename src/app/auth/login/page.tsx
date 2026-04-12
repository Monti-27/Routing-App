"use client";

import Image from "next/image";

import { AuthComponent } from "@/components/ui/sign-up";

export default function LoginPage() {
  return (
    <AuthComponent
      brandName="Routing.run"
      logo={
        <Image
          alt="Routing.run"
          className="h-7 w-auto"
          height={28}
          priority
          src="/transparent_white_logo.PNG"
          width={28}
        />
      }
    />
  );
}
