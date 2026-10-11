import * as React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | string;
  size?: "default" | "sm" | "lg" | "icon" | string;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "default", size = "default", asChild = false, children, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:pointer-events-none disabled:opacity-50 rounded-xl";
    
    let variantStyles = "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm";
    if (variant === "outline") variantStyles = "border border-white/10 bg-transparent hover:bg-white/5 text-slate-100";
    else if (variant === "ghost") variantStyles = "hover:bg-white/10 text-slate-200";
    else if (variant === "secondary") variantStyles = "bg-white/10 text-white hover:bg-white/20";
    else if (variant === "destructive") variantStyles = "bg-rose-600 text-white hover:bg-rose-500";
    else if (variant === "link") variantStyles = "text-indigo-400 underline-offset-4 hover:underline p-0";

    let sizeStyles = "h-10 px-4 py-2 text-sm";
    if (size === "sm") sizeStyles = "h-8 px-3 text-xs";
    else if (size === "lg") sizeStyles = "h-12 px-6 text-base";
    else if (size === "icon") sizeStyles = "h-10 w-10 p-2";

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
