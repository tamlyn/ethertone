import { useModuleState } from '~/components/Module/moduleHooks.ts'

import { PercentKnob, TimeKnob } from '../../components/Knob/Knobs.tsx'
import { BuildAudioGraph, ModuleSpec } from '../types.ts'
import styles from './reverb.module.css'
import srvbAudio from './srvb-audio.ts'

type State = {
  size: number
  decay: number
  mod: number
  mix: number
  sampleRate: number
}

const buildAudioGraph: BuildAudioGraph<State> = ({
  instanceId,
  state,
  input,
}) => {
  return srvbAudio({ ...state, key: instanceId }, input, input)[0]
}

export const Reverb = () => {
  const [state, setState] = useModuleState({
    size: 0.5,
    decay: 0.5,
    mod: 0.5,
    mix: 0.5,
    sampleRate: 44100,
  })

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
  moduleId: '@tamlyn/reverb',
  Component: Reverb,
  buildAudioGraph,
} satisfies ModuleSpec<State>
