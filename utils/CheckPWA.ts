"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void> | void;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type UsePWAStatusOptions = {
  redirectToInstall?: boolean;
  installPath?: string;
};

type NavigatorStandalone = Navigator & { standalone?: boolean };

declare global {
  interface Window {
    __pwaSwRegisterStarted?: boolean;
  }
}

function detectIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOSDevice = /iPad|iPhone|iPod/.test(ua);
  const isIPadOS =
    /Macintosh/.test(ua) && typeof document !== "undefined" && "ontouchend" in document;
  return isIOSDevice || isIPadOS;
}

function detectStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // iOS Safari
  const iosStandalone = (window.navigator as NavigatorStandalone).standalone === true;
  // Most modern browsers
  const displayModeStandalone = window.matchMedia?.("(display-mode: standalone)")?.matches;
  return Boolean(iosStandalone || displayModeStandalone);
}

function registerServiceWorkerOnce(): void {
  if (typeof window === "undefined") return;
  if (process.env.NODE_ENV !== "production") return;
  if (!("serviceWorker" in navigator)) return;

  // Avoid duplicate registration across multiple hook calls
  if (window.__pwaSwRegisterStarted) return;
  window.__pwaSwRegisterStarted = true;

  navigator.serviceWorker
    .register("/sw.js")
    .catch(() => {
      // Keep silent; SW is optional for core app behavior
    });
}

export function usePWAStatus(options: UsePWAStatusOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();

  const { redirectToInstall, installPath } = useMemo(
    () => ({
      redirectToInstall: options.redirectToInstall ?? true,
      installPath: options.installPath ?? "/install",
    }),
    [options.installPath, options.redirectToInstall]
  );

  // Keep first render deterministic (prevents UI flashes + hydration mismatches).
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS] = useState(() => detectIOS());
  const [isReady, setIsReady] = useState(false);

  // Install status tracking
  useEffect(() => {
    const update = () => {
      const standalone = detectStandalone();
      setIsInstalled(standalone);

      // Mark ready after we have a client-derived value.
      setIsReady(true);

      if (!standalone && redirectToInstall) {
        // Avoid redirect loops and allow the install page itself
        if (pathname && pathname !== installPath) {
          router.replace(installPath);
        }
      }
    };

    update();

    const mq = window.matchMedia?.("(display-mode: standalone)");
    const onChange = () => update();
    mq?.addEventListener?.("change", onChange);

    const onAppInstalled = () => update();
    window.addEventListener("appinstalled", onAppInstalled);

    return () => {
      mq?.removeEventListener?.("change", onChange);
      window.removeEventListener("appinstalled", onAppInstalled);
    };
  }, [installPath, pathname, redirectToInstall, router]);

  // SW registration (safe + prod only)
  useEffect(() => {
    registerServiceWorkerOnce();
  }, []);

  return { isInstalled, isIOS, isReady };
}
