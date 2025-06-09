import { cn } from "@/lib/utils"

interface LoadingDotsProps {
  className?: string
  size?: "sm" | "md" | "lg"
  colorClassName?: string // tailwind color utility for the dot background
}

export function LoadingDots({ className, size = "md", colorClassName = "bg-[#40E0D0]" }: LoadingDotsProps) {
  // Map size prop to Tailwind w/h utilities
  const sizeClasses = {
    sm: "w-1.5 h-1.5",
    md: "w-2.5 h-2.5",
    lg: "w-3.5 h-3.5",
  }[size]

  return (
    <div
      className={cn("flex items-center justify-center space-x-1", className)}
      aria-label="Loading"
      role="status"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={cn(
            "rounded-full animate-bounce",
            sizeClasses,
            colorClassName
          )}
          style={{
            animationDelay: `${i * 0.15}s`,
            animationDuration: '0.8s'
          }}
        />
      ))}
    </div>
  )
} 