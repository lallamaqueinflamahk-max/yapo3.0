"use client";

import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "red" | "blue" | "white";

const variantClasses: Record<
  ButtonVariant,
  string
> = {
  red:
    "bg-yapo-red text-yapo-white border-yapo-red active:bg-yapo-red-dark",
  blue:
    "bg-yapo-blue text-yapo-white border-yapo-blue active:bg-yapo-blue-dark",
  white:
    "bg-yapo-white text-yapo-blue border-yapo-blue active:bg-yapo-blue/10",
};

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  children: React.ReactNode;
};

export default function Button({
  variant = "red",
  className = "",
  onClick,
  children,
  ...props
}: ButtonProps) {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    console.log("[Button] click");
    onClick?.(e);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl border-2 px-6 py-3 text-base font-semibold
        transition-[transform,background] active:scale-[0.98]
        disabled:opacity-50 disabled:active:scale-100
        ${variantClasses[variant]} ${className}
      `.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
