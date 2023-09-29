import './App.css'

import { NodeRepr_t } from '@elemaudio/core'
import WebRenderer from '@elemaudio/web-renderer'
import { useEffect, useState } from 'react'

import * as moduleSpecs from './modules'

type ModuleSpec = {
  title: string
  Component: () => JSX.Element
  renderAudioGraph: (input?: number | NodeRepr_t) => number | NodeRepr_t
}

const ctx = new AudioContext()
const core = new WebRenderer()

function renderAudioGraph(modules: ModuleSpec[]) {
  const out = modules.reduce<number | NodeRepr_t>(
    (out, module) => module.renderAudioGraph(out),
    0,
  )
  core.render(out, out)
}

function App() {
  const [ready, setReady] = useState(false)
  const [modules, setModules] = useState<ModuleSpec[]>([])

  useEffect(() => {
    core
      .on('load', () => setReady(true))
      .initialize(ctx)
      .then((node) => node.connect(ctx.destination))
      .catch(console.error)

    return () => void core.removeAllListeners('load')
  }, [])

  if (ready) renderAudioGraph(modules)

  if (!ready) return <h1>Loading...</h1>

  return (
    <div>
      <h1>Ethertone</h1>
      <div className="modules">
        {modules.map((module) => (
          <div key={module.title}>
            <h2>{module.title}</h2>
            <module.Component />
          </div>
        ))}
        <div className="add">
          {Object.values(moduleSpecs).map((module) => (
            <button
              key={module.title}
              onClick={() => setModules([...modules, module])}
            >
              {module.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App
