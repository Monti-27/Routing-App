"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onWidgetId?: (widgetId: string) => void;
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
    turnstile?: TurnstileInstance;
  }
}

export function Turnstile({ siteKey, onVerify, onExpire, onWidgetId, theme = "auto", size = "normal" }: TurnstileProps) {
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

    const initScript = () => {
      if (!document.getElementById(scriptId)) {
        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
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
    };

    initScript();
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

export function resetTurnstile(widgetId: string) {
  if (window.turnstile) {
    window.turnstile.reset(widgetId);
  }
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

export function Turnstile({ siteKey, onVerify, onExpire, onWidgetId, theme = "auto", size = "normal" }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [scriptError, setScriptError] = useState(false);

  console.log("[TURNSTILE] Rendering with siteKey:", siteKey ? `${siteKey.substring(0,10)}...` : "EMPTY/MISSING");

  useEffect(() => {
    console.log("[TURNSTILE] useEffect fired, siteKey:", siteKey);
    const scriptId = "turnstile-script";

    const initTurnstile = () => {
      console.log("[TURNSTILE] initTurnstile called");
      if (widgetIdRef.current !== null) return;

      if (containerRef.current && window.turnstile) {
        console.log("[TURNSTILE] Rendering widget");
        try {
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: siteKey,
            callback: (token) => {
              console.log("[TURNSTILE] Verified, token:", token.substring(0,10) + "...");
              setIsLoading(false);
              onVerify(token);
            },
            "expired-callback": () => {
              console.log("[TURNSTILE] Expired");
              setIsLoading(false);
              onExpire?.();
            },
            theme,
            size,
          });
          if (onWidgetId && widgetIdRef.current) {
            onWidgetId(widgetIdRef.current);
          }
          setIsReady(true);
        } catch (e) {
          console.error("Turnstile render error:", e);
          setIsLoading(false);
        }
      } else {
        console.log("[TURNSTILE] container or turnstile not ready");
      }
    };

    if (!document.getElementById(scriptId)) {
      console.log("[TURNSTILE] Creating script element");
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      script.async = true;
      script.defer = true;
      script.onload = () => {
        console.log("[TURNSTILE] Script loaded");
        setIsLoading(false);
        initTurnstile();
      };
      script.onerror = () => {
        console.error("Failed to load Turnstile script");
        setScriptError(true);
        setIsLoading(false);
      };
      document.head.appendChild(script);
    } else if (window.turnstile) {
      console.log("[TURNSTILE] Script already exists, initializing");
      initTurnstile();
    } else {
      console.log("[TURNSTILE] Script exists but turnstile not ready, polling");
      const checkTurnstile = setInterval(() => {
        if (window.turnstile) {
          console.log("[TURNSTILE] Polling found turnstile");
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

  if (scriptError) {
    return (
      <div className="flex flex-col items-center gap-2 p-4 border border-red-500/50 rounded-lg bg-red-500/10">
        <span className="text-xs text-red-500">CAPTCHA failed to load - email verification still works</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div ref={containerRef} style={{ minWidth: "300px", minHeight: "65px", border: "1px dashed red" }} />
      {isLoading && !isReady && (
        <span className="text-xs text-muted-foreground">Loading CAPTCHA...</span>
      )}
    </div>
  );
}

export function resetTurnstile(widgetId: string) {
  if (window.turnstile) {
    window.turnstile.reset(widgetId);
  }
}
