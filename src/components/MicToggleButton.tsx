import React from 'react'
import { usePipecatClientMicControl } from '@pipecat-ai/client-react'

export interface MicToggleButtonProps {
  connected: boolean
}

const MicToggleButton: React.FC<MicToggleButtonProps> = ({ connected }) => {
  const { enableMic, isMicEnabled } = usePipecatClientMicControl();

  return (
    <div className="flex justify-center mb-8">
      <button
        className={`px-6 py-3 rounded-xl font-bold text-lg transition-all flex items-center ${isMicEnabled
          ? 'bg-gray-800 hover:bg-gray-700 text-white'
          : 'bg-[#ff0000] hover:bg-[#e60000] text-white'}`}
        onClick={() => enableMic(!isMicEnabled)}
      >
        {isMicEnabled ? 'Desactivar micrófono' : 'Activar micrófono'}
      </button>
    </div>
  )
}

export default MicToggleButton
