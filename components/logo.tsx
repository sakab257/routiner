import Image from "next/image";
import { cn } from "@/lib/utils";

const SRC = { blue: "/icons/logo-blue.png", white: "/icons/logo-white.png" } as const;
// Intrinsic size of the logo files (400×285).
const WIDTH = 400;
const HEIGHT = 285;

/**
 * Official Routiner logo. `brand` is blue on light backgrounds and switches to
 * white in dark mode; `white` is for coloured backgrounds (splash, gradients).
 * Size it with a height class (e.g. `h-13`); the width follows the ratio.
 * Served unoptimized so the PNGs come straight from the precached /public files offline.
 */
export function Logo({
  className,
  tone = "brand",
  alt = "",
}: {
  className?: string;
  tone?: "brand" | "white";
  alt?: string;
}) {
  const classes = cn("w-auto shrink-0 select-none", className);
  if (tone === "white") {
    return <Image src={SRC.white} width={WIDTH} height={HEIGHT} alt={alt} unoptimized priority className={classes} />;
  }
  return (
    <>
      <Image src={SRC.blue} width={WIDTH} height={HEIGHT} alt={alt} unoptimized priority className={cn(classes, "dark:hidden")} />
      <Image
        src={SRC.white}
        width={WIDTH}
        height={HEIGHT}
        alt={alt}
        unoptimized
        priority
        className={cn(classes, "hidden dark:block")}
      />
    </>
  );
}
