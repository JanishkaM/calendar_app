"use client";

import LoadingIcon from "@/components/loading-icon";
import { LoginForm } from "@/components/login/LoginForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePWAStatus } from "@/utils/CheckPWA";

export default function LoginRoute() {
  const router = useRouter();
  // const { isInstalled, isReady } = usePWAStatus({ redirectToInstall: false });

  // useEffect(() => {
  //   if (isReady && !isInstalled) {
  //     router.replace("/install");
  //   }
  // }, [isInstalled, isReady, router]);

  // if (!isReady || !isInstalled) {
  //   return <LoadingIcon />;
  // }

  return (
    <main className="w-full min-h-[80vh] grid place-items-center px-3">
      <LoginForm />
    </main>
  );
}
