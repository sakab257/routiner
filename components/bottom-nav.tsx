"use client";

import { ChartColumn, House, LayoutGrid, Plus, Settings, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { HabitSheet } from "@/components/habit-sheet";
import { PlusMenu } from "@/components/plus-menu";
import { useUiStore } from "@/lib/ui-store";
import { cn } from "@/lib/utils";

const TABS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "Accueil", icon: House },
  { href: "/modeles", label: "Modèles", icon: LayoutGrid },
  { href: "/activite", label: "Activité", icon: ChartColumn },
  { href: "/reglages", label: "Réglages", icon: Settings },
];

function Tab({ href, label, icon: Icon, active }: (typeof TABS)[number] & { active: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex h-14 w-15 flex-col items-center justify-center gap-[3px] rounded-field transition-colors",
        active ? "text-accent-ink" : "text-ink-60",
      )}
    >
      <Icon className="size-6.5" strokeWidth={active ? 2.4 : 1.8} fill={active && Icon === House ? "currentColor" : "none"} fillOpacity={0.18} />
      <span className="text-chip leading-none">{label}</span>
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const plusOpen = useUiStore((s) => s.plusOpen);
  const setPlusOpen = useUiStore((s) => s.setPlusOpen);
  const visible = TABS.some((t) => t.href === pathname);

  // Close the overlay when navigating away.
  useEffect(() => setPlusOpen(false), [pathname, setPlusOpen]);

  return (
    <>
      {visible && (
        <>
          <PlusMenu />
          <nav
            aria-label="Navigation principale"
            className="fixed inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+16px)] z-40 mx-auto w-[calc(100%-32px)] max-w-112"
          >
            <div className="flex h-18 items-center justify-between rounded-[36px] border border-line bg-surface px-2 shadow-card">
              <Tab {...TABS[0]} active={pathname === TABS[0].href} />
              <Tab {...TABS[1]} active={pathname === TABS[1].href} />
              <button
                type="button"
                aria-label={plusOpen ? "Fermer le menu" : "Ajouter"}
                aria-expanded={plusOpen}
                onClick={() => setPlusOpen(!plusOpen)}
                className="flex size-15 shrink-0 items-center justify-center rounded-full bg-gradient-fab text-white transition-transform active:scale-[0.92]"
              >
                <Plus
                  className={cn("size-7.5 transition-transform duration-200", plusOpen && "rotate-45")}
                  strokeWidth={2.6}
                />
              </button>
              <Tab {...TABS[2]} active={pathname === TABS[2].href} />
              <Tab {...TABS[3]} active={pathname === TABS[3].href} />
            </div>
          </nav>
        </>
      )}
      <HabitSheet />
    </>
  );
}
