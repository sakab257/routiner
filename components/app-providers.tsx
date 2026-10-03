"use client";

import { SerwistProvider } from "@serwist/turbopack/react";
import { MotionConfig } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { BadgeCelebration } from "@/components/badge-celebration";
import { BottomNav } from "@/components/bottom-nav";
import { Logo } from "@/components/logo";
import { ThemeSync } from "@/components/theme-sync";
import { Toaster } from "@/components/ui/sonner";
import "@/lib/install";
import { useAppStore } from "@/lib/store";

const ONBOARDING_PATH = "/bienvenue";

function AppGate({ children }: { children: ReactNode }) {
  const hydrated = useAppStore((s) => s.hydrated);
  const onboarded = useAppStore((s) => s.onboarded);
  const pathname = usePathname();
  const router = useRouter();
  const misplaced = hydrated && !onboarded && pathname !== ONBOARDING_PATH;

  useEffect(() => {
    void useAppStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (misplaced) router.replace(ONBOARDING_PATH);
  }, [misplaced, router]);

  if (!hydrated || misplaced) {
    // Shown only for the few ms localStorage takes to load; fades in if it ever takes longer.
    return (
      <div className="flex min-h-dvh items-center justify-center bg-bg">
        <Logo alt="Routiner" className="h-12 animate-in fade-in delay-300 duration-500 fill-mode-backwards" />
      </div>
    );
  }
  return children;
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SerwistProvider swUrl="/serwist/sw.js" disable={process.env.NODE_ENV !== "production"}>
      <ThemeSync />
      <MotionConfig reducedMotion="user">
      <AppGate>
        <div className="mx-auto min-h-dvh w-full max-w-120 overflow-x-clip bg-bg">{children}</div>
        <BottomNav />
        <BadgeCelebration />
      </AppGate>
      </MotionConfig>
      <Toaster position="top-center" offset={{ top: "calc(env(safe-area-inset-top) + 12px)" }} />
    </SerwistProvider>
  );
}
