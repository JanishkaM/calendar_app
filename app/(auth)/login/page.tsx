"use client";

import { usePWAStatus } from "@/utils/CheckPWA";
import { LoginForm } from "./components/LoginForm";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const { isInstalled } = usePWAStatus({ redirectToInstall: false });

  useEffect(() => {
    if (!isInstalled) {
      router.replace("/install");
    }
  }, [isInstalled, router]);

  return (
    <main className="w-full min-h-[80vh] grid place-items-center px-3">
      <LoginForm />
    </main>
  );
}