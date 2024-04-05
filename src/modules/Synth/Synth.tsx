import { el } from '@elemaudio/core'

import { PercentKnob } from '~/components/Knob/PercentKnob.tsx'
import { TimeKnob } from '~/components/Knob/TimeKnob.tsx'
import { useMidi, useModuleState } from '~/components/Module/moduleHooks.ts'
import { midiToFreq } from '~/utils/midi.ts'

import { BuildAudioGraph, ModuleSpec } from '../types.ts'
import styles from './synth.module.css'

type State = {
  notes: number[]
  waveform: string
  attack: number
  decay: number
  sustain: number
  release: number
  gain: number
  gate: number
}

const buildAudioGraph: BuildAudioGraph<State> = ({ instanceId: id, state }) => {
  const envelope = el.adsr(
    el.const({ key: `${id}attack`, value: state.attack }),
    el.const({ key: `${id}decay`, value: state.decay }),
    el.const({ key: `${id}sustain`, value: state.sustain }),
    el.const({ key: `${id}release`, value: state.release }),
    el.const({ key: `${id}gate`, value: state.gate }),
  )
  const lastNote = state.notes[state.notes.length - 1]
  const value = lastNote ? midiToFreq(lastNote) : 10
  const osc = el.blepsaw(el.const({ key: `${id}freq`, value: value }))
  const synth = el.mul(osc, envelope)
  return el.mul(synth, el.const({ key: `${id}gain`, value: state.gain }))
}

const Synth = () => {
  const initialState = {
    notes: [],
    attack: 0.01,
    decay: 0.1,
    sustain: 0.9,
    release: 0.5,
    waveform: 'saw',
    gain: 0.5,
    gate: 0,
  }
  const [state, setState] = useModuleState<State>(initialState)

  useMidi((event) => {
    switch (event.type) {
      case 'noteOn': {
        const notes = [...state.notes, event.note]
        setState({ ...state, gate: 1, notes })
        break
      }
      case 'noteOff': {
        const notes = state.notes.filter((note) => note !== event.note)
        const gate = notes.length > 0 ? 1 : 0
        setState({ ...state, gate, notes })
        break
      }
    }
  })

  return (
    <div className={styles.knobs}>
      <TimeKnob
        label="Attack"
        value={state.attack}
        onChange={(attack) => setState({ ...state, attack })}
      />
      <TimeKnob
        label="Decay"
        value={state.decay}
        onChange={(decay) => setState({ ...state, decay })}
      />
      <PercentKnob
        label="Sustain"
        value={state.sustain}
        onChange={(sustain) => setState({ ...state, sustain })}
      />
      <TimeKnob
        label="Release"
        value={state.release}
        onChange={(release) => setState({ ...state, release })}
        max={6}
      />
    </div>
  )
}

export default {
  title: 'Synth',
  moduleId: '@tamlyn/synth',
  Component: Synth,
  buildAudioGraph,
} satisfies ModuleSpec<State>
