import { GlassmorphicCard } from "@/components/ui/GlassmorphicCard";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: string;
  iconBgClass?: string;
  iconClass?: string;
  footer?: ReactNode;
  className?: string;
};

export function StatCard({ 
  title, 
  value, 
  icon, 
  iconBgClass = "gradient-bg", 
  iconClass = "text-white", 
  footer,
  className
}: StatCardProps) {
  return (
    <GlassmorphicCard className={cn("transaction-card", className)}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium">{title}</p>
          <h3 className="text-3xl font-poppins font-bold mt-2">{value}</h3>
        </div>
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", iconBgClass)}>
          <span className={cn("material-icons", iconClass)}>{icon}</span>
        </div>
      </div>
      {footer && (
        <div className="mt-4">
          {footer}
        </div>
      )}
    </GlassmorphicCard>
  );
}
