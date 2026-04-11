"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  "error-callback"?: (errorCode: string) => void;
  "expired-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
  "retry"?: "auto" | "never";
  "retry-interval"?: number;
}

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: TurnstileRenderOptions) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
      getResponse: (widgetId: string) => string;
      ready: (callback: () => void) => void;
    };
    onTurnstileLoad?: () => void;
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

function TurnstileComponent({ siteKey, onVerify, onExpire, onWidgetId, theme = "auto", size = "normal" }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scriptError, setScriptError] = useState(false);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile || widgetIdRef.current !== null) {
      return;
    }

    try {
      const id = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => {
          onVerify(token);
        },
        "expired-callback": () => {
          onExpire?.();
        },
        "error-callback": (errorCode) => {
          console.error("[TURNSTILE] Widget error:", errorCode);
        },
        theme,
        size,
        "retry": "auto",
        "retry-interval": 8000,
      });
      widgetIdRef.current = id;
      if (onWidgetId) {
        onWidgetId(id);
      }
      setIsLoading(false);
    } catch (e) {
      console.error("[TURNSTILE] Render failed:", e);
      setIsLoading(false);
    }
  }, [siteKey, onVerify, onExpire, onWidgetId, theme, size]);

  useEffect(() => {
    const scriptId = "turnstile-script";

    window.onTurnstileLoad = () => {
      if (window.turnstile) {
        window.turnstile.ready(() => {
          renderWidget();
        });
      }
    };

    if (!document.getElementById(scriptId)) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=onTurnstileLoad";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        if (window.turnstile) {
          window.turnstile.ready(() => {
            renderWidget();
          });
        }
      };
      script.onerror = () => {
        setScriptError(true);
        setIsLoading(false);
      };
      document.head.appendChild(script);
    } else if (window.turnstile) {
      window.turnstile.ready(() => {
        renderWidget();
      });
    }
  }, [renderWidget]);

  useEffect(() => {
    return () => {
      if (widgetIdRef.current !== null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
        }
        widgetIdRef.current = null;
      }
    };
  }, []);

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

export function Turnstile(props: TurnstileProps) {
  return <TurnstileComponent {...props} />;
}

export function resetTurnstile(widgetId: string) {
  if (window.turnstile) {
    window.turnstile.reset(widgetId);
  }
}

export default Turnstile;