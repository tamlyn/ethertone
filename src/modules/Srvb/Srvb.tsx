import { useEffect, useState } from 'react'

import { AudioNode, ModuleSpec } from '../types.ts'
import srvbAudio from './srvb-audio.ts'

type State = {
  size: number
  decay: number
  mod: number
  mix: number
  sampleRate: number
}

const renderAudioGraph: (props: {
  state: State
  input: AudioNode
}) => AudioNode = ({ state, input }) => {
  return srvbAudio({ ...state, key: 'hello' }, input, input)[0]
}

export const Reverb: ModuleSpec['Component'] = ({ telephone, inputNode }) => {
  const [state] = useState({
    size: 0.5,
    decay: 0.5,
    mod: 0.5,
    mix: 0.5,
    sampleRate: 44100,
  })

  useEffect(() => {
    telephone.emit('audioGraph', renderAudioGraph({ state, input: inputNode }))
  }, [telephone, state, inputNode])

  return <div />
}

export default {
  title: 'Reverb',
  Component: Reverb,
} satisfies ModuleSpec
