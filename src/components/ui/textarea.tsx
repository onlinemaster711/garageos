import * as React from "react"
import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "flex min-h-[80px] w-full rounded-lg border border-[#4A5260] bg-[#3D4450] px-3 py-2 text-sm text-[#E6E6E6] placeholder:text-[#3D4450] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E5C97B] focus-visible:ring-offset-2 focus-visible:ring-offset-[#0A1A2F] disabled:cursor-not-allowed disabled:opacity-50 resize-none",
        className
      )}
      ref={ref}
      {...props}
    />
  )
)
Textarea.displayName = "Textarea"

export { Textarea }
