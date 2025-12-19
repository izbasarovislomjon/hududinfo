import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: "default" | "success" | "warning" | "info" | "destructive";
}

const variantStyles = {
  default: "bg-card",
  success: "bg-success/5 border-success/20",
  warning: "bg-warning/5 border-warning/20",
  info: "bg-info/5 border-info/20",
  destructive: "bg-destructive/5 border-destructive/20",
};

const iconStyles = {
  default: "bg-primary/10 text-primary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend,
  variant = "default" 
}: StatCardProps) {
  return (
    <div className={cn(
      "stat-card flex flex-col",
      variantStyles[variant]
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn(
          "flex h-11 w-11 items-center justify-center rounded-lg",
          iconStyles[variant]
        )}>
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium rounded-full px-2 py-1",
            trend.isPositive 
              ? "bg-success/10 text-success" 
              : "bg-destructive/10 text-destructive"
          )}>
            <span>{trend.isPositive ? "+" : ""}{trend.value}%</span>
          </div>
        )}
      </div>
      
      <div className="mt-auto">
        <p className="text-sm text-muted-foreground mb-1">{title}</p>
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
