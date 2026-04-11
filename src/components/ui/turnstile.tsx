"use client";

import { useEffect, useRef, useState } from "react";

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onWidgetId?: (widgetId: string) => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
}

declare global {
  interface Window {
    turnstile: {
      render: (container: string | HTMLElement, options: TurnstileRenderOptions) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  "error-callback"?: () => void;
  "expired-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
}

export function Turnstile({ siteKey, onVerify, onExpire, theme = "auto", size = "normal" }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const scriptId = "turnstile-script";

    const initTurnstile = () => {
      if (widgetIdRef.current !== null) return;

      if (containerRef.current && window.turnstile) {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: onVerify,
          "expired-callback": onExpire,
          theme,
          size,
        });
        if (onWidgetId && widgetIdRef.current) {
          onWidgetId(widgetIdRef.current);
        }
        setIsReady(true);
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.onload = initTurnstile;
      document.head.appendChild(script);
    } else if (window.turnstile) {
      initTurnstile();
    } else {
      const checkTurnstile = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkTurnstile);
          initTurnstile();
        }
      }, 100);
      return () => clearInterval(checkTurnstile);
    }

    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, onVerify, onExpire, theme, size]);

  return <div ref={containerRef} />;
}

export function resetTurnstile(widgetId: string) {
  if (window.turnstile) {
    window.turnstile.reset(widgetId);
  }
}
