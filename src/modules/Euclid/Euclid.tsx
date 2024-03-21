import { DiscreteKnob } from '~/components/Knob/Knobs.tsx'
import { useModuleState } from '~/components/Module/moduleHooks.ts'

import { ModuleSpec } from '../types.ts'
import { euclideanPattern } from './euclideanPattern.ts'

type State = {
  steps: number
  fill: number
  rotate: number
}

export const Euclid = () => {
  const [state, setState] = useModuleState({
    steps: 16,
    fill: 4,
    rotate: 0,
  })

  const pattern = euclideanPattern(
    Math.round(state.steps),
    Math.round(state.fill),
    Math.round(state.rotate),
  )

  return (
    <div>
      <div style={{ display: 'flex', gap: 10 }}>
        <DiscreteKnob
          label="Divide"
          min={1}
          max={24}
          value={state.steps}
          onChange={(steps) => setState({ ...state, steps })}
        />
        <DiscreteKnob
          label="Fill"
          min={0}
          max={state.steps}
          value={state.fill}
          onChange={(fill) => setState({ ...state, fill })}
        />
        <DiscreteKnob
          label="Rotate"
          min={0}
          max={state.steps - 1}
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
