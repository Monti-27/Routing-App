"use client";

import { useEffect, useState } from "react";

function detectLowGpu(): boolean {
  if (typeof window === "undefined") return true;

  if (
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return true;
  }

  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") || canvas.getContext("webgl");

    if (!gl) return true;

    const ext = (gl as WebGLRenderingContext).getExtension(
      "WEBGL_debug_renderer_info",
    );
    if (ext) {
      const renderer = (gl as WebGLRenderingContext)
        .getParameter(ext.UNMASKED_RENDERER_WEBGL)
        ?.toLowerCase();

      if (
        renderer &&
        (/swiftshader|llvmpipe|softpipe|microsoft basic|software/.test(
          renderer,
        ) ||
          /mesa.*llvm|chromium/.test(renderer))
      ) {
        return true;
      }
    }

    canvas.remove();
  } catch {
    return true;
  }

  return false;
}

export function useCanRunShader(): boolean | null {
  const [canRun, setCanRun] = useState<boolean | null>(null);

  useEffect(() => {
    setCanRun(!detectLowGpu());
  }, []);

  return canRun;
}
