import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PipecatClientProvider } from "@pipecat-ai/client-react";
import { PipecatClient } from "@pipecat-ai/client-js";
import { SmallWebRTCTransport } from "@pipecat-ai/small-webrtc-transport";
import { useMemo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Control from "./pages/Control";
import RobotPage from "./pages/RobotPage";
import Simulation from "./pages/Simulation";
import { getIceServers } from "./config";

const queryClient = new QueryClient();

function App() {
  const pipecatClient = useMemo(() => {
    return new PipecatClient({
      transport: new SmallWebRTCTransport(),
      enableCam: false,
      enableMic: true
    })
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PipecatClientProvider client={pipecatClient}>
          <Router>
            <Routes>
              <Route path="/" element={<RobotPage />} />
              <Route path="/dashboard" element={<Index />} />
              <Route path="/control" element={<Control />} />
              <Route path="/simulation" element={<Simulation />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </PipecatClientProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
