"use client";

import Link from "next/link";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string | null;
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

const sizeClasses = { sm: "h-8 w-8 text-xs", md: "h-10 w-10 text-sm", lg: "h-14 w-14 text-lg" };

export default function Avatar({ src, alt = "", name, size = "md", href, className = "" }: AvatarProps) {
  const initials = name
    ? name.trim().split(/\s+/).map((s) => s[0]).join("").toUpperCase().slice(0, 2)
    : "?";
  const content = (
    <span
      className={`inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-yapo-blue/20 bg-yapo-blue/10 font-semibold text-yapo-blue ${sizeClasses[size]} ${className}`}
      role="img"
      aria-label={alt || name || "Avatar"}
    >
      {src ? (
        <img src={src} alt="" className="h-full w-full object-cover" />
      ) : (
        <span>{initials}</span>
      )}
    </span>
  );
  if (href) return <Link href={href}>{content}</Link>;
  return content;
}
