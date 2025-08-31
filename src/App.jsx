import React, {useCallback, useMemo, useState} from 'react'

import {
  usePipecatClient,
  useRTVIClientEvent,
  PipecatClientAudio,
  PipecatClientMicToggle,
  VoiceVisualizer
} from '@pipecat-ai/client-react'

import { RTVIEvent } from '@pipecat-ai/client-js/dist'

import { getWebrtcUrl } from './config'

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
        setUserTranscript(prev => prev + (data.final ? data.text + '\n' : ''))
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
      if (data?.state === 'ready') setConnected(true)
      if (data?.state === 'disconnected') setConnected(false)
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
    } catch (e) {
      setErrors(prev => [...prev, String(e)])
      console.error(e)
    } finally {
      setConnecting(false)
    }
  }

  const disconnect = async () => {
    try {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 font-mono flex items-center justify-center">
      <div className="w-full max-w-4xl bg-gray-800/80 backdrop-blur-md rounded-2xl p-6 shadow-2xl border-2 border-cyan-500/30 relative overflow-hidden">
        {/* Efectos de pantalla de robot */}
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-400/10 via-transparent to-transparent pointer-events-none"></div>
        
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-center mb-6 text-cyan-400 drop-shadow-md">
            <span className="text-cyan-300">ROBOT</span> GUÍA
          </h1>
          
          {/* Estado de conexión */}
          <div className="flex justify-center mb-6">
            <div className={`px-4 py-2 rounded-full ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'} border ${connected ? 'border-green-500/30' : 'border-red-500/30'} text-sm font-medium`}>
              {connected ? 'CONECTADO' : 'DESCONECTADO'}
            </div>
          </div>

          {/* Controles de conexión */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            <input
              className="flex-1 max-w-md px-4 py-2 rounded-lg bg-gray-700/70 text-cyan-100 border border-cyan-500/30 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-sm"
              value={webrtcUrl}
              onChange={(e) => setWebrtcUrl(e.target.value)}
              placeholder="http://localhost:7860/client"
            />
            {canConnect && (
              <button 
                className={`px-4 py-2 rounded-lg font-medium transition-all ${connecting 
                  ? 'bg-cyan-400/50 text-gray-800' 
                  : 'bg-cyan-600 hover:bg-cyan-500 text-white'}`}
                onClick={connect}
              >
                {connecting ? 'CONECTANDO...' : 'CONECTAR'}
              </button>
            )}
            <button 
              className="px-4 py-2 rounded-lg font-medium bg-red-600 hover:bg-red-500 text-white transition-all"
              onClick={disconnect}
            >
              DESCONECTAR
            </button>
          </div>

          {/* Visualizadores de audio centrados */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-full max-w-2xl bg-gray-900/80 rounded-2xl p-6 border border-cyan-500/20">              
              <div className="mb-6">
                <div className="text-center text-cyan-300 mb-2">USUARIO</div>
                <VoiceVisualizer
                  participantType="local"
                  barColor="#22d3ee"
                  barCount={15}
                  className="w-full"
                />
              </div>
              
              <div className="mb-2">
                <div className="text-center text-cyan-300 mb-2">ROBOT</div>
                <VoiceVisualizer
                  participantType="bot"
                  barColor="#22d3ee"
                  barCount={15}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Control de micrófono */}
          <div className="flex justify-center mb-8">
            <PipecatClientMicToggle>
              {({ isMicEnabled, onClick }) => (
                <button
                  className={`px-6 py-3 rounded-xl font-bold text-lg transition-all flex items-center ${isMicEnabled 
                    ? 'bg-red-600 hover:bg-red-500 text-white' 
                    : 'bg-cyan-600 hover:bg-cyan-500 text-white'} ${!connected ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={onClick}
                  disabled={!connected}
                >
                  <span className="mr-2">{isMicEnabled ? '🔴' : '🎤'}</span>
                  {isMicEnabled ? 'MICRÓFONO ACTIVADO' : 'MICRÓFONO DESACTIVADO'}
                </button>
              )}
            </PipecatClientMicToggle>
          </div>

          {/* Audio de salida del bot */}
          <PipecatClientAudio />

          {/* Transcripciones */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
            <section className="bg-gray-900/70 rounded-xl p-4 border border-cyan-500/20">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 text-center">TRANSCRIPCIÓN DE USUARIO</h3>
              <div className="bg-gray-800/50 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm text-cyan-100 whitespace-pre-wrap break-words border border-cyan-500/10">
                {userTranscript || '<esperando entrada>'}
              </div>
            </section>
            <section className="bg-gray-900/70 rounded-xl p-4 border border-cyan-500/20">
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 text-center">RESPUESTA DEL ASISTENTE</h3>
              <div className="bg-gray-800/50 rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm text-cyan-100 whitespace-pre-wrap break-words border border-cyan-500/10">
                {botTranscript || '<esperando respuesta>'}
              </div>
            </section>
          </div>

          {/* Botones adicionales */}
          <div className="flex justify-center gap-4 mt-6">
            <button 
              className="px-4 py-2 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-cyan-100 transition-all"
              onClick={clearTranscripts}
            >
              LIMPIAR TEXTO
            </button>
            <button 
              className="px-4 py-2 rounded-lg font-medium bg-gray-700 hover:bg-gray-600 text-cyan-100 transition-all"
              onClick={clearErrors}
            >
              LIMPIAR ERRORES
            </button>
          </div>

          {errors.length > 0 && (
            <div className="mt-6 bg-red-900/30 border border-red-500/30 text-red-200 p-4 rounded-xl">
              <div className="text-lg font-semibold mb-2 text-center">REGISTRO DE ERRORES</div>
              <ul className="space-y-2">
                {errors.map((e, i) => (
                  <li key={i} className="font-mono text-sm">[{i+1}] {e}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="mt-6 text-cyan-500/70 text-xs text-center">
            Sistema de Asistencia Pipecat v1.0 • Conectando a endpoint: {webrtcUrl}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App