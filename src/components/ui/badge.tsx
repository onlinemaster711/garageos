import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:ring-offset-2 focus:ring-offset-[#0A0A0A]",
  {
    variants: {
      variant: {
        default: "border border-transparent bg-[#C9A84C] text-[#0A0A0A]",
        secondary: "border border-transparent bg-[#2A2A2A] text-[#F0F0F0]",
        destructive: "border border-transparent bg-red-600 text-[#F0F0F0]",
        outline: "text-[#F0F0F0] border border-[#333333]",
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
