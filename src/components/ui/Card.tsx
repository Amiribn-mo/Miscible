import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-xl border bg-white dark:bg-neutral-900 ${className}`}
    >
      {children}
    </div>
  );
}
