import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-[#0A1A2F] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C97B] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#E5C97B] text-[#0A1A2F] hover:bg-[#B8963D] active:bg-[#A78632]",
        secondary: "bg-[#3D4450] text-[#E6E6E6] hover:bg-[#4A5260] active:bg-[#404040]",
        destructive: "bg-red-600 text-[#E6E6E6] hover:bg-red-700 active:bg-red-800",
        outline: "border border-[#4A5260] bg-transparent text-[#E6E6E6] hover:bg-[#2A2D30] active:bg-[#3D4450]",
        ghost: "text-[#E6E6E6] hover:bg-[#2A2D30] active:bg-[#3D4450]",
        link: "text-[#E5C97B] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
