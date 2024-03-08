import { el, ElemNode } from '@elemaudio/core'
import { useEffect, useState } from 'react'

import { MeterEvent, ModuleSpec } from '../types.ts'
import styles from './meter.module.css'

const renderAudioGraph = ({ id, input }: { id: string; input: ElemNode }) => {
  return el.meter({ name: id }, input)
}

export const Meter: ModuleSpec['Component'] = ({
  moduleId,
  telephone,
  inputNode,
}) => {
  const [level, setLevel] = useState(0)

  useEffect(() => {
    const newGraph = renderAudioGraph({ id: moduleId, input: inputNode })
    telephone.emit('audioGraph', newGraph)

    telephone.on('meter', (event: MeterEvent) => {
      setLevel(event.max)
    })

    return () => {
      telephone.off('meter')
    }
  }, [telephone, inputNode, moduleId])

  return (
    <div className={styles.container}>
      <div className={styles.output} style={{ width: `${level * 100}%` }} />
    </div>
  )
}

export default {
  title: 'Meter',
  Component: Meter,
} satisfies ModuleSpec
