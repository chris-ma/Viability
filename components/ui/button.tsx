import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] select-none",
  {
    variants: {
      variant: {
        default:     "bg-[#1D1D1F] text-white shadow-sm hover:bg-black hover:shadow-md focus-visible:ring-[#1D1D1F]",
        destructive: "bg-red-500 text-white shadow-sm hover:bg-red-600 hover:shadow-md focus-visible:ring-red-500",
        outline:     "border border-[#D2D2D7] bg-white hover:bg-[#F5F5F7] hover:border-[#AEAEB2] text-[#1D1D1F] focus-visible:ring-[#1D1D1F]",
        secondary:   "bg-[#F5F5F7] text-[#1D1D1F] hover:bg-[#E8E8ED] focus-visible:ring-[#1D1D1F]",
        ghost:       "hover:bg-[#F5F5F7] text-[#6E6E73] hover:text-[#1D1D1F] focus-visible:ring-[#1D1D1F]",
        link:        "text-[#0071E3] underline-offset-4 hover:underline focus-visible:ring-[#0071E3]",
        green:       "bg-green-600 text-white shadow-sm hover:bg-green-700 hover:shadow-md focus-visible:ring-green-600",
        amber:       "bg-amber-500 text-white shadow-sm hover:bg-amber-600 hover:shadow-md focus-visible:ring-amber-500",
        blue:        "bg-[#0071E3] text-white shadow-sm hover:bg-[#0077ED] hover:shadow-md focus-visible:ring-[#0071E3]",
        red:         "bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md focus-visible:ring-red-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm:      "h-8 rounded-md px-3 text-xs",
        lg:      "h-11 rounded-xl px-7 text-[15px]",
        xl:      "h-13 rounded-xl px-9 text-base",
        icon:    "h-10 w-10",
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
