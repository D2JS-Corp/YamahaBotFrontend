import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface RobotPosition {
  position: number
  position_name: string
  is_moving: boolean
}

interface RobotRouteControlsProps {
  onError: (message: string) => void
}

const RobotRouteControls: React.FC<RobotRouteControlsProps> = ({ onError }) => {
  const audioRef = useRef<HTMLAudioElement>(null)
  const movementPollRef = useRef<number | null>(null)
  const simulationIndexRef = useRef(0)
  const simulationTimeoutRef = useRef<number | null>(null)
  const hasTriggeredSimulationRef = useRef(false)

  const [robotInfo, setRobotInfo] = useState<RobotPosition | null>(null)
  const [currentBase, setCurrentBase] = useState<number>(1)
  const [isRouteActive, setIsRouteActive] = useState(false)
  const [isAudioPlaying, setIsAudioPlaying] = useState(false)
  const [isSimulationMode, setIsSimulationMode] = useState(false)

  const audioFiles = useMemo(
    () => ({
      1: '/simulation-audio/base1.mp3',
      2: '/simulation-audio/base2.mp3',
      3: '/simulation-audio/base3.mp3',
    }),
    []
  )

  const simulationBases = useMemo(
    () => [
      { position: 1, position_name: 'Base 1 (simulada)' },
      { position: 2, position_name: 'Base 2 (simulada)' },
      { position: 3, position_name: 'Base 3 (simulada)' },
    ],
    [],
  )

  const appendError = useCallback((message: string) => {
    onError(message)
  }, [onError])

  const stopMovementPolling = useCallback(() => {
    if (movementPollRef.current !== null) {
      window.clearInterval(movementPollRef.current)
      movementPollRef.current = null
    }
  }, [])

  const stopSimulationTimers = useCallback(() => {
    if (simulationTimeoutRef.current !== null) {
      window.clearTimeout(simulationTimeoutRef.current)
      simulationTimeoutRef.current = null
    }
  }, [])

  const simulateFetchPosition = useCallback((resetIndex = false) => {
    if (resetIndex) {
      simulationIndexRef.current = 0
    }

    const current = simulationBases[simulationIndexRef.current] ?? simulationBases[0]
    if (!current) {
      return null
    }

    const data: RobotPosition = {
      position: current.position,
      position_name: current.position_name,
      is_moving: false,
    }

    setRobotInfo(data)
    setCurrentBase(data.position)

    return data
  }, [simulationBases])

  const fetchRobotPositionFromServer = useCallback(async () => {
    try {
      const response = await fetch(`${import.meta.env.REACT_APP_API_URL}/api/v1/robot/position`)
      if (!response.ok) {
        throw new Error(`Estado HTTP ${response.status}`)
      }
      const data: RobotPosition = await response.json()
      setRobotInfo(data)
      setCurrentBase(data.position)
      if (isSimulationMode) {
        setIsSimulationMode(false)
        hasTriggeredSimulationRef.current = false
      }

      return data
    } catch (error) {
      console.error('Error obteniendo la posición del robot:', error)
      appendError('No se pudo obtener la posición del robot')
      stopMovementPolling()

      if (!hasTriggeredSimulationRef.current) {
        appendError('Activando modo simulación sin conexión con el robot real.')
        hasTriggeredSimulationRef.current = true
      }

      setIsSimulationMode(true)

      return simulateFetchPosition(true)
    }
  }, [appendError, isSimulationMode, simulateFetchPosition, stopMovementPolling])

  const fetchRobotPosition = useCallback(async () => {
    if (isSimulationMode) {
      return simulateFetchPosition()
    }

    return fetchRobotPositionFromServer()
  }, [fetchRobotPositionFromServer, isSimulationMode, simulateFetchPosition])

  const playAudioForBase = useCallback(
    (base: number) => {
      const src = audioFiles[base as keyof typeof audioFiles]
      if (!audioRef.current || !src) {
        appendError('No se pudo reproducir el audio')
        return
      }
      setIsAudioPlaying(true)
      audioRef.current.src = src
      audioRef.current.currentTime = 0
      audioRef.current
        .play()
        .catch(error => {
          console.error('Error reproduciendo audio:', error)
          setIsAudioPlaying(false)
          appendError('No se pudo reproducir el audio')
        })
    },
    [appendError, audioFiles]
  )

  const handleStartRoute = useCallback(async () => {
    setIsRouteActive(true)
    setIsAudioPlaying(false)
    stopSimulationTimers()
    const position = await fetchRobotPosition()
    if (position) {
      playAudioForBase(position.position)
    } else {
      setIsRouteActive(false)
    }
  }, [fetchRobotPosition, playAudioForBase, stopSimulationTimers])

  const handleMoveToNextBase = useCallback(async () => {
    if (!isRouteActive) {
      return
    }

    if (isSimulationMode) {
      setIsAudioPlaying(false)
      stopSimulationTimers()

      setRobotInfo(prev => {
        if (prev) {
          return { ...prev, is_moving: true }
        }

        const current = simulationBases[simulationIndexRef.current] ?? simulationBases[0]
        return current
          ? { position: current.position, position_name: current.position_name, is_moving: true }
          : { position: 1, position_name: 'Base 1 (simulada)', is_moving: true }
      })

      simulationTimeoutRef.current = window.setTimeout(() => {
        const nextIndex = (simulationIndexRef.current + 1) % simulationBases.length
        simulationIndexRef.current = nextIndex
        const nextBase = simulationBases[nextIndex]

        if (nextBase) {
          const data: RobotPosition = {
            position: nextBase.position,
            position_name: nextBase.position_name,
            is_moving: false,
          }

          setRobotInfo(data)
          setCurrentBase(nextBase.position)
          playAudioForBase(nextBase.position)
        }

        simulationTimeoutRef.current = null
      }, 1200)

      return
    }

    setIsAudioPlaying(false)
    stopMovementPolling()
    try {
      const response = await fetch(`${import.meta.env.REACT_APP_API_URL}/api/v1/robot/move`, {
        method: 'POST',
      })
      if (!response.ok) {
        throw new Error(`Estado HTTP ${response.status}`)
      }
      await response.json()

      movementPollRef.current = window.setInterval(async () => {
        const position = await fetchRobotPosition()
        if (position && !position.is_moving) {
          stopMovementPolling()
          playAudioForBase(position.position)
        }
      }, 1000)
    } catch (error) {
      console.error('Error al mover el robot:', error)
      stopMovementPolling()
      appendError('Error al mover el robot')
    }
  }, [appendError, fetchRobotPosition, isRouteActive, isSimulationMode, playAudioForBase, simulationBases, stopMovementPolling, stopSimulationTimers])

  const handleStopRoute = useCallback(() => {
    setIsRouteActive(false)
    setIsAudioPlaying(false)
    stopMovementPolling()
    stopSimulationTimers()
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }
  }, [stopMovementPolling, stopSimulationTimers])

  const handleReplayAudio = useCallback(() => {
    if (!isRouteActive) {
      return
    }
    playAudioForBase(currentBase)
  }, [currentBase, isRouteActive, playAudioForBase])

  const handleAudioEnded = useCallback(() => {
    setIsAudioPlaying(false)
  }, [])

  useEffect(() => {
    fetchRobotPosition()
  }, [fetchRobotPosition])

  useEffect(() => {
    return () => {
      stopMovementPolling()
      if (audioRef.current) {
        audioRef.current.pause()
      }
      stopSimulationTimers()
    }
  }, [stopMovementPolling, stopSimulationTimers])

  const isRobotMoving = robotInfo?.is_moving ?? false
  const statusMessage = useMemo(() => {
    if (!isRouteActive) {
      if (isSimulationMode) {
        return 'Modo simulación activo. Inicia el recorrido para reproducir la guía simulada.'
      }
      return 'Inicia el recorrido para escuchar la guía.'
    }
    if (isRobotMoving) {
      return 'El robot está en movimiento hacia la siguiente base.'
    }
    if (isAudioPlaying) {
      return 'Reproduciendo audio de la base actual.'
    }
    return 'Listo para pasar a la siguiente base o repetir el audio.'
  }, [isAudioPlaying, isRobotMoving, isRouteActive, isSimulationMode])

  const buildButtonClasses = (disabled: boolean, activeClasses: string) =>
    `px-4 py-2 rounded-lg font-medium transition-all ${disabled ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : activeClasses}`

  const startDisabled = isRouteActive
  const nextDisabled = !isRouteActive || isRobotMoving
  const replayDisabled = !isRouteActive
  const stopDisabled = !isRouteActive && !isAudioPlaying
  const simulationToggleDisabled = isRouteActive

  const handleSimulationToggle = useCallback(() => {
    if (simulationToggleDisabled) {
      return
    }

    setIsSimulationMode(prev => {
      const next = !prev

      if (next) {
        appendError('Modo simulación activado manualmente.')
        stopMovementPolling()
        stopSimulationTimers()
        hasTriggeredSimulationRef.current = true
        simulateFetchPosition(true)
      } else {
        appendError('Modo simulación desactivado. Intentando reconectar con el robot real.')
        stopSimulationTimers()
        hasTriggeredSimulationRef.current = false
        simulationIndexRef.current = 0
        fetchRobotPositionFromServer()
      }

      return next
    })
  }, [appendError, fetchRobotPositionFromServer, simulationToggleDisabled, simulateFetchPosition, stopMovementPolling, stopSimulationTimers])

  const simulationButtonLabel = isSimulationMode ? 'Desactivar Simulación' : 'Activar Simulación'

  return (
    <Fragment>
      <section className="bg-white rounded-xl p-4 border border-gray-200">
        <h3 className="text-lg font-semibold mb-3 text-center" style={{ color: '#ff0000' }}>Recorrido del Robot</h3>
        <div className="text-center text-sm text-gray-700">
          <p>
            Base actual: <span className="font-semibold">{currentBase}</span>
          </p>
          {robotInfo?.position_name && (
            <p className="text-xs text-gray-500 mt-1">{robotInfo.position_name}</p>
          )}
        </div>
        <div className="flex flex-wrap justify-center gap-3 mt-4">
          <button
            className={buildButtonClasses(startDisabled, 'bg-[#ff0000] hover:bg-[#e60000] text-white')}
            onClick={handleStartRoute}
            disabled={startDisabled}
          >
            Iniciar Recorrido
          </button>
          <button
            className={buildButtonClasses(nextDisabled, 'bg-[#212936] hover:bg-[#2a3445] text-[#dbeafe]')}
            onClick={handleMoveToNextBase}
            disabled={nextDisabled}
          >
            Siguiente Base
          </button>
          <button
            className={buildButtonClasses(replayDisabled, 'bg-white border border-gray-300 hover:bg-gray-100 text-gray-700')}
            onClick={handleReplayAudio}
            disabled={replayDisabled}
          >
            Reproducir Audio
          </button>
          <button
            className={buildButtonClasses(stopDisabled, 'bg-gray-800 hover:bg-gray-700 text-white')}
            onClick={handleStopRoute}
            disabled={stopDisabled}
          >
            Detener Recorrido
          </button>
          <button
            className={buildButtonClasses(simulationToggleDisabled, isSimulationMode ? 'bg-[#2563eb] hover:bg-[#1d4ed8] text-white' : 'bg-white border border-blue-300 hover:bg-blue-50 text-blue-600')}
            onClick={handleSimulationToggle}
            disabled={simulationToggleDisabled}
          >
            {simulationButtonLabel}
          </button>
        </div>
        <p className="mt-4 text-center text-xs text-gray-500">{statusMessage}</p>
        {isSimulationMode && (
          <p className="mt-2 text-center text-[11px] text-blue-600">
            Sin conexión con el robot real: se reproducen posiciones simuladas.
          </p>
        )}
      </section>

      <audio ref={audioRef} onEnded={handleAudioEnded} className="hidden" />
    </Fragment>
  )
}

export default RobotRouteControls
