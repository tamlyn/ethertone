import { el } from '@elemaudio/core'

import { ModuleSpec } from './types.ts'

type State = {
  frequency: number
  waveform: string
  gain: number
}

type Action =
  | { type: 'init' }
  | { type: 'setFrequency'; frequency: number }
  | { type: 'setWaveform'; waveform: 'sine' | 'square' | 'saw' }
  | { type: 'setGain'; gain: number }

type Spec = ModuleSpec<State, Action>

const stateReducer: Spec['stateReducer'] = (state, action) => {
  switch (action.type) {
    case 'init':
      return { frequency: 440, waveform: 'sine', gain: 0.5 }
    case 'setFrequency':
      return { ...state, frequency: action.frequency }
    case 'setWaveform':
      return { ...state, waveform: action.waveform }
    case 'setGain':
      return { ...state, gain: action.gain }
    default:
      console.warn('Unhandled action', action)
      return state
  }
}

const renderAudioGraph: Spec['renderAudioGraph'] = ({ state, input }) => {
  console.log('renderAudioGraph', state)
  const osc = el.mul(el.cycle(state.frequency), state.gain)
  return el.add(osc, input ?? 0)
}

export const Component: Spec['Component'] = ({ state, dispatch }) => (
  <div>
    <input
      type="range"
      min="20"
      max="20000"
      value={state.frequency}
      onChange={(e) =>
        dispatch({ type: 'setFrequency', frequency: Number(e.target.value) })
      }
    />
  </div>
)

export default {
  title: 'Oscillator',
  Component,
  renderAudioGraph,
  stateReducer,
} satisfies Spec
