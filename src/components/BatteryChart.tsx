import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';

export type BatteryPoint = { time: string; battery: number };

interface BatteryChartProps {
  data: BatteryPoint[];
}

export const BatteryChart = ({ data }: BatteryChartProps) => {
  const latest = data?.[data.length - 1]?.battery;
  return (
    <Card className="bg-card border border-border shadow-card">
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-foreground mb-2">Nivel de batería en el tiempo</h3>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Nivel de batería</p>
            <div className="flex items-baseline space-x-2">
              <h3 className="text-2xl font-bold text-foreground">{latest != null ? `${latest}%` : '—'}</h3>
              {/* Espacio reservado para métricas como variación */}
            </div>
          </div>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
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
                labelFormatter={(value) => `Hora: ${value}`}
                formatter={(value) => [`${value}%`, 'Batería']}
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