import { mapFrom01Linear } from '@dsp-ts/math'

import styles from './knob.module.css'

type KnobBaseThumbProps = {
  readonly value01: number
}

export function KnobBaseThumb({ value01 }: KnobBaseThumbProps) {
  const angleMin = -145
  const angleMax = 145
  const angle = mapFrom01Linear(value01, angleMin, angleMax)
  return (
    <div className={styles.outer} style={{ rotate: `${angle}deg` }}>
      <div className={styles.tick} />
    </div>
  )
}
