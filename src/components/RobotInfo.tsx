import { Card } from "@/components/ui/card";
import { Bot, Wifi, Users, Clock } from "lucide-react";
import { StatCard } from "./StatCard";

interface RobotInfoProps {
  robotId?: string;
  uptime?: string;
  visitorsServed?: number;
  connectionStatus?: 'connected' | 'weak' | 'disconnected';
}

export const RobotInfo = ({
  robotId = "YMH-BOT-001",
  uptime = "8h 42m",
  visitorsServed = 23,
  connectionStatus = 'connected'
}: RobotInfoProps) => {
  const getConnectionStatus = () => {
    switch (connectionStatus) {
      case 'connected': return { status: 'success', label: 'Conectado' };
      case 'weak': return { status: 'warning', label: 'Señal débil' };
      case 'disconnected': return { status: 'destructive', label: 'Desconectado' };
      default: return { status: 'default', label: 'Desconocido' };
    }
  };

  const connection = getConnectionStatus();

  return (
    <div className="space-y-4">
      {/* Información principal del robot */}
      <Card className="bg-gradient-card border-primary/20 backdrop-blur-sm">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-primary/20 to-primary-glow/20 rounded-lg">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Yamaha MuseBot</h3>
              <p className="text-sm text-muted-foreground">ID: {robotId}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Modelo:</span>
              <span className="ml-2 font-medium">YMH-Guide-2024</span>
            </div>
            <div>
              <span className="text-muted-foreground">Versión:</span>
              <span className="ml-2 font-medium">v2.1.3</span>
            </div>
            <div>
              <span className="text-muted-foreground">Última actualización:</span>
              <span className="ml-2 font-medium">Hoy, 09:15</span>
            </div>
            <div>
              <span className="text-muted-foreground">Próximo mantenimiento:</span>
              <span className="ml-2 font-medium">En 5 días</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats cards en grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Tiempo activo"
          value={uptime}
          icon={Clock}
          status="success"
        />
        
        <StatCard
          title="Visitantes atendidos"
          value={visitorsServed.toString()}
          icon={Users}
          trend="Hoy"
          status="default"
        />
        
        <StatCard
          title="Conexión"
          value={connection.label}
          icon={Wifi}
          status={connection.status as any}
        />
      </div>
    </div>
  );
};