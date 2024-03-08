import './App.css'

import { el, ElemNode } from '@elemaudio/core'
import WebRenderer from '@elemaudio/web-renderer'
import EventEmitter from 'eventemitter3'
import { useEffect, useReducer } from 'react'
import { v4 } from 'uuid'

import Keyboard from './components/Keyboard.tsx'
import * as moduleSpecs from './modules'
import { MeterEvent, ModuleSpec } from './modules/types.ts'
import { useEffectEvent } from './utils/useEffectEvent.ts'

type Module = {
  spec: ModuleSpec
  moduleId: string
  emitter: EventEmitter
  audioGraph: ElemNode
  inputNode: ElemNode
}

type AppState = {
  audioContextReady: boolean
  modules: Array<Module>
  globalState: { playing: boolean }
}

type AppAction =
  | { type: 'audioContextReady' }
  | {
      type: 'addModule'
      moduleId: string
      moduleSpec: ModuleSpec
      emitter: EventEmitter
    }
  | {
      type: 'moduleAudioGraphChanged'
      moduleId: string
      audioGraph: ElemNode
    }

const initialState: AppState = {
  audioContextReady: false,
  modules: [],
  globalState: { playing: false },
}

const ctx = new AudioContext()
const core = new WebRenderer()

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'audioContextReady':
      return { ...state, audioContextReady: true }
    case 'addModule':
      return {
        ...state,
        modules: [
          ...state.modules,
          {
            spec: action.moduleSpec,
            moduleId: action.moduleId,
            emitter: action.emitter,
            audioGraph: el.const({ value: 0 }),
            inputNode: state.modules[state.modules.length - 1]?.audioGraph ?? 0,
          },
        ],
      }
    case 'moduleAudioGraphChanged': {
      const moduleIndex = state.modules.findIndex(
        (module) => module.moduleId === action.moduleId,
      )
      if (moduleIndex === -1) return state

      const newModules = [...state.modules]
      newModules[moduleIndex] = {
        ...newModules[moduleIndex],
        audioGraph: action.audioGraph,
      }
      return { ...state, modules: newModules }
    }
    default:
      return state
  }
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

  useEffect(() => {
    core.on('meter', onMeter)
    return () => void core.off('meter', onMeter)
  }, [onMeter])

  function addModule(spec: unknown) {
    ctx.resume().catch(console.error)

    // this is not typesafe - can it ever be?
    const moduleSpec = spec as ModuleSpec
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
      moduleSpec: moduleSpec,
      emitter: eventEmitter,
    })
  }

  if (state.audioContextReady && state.modules.length > 0) {
    const lastModule = state.modules[state.modules.length - 1]
    core.render(lastModule.audioGraph, lastModule.audioGraph)
  }

  if (!state.audioContextReady) return <h1>Loading...</h1>

  const firstModule = state.modules[0]

  return (
    <div>
      <h1>Ethertone</h1>
      <Keyboard
        onNoteOn={(noteNum) => firstModule.emitter.emit('noteOn', noteNum)}
        onNoteOff={(noteNum) => firstModule.emitter.emit('noteOff', noteNum)}
      />
      <div className="modules">
        {state.modules.map((module, index) => {
          const prevModule = state.modules[index - 1]
          const inputNode = prevModule ? prevModule.audioGraph : 0
          return (
            <div key={index}>
              <h2>{module.spec.title}</h2>
              <module.spec.Component
                telephone={module.emitter}
                globalState={state.globalState}
                inputNode={inputNode}
                moduleId={module.moduleId}
              />
            </div>
          )
        })}
        <div className="add">
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
