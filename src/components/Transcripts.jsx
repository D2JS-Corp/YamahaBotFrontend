import React from 'react'

function Panel({ title, text, placeholder }) {
  return (
    <section className="bg-white rounded-xl p-4 border border-gray-200">
      <h3 className="text-lg font-semibold mb-3 text-center" style={{color:'#ff0000'}}>{title}</h3>
      <div className="bg-white rounded-lg p-4 h-48 overflow-y-auto font-mono text-sm whitespace-pre-wrap break-words border border-gray-200 text-gray-800">
        {text || placeholder}
      </div>
    </section>
  )
}

function Transcripts({ userTranscript, botTranscript }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
      <Panel title="TRANSCRIPCIÓN DE USUARIO" text={userTranscript} placeholder="<esperando entrada>" />
      <Panel title="RESPUESTA DEL ASISTENTE" text={botTranscript} placeholder="<esperando respuesta>" />
    </div>
  )
}

export default Transcripts
