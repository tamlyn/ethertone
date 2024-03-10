import { el, ElemNode } from '@elemaudio/core'
import WebRenderer from '@elemaudio/web-renderer'
import EventEmitter from 'eventemitter3'
import { useEffect, useReducer } from 'react'
import { v4 } from 'uuid'

import styles from './app.module.css'
import Keyboard from './components/Keyboard.tsx'
import { TempoKnob } from './components/Knob/Knobs.tsx'
import * as moduleSpecs from './modules'
import { MeterEvent, ModuleSpec } from './modules/types.ts'
import { initialState, reducer } from './reducer.ts'
import { useEffectEvent } from './utils/useEffectEvent.ts'

const ctx = new AudioContext()
const core = new WebRenderer()
function startAudio() {
  ctx.resume().catch(console.error)
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    core
      .on('load', () => dispatch({ type: 'audioContextReady' }))
      .initialize(ctx)
      .then((node) => node.connect(ctx.destination))
      .catch(console.error)

    return () => void core.removeAllListeners('load')
  }, [])

  const onMeter = useEffectEvent((event: MeterEvent) => {
    const moduleId = event.source
    const module = state.modules.find((module) => module.moduleId === moduleId)
    if (!module) {
      console.error('Meter event for unknown module "%s"', moduleId)
      return
    }
    module.emitter.emit('meter', event)
  })

  const onSnapshot = useEffectEvent(
    (event: { source?: string; data: number }) => {
      if (event.source === 'tick') dispatch({ type: 'tick' })
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

    const moduleId = v4()
    console.debug('Adding module "%s" (%s)', moduleSpec.title, moduleId)

    const eventEmitter = new EventEmitter()
    eventEmitter.on('audioGraph', (audioGraph: ElemNode) => {
      dispatch({
        type: 'moduleAudioGraphChanged',
        moduleId,
        audioGraph,
      })
    })
    dispatch({
      type: 'addModule',
      moduleId,
      moduleSpec,
      emitter: eventEmitter,
    })
  }

  if (state.audioContextReady && state.modules.length > 0) {
    const tickFreq = (state.tempo / 60) * state.ppqn
    const metro = el.mul(
      0,
      el.snapshot(
        { name: 'tick' },
        el.train({}, el.const({ key: 'tickFreq', value: tickFreq })),
        el.time(),
      ),
    )

    const lastModule = state.modules[state.modules.length - 1]
    core.render(lastModule.audioGraph, el.add(metro, lastModule.audioGraph))
  }

  if (!state.audioContextReady) return <h1>Loading...</h1>

  const firstModule = state.modules[0]

  return (
    <div className={styles.container}>
      <h1>Ethertone</h1>
      <Keyboard
        onNoteOn={(noteNum) => firstModule.emitter.emit('noteOn', noteNum)}
        onNoteOff={(noteNum) => firstModule.emitter.emit('noteOff', noteNum)}
      />
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
        <div>
          {state.globalState.measure}:{state.globalState.beat}:
          {state.globalState.teenth}
        </div>
      </div>
      <div>
        {state.modules.map((module, index) => {
          const prevModule = state.modules[index - 1]
          const inputNode = prevModule ? prevModule.audioGraph : 0
          const onClickRemove = () =>
            dispatch({ type: 'removeModule', moduleId: module.moduleId })

          return (
            <div key={index}>
              <h2>{module.spec.title}</h2>
              <module.spec.Component
                telephone={module.emitter}
                globalState={state.globalState}
                inputNode={inputNode}
                moduleId={module.moduleId}
              />
              <button onClick={onClickRemove}>Remove</button>
            </div>
          )
        })}
        <div className={styles.add}>
          {Object.values(moduleSpecs).map((spec) => (
            <button key={spec.title} onClick={() => addModule(spec)}>
              {spec.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
