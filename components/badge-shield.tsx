import { cn } from "@/lib/utils";

/** Gold shield badge from the success screen; greyed out when locked. */
export function BadgeShield({ days, size = "sm", locked = false }: { days: number; size?: "sm" | "lg"; locked?: boolean }) {
  const lg = size === "lg";
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        lg ? "h-44.5 w-39 rounded-[44px_44px_78px_78px] border-10" : "h-20 w-17.5 rounded-[20px_20px_36px_36px] border-[5px]",
        locked
          ? "border-track bg-track text-ink-40"
          : "border-[#FFD52E] bg-[linear-gradient(160deg,#FFE680_0%,#FFC400_70%)] text-[#C47800]",
      )}
    >
      <span className={cn("leading-none font-extrabold", lg ? "text-[72px]" : "text-[28px]")}>{days}</span>
      <span className={cn("font-extrabold", lg ? "text-xs tracking-[2px]" : "text-[8px] tracking-[1px]")}>JOURS</span>
    </div>
  );
}
