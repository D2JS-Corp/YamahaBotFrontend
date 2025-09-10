import { Card } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: LucideIcon;
  trend?: string;
  status?: 'success' | 'warning' | 'destructive' | 'default';
  className?: string;
}

export const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  status = 'default',
  className = ""
}: StatCardProps) => {
  const statusColors = {
    success: 'text-success border-success/20 shadow-success/20',
    warning: 'text-warning border-warning/20 shadow-warning/20', 
    destructive: 'text-destructive border-destructive/20 shadow-destructive/20',
    default: 'text-primary border-primary/20 shadow-primary/20'
  };

  return (
    <Card className={`bg-gradient-card border backdrop-blur-sm ${statusColors[status]} ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm font-medium">{title}</p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-bold">{value}</h3>
              {trend && (
                <span className="text-xs text-muted-foreground">{trend}</span>
              )}
            </div>
          </div>
          <div className={`p-3 rounded-lg bg-gradient-to-br from-primary/20 to-primary-glow/20`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </Card>
  );
};