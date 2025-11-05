import React, { useCallback, useMemo, useState } from "react";
import { usePipecatClientTransportState, useRTVIClientEvent } from "@pipecat-ai/client-react";
import { RTVIEvent } from "@pipecat-ai/client-js";
import { Badge } from "@/components/ui/badge";
import { Plug, Loader2, Wifi, AlertTriangle, PowerOff, Ear, Mic, Brain, Waves, User } from "lucide-react";
import { set } from "date-fns";

type ConversationState = "idle" | "listening" | "thinking" | "responding";

const CONVERSATION_META: Record<ConversationState, { title: string; badge: string; icon: React.ReactNode }> = {
  idle: {
    title: "En espera",
    badge: "bg-gray-50 text-gray-700 border-gray-200",
    icon: <Mic className="w-4 h-4" />,
  },
  listening: {
    title: "Escuchando",
    badge: "bg-blue-100 text-blue-700 border-blue-300",
    icon: <Ear className="w-4 h-4" />,
  },
  thinking: {
    title: "Pensando",
    badge: "bg-yellow-100 text-yellow-700 border-yellow-300 animate-pulse",
    icon: <Brain className="w-4 h-4" />,
  },
  responding: {
    title: "Respondiendo",
    badge: "bg-teal-100 text-teal-700 border-teal-300",
    icon: <Waves className="w-4 h-4" />,
  },
};

const TRANSPORT_META: Record<string, { title: string; badge: string; icon: React.ReactNode }> = {
  disconnected: {
    title: "Desconectado",
    badge: "bg-red-100 text-red-600 border-red-300",
    icon: <PowerOff className="w-4 h-4" />,
  },
  connecting: {
    title: "Conectando",
    badge: "bg-blue-50 text-blue-600 border-blue-200",
    icon: <Loader2 className="w-4 h-4 animate-spin" />,
  },
  ready: {
    title: "Conectado",
    badge: "bg-green-100 text-green-700 border-green-300",
    icon: <Wifi className="w-4 h-4" />,
  },
  connected: {
    title: "Conectado",
    badge: "bg-lime-100 text-lime-700 border-lime-300",
    icon: <Wifi className="w-4 h-4" />,
  },
  failed: {
    title: "Error",
    badge: "bg-orange-100 text-orange-700 border-orange-300",
    icon: <AlertTriangle className="w-4 h-4" />,
  },
  closed: {
    title: "Cerrado",
    badge: "bg-gray-200 text-gray-500 border-gray-300",
    icon: <Plug className="w-4 h-4" />,
  },
};

const ConnectionStatus: React.FC = () => {
  const transportState = usePipecatClientTransportState();
  const [conversationState, setConversationState] = useState<ConversationState>("idle");
  const [userSpeaking, setUserSpeaking] = useState(false);

  // Conversational state listeners
  useRTVIClientEvent(
    RTVIEvent.UserStartedSpeaking,
    useCallback(() => {
      setUserSpeaking(true);
      setConversationState("listening");
    }, [])
  );

  useRTVIClientEvent(
    RTVIEvent.UserStoppedSpeaking,
    useCallback(() => {
      setUserSpeaking(false);
      setConversationState("thinking");
    }, [])
  );

  useRTVIClientEvent(
    RTVIEvent.BotStartedSpeaking,
    useCallback(() => setConversationState("responding"), [])
  );

  useRTVIClientEvent(
    RTVIEvent.BotStoppedSpeaking,
    useCallback(() => {
      setConversationState("listening")
    }, [])
  );

  useRTVIClientEvent(
    RTVIEvent.Error,
    useCallback(() => setConversationState("idle"), [])
  );

  const transportMeta = useMemo(() => {
    return TRANSPORT_META[transportState ?? "disconnected"] || TRANSPORT_META.disconnected;
  }, [transportState]);

  const conversationMeta = CONVERSATION_META[conversationState];

  return (
    <div className="flex flex-col items-center gap-2 mb-6">
      <div className="flex items-center gap-3">
        {/* Robot status */}
        <Badge
          variant="outline"
          className={`${transportMeta.badge} gap-2`}
          title={`Estado conexión: ${transportMeta.title}`}
        >
          {transportMeta.icon}
          <span className="sr-only">{transportMeta.title}</span>
        </Badge>
        {/* Conversation status */}
        <Badge
          variant="outline"
          className={`${conversationMeta.badge} gap-2`}
          title={`Estado conversación: ${conversationMeta.title}`}
        >
          {conversationMeta.icon}
          <span className="sr-only">{conversationMeta.title}</span>
        </Badge>
        {/* User status */}
        {userSpeaking && (
          <Badge
            variant="outline"
            className="bg-rose-100 text-rose-700 border-rose-300 animate-pulse gap-2"
            title="Usuario hablando"
          >
            <User className="w-4 h-4" />
            <span className="sr-only">Usuario hablando</span>
          </Badge>
        )}
      </div>
    </div>
  );
};

export default ConnectionStatus;
