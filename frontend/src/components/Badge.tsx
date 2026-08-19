"use client";

import { ReactNode } from "react";

type BadgeVariant = "default" | "forest" | "ember" | "muted";

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-surface-warm dark:bg-surface-dark-warm border border-border dark:border-border-dark text-muted dark:text-muted-dark",
  forest: "bg-forest/10 dark:bg-forest-muted/10 text-forest dark:text-forest-muted border border-forest/20 dark:border-forest-muted/20",
  ember: "bg-ember/10 dark:bg-ember-muted/10 text-ember dark:text-ember-muted border border-ember/20 dark:border-ember-muted/20",
  muted: "bg-surface-deep dark:bg-surface-dark-deep text-muted dark:text-muted-dark border border-transparent",
};

export default function Badge({ children, variant = "default", className = "" }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-mono transition-colors ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
