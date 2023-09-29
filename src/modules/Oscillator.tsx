import { el } from '@elemaudio/core'
import { create } from 'zustand'
import { combine } from 'zustand/middleware'

export default {
  title: 'Oscillator',
  Component,
  renderAudioGraph,
}

const useModuleState = create(
  combine(
    {
      frequency: 440,
      waveform: 'sine',
      gain: 0.5,
    },
    (set) => ({
      changeFrequency: (frequency: number) => set({ frequency }),
    }),
  ),
)

function renderAudioGraph() {
  const { frequency, gain } = useModuleState.getState()
  return el.mul(el.cycle(frequency), gain)
}

export function Component() {
  const state = useModuleState()
  return (
    <div>
      <input
        type="range"
        min="20"
        max="20000"
        value={state.frequency}
        onChange={(e) => state.changeFrequency(Number(e.target.value))}
      />
    </div>
  )
}
