import WebRenderer from '@elemaudio/web-renderer'
import EventEmitter from 'eventemitter3'
import { useContext, useEffect } from 'react'

import { AppContext } from '~/components/App/AppContext.tsx'

import moduleSpecs from '../../modules'
import { MidiMessage, ModuleEvent } from '../../modules/types.ts'
import { useEffectEvent } from '../../utils/useEffectEvent.ts'
import Keyboard from '../Keyboard/Keyboard.tsx'
import { TempoKnob } from '../Knob/TempoKnob.tsx'
import ModuleDisplay from '../Module/ModuleDisplay.tsx'
import styles from './app.module.css'
import { buildAppAudioGraph } from './audioGraph.ts'
import { Module } from './reducer.ts'

const ctx = new AudioContext()
const core = new WebRenderer()
const eventBus = new EventEmitter<Record<string, ModuleEvent>>()
function startAudio() {
  if (ctx.state === 'running') return
  ctx.resume().catch(console.error)
}

function App() {
  const { state, dispatch } = useContext(AppContext)

  useEffect(() => {
    const savedState = localStorage.getItem('state')
    if (savedState) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      dispatch({ type: 'loadState', state: JSON.parse(savedState) })
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('state', JSON.stringify(state))
    }, 5000)
    return () => clearTimeout(timer)
  }, [state])

  useEffect(() => {
    core
      .on('load', () => dispatch({ type: 'audioContextReady' }))
      .initialize(ctx)
      .then((node) => node.connect(ctx.destination))
      .catch(console.error)

    return () => void core.removeAllListeners('load')
  }, [])

  const onMeter = useEffectEvent(
    (event: { source?: string; min: number; max: number }) => {
      if (event.source) {
        eventBus.emit(event.source, { type: 'meter', ...event })
      }
    },
  )

  const onSnapshot = useEffectEvent(
    (event: { source?: string; data: number }) => {
      if (event.source === 'tick') dispatch({ type: 'tick' })
      state.tracks.forEach((track) => {
        track.modules.forEach((module) => {
          eventBus.emit(module.instanceId, { type: 'tick', tick: event.data })
        })
      })
    },
  )

  useEffect(() => {
    core.on('meter', onMeter)
    core.on('snapshot', onSnapshot)
    return () => {
      core.off('meter', onMeter)
      core.off('snapshot', onSnapshot)
    }
  }, [onMeter, onSnapshot])

  function addModule(trackId: string, moduleId: string) {
    startAudio()

    dispatch({ type: 'addModule', trackId, moduleId })
  }

  function triggerMidi(message: MidiMessage, fromInstanceId?: string) {
    let module: Module | undefined
    if (fromInstanceId) {
      for (const track of state.tracks) {
        module = track.modules.find(
          (module) => module.instanceId === fromInstanceId,
        )
        if (module) break
      }
      if (!module) {
        console.error('Midi event from unknown module "%s"', fromInstanceId)
        return
      }
    } else {
      // todo: some way of selecting which track receives midi
      module = state.tracks[0].modules[0]
    }

    if (module) {
      if (module.consumesMidi) {
        eventBus.emit(module.instanceId, { type: 'midi', message })
      } else {
        triggerMidi(message, module.instanceId)
      }
    }
  }

  if (state.audioContextReady) {
    const channels = buildAppAudioGraph(state)
    core.render(...channels)
  }

  if (!state.audioContextReady) return <h1>Loading...</h1>

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Ethertone</h1>

        <div className={styles.controls}>
          <TempoKnob
            label="Tempo"
            value={state.tempo}
            onChange={(tempo) => dispatch({ type: 'updateTempo', tempo })}
          />
          <button
            onClick={() => {
              startAudio()
              dispatch({ type: 'playToggle' })
            }}
          >
            {state.globalState.playing ? 'Stop' : 'Play'}
          </button>
          <button onClick={() => dispatch({ type: 'metronomeToggle' })}>
            {state.globalState.metronome ? 'Mute' : 'Unmute'} Metronome
          </button>
          <div>
            {state.globalState.measure}:{state.globalState.beat}:
            {state.globalState.teenth}
          </div>
        </div>
      </div>

      <div className={styles.tracks}>
        {state.tracks.map((track) => (
          <div className={styles.track}>
            {track.modules.map((module) => {
              return (
                <ModuleDisplay
                  key={module.instanceId}
                  module={module}
                  triggerMidi={triggerMidi}
                  eventBus={eventBus}
                />
              )
            })}
            <div className={styles.add}>
              {moduleSpecs.map((spec) => (
                <button
                  key={spec.title}
                  onClick={() => addModule(track.trackId, spec.moduleId)}
                >
                  {spec.title}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Keyboard
        onNoteOn={(note) => triggerMidi({ type: 'noteOn', note, velocity: 96 })}
        onNoteOff={(note) =>
          triggerMidi({ type: 'noteOff', note, velocity: 0 })
        }
      />
    </div>
  )
}

export default App
