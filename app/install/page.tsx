"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BeforeInstallPromptEvent, usePWAStatus } from "@/utils/CheckPWA";


export default function Page() {
  const router = useRouter();
  const { isInstalled, isIOS } = usePWAStatus({ redirectToInstall: false });

  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);
  const [installError, setInstallError] = useState<string | null>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
      setInstallError(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  useEffect(() => {
    // If already installed, redirect to home
    if (isInstalled) {
      router.replace("/");
    }
  }, [isInstalled, router]);

  const handleInstall = useCallback(async () => {
    if (isInstalled) {
      router.push("/");
      return;
    }

    if (isIOS) {
      setInstallError(
        "On iPhone, use the Share button in Safari and choose 'Add to Home Screen'."
      );
      return;
    }

    if (!deferredPrompt) {
      setInstallError(
        "Install prompt is not available yet. Try refreshing or open in Chrome/Edge."
      );
      return;
    }

    setInstallError(null);
    setInstalling(true);
    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;

      if (choice.outcome === "dismissed") {
        setInstallError("Install dismissed. You can try again from the browser menu.");
      } else {
        try {
          localStorage.setItem("pwa-installed", "true");
        } catch {}
      }
    } catch (error) {
      setInstallError("Something went wrong while starting the install.");
      console.error("PWA install failed", error);
    } finally {
      setInstalling(false);
      setDeferredPrompt(null);
    }
  }, [deferredPrompt, isIOS, isInstalled, router]);

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <header className="space-y-2">
        <h1 className="text-3xl font-black">Install the Calendar</h1>
        <p className="text-muted-foreground text-sm">
          Add the calendar as a Progressive Web App for fast access and an
          app-like experience.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Ready to install</CardTitle>
          <CardDescription>
            Install once and access the calendar from your home screen, even
            when offline.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg border bg-muted/40 px-4 py-3">
            <p className="text-sm font-semibold">
              Status: {isInstalled ? "Installed" : "Not installed"}
            </p>
            <p className="text-muted-foreground text-sm">
              {isInstalled
                ? "This device already has the calendar installed."
                : "Follow the steps below to install the PWA on this device."}
            </p>
          </div>

          {isIOS ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Install on iPhone</p>
              <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                <li>Open this page in Safari (required by iOS).</li>
                <li>Tap the Share icon in the toolbar.</li>
                <li>Select “Add to Home Screen”.</li>
                <li>Confirm by tapping “Add”.</li>
              </ol>
              <p className="text-xs text-muted-foreground">
                After adding, reopen the app from your home screen for the
                full-screen experience.
              </p>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                When you click install, your browser will prompt you to add the
                calendar to your device.
              </p>
              <p>
                If you do not see a prompt, open the browser menu and choose
                “Install app” or “Add to Home screen”.
              </p>
            </div>
          )}

          {installError && (
            <p className="text-sm font-semibold text-destructive">{installError}</p>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap gap-3">
          <Button
            onClick={handleInstall}
            disabled={installing}
            className="min-w-[180px]"
          >
            {isInstalled
              ? "Open calendar"
              : isIOS
                ? "See iPhone steps"
                : installing
                  ? "Requesting install..."
                  : "Install app"}
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
