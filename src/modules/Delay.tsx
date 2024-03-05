import { el } from '@elemaudio/core'
import { useEffect, useState } from 'react'

import { ModuleSpec, RenderAudioGraph } from './types.ts'

type State = {
  feedback: number
  time: number
}

const renderAudioGraph: RenderAudioGraph<State> = ({ id, state, input }) => {
  return el.delay(
    { size: 44100 },
    el.ms2samps(state.time * 1000),
    el.const({ key: `${id}fb`, value: state.feedback }),
    input,
  )
}

export const Delay: ModuleSpec['Component'] = ({
  moduleId,
  telephone,
  inputNode,
}) => {
  const [state] = useState({
    feedback: 0.5,
    time: 0.5,
  })

  useEffect(() => {
    const newGraph = renderAudioGraph({ id: moduleId, state, input: inputNode })
    telephone.emit('audioGraph', newGraph)
  }, [telephone, state, inputNode, moduleId])

  return <div />
}

export default {
  title: 'Delay',
  Component: Delay,
} satisfies ModuleSpec
