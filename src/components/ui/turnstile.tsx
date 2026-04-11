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

export function Turnstile({ siteKey, onVerify, onExpire, onWidgetId, theme = "auto", size = "normal" }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scriptError, setScriptError] = useState(false);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const onWidgetIdRef = useRef(onWidgetId);

  useEffect(() => {
    onVerifyRef.current = onVerify;
    onExpireRef.current = onExpire;
    onWidgetIdRef.current = onWidgetId;
  }, [onVerify, onExpire, onWidgetId]);

  useEffect(() => {
    const containerId = "turnstile-widget-container";

    const renderWidget = () => {
      if (!containerRef.current || widgetIdRef.current !== null) return;
      if (typeof window === "undefined" || !window.turnstile) return;

      try {
        const id = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => {
            onVerifyRef.current(token);
          },
          "expired-callback": () => {
            onExpireRef.current?.();
          },
          "error-callback": (errorCode: string) => {
            console.error("[TURNSTILE] Error:", errorCode);
          },
          theme,
          size,
        });
        widgetIdRef.current = id;
        if (onWidgetIdRef.current) {
          onWidgetIdRef.current(id);
        }
        setIsLoading(false);
      } catch (e) {
        console.error("[TURNSTILE] Render error:", e);
        setIsLoading(false);
      }
    };

    const scriptId = "turnstile-script";

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad";
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        setScriptError(true);
        setIsLoading(false);
      };

      (window as any).onTurnstileLoad = () => {
        if ((window as any).turnstile) {
          renderWidget();
        }
      };

      document.head.appendChild(script);
    } else if ((window as any).turnstile) {
      renderWidget();
    }

    return () => {
      if (widgetIdRef.current !== null && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(widgetIdRef.current);
        } catch {}
        widgetIdRef.current = null;
      }
    };
  }, [siteKey, theme, size]);

  if (scriptError) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 border border-red-500/50 rounded-lg bg-red-500/10">
        <span className="text-xs text-red-500">CAPTCHA failed to load - email verification still works</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={containerRef} id={containerRef.current?.id || "turnstile-widget-container"} style={{ minWidth: "300px", minHeight: "65px" }} />
      {isLoading && (
        <span className="text-xs text-muted-foreground">Loading CAPTCHA...</span>
      )}
    </div>
  );
}

export function resetTurnstile(widgetId: string) {
  if (typeof window !== "undefined" && (window as any).turnstile) {
    (window as any).turnstile.reset(widgetId);
  }
}