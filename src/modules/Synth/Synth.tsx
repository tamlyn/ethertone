import { el } from '@elemaudio/core'
import { useEffect, useState } from 'react'

import { PercentKnob, TimeKnob } from '../../components/Knob/Knobs.tsx'
import { midiToFreq } from '../../utils/midi.ts'
import { useEffectEvent } from '../../utils/useEffectEvent.ts'
import { ModuleSpec, RenderAudioGraph } from '../types.ts'
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

const renderAudioGraph: RenderAudioGraph<State> = ({ id, state }) => {
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

export const Synth: ModuleSpec['Component'] = ({
  moduleId,
  telephone,
  inputNode,
}) => {
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
  const [state, setState] = useState<State>(initialState)

  const noteOn = useEffectEvent((note: number) => {
    const newState = { ...state, gate: 1, notes: [...state.notes, note] }
    const newGraph = renderAudioGraph({
      id: moduleId,
      state: newState,
      input: inputNode,
    })
    telephone.emit('audioGraph', newGraph)
    setState(newState)
  })

  const noteOff = useEffectEvent((note: number) => {
    const newNotes = state.notes.filter((noteNum) => note !== noteNum)
    const gate = newNotes.length > 0 ? 1 : 0
    const newState = { ...state, gate, notes: newNotes }
    const newGraph = renderAudioGraph({
      id: moduleId,
      state: newState,
      input: inputNode,
    })
    telephone.emit('audioGraph', newGraph)
    setState(newState)
  })

  useEffect(() => {
    telephone.on('noteOn', noteOn)
    telephone.on('noteOff', noteOff)
    return () => {
      telephone.off('noteOn', noteOn)
      telephone.off('noteOff', noteOff)
    }
  }, [telephone, noteOn, noteOff])

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
  Component: Synth,
} satisfies ModuleSpec
