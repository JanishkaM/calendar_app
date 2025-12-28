export default function manifest() {
  return {
    name: "Reliance Calendar",
    short_name: "Calendar",
    description:
      "Calendar with reminders, holidays, and PWA home-screen access.",
    start_url: "/?source=pwa",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#8e51ff",
    orientation: "portrait-primary",
    scope: "/",
    lang: "en",
    dir: "ltr",
    categories: ["productivity", "utilities"],
    icons: [
      { src: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
      { src: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
      { src: "/icons/icon-48.png", sizes: "48x48", type: "image/png" },
      { src: "/icons/icon-72.png", sizes: "72x72", type: "image/png" },
      { src: "/icons/icon-96.png", sizes: "96x96", type: "image/png" },
      { src: "/icons/icon-128.png", sizes: "128x128", type: "image/png" },
      { src: "/icons/icon-144.png", sizes: "144x144", type: "image/png" },
      { src: "/icons/icon-152.png", sizes: "152x152", type: "image/png" },
      { src: "/icons/icon-167.png", sizes: "167x167", type: "image/png" },
      { src: "/icons/icon-180.png", sizes: "180x180", type: "image/png" },
      { src: "/icons/icon-256.png", sizes: "256x256", type: "image/png" },
      { src: "/icons/icon-1024.png", sizes: "1024x1024", type: "image/png" },
    ],
    related_applications: [],
    prefer_related_applications: false
  };
}