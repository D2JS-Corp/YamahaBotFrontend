import React from "react";
import { Card } from "@/components/ui/card";

interface ListCardProps {
  title: string;
  items: Array<string | React.ReactNode>;
  icon?: React.ReactNode;
}

export const ListCard: React.FC<ListCardProps> = ({ title, items, icon }) => (
  <Card className="bg-card rounded-lg border border-border p-6 shadow-card">
    <div className="flex items-center space-x-3 mb-2">
      {icon}
      <h3 className="text-sm text-muted-foreground">{title}</h3>
    </div>
    <ul className="list-disc ml-5 space-y-1">
      {items.map((item, idx) => (
        <li key={idx} className="text-foreground text-sm">{item}</li>
      ))}
    </ul>
  </Card>
);