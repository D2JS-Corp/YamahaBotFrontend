import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

// Datos de ejemplo para el gráfico
const batteryData = [
  { time: '00:00', battery: 95 },
  { time: '02:00', battery: 88 },
  { time: '04:00', battery: 82 },
  { time: '06:00', battery: 75 },
  { time: '08:00', battery: 68 },
  { time: '10:00', battery: 62 },
  { time: '12:00', battery: 55 },
  { time: '14:00', battery: 48 },
  { time: '16:00', battery: 42 },
  { time: '18:00', battery: 38 },
  { time: '20:00', battery: 35 },
  { time: '22:00', battery: 99 }
];

export const BatteryChart = () => {
  return (
    <Card className="bg-card border border-border shadow-card">
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">Battery Level Over Time</h3>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Battery Level</p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-bold text-foreground">85%</h3>
              <span className="text-sm text-destructive">Last 24 Hours -5%</span>
            </div>
          </div>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={batteryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="time" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                domain={[0, 100]}
                axisLine={false}
                tickLine={false}
                hide
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--card-foreground))'
                }}
                labelFormatter={(value) => `Time: ${value}`}
                formatter={(value) => [`${value}%`, 'Battery']}
              />
              <Line 
                type="monotone" 
                dataKey="battery" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
                activeDot={{ 
                  r: 4, 
                  fill: 'hsl(var(--primary))',
                  stroke: 'hsl(var(--primary))',
                  strokeWidth: 2
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
};