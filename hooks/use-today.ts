"use client";

import { useEffect, useState } from "react";
import { todayKey, type DayKey } from "@/lib/date";

/** Today's local day key, refreshed when the app comes back to the foreground or midnight passes. */
export function useToday(): DayKey {
  const [today, setToday] = useState(() => todayKey());
  useEffect(() => {
    const refresh = () => setToday(todayKey());
    const timer = window.setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, []);
  return today;
}
