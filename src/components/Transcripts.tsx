import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'
import { RTVIEvent } from '@pipecat-ai/client-js'
import { useRTVIClientEvent } from '@pipecat-ai/client-react'

const AUTO_CLEAR_INTERVAL_MS = 1 * 60 * 1000

interface PanelProps {
  title: string
  text: string
  placeholder: string
}

const Panel: React.FC<PanelProps> = ({ title, text, placeholder }) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [text])

  return (
    <section className="bg-white rounded-xl p-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-3 text-center" style={{ color: '#ff0000' }}>{title}</h3>
      <div
        ref={containerRef}
        className="bg-white rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm whitespace-pre-wrap break-words border border-gray-200 text-gray-800"
      >
        {text || placeholder}
      </div>
    </section>
  )
}

export interface TranscriptsHandle {
  clear: () => void
}

export interface TranscriptsProps {
  errors: string[]
  onClearErrors: () => void
}

const Transcripts = forwardRef<TranscriptsHandle, TranscriptsProps>((props, ref) => {
  const { errors, onClearErrors } = props

  const [userTranscript, setUserTranscript] = useState<string>('')
  const [botTranscript, setBotTranscript] = useState<string>('')

  const clearTranscripts = useCallback(() => {
    setUserTranscript('')
    setBotTranscript('')
  }, [])

  useImperativeHandle(ref, () => ({ clear: clearTranscripts }), [clearTranscripts])

  useRTVIClientEvent(
    RTVIEvent.UserTranscript,
    useCallback((data: any) => {
      if (data?.text) {
        setUserTranscript(prev => prev + data.text + '\n')
      }
    }, [])
  )

  useRTVIClientEvent(
    RTVIEvent.BotTranscript,
    useCallback((data: any) => {
      if (data?.text) {
        setBotTranscript(prev => prev + data.text + '\n')
      }
    }, [])
  )

  useEffect(() => {
    const intervalId = window.setInterval(clearTranscripts, AUTO_CLEAR_INTERVAL_MS)
    return () => window.clearInterval(intervalId)
  }, [clearTranscripts])

  const hasErrors = useMemo(() => errors && errors.length > 0, [errors])

  return (
    <div className="mt-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Panel title="Transcripción de Usuario" text={userTranscript} placeholder="Esperando entrada..." />
        <Panel title="Respuesta del Robot" text={botTranscript} placeholder="Esperando respuesta..." />
      </div>

      <div className="flex justify-center gap-4">
        <button
          className="px-4 py-2 rounded-lg font-medium bg-[#212936] hover:bg-[#2a3445] text-[#dbeafe] transition-all"
          onClick={clearTranscripts}
        >
          Limpiar Texto
        </button>
        <button
          className="px-4 py-2 rounded-lg font-medium bg-[#212936] hover:bg-[#2a3445] text-[#dbeafe] transition-all"
          onClick={onClearErrors}
        >
          Limpiar Errores
        </button>
      </div>

      {hasErrors && (
        <section className="bg-[rgba(255,0,0,0.12)] border border-[#ff0000]/30 text-[#ffb3b3] p-4 rounded-xl">
          <h3 className="text-lg font-semibold mb-2 text-center" style={{ color: '#ff0000' }}>
            Registro de Errores
          </h3>
          <ul className="space-y-2">
            {errors.map((error, index) => (
              <li key={index} className="font-mono text-sm">[{index + 1}] {error}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
})

export default Transcripts
