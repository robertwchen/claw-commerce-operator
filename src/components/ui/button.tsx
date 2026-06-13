import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-[#262521] text-white hover:bg-[#3b3932] focus-visible:outline-[#262521]",
        secondary: "border border-[#d9d2c2] bg-white text-[#262521] hover:bg-[#f1efe8] focus-visible:outline-[#9a7a2f]",
        ghost: "text-[#262521] hover:bg-[#ebe6d8] focus-visible:outline-[#9a7a2f]",
        accent: "bg-[#2f7d68] text-white hover:bg-[#286c5a] focus-visible:outline-[#2f7d68]",
        danger: "bg-[#b85c4d] text-white hover:bg-[#9d4e42] focus-visible:outline-[#b85c4d]",
      },
      size: {
        default: "h-10 px-4",
        sm: "h-8 px-3 text-xs",
        icon: "h-10 w-10 px-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export function buttonClassName(props?: VariantProps<typeof buttonVariants> & { className?: string }) {
  const { className, ...variants } = props ?? {};
  return cn(buttonVariants(variants), className);
}
