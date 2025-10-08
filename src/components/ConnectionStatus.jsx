import React from 'react'

function ConnectionStatus({ connected, connecting }) {
  let label = 'DESCONECTADO'
  let cls = 'bg-[rgba(255,0,0,0.08)] text-[#ff0000] border-[#ff0000]/30'

  if (connecting) {
    label = 'CONECTANDO…'
    cls = 'bg-gray-100 text-gray-700 border-gray-300'
  } else if (connected) {
    label = 'CONECTADO'
    cls = 'bg-gray-100 text-gray-700 border-gray-300'
  }

  return (
    <div className="flex justify-center mb-6">
      <div className={`px-4 py-2 rounded-full border text-sm font-medium ${cls}`}>
        {label}
      </div>
    </div>
  )
}

export default ConnectionStatus
