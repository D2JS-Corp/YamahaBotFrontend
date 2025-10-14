import React, { useCallback, useMemo, useState } from 'react'
import {
  usePipecatClient,
  useRTVIClientEvent,
  PipecatClientAudio,
} from '@pipecat-ai/client-react'
import { RTVIEvent } from '@pipecat-ai/client-js/dist'
import { getWebrtcUrl } from '../config'

import ConnectionStatus from '../components/ConnectionStatus'
import ConnectionControls from '../components/ConnectionControls'
import MicToggleButton from '../components/MicToggleButton'
import VoiceMeters from '../components/VoiceMeters'
import Transcripts from '../components/Transcripts'
import ErrorLog, { ActionsRow } from '../components/ErrorLog'

function RobotPage() {
  const client = usePipecatClient()

  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [webrtcUrl, setWebrtcUrl] = useState(getWebrtcUrl())
  const [userTranscript, setUserTranscript] = useState('')
  const [botTranscript, setBotTranscript] = useState('')
  const [errors, setErrors] = useState([])

  // Suscripción a eventos del usuario (transcripción final)
  useRTVIClientEvent(
    RTVIEvent.UserTranscript,
    useCallback((data) => {
      if (data?.text && data.final) {
        setUserTranscript(prev => prev + data.text + '\n')
      }
    }, [])
  )

  // Suscripción a eventos del bot (texto final)
  useRTVIClientEvent(
    RTVIEvent.BotTranscript,
    useCallback((data) => {
      if (data?.text) {
        setBotTranscript(prev => prev + data.text + '\n')
      }
    }, [])
  )

  // Estados de sesión
  useRTVIClientEvent(
    RTVIEvent.SessionStateChanged,
    useCallback((data) => {
      const state = data?.state
      if (state === 'active' || state === 'ready' || state === 'connected') {
        setConnected(true)
        setConnecting(false)
      } else if (state === 'inactive' || state === 'ended') {
        setConnected(false)
        setConnecting(false)
      }
    }, [])
  )

  // Errores
  useRTVIClientEvent(
    RTVIEvent.Error,
    useCallback((data) => {
      const msg = (data && (data.message || data.error || JSON.stringify(data))) || 'Error desconocido'
      setErrors(prev => [...prev, msg])
      console.error('Pipecat Error:', data)
    }, [])
  )

  // Estados de conexión del transporte
  useRTVIClientEvent(
    RTVIEvent.TransportStateChanged,
    useCallback((data) => {
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
      await client.connect({ webrtcUrl })
      setConnected(true)
      setConnecting(false)
    } catch (e) {
      setErrors(prev => [...prev, String(e)])
      console.error(e)
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = async () => {
    try {
      setConnecting(false)
      await client.disconnect()
      setConnected(false)
    } catch (e) {
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
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/Yamaha_Motor_Company-Logo.png" alt="Yamaha" className="w-50 h-30 drop-shadow" />
          </div>

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
