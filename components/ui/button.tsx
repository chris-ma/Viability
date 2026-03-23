import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#1C0F07] text-white hover:bg-[#1C0F07]/80 focus-visible:ring-[#1C0F07]",
        destructive: "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500",
        outline: "border-2 border-[#F2D9C0] bg-white hover:bg-[#FBF7F0] hover:border-[#E8A44A]/60 focus-visible:ring-[#1C0F07]",
        secondary: "bg-[#F2D9C0] text-[#1C0F07] hover:bg-[#F2D9C0]/70 focus-visible:ring-[#E8A44A]",
        ghost: "hover:bg-[#F2D9C0]/60 hover:text-[#1C0F07] focus-visible:ring-[#E8A44A]",
        link: "text-[#1C0F07] underline-offset-4 hover:underline focus-visible:ring-[#1C0F07]",
        green: "bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-600",
        amber: "bg-amber-500 text-white hover:bg-amber-600 focus-visible:ring-amber-500",
        blue: "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600",
        red: "bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-600",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
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
