import React, {useCallback, useMemo, useState} from 'react'

import {
  usePipecatClient,
  useRTVIClientEvent,
  PipecatClientAudio,
} from '@pipecat-ai/client-react'

import { RTVIEvent } from '@pipecat-ai/client-js/dist'

import { getWebrtcUrl } from './config'
import ConnectionStatus from './components/ConnectionStatus'
import ConnectionControls from './components/ConnectionControls'
import MicToggleButton from './components/MicToggleButton'
import VoiceMeters from './components/VoiceMeters'
import Transcripts from './components/Transcripts'
import ErrorLog, { ActionsRow } from './components/ErrorLog'

function App() {
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
      // data: { text, final, ... }
      if (data?.text) {
        // Solo agregamos líneas finales para evitar ruido intermedio
        if (data.final) {
          setUserTranscript(prev => prev + data.text + '\n')
        }
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

  // Estados de sesión (por si el backend emite un estado más alto nivel)
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

  // Estados de conexión
  useRTVIClientEvent(
    RTVIEvent.TransportStateChanged,
    useCallback((data) => {
      // data: { state: 'connecting' | 'connected' | 'ready' | 'disconnected' | ... }
      const state = data?.state
      // Opcional: depurar estados reales emitidos
      // console.debug('Transport state:', state)

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

  const canConnect = useMemo(() => {
    return !connecting && !connected
  }, [connecting, connected])

  const canDisconnect = useMemo(() => {
    return connected
  }, [connected])

  const connect = async () => {
    setErrors([])
    setConnecting(true)
    try {
      // Conexión directa al endpoint de señalización del runner (SmallWebRTC)
      await client.connect({ webrtcUrl })
      // pasará a 'ready' cuando termine la negociación → evento arriba
      // en algunos backends, connect resuelve cuando ya hay conexión establecida
      setConnected(true)
      setConnecting(false)
    } catch (e) {
      setErrors(prev => [...prev, String(e)])
      console.error(e)
    } finally {
      // el evento de estado también ajustará estos flags; evitamos dejarlo en true si algo falló
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

  const clearErrors = () => {
    setErrors([])
  }

  return (
    <div className="min-h-screen bg-white p-4 font-mono flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-[2rem] p-6 shadow-xl border border-gray-200 relative overflow-hidden">
        {/* Carcasa frontal sutil */}
        <div className="absolute inset-0 bg-[radial-gradient(800px_300px_at_top,_rgba(124,124,124,0.06),_transparent)] pointer-events-none"></div>
        
        <div className="relative z-10">
          {/* Frente con logo */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <img src="/Yamaha_Motor_Company-Logo.png" alt="Yamaha" className="w-50 h-30 drop-shadow" />
            {/* <h1 className="text-3xl font-extrabold text-center tracking-wider" style={{color:'#ff0000'}}>
              ROBOT GUÍA
            </h1> */}
          </div>
          
          <ConnectionStatus connected={connected} connecting={connecting} />

          {/* Controles de conexión */}
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

          {/* Transcripciones */}
          <Transcripts userTranscript={userTranscript} botTranscript={botTranscript} />

          {/* Botones adicionales */}
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

export default App