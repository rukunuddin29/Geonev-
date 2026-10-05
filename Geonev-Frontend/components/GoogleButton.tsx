"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: any;
  }
}

interface Props {
  onToken: (idToken: string) => void;
  onError?: (message: string) => void;
}

const GSI_SRC = "https://accounts.google.com/gsi/client";

export default function GoogleButton({ onToken, onError }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onTokenRef = useRef(onToken);
  const onErrorRef = useRef(onError);

  // Keep latest callbacks without re-running the Google init effect
  useEffect(() => {
    onTokenRef.current = onToken;
    onErrorRef.current = onError;
  });

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    const render = () => {
      const el = containerRef.current;
      if (cancelled || !el || !window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (res: { credential: string }) =>
          onTokenRef.current(res.credential),
      });

      el.innerHTML = "";
      window.google.accounts.id.renderButton(el, {
        theme: "outline",
        size: "large",
        text: "continue_with",
        width: Math.min(el.offsetWidth || 320, 400), // Google max is 400
      });
    };

    // Script already loaded
    if (window.google?.accounts?.id) {
      render();
      return () => {
        cancelled = true;
      };
    }

    let script = document.querySelector<HTMLScriptElement>(
      `script[src="${GSI_SRC}"]`
    );
    if (!script) {
      script = document.createElement("script");
      script.src = GSI_SRC;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }

    const onLoad = () => render();
    const onFail = () => onErrorRef.current?.("Could not load Google sign-in");

    script.addEventListener("load", onLoad);
    script.addEventListener("error", onFail);

    return () => {
      cancelled = true;
      script?.removeEventListener("load", onLoad);
      script?.removeEventListener("error", onFail);
    };
  }, [clientId]);

  return (
    <div className="mt-6">
      <div className="relative mb-4 flex items-center">
        <div className="flex-1 border-t border-slate-200" />
        <span className="mx-3 text-xs text-slate-400">or</span>
        <div className="flex-1 border-t border-slate-200" />
      </div>

      {clientId ? (
        <div ref={containerRef} className="flex w-full justify-center" />
      ) : (
        <p className="text-center text-xs text-amber-600">
          Add NEXT_PUBLIC_GOOGLE_CLIENT_ID to .env to enable Google sign-in
        </p>
      )}
    </div>
  );
}