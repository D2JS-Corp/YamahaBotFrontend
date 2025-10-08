import React from 'react'

function ConnectionControls({ webrtcUrl, setWebrtcUrl, canConnect, connecting, onConnect, onDisconnect }) {
  return (
    <div className="flex flex-wrap justify-center gap-3 mb-8">
      <input
        className="flex-1 max-w-md px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#ff0000]/60 font-mono text-sm"
        value={webrtcUrl}
        onChange={(e) => setWebrtcUrl(e.target.value)}
        placeholder="http://localhost:7860/client"
      />
      {canConnect && (
        <button 
          className={`px-4 py-2 rounded-lg font-medium transition-all ${connecting 
            ? 'bg-[#7c7c7c] text-white' 
            : 'bg-[#ff0000] hover:bg-[#e60000] text-white'}`}
          onClick={onConnect}
        >
          {connecting ? 'CONECTANDO...' : 'CONECTAR'}
        </button>
      )}
      <button 
        className="px-4 py-2 rounded-lg font-medium bg-gray-200 hover:bg-gray-300 text-gray-800 transition-all"
        onClick={onDisconnect}
      >
        DESCONECTAR
      </button>
    </div>
  )
}

export default ConnectionControls
