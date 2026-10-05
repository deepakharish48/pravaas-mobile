import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
}

export default function Card({
  children,
  className = "",
}: CardProps) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}
