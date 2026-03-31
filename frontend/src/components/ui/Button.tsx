import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes } from "react";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 font-medium",
    "rounded-lg transition-all duration-150 focus-visible:outline",
    "focus-visible:outline-2 focus-visible:outline-offset-2",
    "focus-visible:outline-primary-500 disabled:pointer-events-none",
    "disabled:opacity-50 select-none whitespace-nowrap",
  ],
  {
    variants: {
      variant: {
        primary:   "bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-sm",
        secondary: "bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300",
        outline:   "border border-border bg-surface text-slate-700 hover:bg-slate-50 active:bg-slate-100",
        ghost:     "text-slate-600 hover:bg-slate-100 active:bg-slate-200",
        danger:    "bg-danger text-white hover:bg-danger-dark shadow-sm",
        link:      "text-primary-600 underline-offset-4 hover:underline p-0 h-auto",
      },
      size: {
        sm:   "h-8  px-3 text-xs",
        md:   "h-9  px-4 text-sm",
        lg:   "h-10 px-5 text-sm",
        xl:   "h-12 px-6 text-base",
        icon: "h-9  w-9",
      },
    },
    defaultVariants: {
      variant: "primary",
      size:    "md",
    },
  }
);

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export function Button({
  className,
  variant,
  size,
  isLoading,
  children,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin h-4 w-4 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}