import React, { useState } from "react";
import { BatteryChart } from "@/components/BatteryChart";
import { RobotMap } from "@/components/RobotMap";
import Sidebar from "@/components/Sidebar";
import { StatusCard } from "@/components/StatusCard";
import { ListCard } from "@/components/ListCard";
import { Zap, Move, Dock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectItem, SelectTrigger, SelectContent } from "@/components/ui/select";
import { Alert } from "@/components/ui/alert";

const Control: React.FC = () => {
  // Estados simulados para el prototipo
  const [speed, setSpeed] = useState(50);
  const [direction, setDirection] = useState("forward");
  const [mode, setMode] = useState("auto");
  const [emergency, setEmergency] = useState(false);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatusCard title="Nivel de Batería" value={80} unit="%" icon={<Zap />} status="Cargando" />
        <StatusCard title="Velocidad" value="0.3" unit="m/s" icon={<Move />} status="Atrás" />
        <StatusCard title="Estado de Dock" value="Acoplado" icon={<Dock />} />
        <StatusCard title="Contacto de Parachoques" value="Sí" icon={<Shield />} />

        {/* Controles */}
        <div className="mb-8 col-span-1 md:col-span-2 lg:col-span-3">
          <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-6">
            <h2 className="text-lg font-semibold mb-2">Controles de Movimiento</h2>
            <div>
              <label className="block text-sm mb-2">Velocidad</label>
              <Slider
                min={0}
                max={100}
                value={[speed]}
                onValueChange={([val]) => setSpeed(val)}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">Actual: {speed}%</span>
            </div>
            <div>
              <label className="block text-sm mb-2">Dirección</label>
              <Select value={direction} onValueChange={setDirection}>
                <SelectTrigger className="w-full" />
                <SelectContent>
                  <SelectItem value="forward">Adelante</SelectItem>
                  <SelectItem value="backward">Atrás</SelectItem>
                  <SelectItem value="left">Izquierda</SelectItem>
                  <SelectItem value="right">Derecha</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Modo de Operación */}
        <div className="mb-8 col-span-1 md:col-span-2 lg:col-span-3">
          <div className="bg-card rounded-lg border border-border p-6 shadow-card space-y-6">
            <h2 className="text-lg font-semibold mb-2">Modo de Operación</h2>
            <Select value={mode} onValueChange={setMode}>
              <SelectTrigger className="w-full" />
              <SelectContent>
                <SelectItem value="auto">Automático</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="standby">Standby</SelectItem>
              </SelectContent>
            </Select>
            <div className="mt-6">
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setEmergency(true)}
              >
                Parada de Emergencia
              </Button>
              {emergency && (
                <Alert variant="destructive" className="mt-4">
                  ¡Parada de emergencia activada!
                </Alert>
              )}
            </div>
          </div>
        </div>

        {/* Visualizaciones */}
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <div className="bg-card rounded-lg border border-border p-6 shadow-card">
            <h2 className="text-lg font-semibold mb-4">Histórico de Batería</h2>
            <BatteryChart />
          </div>
        </div>
        <div className="col-span-1 md:col-span-2 lg:col-span-3">
          <div className="bg-card rounded-lg border border-border p-6 shadow-card">
            <h2 className="text-lg font-semibold mb-4">Ubicación Actual</h2>
            <RobotMap
              position={{ x: 45, y: 30 }}
              destination={{ x: 70, y: 60 }}
              status={mode === "auto" ? "guiding" : "idle"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Control;