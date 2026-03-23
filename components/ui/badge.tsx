import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#1D1D1F] text-white",
        secondary: "bg-[#F5F5F7] text-[#1D1D1F]",
        destructive: "bg-red-100 text-red-700 border border-red-200",
        outline: "border border-[#D2D2D7] text-[#6E6E73]",
        green: "bg-green-100 text-green-700 border border-green-200",
        amber: "bg-amber-100 text-amber-700 border border-amber-200",
        blue: "bg-blue-100 text-blue-700 border border-blue-200",
        red: "bg-red-100 text-red-700 border border-red-200",
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
