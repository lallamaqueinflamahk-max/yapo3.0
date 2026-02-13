"use client";

interface TypingIndicatorProps {
  userName?: string;
  className?: string;
}

export default function TypingIndicator({ userName, className = "" }: TypingIndicatorProps) {
  return (
    <div
      className={`flex items-center gap-2 px-4 py-2 ${className}`}
      role="status"
      aria-label={userName ? `${userName} está escribiendo` : "Escribiendo"}
    >
      <div className="flex gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-yapo-blue/60 [animation-delay:0ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-yapo-blue/60 [animation-delay:150ms]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-yapo-blue/60 [animation-delay:300ms]" />
      </div>
      {userName && (
        <span className="text-xs text-yapo-blue/70">{userName} está escribiendo...</span>
      )}
    </div>
  );
}
