import { el } from '@elemaudio/core'
import { useEffect, useState } from 'react'

import { AudioNode, ModuleSpec } from './types.ts'

type State = {
  frequency: number
  waveform: string
  gain: number
}

const renderAudioGraph: (props: {
  state: State
  input: AudioNode
}) => AudioNode = ({ state, input }) => {
  const osc = el.mul(el.cycle(state.frequency), state.gain)
  return el.add(osc, input ?? 0)
}

function midiToFreq(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

export const Oscillator: ModuleSpec['Component'] = ({
  telephone,
  inputNode,
}) => {
  const [state, setState] = useState({
    frequency: 440,
    waveform: 'sine',
    gain: 0.5,
  })

  useEffect(() => {
    function noteOn(note: number) {
      const newState = { ...state, frequency: midiToFreq(note), gain: 0.5 }
      const newGraph = renderAudioGraph({ state: newState, input: inputNode })
      telephone.emit('audioGraph', newGraph)
      setState(newState)
    }

    function noteOff() {
      const newState = { ...state, gain: 0 }
      const newGraph = renderAudioGraph({ state: newState, input: inputNode })
      telephone.emit('audioGraph', newGraph)
      setState(newState)
    }

    telephone.on('noteOn', noteOn)
    telephone.on('noteOff', noteOff)
    return () => {
      telephone.off('noteOn', noteOn)
      telephone.off('noteOff', noteOff)
    }
  }, [telephone, state, inputNode])

  return <div />
}

export default {
  title: 'Oscillator',
  Component: Oscillator,
} satisfies ModuleSpec
