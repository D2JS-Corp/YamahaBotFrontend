import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

import { PipecatClient } from '@pipecat-ai/client-js'
import { PipecatClientProvider } from '@pipecat-ai/client-react'
import { SmallWebRTCTransport } from '@pipecat-ai/small-webrtc-transport'

import { getIceServers } from './config.js'

const client = new PipecatClient({
  transport: new SmallWebRTCTransport({
    iceServers: getIceServers()
  }),
  // habilita mic; cámara deshabilitada por defecto
  enableMic: true,
  enableCam: false
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <PipecatClientProvider client={client}>
      <App />
    </PipecatClientProvider>
  </StrictMode>,
)
