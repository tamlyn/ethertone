import { el } from '@elemaudio/core'
import { useEffect, useState } from 'react'

import { ModuleSpec, RenderAudioGraph } from './types.ts'

type State = {
  frequency: number
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
  const osc = el.blepsaw(el.const({ key: `${id}freq`, value: state.frequency }))
  const synth = el.mul(osc, envelope)
  return el.mul(synth, el.const({ key: `${id}gain`, value: state.gain }))
}

function midiToFreq(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

export const Oscillator: ModuleSpec['Component'] = ({
  moduleId,
  telephone,
  inputNode,
}) => {
  const [state, setState] = useState({
    frequency: 440,
    attack: 0.01,
    decay: 0.1,
    sustain: 0.9,
    release: 0.5,
    waveform: 'saw',
    gain: 0.5,
    gate: 0,
  })

  useEffect(() => {
    function noteOn(note: number) {
      const newState = { ...state, frequency: midiToFreq(note), gate: 1 }
      const newGraph = renderAudioGraph({
        id: moduleId,
        state: newState,
        input: inputNode,
      })
      telephone.emit('audioGraph', newGraph)
      setState(newState)
    }

    function noteOff() {
      const newState = { ...state, gate: 0 }
      const newGraph = renderAudioGraph({
        id: moduleId,
        state: newState,
        input: inputNode,
      })
      telephone.emit('audioGraph', newGraph)
      setState(newState)
    }

    telephone.on('noteOn', noteOn)
    telephone.on('noteOff', noteOff)
    return () => {
      telephone.off('noteOn', noteOn)
      telephone.off('noteOff', noteOff)
    }
  }, [telephone, state, inputNode, moduleId])

  return <div />
}

export default {
  title: 'Oscillator',
  Component: Oscillator,
} satisfies ModuleSpec
