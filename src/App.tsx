import WebRenderer from '@elemaudio/web-renderer'
import { useEffect, useReducer } from 'react'

import styles from './app.module.css'
import { buildAppAudioGraph } from './audioGraph.ts'
import Keyboard from './components/Keyboard.tsx'
import { TempoKnob } from './components/Knob/TempoKnob.tsx'
import ModuleDisplay from './components/Module/ModuleDisplay.tsx'
import moduleSpecs from './modules'
import {
  DefaultState,
  MeterEvent,
  MidiEvent,
  ModuleSpec,
} from './modules/types.ts'
import { initialState, Module, reducer } from './reducer.ts'
import { useEffectEvent } from './utils/useEffectEvent.ts'

const ctx = new AudioContext()
const core = new WebRenderer()
function startAudio() {
  ctx.resume().catch(console.error)
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  function setModuleState(instanceId: string, moduleState: DefaultState) {
    dispatch({ type: 'moduleStateChanged', instanceId, moduleState })
  }

  useEffect(() => {
    core
      .on('load', () => dispatch({ type: 'audioContextReady' }))
      .initialize(ctx)
      .then((node) => node.connect(ctx.destination))
      .catch(console.error)

    return () => void core.removeAllListeners('load')
  }, [])

  const onMeter = useEffectEvent((event: MeterEvent) => {
    const instanceId = event.source
    const module = state.modules.find(
      (module) => module.instanceId === instanceId,
    )
    if (!module) {
      console.error('Meter event for unknown module "%s"', instanceId)
      return
    }
    module.emitter.emit('meter', event)
  })

  const onSnapshot = useEffectEvent(
    (event: { source?: string; data: number }) => {
      if (event.source === 'tick') dispatch({ type: 'tick' })
      state.modules.map((module) => {
        module.emitter.emit('tick', { tick: event.data })
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

  function addModule(moduleSpec: ModuleSpec) {
    startAudio()

    dispatch({ type: 'addModule', moduleId: moduleSpec.moduleId })
  }

  function triggerMidi(event: MidiEvent, fromInstanceId?: string) {
    let module: Module | undefined
    if (fromInstanceId) {
      const index = state.modules.findIndex(
        (module) => module.instanceId === fromInstanceId,
      )
      if (index === -1) {
        console.error('Midi event from unknown module "%s"', fromInstanceId)
        return
      }
      module = state.modules[index + 1]
    } else {
      module = state.modules[0]
    }

    if (module) {
      if (module.consumesMidi) {
        module.emitter.emit('midi', event)
      } else {
        triggerMidi(event, module.instanceId)
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
        <div className={styles.track}>
          {state.modules.map((module) => {
            const onClickRemove = () =>
              dispatch({ type: 'removeModule', instanceId: module.instanceId })

            return (
              <ModuleDisplay
                key={module.instanceId}
                module={module}
                setModuleState={setModuleState}
                onClickRemove={onClickRemove}
                triggerMidi={triggerMidi}
              />
            )
          })}
          <div className={styles.add}>
            {moduleSpecs.map((spec) => (
              <button key={spec.title} onClick={() => addModule(spec)}>
                {spec.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <Keyboard
        onNoteOn={(noteNum) =>
          triggerMidi({
            type: 'noteOn',
            note: noteNum,
            velocity: 127,
          })
        }
        onNoteOff={(noteNum) =>
          triggerMidi({
            type: 'noteOff',
            note: noteNum,
            velocity: 0,
          })
        }
      />
    </div>
  )
}

export default App
