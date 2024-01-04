import './App.css'

import { NodeRepr_t } from '@elemaudio/core'
import WebRenderer from '@elemaudio/web-renderer'
import { useEffect, useReducer, useState } from 'react'

import * as moduleSpecs from './modules'
import { DefaultState, ModuleSpec } from './modules/types.ts'

type Module = { spec: ModuleSpec; state: DefaultState }

type AppState = {
  modules: Array<Module>
}

type AppAction =
  | { type: 'addModule'; module: ModuleSpec }
  | { type: 'updateModuleState'; moduleIndex: number; state: DefaultState }

const initialState: AppState = {
  modules: [],
}

const ctx = new AudioContext()
const core = new WebRenderer()

function renderAudioGraph(modules: AppState['modules']) {
  const out = modules.reduce<number | NodeRepr_t>(
    (out, module) =>
      module.spec.renderAudioGraph({
        state: module.state,
        input: out,
      }),
    0,
  )
  core.render(out, out)
}

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'addModule':
      return {
        ...state,
        modules: [
          ...state.modules,
          {
            spec: action.module,
            state: action.module.stateReducer({}, { type: 'init' }),
          },
        ],
      }
    case 'updateModuleState':
      return {
        ...state,
        modules: state.modules.map((module, index) =>
          index === action.moduleIndex
            ? { ...module, state: action.state }
            : module,
        ),
      }
    default:
      return state
  }
}

function App() {
  const [ready, setReady] = useState(false)
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    core
      .on('load', () => setReady(true))
      .initialize(ctx)
      .then((node) => node.connect(ctx.destination))
      .catch(console.error)

    return () => void core.removeAllListeners('load')
  }, [])

  // this is not typesafe - can it ever be?
  function addModule(module: unknown) {
    ctx.resume().catch(console.error)
    dispatch({ type: 'addModule', module: module as ModuleSpec })
  }

  if (ready) renderAudioGraph(state.modules)

  if (!ready) return <h1>Loading...</h1>

  return (
    <div>
      <h1>Ethertone</h1>
      <div className="modules">
        {state.modules.map((module, index) => (
          <div key={index}>
            <h2>{module.spec.title}</h2>
            <module.spec.Component
              state={module.state}
              dispatch={
                //todo: make this stable
                (action) =>
                  dispatch({
                    type: 'updateModuleState',
                    moduleIndex: index,
                    state: module.spec.stateReducer(module.state, action),
                  })
              }
            />
          </div>
        ))}
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
