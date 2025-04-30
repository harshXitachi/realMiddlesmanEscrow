import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type GlassmorphicCardProps = {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
};

export function GlassmorphicCard({ children, className, onClick }: GlassmorphicCardProps) {
  return (
    <div 
      className={cn(
        "glassmorphism rounded-xl p-6", 
        onClick && "cursor-pointer hover:shadow-xl transition-shadow duration-300",
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
