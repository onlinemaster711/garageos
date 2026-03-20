import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#E5C97B] focus:ring-offset-2 focus:ring-offset-[#0A1A2F]",
  {
    variants: {
      variant: {
        default: "border border-transparent bg-[#E5C97B] text-[#0A1A2F]",
        secondary: "border border-transparent bg-[#3D4450] text-[#E6E6E6]",
        destructive: "border border-transparent bg-red-600 text-[#E6E6E6]",
        outline: "text-[#E6E6E6] border border-[#4A5260]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
