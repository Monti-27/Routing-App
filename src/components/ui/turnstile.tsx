"use client";

import { useEffect, useRef, useState } from "react";

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

export function Turnstile({ siteKey, onVerify, onExpire, onWidgetId, theme = "auto", size = "normal" }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scriptError, setScriptError] = useState(false);

  useEffect(() => {
    let widgetId: string | null = null;

    const initTurnstile = () => {
      if (!containerRef.current || widgetId !== null) return;
      
      if (typeof window !== "undefined" && (window as any).turnstile) {
        try {
          widgetId = (window as any).turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token: string) => {
              onVerify(token);
            },
            "expired-callback": () => {
              onExpire?.();
            },
            theme,
            size,
          });
          widgetIdRef.current = widgetId;
          if (onWidgetId && widgetId) {
            onWidgetId(widgetId);
          }
          setIsLoading(false);
        } catch (e) {
          console.error("[TURNSTILE] Render error:", e);
          setIsLoading(false);
        }
      }
    };

    const scriptId = "turnstile-script";
    
    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setIsLoading(false);
        setTimeout(initTurnstile, 100);
      };
      
      script.onerror = () => {
        setScriptError(true);
        setIsLoading(false);
      };
      
      document.head.appendChild(script);
    } else {
      setIsLoading(false);
      setTimeout(initTurnstile, 100);
    }

    return () => {
      if (widgetId !== null && (window as any).turnstile) {
        try {
          (window as any).turnstile.remove(widgetId);
        } catch {}
      }
    };
  }, [siteKey, theme, size, onVerify, onExpire, onWidgetId]);

  if (scriptError) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 border border-red-500/50 rounded-lg bg-red-500/10">
        <span className="text-xs text-red-500">CAPTCHA failed to load - email verification still works</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={containerRef} style={{ minWidth: "300px", minHeight: "65px" }} />
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