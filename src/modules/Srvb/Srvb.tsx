import { useEffect, useState } from 'react'

import { PercentKnob, TimeKnob } from '../../components/Knob/Knobs.tsx'
import { ModuleSpec, RenderAudioGraph } from '../types.ts'
import styles from './reverb.module.css'
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
  const [state, setState] = useState({
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
  }, [telephone, state, inputNode, moduleId])

  return (
    <div className={styles.knobs}>
      <PercentKnob
        label="Size"
        value={state.size}
        onChange={(size) => setState({ ...state, size })}
      />
      <TimeKnob
        label="Decay"
        value={state.decay}
        onChange={(decay) => setState({ ...state, decay })}
      />
      <PercentKnob
        label="Mod"
        value={state.mod}
        onChange={(mod) => setState({ ...state, mod })}
      />
      <PercentKnob
        label="Dry/wet"
        value={state.mix}
        onChange={(mix) => setState({ ...state, mix })}
      />
    </div>
  )
}

export default {
  title: 'Reverb',
  Component: Reverb,
} satisfies ModuleSpec
