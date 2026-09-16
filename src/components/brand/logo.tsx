import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className, light = false }: { className?: string; light?: boolean }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-teal-500 text-white shadow-sm",
        )}
      >
        <Sparkles className="size-4" />
      </span>
      <span className={cn("font-semibold tracking-tight", light ? "text-white" : "text-foreground")}>
        UPDON
        <span className={cn("ml-1 font-medium", light ? "text-slate-300" : "text-muted-foreground")}>
          AI
        </span>
      </span>
    </div>
  );
}
