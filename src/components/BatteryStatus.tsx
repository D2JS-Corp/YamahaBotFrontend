import { Battery, BatteryLow, BatteryWarning } from "lucide-react";
import { Card } from "@/components/ui/card";

interface BatteryStatusProps {
  percentage: number;
  isCharging?: boolean;
  voltage?: number;
  temperature?: number;
}

export const BatteryStatus = ({ 
  percentage, 
  isCharging = false, 
  voltage = 12.4,
  temperature = 25 
}: BatteryStatusProps) => {
  const getBatteryIcon = () => {
    if (percentage <= 10) return BatteryLow;
    if (percentage <= 25) return BatteryWarning;
    return Battery;
  };

  const getBatteryColor = () => {
    if (percentage <= 10) return 'text-destructive';
    if (percentage <= 25) return 'text-warning';
    return 'text-success';
  };

  const getBatteryGradient = () => {
    if (percentage <= 10) return 'from-destructive to-destructive/80';
    if (percentage <= 25) return 'from-warning to-warning/80';
    return 'from-success to-success/80';
  };

  const BatteryIcon = getBatteryIcon();

  return (
    <Card className="bg-gradient-card border-primary/20 shadow-battery backdrop-blur-sm">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <BatteryIcon className={`h-6 w-6 ${getBatteryColor()}`} />
            <h3 className="text-lg font-semibold">Batería</h3>
            {isCharging && (
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <span className="text-xs text-primary">Cargando</span>
              </div>
            )}
          </div>
          <span className={`text-2xl font-bold ${getBatteryColor()}`}>
            {percentage}%
          </span>
        </div>

        {/* Battery Visual */}
        <div className="relative mb-4">
          <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full bg-gradient-to-r ${getBatteryGradient()} transition-all duration-700 ease-out`}
              style={{ width: `${percentage}%` }}
            >
              <div className="w-full h-full bg-gradient-to-r from-white/20 to-transparent"></div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Voltaje:</span>
            <span className="ml-2 font-medium">{voltage}V</span>
          </div>
          <div>
            <span className="text-muted-foreground">Temp:</span>
            <span className="ml-2 font-medium">{temperature}°C</span>
          </div>
        </div>
      </div>
    </Card>
  );
};