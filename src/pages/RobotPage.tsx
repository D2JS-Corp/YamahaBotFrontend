import React, { useCallback, useEffect, useState } from 'react'
import { RTVIEvent } from '@pipecat-ai/client-js'
import {
  useRTVIClientEvent,
  PipecatClientAudio,
} from '@pipecat-ai/client-react'

import ConnectionStatus from '../components/ConnectionStatus'
import MicToggleButton from '../components/MicToggleButton'
import VoiceMeters from '../components/VoiceMeters'
import Transcripts from '../components/Transcripts'
import ErrorLog, { ActionsRow } from '../components/ErrorLog'

const RobotPage: React.FC = () => {
  const [userTranscript, setUserTranscript] = useState<string>('')
  const [botTranscript, setBotTranscript] = useState<string>('')
  const [errors, setErrors] = useState<string[]>([])

  const clearTranscripts = useCallback(() => {
    setUserTranscript('')
    setBotTranscript('')
  }, [])

  const clearErrors = useCallback(() => setErrors([]), [])

  // Auto-clear transcripts every 1 minute to prevent overflowing the panel
  useEffect(() => {
    const AUTO_CLEAR_INTERVAL_MS = 1 * 60 * 1000
    const intervalId = window.setInterval(clearTranscripts, AUTO_CLEAR_INTERVAL_MS)
    return () => window.clearInterval(intervalId)
  }, [clearTranscripts])

  // User transcript
  useRTVIClientEvent(
    RTVIEvent.UserTranscript,
    useCallback((data: any) => {
      if (data?.text) {
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

  return (
    <div className="min-h-screen bg-white p-4 font-mono flex items-center justify-center">
      <div className="w-full max-w-4xl bg-white rounded-[2rem] p-6 shadow-xl border border-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(800px_300px_at_top,_rgba(124,124,124,0.06),_transparent)] pointer-events-none" />
        <div className="relative z-10">
          <ConnectionStatus />
          <VoiceMeters />
          <MicToggleButton />
          <PipecatClientAudio />
          <Transcripts userTranscript={userTranscript} botTranscript={botTranscript} />
          <ActionsRow onClearTranscripts={clearTranscripts} onClearErrors={clearErrors} />
          <ErrorLog errors={errors} />
        </div>
      </div>
    </div>
  )
}

export default RobotPage
