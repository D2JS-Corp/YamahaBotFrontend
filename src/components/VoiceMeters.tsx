import React from 'react'
import { VoiceVisualizer } from '@pipecat-ai/client-react'

const VoiceMeters: React.FC = () => {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="w-full max-w-2xl bg-white rounded-[1.5rem] p-6 border border-gray-200">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-xl rounded-[2rem] border border-red-200 bg-[rgba(255,0,0,0.05)] p-4 shadow-inner">
            <VoiceVisualizer
              participantType="bot"
              barColor="#ff0000"
              barCount={13}
              className="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default VoiceMeters
