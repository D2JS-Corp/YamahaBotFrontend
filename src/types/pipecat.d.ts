// Temporary module declarations for Pipecat packages to satisfy TypeScript.
// Replace/remove once official type definitions are installed.

declare module '@pipecat-ai/client-react' {
  import React from 'react'
  // Minimal shape declarations (extend as needed)
  export interface PipecatClientProviderProps { children: React.ReactNode; client: any }
  export const PipecatClientProvider: React.FC<PipecatClientProviderProps>
  export function usePipecatClient(): any
  export function useRTVIClientEvent(event: any, handler: (...args: any[]) => void): void
  export const PipecatClientAudio: React.FC
  export interface MicToggleChildrenArgs { isMicEnabled: boolean; onClick: () => void }
  export const PipecatClientMicToggle: React.FC<{ children: (args: MicToggleChildrenArgs) => React.ReactNode }>
  export const VoiceVisualizer: React.FC<{ participantType: 'local' | 'bot'; barColor?: string; barCount?: number; className?: string }>
}

declare module '@pipecat-ai/client-js' {
  // Export a RTVIEvent enum-like object (adjust once real types available)
  export const RTVIEvent: Record<string, string>
  export class PipecatClient {
    constructor(opts: any)
    connect(opts: any): Promise<void>
    disconnect(): Promise<void>
  }
}

declare module '@pipecat-ai/small-webrtc-transport' {
  export class SmallWebRTCTransport { constructor(opts: any) }
}
