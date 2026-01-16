"use client";

import { cn } from "@/lib/utils";

type GlowTextProps = {
  children: React.ReactNode;
  className?: string;
  variant?: "primary" | "accent" | "white";
};

export function GlowText({
  children,
  className,
  variant = "primary",
}: GlowTextProps) {
  const variants = {
    primary: "text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]",
    accent: "text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]",
    white: "text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]",
  };

  return <span className={cn(variants[variant], className)}>{children}</span>;
}