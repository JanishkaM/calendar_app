"use client";

import { usePWAStatus } from "@/utils/CheckPWA";
import { LoginForm } from "./components/LoginForm";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingIcon from "@/components/loading-icon";

export default function LoginPage() {
  const router = useRouter();
  const { isInstalled, isReady } = usePWAStatus({ redirectToInstall: false });

  useEffect(() => {
    if (isReady && !isInstalled) {
      router.replace("/install");
    }
  }, [isInstalled, isReady, router]);

  if (!isReady || !isInstalled) {
    return <LoadingIcon />;
  }

  return (
    <main className="w-full min-h-[80vh] grid place-items-center px-3">
      <LoginForm />
    </main>
  );
}