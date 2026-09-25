import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback": () => void;
          "error-callback": () => void;
          theme?: "light" | "dark" | "auto";
        }
      ) => string;
      remove: (widgetId: string) => void;
    };
  }
}

type TurnstileFieldProps = { onToken: (token: string) => void };
let turnstileScript: Promise<void> | null = null;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve();
  if (turnstileScript) return turnstileScript;
  turnstileScript = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"]'
    );
    const script = existing ?? document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Security check failed to load"));
    if (!existing) document.head.appendChild(script);
  });
  return turnstileScript;
}

export const TurnstileField: React.FC<TurnstileFieldProps> = ({ onToken }) => {
  const container = useRef<HTMLDivElement>(null);
  const [siteKey, setSiteKey] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void fetch("/api/v1/config", { credentials: "same-origin" })
      .then((response) =>
        response.ok ? (response.json() as Promise<{ turnstileSiteKey?: string }>) : Promise.reject()
      )
      .then((config) => {
        if (!cancelled) setSiteKey(config.turnstileSiteKey ?? "");
      })
      .catch(() => {
        if (!cancelled) setError("Security check is unavailable. Please try again later.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    let widgetId: string | undefined;
    if (!siteKey || !container.current) return;
    void loadTurnstile()
      .then(() => {
        if (cancelled || !container.current || !window.turnstile) return;
        widgetId = window.turnstile.render(container.current, {
          sitekey: siteKey,
          callback: onToken,
          "expired-callback": () => onToken(""),
          "error-callback": () => {
            onToken("");
            setError("Complete the security check again.");
          },
          theme: "auto",
        });
        setError("");
      })
      .catch(() => {
        if (!cancelled) setError("Security check failed to load.");
      });
    return () => {
      cancelled = true;
      if (widgetId && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [siteKey, onToken]);

  return (
    <div className="space-y-1">
      <div ref={container} aria-label="Security check" />
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
};
