import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import ThemeTrigger from "@/components/theme-trigger";
import Footer from "@/components/footer";
import { Toaster } from "@/components/ui/sonner";
import CoverImage from "@/components/cover-image";

type RootLayoutProps = {
  children: ReactNode;
};

const metadataBase = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL)
  : undefined;

export const metadata: Metadata = {
  title: "Reliance Calendar",
  applicationName: "Reliance Calendar",
  description: "Calendar with reminders, holidays, and PWA home-screen access.",
  manifest: "/manifest.webmanifest",
  metadataBase,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Reliance Calendar",
    description: "Calendar with reminders, holidays, and PWA home-screen access.",
    type: "website",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Reliance Calendar",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reliance Calendar",
    description: "Calendar with reminders, holidays, and PWA home-screen access.",
    images: ["/og-image.jpg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Reliance Calendar",
  },
  icons: {
    icon: [
      { url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
    ],
    apple: [{ url: "/icons/icon-180.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#8e51ff",
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <ThemeTrigger />
            {children}
            <Footer />
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </>
  );
}
