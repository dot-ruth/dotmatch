"use client";

import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl bg-surface-warm dark:bg-surface-dark-warm border border-border dark:border-border-dark transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
}
