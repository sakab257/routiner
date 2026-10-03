import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/60 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-brand-600 active:bg-brand-600 disabled:bg-brand-300 disabled:opacity-80",
        outline: "border-line bg-surface text-ink hover:bg-soft active:bg-soft",
        soft: "bg-soft text-accent-ink hover:brightness-95",
        secondary: "bg-track text-ink hover:brightness-95",
        ghost: "text-ink hover:bg-soft",
        destructive: "bg-fail-soft text-fail-ink hover:brightness-95",
        white: "bg-white text-brand hover:bg-brand-50 active:bg-brand-50",
        link: "text-accent-ink underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 gap-2 rounded-tile px-4 text-sm",
        sm: "h-9 gap-1.5 rounded-xl px-3 text-sm",
        lg: "h-14 gap-2 rounded-[28px] px-6 text-base font-bold",
        icon: "size-11 rounded-tile",
        "icon-sm": "size-9 rounded-xl [&_svg:not([class*='size-'])]:size-4",
        "icon-lg": "size-12 rounded-field [&_svg:not([class*='size-'])]:size-5.5",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
