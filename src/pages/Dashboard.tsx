import { BatteryChart, type BatteryPoint } from "@/components/BatteryChart";
import { RobotMap } from "@/components/RobotMap";
import Sidebar from "@/components/Sidebar";
import { StatusCard } from "@/components/StatusCard";
import { Zap, Target, Move, Dock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchLatestTopic, fetchTopicHistory, parsePercentString, fetchRobotPosition } from "@/lib/api";
import { useEffect, useMemo, useState } from "react";

const Dashboard = () => {
  // Intervalo de refresco (ms)
  const refetchMs = 1500;

  // Tópicos por tarjeta
  // Nota: estos nombres deben coincidir con el backend
  const TOPICS = {
    battery: "ros2/battery",
    dockStatus: "ros2/dock",
    velocity: "ros2/velocity",
    goalPose: "ros2/goal",
    position: "ros2/position",
  } as const;

  // Queries para cada tópico
  const batteryQuery = useQuery({
    queryKey: ["latest", TOPICS.battery],
    queryFn: () => fetchLatestTopic<any>(TOPICS.battery),
    refetchInterval: refetchMs,
  });

  // Histórico de batería (últimas 12 horas)
  const batteryHistoryQuery = useQuery({
    queryKey: ["history", TOPICS.battery],
    queryFn: () => fetchTopicHistory<any>(TOPICS.battery),
    refetchInterval: 60_000,
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
    queryKey: ["robot-position"],
    queryFn: () => fetchRobotPosition(),
    refetchInterval: refetchMs,
  });

  // Parse helpers
  // Notas: el backend devuelve { topic: string, data: any, received_at: string }
  // Por ello, extraemos siempre desde "data" cuando esté presente.
  const batteryValue: number | undefined = (() => {
    const d = batteryQuery.data?.data ?? batteryQuery.data;
    return parsePercentString(d?.raw ?? d);
  })();

  const dockValue: string = (() => {
    const d = dockQuery.data?.data ?? dockQuery.data;
    const toEs = (s: string) => {
      const v = s.toLowerCase();
      if (v === "docked") return "Acoplado";
      if (v === "undocked") return "Desacoplado";
      return s;
    };
    if (typeof d === "string") return toEs(d);
    if (typeof d?.raw === "string") return toEs(d.raw);
    if (typeof d?.status === "string") return toEs(d.status);
    return "Desacoplado";
  })();

  const velocityValue: string = (() => {
    const d = velocityQuery.data?.data ?? velocityQuery.data;
    if (typeof d === "number") return d.toFixed(2);
    const v = d?.linear ?? d?.speed ?? d?.v;
    if (typeof v === "number") return v.toFixed(2);
    return "0.00";
  })();

  const goalValue: string = (() => {
    const d = goalQuery.data?.data ?? goalQuery.data;
    const gx = d?.x ?? d?.goal?.x;
    const gy = d?.y ?? d?.goal?.y;
    if (typeof gx === "number" && typeof gy === "number") return `X: ${gx}, Y: ${gy}`;
    return "—";
  })();

  const positionName = positionQuery.data?.position_name ?? 'Desconocida';
  const isMoving = !!positionQuery.data?.is_moving;

  // Serie de batería para el gráfico (construida desde el histórico y actualizada con el latest)
  const initialBatterySeries: BatteryPoint[] = useMemo(() => {
    const recs: any[] = batteryHistoryQuery.data?.records ?? [];
    return recs
      .map((r) => {
        const v = parsePercentString(r?.data?.raw ?? r?.data);
        const t = r?.received_at ? new Date(r.received_at) : undefined;
        return v != null && t
          ? { time: t.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), battery: v }
          : undefined;
      })
      .filter(Boolean) as BatteryPoint[];
  }, [batteryHistoryQuery.data]);

  const [batterySeries, setBatterySeries] = useState<BatteryPoint[]>(initialBatterySeries);

  // Sincroniza con el histórico cuando cambia (primer render o refetch del histórico)
  useEffect(() => {
    setBatterySeries(initialBatterySeries);
  }, [initialBatterySeries]);

  // Al recibir un nuevo valor de batería, añádelo y limita el tamaño máximo de la serie
  useEffect(() => {
    if (batteryValue == null) return;
    const nowLabel = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setBatterySeries((prev) => {
      const last = prev[prev.length - 1];
      // Si el último punto ya tiene el mismo valor, evita duplicar; podrías mejorar con timestamp real si está disponible
      if (last && last.battery === batteryValue) return prev;
      const next = [...prev, { time: nowLabel, battery: batteryValue }];
      const max = batteryHistoryQuery.data?.count && batteryHistoryQuery.data.count > 0 ? batteryHistoryQuery.data.count : 720;
      return next.length > max ? next.slice(next.length - max) : next;
    });
  }, [batteryValue, batteryHistoryQuery.data?.count]);

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
            <RobotMap positionName={positionName} isMoving={isMoving} />
          </div>
          <StatusCard title="Estado del dock" value={dockValue} icon={<Dock />} />

          {/* Resto de tarjetas */}
          <StatusCard title="Velocidad" value={velocityValue} unit="m/s" icon={<Move />} />
          <StatusCard title="Objetivo" value={goalValue} icon={<Target />} status={goalValue !== "—" ? "En ruta" : undefined} />
          {/* Eliminadas: Odometría, Bumper Contact y Waypoints */}
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <BatteryChart data={batterySeries} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;