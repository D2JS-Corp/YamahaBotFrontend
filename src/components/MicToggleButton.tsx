import { usePipecatClientMicControl } from '@pipecat-ai/client-react'
import { Mic, MicOff } from 'lucide-react'

const MicToggleButton = () => {
  const { enableMic, isMicEnabled } = usePipecatClientMicControl();

  return (
    <div className="flex justify-center mb-8">
      <button
        className={`px-6 py-3 rounded-xl font-bold text-lg transition-all flex items-center ${isMicEnabled
          ? 'bg-[#ff0000] hover:bg-[#e60000] text-white'
          : 'bg-gray-800 hover:bg-gray-700 text-white'}`}
        onClick={() => enableMic(!isMicEnabled)}
        aria-label={isMicEnabled ? 'Desactivar micrófono' : 'Activar micrófono'}
      >
        {isMicEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
      </button>
    </div>
  )
}

export default MicToggleButton
