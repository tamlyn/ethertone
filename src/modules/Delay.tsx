import { el } from '@elemaudio/core'
import { useEffect, useState } from 'react'

import { PercentKnob, TimeKnob } from '../components/Knob/Knobs.tsx'
import { ModuleSpec, RenderAudioGraph } from './types.ts'

type State = {
  feedback: number
  time: number
  wet: number
}

const renderAudioGraph: RenderAudioGraph<State> = ({ id, state, input }) => {
  const delay = el.delay(
    { size: 44100 },
    el.ms2samps(el.const({ key: `${id}time`, value: state.time * 1000 })),
    el.const({ key: `${id}fb`, value: state.feedback }),
    input,
  )
  const mix = el.const({ key: `${id}mix`, value: state.wet })
  return el.select(mix, delay, input)
}

export const Delay: ModuleSpec['Component'] = ({
  moduleId,
  telephone,
  inputNode,
}) => {
  const [state, setState] = useState({
    feedback: 0.5,
    time: 0.5,
    wet: 0.5,
  })

  useEffect(() => {
    const newGraph = renderAudioGraph({ id: moduleId, state, input: inputNode })
    telephone.emit('audioGraph', newGraph)
  }, [telephone, state, inputNode, moduleId])

  return (
    <div style={{ display: 'flex', gap: 10 }}>
      <PercentKnob
        label="Feedback"
        value={state.feedback}
        onChange={(feedback) => setState({ ...state, feedback })}
      />
      <TimeKnob
        label="Time"
        value={state.time}
        onChange={(time) => setState({ ...state, time })}
      />
      <PercentKnob
        label="Wet/Dry"
        value={state.wet}
        onChange={(wet) => setState({ ...state, wet })}
      />
    </div>
  )
}

export default {
  title: 'Delay',
  Component: Delay,
} satisfies ModuleSpec
