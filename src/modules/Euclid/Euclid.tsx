import { DiscreteKnob } from '~/components/Knob/DiscreteKnob.tsx'
import {
  useEvent,
  useMidi,
  useModuleState,
} from '~/components/Module/moduleHooks.ts'

import { ModuleSpec } from '../types.ts'
import { euclideanPattern } from './euclideanPattern.ts'

type State = {
  steps: number
  fill: number
  rotate: number
  cursor: number
}

export const Euclid = () => {
  const [state, setState] = useModuleState({
    steps: 16,
    fill: 4,
    rotate: 0,
    cursor: 0,
  })
  const { trigger } = useMidi()

  const pattern = euclideanPattern(
    Math.round(state.steps),
    Math.round(state.fill),
    Math.round(state.rotate),
  )

  useEvent('tick', () => {
    const cursor = (state.cursor + 1) % state.steps
    setState({ ...state, cursor })
    if (pattern[cursor]) {
      trigger({ type: 'midi', midiType: 'noteOn', note: 60, velocity: 100 })
    } else {
      trigger({ type: 'midi', midiType: 'noteOff', note: 60, velocity: 100 })
    }
  })

  return (
    <div>
      <div style={{ display: 'flex', gap: 10 }}>
        <DiscreteKnob
          label="Divide"
          options={Array.from({ length: 24 }, (_, i) => i + 1)}
          value={state.steps}
          onChange={(steps) => setState({ ...state, steps })}
        />
        <DiscreteKnob
          label="Fill"
          options={Array.from({ length: state.steps }, (_, i) => i + 1)}
          value={state.fill}
          onChange={(fill) => setState({ ...state, fill })}
        />
        <DiscreteKnob
          label="Rotate"
          options={Array.from({ length: state.steps }, (_, i) => i)}
          value={state.rotate}
          onChange={(rotate) => setState({ ...state, rotate })}
        />
      </div>
      <div
        style={{
          display: 'flex',
          height: 10,
          justifyContent: 'stretch',
          justifyItems: 'stretch',
        }}
      >
        {pattern.map((x, i) => (
          <div
            key={i}
            style={{ backgroundColor: x ? 'black' : 'white', flex: 1 }}
          />
        ))}
      </div>
    </div>
  )
}

export default {
  title: 'Euclid',
  moduleId: '@tamlyn/euclid',
  Component: Euclid,
  buildAudioGraph: ({ input }) => input,
} satisfies ModuleSpec<State>
