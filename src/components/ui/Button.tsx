"use client";

import { type ButtonHTMLAttributes } from "react";

type ButtonVariant = "red" | "blue" | "white";

const variantClasses: Record<
  ButtonVariant,
  string
> = {
  red:
    "bg-yapo-cta text-yapo-white border-2 border-yapo-cta shadow-md hover:bg-yapo-cta-hover hover:shadow-lg hover:border-yapo-cta-hover",
  blue:
    "bg-yapo-blue text-yapo-white border-2 border-yapo-blue shadow-md hover:bg-yapo-blue-dark hover:shadow-lg hover:border-yapo-blue-dark",
  white:
    "bg-yapo-white text-yapo-blue border-2 border-yapo-blue shadow-sm hover:bg-yapo-blue-light/50 hover:shadow-md hover:border-yapo-blue-dark",
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
        btn-interactive inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-xl px-6 py-3 text-base font-semibold
        disabled:opacity-50 disabled:pointer-events-none
        ${variantClasses[variant]} ${className}
      `.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
