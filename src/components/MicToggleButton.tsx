import React from 'react'
import { PipecatClientMicToggle } from '@pipecat-ai/client-react'

export interface MicToggleButtonProps {
  connected: boolean
}

const MicToggleButton: React.FC<MicToggleButtonProps> = ({ connected }) => {
  return (
    <div className="flex justify-center mb-8">
      <PipecatClientMicToggle>
        {({ isMicEnabled, onClick }: { isMicEnabled: boolean; onClick: () => void }) => (
          <button
            className={`px-6 py-3 rounded-xl font-bold text-lg transition-all flex items-center ${isMicEnabled
              ? 'bg-[#ff0000] hover:bg-[#e60000] text-white'
              : 'bg-gray-800 hover:bg-gray-700 text-white'} ${!connected ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={onClick}
            disabled={!connected}
          >
            <span className="mr-2">{isMicEnabled ? '🔴' : '🎤'}</span>
            {isMicEnabled ? 'MICRÓFONO ACTIVADO' : 'MICRÓFONO DESACTIVADO'}
          </button>
        )}
      </PipecatClientMicToggle>
    </div>
  )
}

export default MicToggleButton
