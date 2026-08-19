"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function Card({ children, className = "", hover = false, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl bg-surface-warm dark:bg-surface-dark-warm border border-border dark:border-border-dark transition-all duration-200 ${
        hover ? "hover:border-forest/30 dark:hover:border-forest-muted/30 hover:shadow-card-hover dark:hover:shadow-none cursor-pointer" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
