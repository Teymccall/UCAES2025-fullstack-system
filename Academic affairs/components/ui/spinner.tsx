import React from "react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  className?: string;
}

export function Spinner({ className }: SpinnerProps) {
  return (
    <div className={cn("spinner", className)} aria-label="Loading"></div>
  );
}

export function SpinnerContainer({ children, className }: { children?: React.ReactNode, className?: string }) {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-4", className)}>
      <Spinner />
      {children && <div className="text-muted-foreground text-sm">{children}</div>}
    </div>
  );
} 