import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}

export default function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  const styles =
    variant === "secondary"
      ? "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      : "bg-blue-600 text-white hover:bg-blue-700";

  return (
    <button
      className={`min-h-11 w-full rounded-xl px-4 py-3 text-sm font-semibold transition sm:w-auto ${styles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
