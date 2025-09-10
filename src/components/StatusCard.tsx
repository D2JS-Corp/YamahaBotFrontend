import React from "react";
import { Card } from "@/components/ui/card";

interface StatusCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  status?: string;
  extra?: React.ReactNode;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  title,
  value,
  unit,
  icon,
  status,
  extra,
}) => (
  <Card className="bg-card rounded-lg border border-border p-6 shadow-card flex flex-col justify-between">
    <div className="flex items-center space-x-3 mb-2">
      {icon}
      <p className="text-sm text-muted-foreground">{title}</p>
    </div>
    <div className="flex items-baseline space-x-2">
      <h3 className="text-2xl font-bold text-foreground">{value}{unit && <span className="text-base font-normal">{unit}</span>}</h3>
      {status && <span className="text-sm text-muted-foreground">{status}</span>}
    </div>
    {extra}
  </Card>
);