import { el } from '@elemaudio/core'

import { useEvent, useModuleState } from '~/components/Module/moduleHooks.ts'

import { BuildAudioGraph, ModuleSpec } from '../types.ts'
import styles from './meter.module.css'

type State = {
  level: number
}

const buildAudioGraph: BuildAudioGraph<State> = ({ instanceId, input }) => {
  return el.meter({ name: instanceId }, input)
}

export const Meter = () => {
  const [state, setState] = useModuleState({ level: 0 })

  useEvent('meter', (event) => {
    const level = Math.max(Math.abs(event.min), Math.abs(event.max))
    if (level > 0.0001) {
      setState({ level })
    }
  })

  return (
    <div className={styles.container}>
      <div
        className={styles.output}
        style={{ width: `${state.level * 100}%` }}
      />
    </div>
  )
}

export default {
  title: 'Meter',
  moduleId: '@tamlyn/meter',
  Component: Meter,
  buildAudioGraph,
} satisfies ModuleSpec<State>
