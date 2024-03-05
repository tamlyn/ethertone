import { useEffect, useState } from 'react'

import { ModuleSpec, RenderAudioGraph } from '../types.ts'
import srvbAudio from './srvb-audio.ts'

type State = {
  size: number
  decay: number
  mod: number
  mix: number
  sampleRate: number
}

const renderAudioGraph: RenderAudioGraph<State> = ({ id, state, input }) => {
  return srvbAudio({ ...state, key: `${id}hello` }, input, input)[0]
}

export const Reverb: ModuleSpec['Component'] = ({
  moduleId,
  telephone,
  inputNode,
}) => {
  const [state] = useState({
    size: 0.5,
    decay: 0.5,
    mod: 0.5,
    mix: 0.5,
    sampleRate: 44100,
  })

  useEffect(() => {
    telephone.emit(
      'audioGraph',
      renderAudioGraph({ id: moduleId, state, input: inputNode }),
    )
  }, [telephone, state, inputNode])

  return <div />
}

export default {
  title: 'Reverb',
  Component: Reverb,
} satisfies ModuleSpec
