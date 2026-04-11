"use client";

import { useEffect, useRef, useState } from "react";

interface TurnstileRenderOptions {
  sitekey: string;
  callback: (token: string) => void;
  "error-callback"?: (errorCode: string) => void;
  "expired-callback"?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
}

interface TurnstileInstance {
  render: (container: string | HTMLElement, options: TurnstileRenderOptions) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
  getResponse: (widgetId: string) => string;
  ready: (callback: () => void) => void;
}

declare global {
  interface Window {
    turnstile?: TurnstileInstance;
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

function TurnstileWidget({ siteKey, onVerify, onExpire, onWidgetId, theme = "auto", size = "normal" }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scriptError, setScriptError] = useState(false);
  const callbacksRef = useRef({ onVerify, onExpire, onWidgetId });

  useEffect(() => {
    callbacksRef.current = { onVerify, onExpire, onWidgetId };
  }, [onVerify, onExpire, onWidgetId]);

  useEffect(() => {
    const scriptId = "turnstile-script";

    window.onTurnstileLoad = () => {
      if (window.turnstile && containerRef.current && widgetIdRef.current === null) {
        widgetIdRef.current = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          callback: (token) => {
            callbacksRef.current.onVerify(token);
          },
          "expired-callback": () => {
            callbacksRef.current.onExpire?.();
          },
          theme,
          size,
        });
        if (callbacksRef.current.onWidgetId && widgetIdRef.current) {
          callbacksRef.current.onWidgetId(widgetIdRef.current);
        }
        setIsLoading(false);
      }
    };

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
      document.head.appendChild(script);
    } else if (window.turnstile) {
      window.onTurnstileLoad();
    }
  }, [siteKey, theme, size]);

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
      <div ref={containerRef} id="turnstile-container" style={{ minWidth: "300px", minHeight: "65px" }} />
      {isLoading && (
        <span className="text-xs text-muted-foreground">Loading CAPTCHA...</span>
      )}
    </div>
  );
}

export function Turnstile(props: TurnstileProps) {
  return <TurnstileWidget {...props} />;
}

export function resetTurnstile(widgetId: string) {
  if (window.turnstile) {
    window.turnstile.reset(widgetId);
  }
}