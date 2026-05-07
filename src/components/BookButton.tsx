"use client";

import Link from "next/link";

type Props = {
  serviceTitle?: string; // when set, will prefill the booking description
  variant?: "primary" | "secondary";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  label?: string;
};

export default function BookButton({
  serviceTitle,
  variant = "primary",
  size = "md",
  fullWidth = false,
  label = "Book Appointment",
}: Props) {
  const sizePad: Record<string, string> = {
    sm: "px-4 py-1.5 text-[14px]",
    md: "px-5 py-2.5 text-[15px]",
    lg: "px-7 py-3 text-[17px]",
  };
  const base = variant === "primary" ? "btn-primary" : "btn-secondary";
  const cls = `${base} ${sizePad[size]} ${fullWidth ? "w-full" : ""}`;

  const href = serviceTitle
    ? `/book?service=${encodeURIComponent(serviceTitle)}`
    : "/book";

  return (
    <Link href={href} className={cls}>
      {label}
    </Link>
  );
}
