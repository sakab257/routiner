import { create } from "zustand";
import type { HabitKind } from "@/lib/schema";

/** Ephemeral UI state shared between the bottom nav and the screens (not persisted). */
interface UiState {
  plusOpen: boolean;
  sheet: HabitKind | null;
  setPlusOpen: (open: boolean) => void;
  openSheet: (kind: HabitKind | null) => void;
}

export const useUiStore = create<UiState>()((set) => ({
  plusOpen: false,
  sheet: null,
  setPlusOpen: (plusOpen) => set({ plusOpen }),
  openSheet: (sheet) => set({ sheet, plusOpen: false }),
}));
