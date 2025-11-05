import { useCallback, useState } from 'react'
import { RTVIEvent } from '@pipecat-ai/client-js'
import { PipecatClientAudio, useRTVIClientEvent } from '@pipecat-ai/client-react'

import ConnectionStatus from '../components/ConnectionStatus'
import MicToggleButton from '../components/MicToggleButton'
import VoiceMeters from '../components/VoiceMeters'
import Transcripts from '../components/Transcripts'
import RobotRouteControls from '../components/RobotRouteControls'

const RobotPage = () => {
  const [errors, setErrors] = useState<string[]>([])

  const addError = useCallback((message: string) => {
    setErrors(prev => [...prev, message])
  }, [])

  const clearErrors = useCallback(() => setErrors([]), [])

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

          <RobotRouteControls onError={addError} />
          <PipecatClientAudio />
          <Transcripts errors={errors} onClearErrors={clearErrors} />
        </div>
      </div>
    </div>
  )
}

export default RobotPage
