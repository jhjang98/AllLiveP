import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";

type Variant = "primary" | "accent" | "outline";

const styles: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-deep",
  accent: "bg-accent text-white hover:brightness-95",
  outline: "border-[1.5px] border-primary bg-surface text-primary hover:bg-primary-soft",
};

const base =
  "inline-flex min-h-11 items-center justify-center rounded-(--radius-btn) px-6 py-3 text-[17px] font-bold transition";

export function Button({
  variant = "primary",
  full = false,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; full?: boolean }) {
  return (
    <button
      className={`${base} disabled:cursor-not-allowed disabled:opacity-40 ${styles[variant]} ${full ? "w-full" : ""} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  full = false,
  className = "",
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; full?: boolean }) {
  return (
    <Link
      className={`${base} ${styles[variant]} ${full ? "w-full" : ""} ${className}`}
      {...props}
    />
  );
}
