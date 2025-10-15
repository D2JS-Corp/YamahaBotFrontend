import { BatteryChart } from "@/components/BatteryChart";
import { RobotMap } from "@/components/RobotMap";
import Sidebar from "@/components/Sidebar";
import { StatusCard } from "@/components/StatusCard";
import { ListCard } from "@/components/ListCard";
import { Zap, Target, Move, Dock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchLatestTopic } from "@/lib/api";

const Dashboard = () => {
  // Intervalo de refresco (ms)
  const refetchMs = 1500;

  // Tópicos por tarjeta
  // Nota: estos nombres deben coincidir con el backend
  const TOPICS = {
    battery: "battery",
    dockStatus: "dock",
    velocity: "velocity",
    goalPose: "goal",
    position: "position",
  } as const;

  // Queries para cada tópico
  const batteryQuery = useQuery({
    queryKey: ["latest", TOPICS.battery],
    queryFn: () => fetchLatestTopic<any>(TOPICS.battery),
    refetchInterval: refetchMs,
  });

  const dockQuery = useQuery({
    queryKey: ["latest", TOPICS.dockStatus],
    queryFn: () => fetchLatestTopic<any>(TOPICS.dockStatus),
    refetchInterval: refetchMs,
  });

  const velocityQuery = useQuery({
    queryKey: ["latest", TOPICS.velocity],
    queryFn: () => fetchLatestTopic<any>(TOPICS.velocity),
    refetchInterval: refetchMs,
  });

  const goalQuery = useQuery({
    queryKey: ["latest", TOPICS.goalPose],
    queryFn: () => fetchLatestTopic<any>(TOPICS.goalPose),
    refetchInterval: refetchMs,
  });

  const positionQuery = useQuery({
    queryKey: ["latest", TOPICS.position],
    queryFn: () => fetchLatestTopic<any>(TOPICS.position),
    refetchInterval: refetchMs,
  });

  // Parse helpers
  const batteryValue: number | undefined =
    typeof batteryQuery.data === "number" ? batteryQuery.data : batteryQuery.data?.percentage ?? batteryQuery.data?.value;

  const dockValue: string =
    typeof dockQuery.data === "string" ? dockQuery.data : dockQuery.data?.status ?? "Desacoplado";

  const velocityValue: string = (() => {
    const d = velocityQuery.data;
    if (typeof d === "number") return d.toFixed(2);
    const v = d?.linear ?? d?.speed ?? d?.v;
    if (typeof v === "number") return v.toFixed(2);
    return "0.00";
  })();

  const goalValue: string = (() => {
    const d = goalQuery.data;
    const gx = d?.x ?? d?.goal?.x;
    const gy = d?.y ?? d?.goal?.y;
    if (typeof gx === "number" && typeof gy === "number") return `X: ${gx}, Y: ${gy}`;
    return "—";
  })();

  const position = (() => {
    const d = positionQuery.data;
    const x = d?.x ?? d?.position?.x;
    const y = d?.y ?? d?.position?.y;
    if (typeof x === "number" && typeof y === "number") return { x, y } as const;
    return undefined;
  })();

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1">
        <header className="border-b border-border bg-card px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">Estado del Robot</h1>
        </header>
        <main className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {/* Primera fila: mapa arriba a la derecha junto a tarjetas */}
          <StatusCard
            title="Nivel de batería"
            value={batteryValue ?? "—"}
            unit={batteryValue != null ? "%" : undefined}
            icon={<Zap />}
            status={batteryQuery.isFetching ? "Actualizando…" : undefined}
          />
          <div className="md:col-start-2 md:row-start-1 lg:col-start-3 lg:row-start-1 lg:row-span-2 self-start">
            <RobotMap position={position ?? { x: 45, y: 30 }} destination={{ x: 70, y: 60 }} status="guiding" />
          </div>
          <StatusCard title="Estado del dock" value={dockValue} icon={<Dock />} />

          {/* Resto de tarjetas */}
          <StatusCard title="Velocidad" value={velocityValue} unit="m/s" icon={<Move />} />
          <StatusCard title="Objetivo" value={goalValue} icon={<Target />} status={goalValue !== "—" ? "En ruta" : undefined} />
          {/* Eliminadas: Odometría, Bumper Contact y Waypoints */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <BatteryChart />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;