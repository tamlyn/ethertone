import './App.css'

import { el } from '@elemaudio/core'
import WebRenderer from '@elemaudio/web-renderer'
import { useEffect } from 'react'

const ctx = new AudioContext()
const core = new WebRenderer()

core.on('load', function () {
  core.render(el.cycle(440), el.cycle(441))
})

function App() {
  useEffect(() => {
    core.initialize(ctx).then((node) => node.connect(ctx.destination))
  }, [])

  return <h1>Ethertone</h1>
}

export default App
