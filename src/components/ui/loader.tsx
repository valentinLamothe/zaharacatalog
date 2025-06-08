import { cn } from "@/lib/utils"

interface LoaderProps {
  size?: "small" | "medium" | "large"
  className?: string
}

export function Loader({ size = "medium", className }: LoaderProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div
        className={cn(
          "relative",
          size === "small" && "w-6 h-6",
          size === "medium" && "w-10 h-10",
          size === "large" && "w-16 h-16",
        )}
      >
        <div
          className={cn(
            "absolute inset-0 border-t-2 border-zinc-300 rounded-full animate-spin",
            size === "small" && "border-t-2",
            size === "medium" && "border-t-2",
            size === "large" && "border-t-3",
          )}
        ></div>
        <div
          className={cn(
            "absolute inset-0 border-t-2 border-zinc-800 rounded-full opacity-20",
            size === "small" && "border-2",
            size === "medium" && "border-2",
            size === "large" && "border-3",
          )}
        ></div>
      </div>
    </div>
  )
}

