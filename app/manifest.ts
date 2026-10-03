import type { MetadataRoute } from "next";
import { THEME_COLORS } from "@/lib/theme";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Routiner — suivi d'habitudes",
    short_name: "Routiner",
    description: "Suivi d'habitudes personnel, hors ligne, sans compte.",
    lang: "fr",
    dir: "ltr",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: THEME_COLORS.light,
    theme_color: THEME_COLORS.light,
    categories: ["health", "lifestyle", "productivity"],
    icons: [
      { src: "/icons/app-icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/app-icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/app-icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "Nouvelle habitude", url: "/habitudes/nouvelle", icons: [{ src: "/icons/app-icon-192.png", sizes: "192x192" }] },
      { name: "Activité", url: "/activite", icons: [{ src: "/icons/app-icon-192.png", sizes: "192x192" }] },
    ],
  };
}
