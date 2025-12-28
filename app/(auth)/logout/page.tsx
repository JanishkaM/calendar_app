'use client';
import LoadingIcon from "@/components/loading-icon";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LogoutPage =  () => {
    const router = useRouter();
    useEffect(() => {
        setTimeout(()=> router.push("/"), 2000);
    }, []);
  return <LoadingIcon />;
};

export default LogoutPage;