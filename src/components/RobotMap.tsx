import { Card } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";

interface RobotMapProps {
  position?: { x: number; y: number };
  destination?: { x: number; y: number };
  status?: 'idle' | 'moving' | 'guiding' | 'charging';
}

export const RobotMap = ({ 
  position = { x: 45, y: 30 },
  destination = { x: 70, y: 60 },
  status = 'guiding'
}: RobotMapProps) => {
  const getStatusColor = () => {
    switch (status) {
      case 'idle': return 'text-muted-foreground';
      case 'moving': return 'text-warning';
      case 'guiding': return 'text-success';
      case 'charging': return 'text-primary';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'idle': return 'En espera';
      case 'moving': return 'Moviéndose';
      case 'guiding': return 'Guiando visita';
      case 'charging': return 'Cargando';
      default: return 'Desconocido';
    }
  };

  return (
    <Card className="bg-card border border-border shadow-card">
      <div className="p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-foreground">Robot Location</h3>
        </div>

        {/* Simplified museum map */}
        <div className="bg-muted/10 rounded-lg p-4 h-64 flex items-center justify-center">
          <div className="w-full h-full relative bg-muted/5 rounded border border-border">
            {/* Map placeholder matching the reference image style */}
            <div className="absolute inset-4 border border-dashed border-muted-foreground/30 rounded flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Current Position: Gallery 3<br />
                  Coordinates: X: {position.x}, Y: {position.y}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};