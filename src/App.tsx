import { useEffect, useMemo } from "react";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import { PipecatClientProvider } from "@pipecat-ai/client-react";
import { PipecatClient } from "@pipecat-ai/client-js";
import { SmallWebRTCTransport } from "@pipecat-ai/small-webrtc-transport";
import { getIceServers, getWebrtcUrl } from "./config";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Control from "./pages/Control";
import RobotPage from "./pages/RobotPage";
import Simulation from "./pages/Simulation";

const queryClient = new QueryClient();

function App() {
  const pipecatClient = useMemo(() => {
    return new PipecatClient({
      transport: new SmallWebRTCTransport(),
      enableCam: false,
      enableMic: true
    })
  }, []);

  useEffect(() => {
    const initClient = async () => {
      try {
        await pipecatClient.disconnect();
        await pipecatClient.connect({
          webrtcUrl: getWebrtcUrl(),
        })
      } catch (error) {
        console.error("Error connecting Pipecat Client:", error);
        alert("Failed to connect to the server.");
      }
    }
    initClient();
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </PipecatClientProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
