"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useAppStore } from "@/lib/store";
import { applyTheme, resolveTheme } from "@/lib/theme";

const QUERY = "(prefers-color-scheme: dark)";

function subscribe(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const systemDark = () => window.matchMedia(QUERY).matches;

export function useResolvedTheme(): "light" | "dark" {
  const pref = useAppStore((s) => s.settings.theme);
  const dark = useSyncExternalStore(subscribe, systemDark, () => false);
  return resolveTheme(pref, dark);
}

/** Keeps the <html> class and theme-color meta in sync with the chosen theme. */
export function ThemeSync() {
  const hydrated = useAppStore((s) => s.hydrated);
  const theme = useResolvedTheme();
  useEffect(() => {
    // Before rehydration the inline head script has already applied the stored theme.
    if (hydrated) applyTheme(theme);
  }, [hydrated, theme]);
  return null;
}
