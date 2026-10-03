import { STORAGE_KEY, type ThemePreference } from "@/lib/schema";

export const THEME_COLORS = { light: "#F6F9FF", dark: "#0A0B1A" } as const;

/**
 * Inline <head> script: applies the persisted theme before first paint so a
 * dark-mode user never sees a light flash while the store rehydrates.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(
  STORAGE_KEY,
)})||"null");var t=(s&&s.state&&s.state.settings&&s.state.settings.theme)||"system";var d=t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches);document.documentElement.classList.toggle("dark",d)}catch(e){}})()`;

export function resolveTheme(pref: ThemePreference, systemDark: boolean): "light" | "dark" {
  if (pref === "system") return systemDark ? "dark" : "light";
  return pref;
}

export function applyTheme(theme: "light" | "dark") {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    meta.setAttribute("content", THEME_COLORS[theme]);
  });
}
