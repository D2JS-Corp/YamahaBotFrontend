import React, { useCallback, useMemo, useState } from 'react'
import {
  usePipecatClient,
  useRTVIClientEvent,
  PipecatClientAudio,
} from '@pipecat-ai/client-react'
// @ts-ignore - some distributions may not yet ship full types for dist path
import { RTVIEvent } from '@pipecat-ai/client-js/dist'
import { getWebrtcUrl, getIceServers } from '../config'

import ConnectionStatus from '../components/ConnectionStatus'
import ConnectionControls from '../components/ConnectionControls'
import MicToggleButton from '../components/MicToggleButton'
import VoiceMeters from '../components/VoiceMeters'
import Transcripts from '../components/Transcripts'
import ErrorLog, { ActionsRow } from '../components/ErrorLog'

const RobotPage: React.FC = () => {
  const client = usePipecatClient()

  const [connecting, setConnecting] = useState<boolean>(false)
  const [connected, setConnected] = useState<boolean>(false)
  const [webrtcUrl, setWebrtcUrl] = useState<string>(getWebrtcUrl())
  const [userTranscript, setUserTranscript] = useState<string>('')
  const [botTranscript, setBotTranscript] = useState<string>('')
  const [errors, setErrors] = useState<string[]>([])

  // User transcript (final only)
  useRTVIClientEvent(
    RTVIEvent.UserTranscript,
    useCallback((data: any) => {
      if (data?.text && data.final) {
        setUserTranscript(prev => prev + data.text + '\n')
      }
    }, [])
  )

  // Bot transcript
  useRTVIClientEvent(
    RTVIEvent.BotTranscript,
    useCallback((data: any) => {
      if (data?.text) {
        setBotTranscript(prev => prev + data.text + '\n')
      }
    }, [])
  )

  // Errors
  useRTVIClientEvent(
    RTVIEvent.Error,
    useCallback((data: any) => {
      const msg = (data && (data.message || data.error || JSON.stringify(data))) || 'Error desconocido'
      setErrors(prev => [...prev, msg])
      console.error('Pipecat Error:', data)
    }, [])
  )

  // Transport state
  useRTVIClientEvent(
    RTVIEvent.TransportStateChanged,
    useCallback((data: any) => {
      const state = data?.state
      if (state === 'connecting') {
        setConnecting(true)
        return
      }
      if (state === 'connected' || state === 'ready') {
        setConnected(true)
        setConnecting(false)
        return
      }
      if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        setConnected(false)
        setConnecting(false)
        return
      }
    }, [])
  )

  const canConnect = useMemo(() => !connecting && !connected, [connecting, connected])
  const canDisconnect = useMemo(() => connected, [connected])

  const connect = async () => {
    setErrors([])
    setConnecting(true)
    try {
      if (!client || typeof client.connect !== 'function') {
        throw new Error('Pipecat client no está disponible o es inválido')
      }
      await client.connect({ webrtcUrl, iceServers: getIceServers() })
      setConnected(true)
      setConnecting(false)
    } catch (e: any) {
      setErrors(prev => [...prev, String(e)])
      console.error(e)
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = async () => {
    try {
      setConnecting(false)
      if (!client || typeof client.disconnect !== 'function') {
        throw new Error('Pipecat client no está disponible o es inválido')
      }
      await client.disconnect()
      setConnected(false)
    } catch (e: any) {
      setErrors(prev => [...prev, String(e)])
    }
  }

  const clearTranscripts = () => {
    setUserTranscript('')
    setBotTranscript('')
  }

  const clearErrors = () => setErrors([])

  return (
    <div className="min-h-screen bg-white p-4 font-mono flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-[2rem] p-6 shadow-xl border border-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(800px_300px_at_top,_rgba(124,124,124,0.06),_transparent)] pointer-events-none" />
        <div className="relative z-10">
          {/* <div className="flex items-center justify-center gap-3 mb-4 w-10 h-10">
            <img src="/Yamaha_Motor_Company-Logo.png" alt="Yamaha" className="drop-shadow" />
          </div> */}

          <ConnectionStatus connected={connected} connecting={connecting} />

          <ConnectionControls
            webrtcUrl={webrtcUrl}
            setWebrtcUrl={setWebrtcUrl}
            canConnect={canConnect}
            connecting={connecting}
            onConnect={connect}
            onDisconnect={disconnect}
          />

          <VoiceMeters />
          <MicToggleButton connected={connected} />
          <PipecatClientAudio />
          <Transcripts userTranscript={userTranscript} botTranscript={botTranscript} />
          <ActionsRow onClearTranscripts={clearTranscripts} onClearErrors={clearErrors} />
          <ErrorLog errors={errors} />
          <div className="mt-6 text-[#7c7c7c] text-xs text-center">
            Sistema de Asistencia Pipecat v1.0 • Endpoint: {webrtcUrl}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RobotPage
