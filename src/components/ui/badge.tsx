import * as React from "react";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | string;
}

export const Badge = ({ className = "", variant = "default", ...props }: BadgeProps) => {
  let variantStyles = "bg-indigo-500/10 text-indigo-400 border-indigo-500/20";
  if (variant === "secondary") variantStyles = "bg-white/10 text-slate-300 border-white/10";
  else if (variant === "destructive") variantStyles = "bg-rose-500/10 text-rose-400 border-rose-500/20";
  else if (variant === "outline") variantStyles = "text-slate-200 border-white/20";
  else if (variant === "success") variantStyles = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none ${variantStyles} ${className}`}
      {...props}
    />
  );
};
