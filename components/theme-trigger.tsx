"use client";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Monitor, Moon, Sun } from "lucide-react";

export default function ThemeTrigger() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <Button
      onClick={() =>
        setTheme(
          theme === "dark" ? "light" : theme === "light" ? "system" : "dark"
        )
      }
      size="icon"
      className="fixed z-50 bottom-2 right-2"
    >
      <Sun
        style={theme === "light" ? {opacity: "1"} : { opacity: "0" }}
        className="h-[1.2rem] w-[1.2rem] transition-all absolute"
      />
      <Moon
        style={theme === "dark" ? {opacity: "1"} : { opacity: "0" }}
        className="h-[1.2rem] w-[1.2rem] transition-all absolute"
      />
      <Monitor
        style={theme === "system" ? {opacity: "1"} : { opacity: "0" }}
        className="h-[1.2rem] w-[1.2rem] transition-all absolute"
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
