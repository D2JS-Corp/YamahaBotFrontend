import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  usePipecatClient,
  useRTVIClientEvent,
  PipecatClientAudio,
  usePipecatClientMicControl
} from '@pipecat-ai/client-react'
// @ts-ignore
import { RTVIEvent } from '@pipecat-ai/client-js/dist'
import { getWebrtcUrl, getIceServers } from '../config'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { Alert, AlertDescription } from '../components/ui/alert'
import { Play, Pause, SkipForward, Volume2, Mic, AlertCircle } from 'lucide-react'

interface RobotPosition {
  position: number
  position_name: string
  is_moving: boolean
}

type SimulationState = 'idle' | 'playing-audio' | 'waiting-for-action' | 'moving' | 'asking-questions'

const Simulation: React.FC = () => {
  const client = usePipecatClient()
  const audioRef = useRef<HTMLAudioElement>(null)

  // Simulation state
  const [isRunning, setIsRunning] = useState(false)
  const [currentState, setCurrentState] = useState<SimulationState>('idle')
  const [currentBase, setCurrentBase] = useState(1)
  const [robotPosition, setRobotPosition] = useState<RobotPosition | null>(null)
  const [isMoving, setIsMoving] = useState(false)
  
  // Pipecat state
  const [agentConnected, setAgentConnected] = useState(false)
  const [agentConnecting, setAgentConnecting] = useState(false)
  const { enableMic, isMicEnabled } = usePipecatClientMicControl()
  
  // Transcripts
  const [userTranscript, setUserTranscript] = useState<string>('')
  const [botTranscript, setBotTranscript] = useState<string>('')
  
  // Audio paths for each base
  const audioFiles = useMemo(() => ({
    1: '/simulation-audio/base1.mp3',
    2: '/simulation-audio/base2.mp3',
    3: '/simulation-audio/base3.mp3',
  }), [])
  
  // Errors
  const [errors, setErrors] = useState<string[]>([])

  // Monitor user speech
  useRTVIClientEvent(
    RTVIEvent.UserTranscript,
    useCallback((data: any) => {
      if (data?.text && data.final) {
        setUserTranscript(prev => prev + data.text + '\n')
      }
    }, [])
  )

  // Monitor bot speech
  useRTVIClientEvent(
    RTVIEvent.BotTranscript,
    useCallback((data: any) => {
      if (data?.text) {
        setBotTranscript(prev => prev + data.text + '\n')
      }
    }, [])
  )

  // Monitor when bot stops speaking
  useRTVIClientEvent(
    RTVIEvent.BotStoppedSpeaking,
    useCallback(() => {
      console.log('Bot stopped speaking')
      // Removed automatic logic
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
      console.log('TransportStateChanged event:', data)
      const state = data?.state
      if (state === 'connecting') {
        setAgentConnecting(true)
        return
      }
      if (state === 'connected' || state === 'ready') {
        setAgentConnected(true)
        setAgentConnecting(false)
        return
      }
      if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        setAgentConnected(false)
        setAgentConnecting(false)
        return
      }
    }, [])
  )

  // Also listen for Connected event as a fallback
  useRTVIClientEvent(
    RTVIEvent.Connected,
    useCallback(() => {
      console.log('Connected event fired')
      setAgentConnected(true)
      setAgentConnecting(false)
    }, [])
  )

  // Listen for Disconnected event
  useRTVIClientEvent(
    RTVIEvent.Disconnected,
    useCallback(() => {
      console.log('Disconnected event fired')
      setAgentConnected(false)
      setAgentConnecting(false)
    }, [])
  )

  // Fetch current robot position
  const fetchRobotPosition = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/v1/robot/position')
      const data = await response.json()
      setRobotPosition(data)
      return data
    } catch (error) {
      console.error('Error fetching robot position:', error)
      return null
    }
  }

  // Move robot to next base
  const moveRobot = async () => {
    try {
      setCurrentState('moving')
      const response = await fetch('http://127.0.0.1:8000/api/v1/robot/move', {
        method: 'POST',
      })
      const data = await response.json()
      console.log('Move initiated:', data)
      
      // Poll for position update
      const checkPosition = setInterval(async () => {
        const position = await fetchRobotPosition()
        if (position && !position.is_moving) {
          clearInterval(checkPosition)
          setCurrentBase(position.position)
          playAudioForBase(position.position)
        }
      }, 1000)
      
    } catch (error) {
      console.error('Error moving robot:', error)
      setErrors(prev => [...prev, 'Error al mover el robot'])
    }
  }

  // Play audio for specific base
  const playAudioForBase = (base: number) => {
    console.log('playAudioForBase called for base:', base)
    if (audioRef.current && audioFiles[base as keyof typeof audioFiles]) {
      console.log('Setting audio src to:', audioFiles[base as keyof typeof audioFiles])
      setCurrentState('playing-audio')
      audioRef.current.src = audioFiles[base as keyof typeof audioFiles]
      audioRef.current.volume = 1
      audioRef.current.load()
      audioRef.current.play().then(() => {
        console.log('Audio started playing')
      }).catch(err => {
        console.error('Error playing audio:', err)
        // If audio fails, move to next state
        onAudioEnded()
      })
    } else {
      console.log('Audio ref or file not found, skipping to onAudioEnded')
      // No audio file, skip to waiting
      onAudioEnded()
    }
  }

  // When audio finishes playing
  const onAudioEnded = () => {
    console.log('Audio ended, waiting for action')
    setCurrentState('waiting-for-action')
  }

  // Connect to Pipecat agent
  const connectAgent = async () => {
    setErrors([])
    setAgentConnecting(true)
    try {
      if (!client || typeof client.connect !== 'function') {
        throw new Error('Pipecat client no disponible')
      }
      await client.connect({ 
        webrtcUrl: getWebrtcUrl(), 
        iceServers: getIceServers() 
      })
      setAgentConnected(true)
      setAgentConnecting(false)
    } catch (e: any) {
      setErrors(prev => [...prev, String(e)])
      console.error(e)
    } finally {
      setAgentConnecting(false)
    }
  }

  // Disconnect from agent
  const disconnectAgent = async () => {
    try {
      if (client) {
        await client.disconnect()
      }
      setAgentConnected(false)
    } catch (e: any) {
      console.error(e)
    }
  }

  // Ask questions - connect agent
  const askQuestions = async () => {
    if (!agentConnected) {
      await connectAgent()
    }
    // Enable mic when asking questions
    if (!isMicEnabled) {
      enableMic(true)
    }
    setCurrentState('asking-questions')
  }

  // Finish questions and move
  const finishQuestionsAndMove = async () => {
    // Disconnect agent and disable mic
    if (agentConnected) {
      await disconnectAgent()
    }
    if (isMicEnabled) {
      enableMic(false)
    }
    // Move to next base
    await moveRobot()
  }

  // @ts-ignore
  // Toggle mic
  const toggleMic = () => {
    if (client && agentConnected) {
      if (isMicEnabled) {
        enableMic(false)
      } else {
        enableMic(true)
      }
    }
  }

  // Start simulation
  const startSimulation = async () => {
    setIsRunning(true)
    setUserTranscript('')
    setBotTranscript('')
    
    // Fetch current position and start
    const position = await fetchRobotPosition()
    if (position) {
      setCurrentBase(position.position)
      playAudioForBase(position.position)
    }
  }

  // Stop simulation
  const stopSimulation = () => {
    setIsRunning(false)
    setCurrentState('idle')
    if (audioRef.current) {
      audioRef.current.pause()
    }
  }

  // Initial position fetch
  useEffect(() => {
    fetchRobotPosition()
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // No timer to clean up
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            Simulación de Robot de Museo
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            El robot se mueve entre bases, reproduce audio y responde preguntas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Control Panel */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Panel de Control</CardTitle>
              <CardDescription>Gestiona la simulación y el agente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Agent Connection */}
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Conexión del Agente
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={connectAgent}
                    disabled={agentConnected || agentConnecting}
                    className="flex-1"
                    variant={agentConnected ? "secondary" : "default"}
                  >
                    {agentConnecting ? 'Conectando...' : agentConnected ? 'Conectado' : 'Conectar'}
                  </Button>
                  {agentConnected && (
                    <Button
                      onClick={disconnectAgent}
                      variant="destructive"
                      className="flex-1"
                    >
                      Desconectar
                    </Button>
                  )}
                </div>
                <Badge variant={agentConnected ? "default" : "secondary"} className="w-full justify-center">
                  {agentConnected ? 'Agente Conectado' : 'Agente Desconectado'}
                </Badge>
              </div>

              {/* Microphone */}
              {agentConnected && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Micrófono
                  </h3>
                  <Button
                    onClick={toggleMic}
                    variant={isMicEnabled ? "default" : "outline"}
                    className="w-full"
                  >
                    <Mic className="mr-2 h-4 w-4" />
                    {isMicEnabled ? 'Desactivar Micrófono' : 'Activar Micrófono'}
                  </Button>
                </div>
              )}

              {/* Simulation Controls */}
              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Simulación
                </h3>
                {!isRunning ? (
                  <Button
                    onClick={startSimulation}
                    className="w-full"
                    size="lg"
                  >
                    <Play className="mr-2 h-5 w-5" />
                    Iniciar Simulación
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={stopSimulation}
                      variant="destructive"
                      className="w-full"
                      size="lg"
                    >
                      <Pause className="mr-2 h-5 w-5" />
                      Detener Simulación
                    </Button>
                    {currentState === 'waiting-for-action' && (
                      <div className="space-y-2">
                        <Button onClick={askQuestions} className="w-full" variant="default">
                          Hacer Preguntas
                        </Button>
                        <Button onClick={moveRobot} className="w-full" variant="outline">
                          Mover a Siguiente Base
                        </Button>
                      </div>
                    )}
                    {currentState === 'asking-questions' && (
                      <div className="space-y-2">
                        <Button onClick={finishQuestionsAndMove} className="w-full" variant="default">
                          Terminar Preguntas y Mover
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Current State */}
              <div className="space-y-2 pt-4 border-t">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Estado Actual
                </h3>
                <Badge variant="outline" className="w-full justify-center">
                  {currentState === 'idle' && 'Inactivo'}
                  {currentState === 'playing-audio' && 'Reproduciendo Audio'}
                  {currentState === 'waiting-for-action' && 'Esperando Acción'}
                  {currentState === 'moving' && 'Moviendo Robot'}
                  {currentState === 'asking-questions' && 'Preguntando'}
                </Badge>
                <div className="text-center">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Base Actual: <span className="font-bold">{currentBase}</span>
                  </p>
                  {robotPosition && (
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {robotPosition.position_name}
                      {robotPosition.is_moving && ' (en movimiento)'}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transcripts */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Conversación</CardTitle>
              <CardDescription>Transcripciones en tiempo real</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* User Transcript */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    Usuario
                  </h3>
                  <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg h-96 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                      {userTranscript || 'Esperando entrada de voz...'}
                    </pre>
                  </div>
                </div>

                {/* Bot Transcript */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-green-600 dark:text-green-400">
                    Bot
                  </h3>
                  <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg h-96 overflow-y-auto">
                    <pre className="text-sm whitespace-pre-wrap text-slate-800 dark:text-slate-200">
                      {botTranscript || 'Esperando respuestas...'}
                    </pre>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Visual Representation */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Recorrido del Robot</CardTitle>
              <CardDescription>Visualización de las 3 bases del museo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-around items-center py-8">
                {[1, 2, 3].map((base) => (
                  <div
                    key={base}
                    className={`flex flex-col items-center space-y-2 transition-all ${
                      currentBase === base ? 'scale-110' : 'scale-100 opacity-50'
                    }`}
                  >
                    <div
                      className={`w-32 h-32 rounded-full flex items-center justify-center text-3xl font-bold transition-all ${
                        currentBase === base
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                      }`}
                    >
                      {currentBase === base && currentState === 'playing-audio' && (
                        <Volume2 className="h-12 w-12 animate-pulse" />
                      )}
                      {currentBase === base && currentState === 'waiting-for-action' && (
                        <Mic className="h-12 w-12 animate-pulse" />
                      )}
                      {currentState === 'asking-questions' && (
                        <div className="flex items-center justify-center h-32 bg-gray-100 rounded-lg">
                          <span className="animate-pulse">Preguntando</span>
                        </div>
                      )}
                      {(currentBase !== base || currentState === 'idle' || currentState === 'moving') && base}
                    </div>
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Base {base}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Errors */}
          {errors.length > 0 && (
            <Card className="lg:col-span-3 border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400 flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Errores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {errors.map((error, idx) => (
                    <Alert key={idx} variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ))}
                  <Button
                    onClick={() => setErrors([])}
                    variant="outline"
                    size="sm"
                  >
                    Limpiar Errores
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Hidden audio player */}
      <audio
        ref={audioRef}
        onEnded={onAudioEnded}
        className="hidden"
      />

      {/* Pipecat Audio Component (for WebRTC audio) */}
      <PipecatClientAudio />
    </div>
  )
}

export default Simulation
