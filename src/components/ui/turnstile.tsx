"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: {
        sitekey: string;
        callback: (token: string) => void;
        "error-callback"?: (errorCode: string) => void;
        "expired-callback"?: () => void;
        theme?: "light" | "dark" | "auto";
        size?: "normal" | "compact";
      }) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onWidgetId?: (widgetId: string) => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
}

export function Turnstile({ siteKey, onVerify, onExpire, onWidgetId, theme = "light", size = "normal" }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const isRenderedRef = useRef(false);

  useEffect(() => {
    if (isRenderedRef.current) return;
    isRenderedRef.current = true;

    const scriptId = "cf-turnstile-script";

    const initTurnstile = () => {
      if (!containerRef.current || !window.turnstile || widgetIdRef.current) return;

      const id = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerify,
        "expired-callback": onExpire,
        theme,
        size,
      });

      widgetIdRef.current = id;
      if (onWidgetId) onWidgetId(id);
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = () => initTurnstile();
      document.head.appendChild(script);
    } else if (window.turnstile) {
      initTurnstile();
    }

    return () => {
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
        isRenderedRef.current = false;
      }
    };
  }, [siteKey, onVerify, onExpire, onWidgetId, theme, size]);

  return <div ref={containerRef} style={{ minWidth: "300px", minHeight: "65px" }} />;
}

export function resetTurnstile(widgetId: string) {
  if (window.turnstile) {
    window.turnstile.reset(widgetId);
  }
}