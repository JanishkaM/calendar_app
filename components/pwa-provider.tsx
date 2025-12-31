"use client";
import Image from "next/image";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle, 
} from "@/components/ui/dialog";
import { Download, X, Share, Plus, Smartphone } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type PWAContextValue = {
  isInstalled: boolean;
  showBanner: boolean;
  dismissBanner: () => void;
  promptInstall: () => void;
  showIOSModal: boolean;
  setShowIOSModal: (value: boolean) => void;
  supportsPrompt: boolean;
};

const PWAContext = createContext<PWAContextValue | null>(null);

type ProviderProps = {
  children: ReactNode;
  debug?: boolean;
  dismissTTLHours?: number;
};

export function PWAProvider({
  children,
  debug = false,
  dismissTTLHours = 168, // 7 days
}: ProviderProps) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [supportsPrompt, setSupportsPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  const log = useCallback(
    (...a: unknown[]) => debug && console.log("[PWA]", ...a),
    [debug]
  );

  // Banner dismissal persistence
  const bannerDismissed = () => {
    try {
      const raw = localStorage.getItem("pwa_install_dismissed_until");
      if (!raw) return false;
      return Date.now() < parseInt(raw, 10);
    } catch {
      return false;
    }
  };
  const setDismissedUntil = useCallback(() => {
    try {
      localStorage.setItem(
        "pwa_install_dismissed_until",
        String(Date.now() + dismissTTLHours * 3600 * 1000)
      );
    } catch {
      /* ignore */
    }
  }, [dismissTTLHours]);

  // Register SW once (prod only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (process.env.NODE_ENV !== "production") {
      log("Skipping SW registration in development.");
      return;
    }
    if (!("serviceWorker" in navigator)) return;

    (async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js");
        log("SW registered:", reg);

        reg.addEventListener("updatefound", () => {
          const newSW = reg.installing;
          newSW?.addEventListener("statechange", () => {
            if (
              newSW.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // No update toast per requirement; refresh will happen on next load.
            }
          });
        });
      } catch (e) {
        log("SW registration failed:", e);
      }
    })();
  }, [log]);

  // Detect installed display-mode
  useEffect(() => {
    const updateInstalled = () => {
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as { standalone?: boolean }).standalone === true;
      setIsInstalled(standalone);
      if (standalone) setShowBanner(false);
    };
    updateInstalled();
    const mq = window.matchMedia("(display-mode: standalone)");
    mq.addEventListener("change", updateInstalled);

    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
    });

    return () => mq.removeEventListener("change", updateInstalled);
  }, []);

  // Capture beforeinstallprompt (Chrome/Android)
  useEffect(() => {
    const handler = (e: Event) => {
      const bip = e as BeforeInstallPromptEvent;
      bip.preventDefault();
      setDeferredPrompt(bip);
      setSupportsPrompt(true);
      if (!isInstalled && !bannerDismissed()) {
        setTimeout(() => setShowBanner(true), 800);
      }
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [isInstalled]);

  // iOS fallback (no beforeinstallprompt)
  useEffect(() => {
    if (isIOS && !isInstalled && !bannerDismissed()) {
      const t = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(t);
    }
  }, [isIOS, isInstalled]);

  const dismissBanner = useCallback(() => {
    setShowBanner(false);
    setDismissedUntil();
  }, [setDismissedUntil]);

  const promptInstall = useCallback(async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    if (!deferredPrompt) {
      log("No deferredPrompt available");
      return;
    }
    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      log("Install choice:", choice);
      if (choice.outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } catch (e) {
      log("Prompt error:", e);
    }
  }, [deferredPrompt, isIOS, log]);

  return (
    <PWAContext.Provider
      value={{
        isInstalled,
        showBanner,
        dismissBanner,
        promptInstall,
        showIOSModal,
        setShowIOSModal,
        supportsPrompt,
      }}
    >
      {children}
      <InstallBanner />
      <IOSDialog />
    </PWAContext.Provider>
  );
}

export function usePWA() {
  const ctx = useContext(PWAContext);
  if (!ctx) {
    throw new Error("usePWA must be used within a PWAProvider");
  }
  return ctx;
}

function InstallBanner() {
  const {
    showBanner,
    dismissBanner,
    promptInstall,
    isInstalled,
    supportsPrompt,
  } = usePWA();

  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (!showBanner || isInstalled) return null;
  if (!isIOS && !supportsPrompt) return null;

  return (
    <>
      <span className="block h-16" />
      <div className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 flex items-center justify-center backdrop-blur-sm shrink-0 rounded-lg bg-accent">
                <Image
                  src="/icons/icon-192.png"
                  alt="Reliance Calendar"
                  width={40}
                  height={40}
                  className="object-contain rounded-lg"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">
                  Install Reliance Calendar
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Add it to your home screen for faster access.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                onClick={promptInstall}
                size="sm"
                className="h-8 px-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg transition-all duration-200 text-xs"
              >
                <Download className="w-3 h-3 mr-1" />
                Install
              </Button>
              <Button
                onClick={dismissBanner}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 hover:bg-accent/50 rounded-lg"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function IOSDialog() {
  const { showIOSModal, setShowIOSModal } = usePWA();
  const isIOS =
    typeof navigator !== "undefined" &&
    /iPad|iPhone|iPod/.test(navigator.userAgent);

  if (!isIOS) return null;

  return (
    <Dialog open={showIOSModal} onOpenChange={setShowIOSModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Install App
          </DialogTitle>
          <DialogDescription className="text-start">
            Follow these steps to install the app on your device:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <IOSStep number={1}>
            Tap the <strong>Share</strong> button{" "}
            <Share className="inline h-4 w-4" /> in Safari
          </IOSStep>
          <IOSStep number={2}>
            Scroll and tap <strong>&quot;Add to Home Screen&quot;</strong>{" "}
            <Plus className="inline h-4 w-4" />
          </IOSStep>
          <IOSStep number={3}>
            Tap <strong>&quot;Add&quot;</strong> (top-right)
          </IOSStep>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => setShowIOSModal(false)}>Got it</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function IOSStep({
  number,
  children,
}: {
  number: number;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
        {number}
      </div>
      <div className="flex-1">
        <p className="text-sm text-muted-foreground">{children}</p>
      </div>
    </div>
  );
}

export default PWAProvider;
