import React from 'react'

export interface ActionsRowProps {
  onClearTranscripts: () => void
  onClearErrors: () => void
}

export const ActionsRow: React.FC<ActionsRowProps> = ({ onClearTranscripts, onClearErrors }) => (
  <div className="flex justify-center gap-4 mt-6">
    <button
      className="px-4 py-2 rounded-lg font-medium bg-[#212936] hover:bg-[#2a3445] text-[#dbeafe] transition-all"
      onClick={onClearTranscripts}
    >
      LIMPIAR TEXTO
    </button>
    <button
      className="px-4 py-2 rounded-lg font-medium bg-[#212936] hover:bg-[#2a3445] text-[#dbeafe] transition-all"
      onClick={onClearErrors}
    >
      LIMPIAR ERRORES
    </button>
  </div>
)

export interface ErrorLogProps {
  errors: string[]
}

const ErrorLog: React.FC<ErrorLogProps> = ({ errors }) => {
  if (!errors || errors.length === 0) return null
  return (
    <div className="mt-6 bg-[rgba(255,0,0,0.12)] border border-[#ff0000]/30 text-[#ffb3b3] p-4 rounded-xl">
      <div className="text-lg font-semibold mb-2 text-center" style={{ color: '#ff0000' }}>REGISTRO DE ERRORES</div>
      <ul className="space-y-2">
        {errors.map((e, i) => (
          <li key={i} className="font-mono text-sm">[{i + 1}] {e}</li>
        ))}
      </ul>
    </div>
  )
}

export default ErrorLog
