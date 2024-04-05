import { el } from '@elemaudio/core'

import { PercentKnob } from '~/components/Knob/PercentKnob.tsx'
import { TimeKnob } from '~/components/Knob/TimeKnob.tsx'
import { useModuleState } from '~/components/Module/moduleHooks.ts'

import { BuildAudioGraph, ModuleSpec } from '../types.ts'

type State = {
  feedback: number
  time: number
  wet: number
}

const buildAudioGraph: BuildAudioGraph<State> = ({
  instanceId: id,
  state,
  input,
}) => {
  const delay = el.delay(
    { size: 44100 },
    el.ms2samps(el.const({ key: `${id}time`, value: state.time * 1000 })),
    el.const({ key: `${id}fb`, value: state.feedback }),
    input,
  )
  const mix = el.const({ key: `${id}mix`, value: state.wet })
  return el.select(mix, delay, input)
}

export const Delay = () => {
  const [state, setState] = useModuleState<State>({
    feedback: 0.5,
    time: 0.5,
    wet: 0.5,
  })

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
  moduleId: '@tamlyn/delay',
  Component: Delay,
  buildAudioGraph: buildAudioGraph,
} satisfies ModuleSpec<State>
