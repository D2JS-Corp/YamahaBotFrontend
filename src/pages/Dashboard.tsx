import { BatteryChart } from "@/components/BatteryChart";
import { RobotMap } from "@/components/RobotMap";
import Sidebar from "@/components/Sidebar";
import { StatusCard } from "@/components/StatusCard";
import { ListCard } from "@/components/ListCard";
import { Zap, MapPin, Target, Shield, Move, Dock, AlertTriangle } from "lucide-react";

const Dashboard = () => {
  // Datos simulados
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1">
        <header className="border-b border-border bg-card px-8 py-6">
          <h1 className="text-3xl font-bold text-foreground">Robot Status</h1>
        </header>
        <main className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatusCard title="Battery Level" value={85} unit="%" icon={<Zap />} status="Normal" />
          <StatusCard title="Dock Status" value="Undocked" icon={<Dock />} />
          <StatusCard title="Velocity" value="0.5" unit="m/s" icon={<Move />} status="Forward" />
          <StatusCard title="Goal Pose" value="X: 12, Y: 7" icon={<Target />} status="En ruta" />
          <StatusCard title="Odometría" value="X: 10, Y: 5, θ: 0.78" icon={<MapPin />} />
          <StatusCard title="Bumper Contact" value="No" icon={<Shield />} />
          <ListCard title="Hazards" items={["Ninguno"]} icon={<AlertTriangle />} />
          <ListCard title="Waypoints" items={["WP1: X: 8, Y: 3", "WP2: X: 12, Y: 7"]} icon={<MapPin />} />
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <BatteryChart />
          </div>
          <div className="col-span-1 md:col-span-2 lg:col-span-3">
            <RobotMap position={{ x: 45, y: 30 }} destination={{ x: 70, y: 60 }} status="guiding" />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;