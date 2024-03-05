import { mapFrom01Linear, mapTo01Linear } from '@dsp-ts/math'
import { useId } from 'react'
import {
  KnobHeadless,
  KnobHeadlessLabel,
  KnobHeadlessOutput,
  useKnobKeyboardControls,
} from 'react-knob-headless'

import styles from './knob.module.css'
import { KnobBaseThumb } from './KnobBaseThumb'

type KnobHeadlessProps = React.ComponentProps<typeof KnobHeadless>
type KnobBaseProps = Pick<
  KnobHeadlessProps,
  | 'valueMin'
  | 'valueMax'
  | 'valueRawRoundFn'
  | 'valueRawDisplayFn'
  | 'orientation'
  | 'mapTo01'
  | 'mapFrom01'
> & {
  readonly label: string
  readonly value: number
  readonly onChange: (newValue: number) => void
  readonly stepFn: (valueRaw: number) => number
  readonly stepLargerFn: (valueRaw: number) => number
}

export function KnobBase({
  label,
  value,
  onChange,
  valueMin,
  valueMax,
  valueRawRoundFn,
  valueRawDisplayFn,
  orientation,
  stepFn,
  stepLargerFn,
  mapTo01 = mapTo01Linear,
  mapFrom01 = mapFrom01Linear,
}: KnobBaseProps) {
  const knobId = useId()
  const labelId = useId()
  const value01 = mapTo01(value, valueMin, valueMax)
  const step = stepFn(value)
  const stepLarger = stepLargerFn(value)
  const dragSensitivity = 0.006

  const keyboardControlHandlers = useKnobKeyboardControls({
    valueRaw: value,
    valueMin,
    valueMax,
    step,
    stepLarger,
    onValueRawChange: onChange,
  })

  return (
    <div className={styles.container}>
      <KnobHeadlessLabel className={styles.label} id={labelId}>
        {label}
      </KnobHeadlessLabel>
      <KnobHeadless
        id={knobId}
        aria-labelledby={labelId}
        className={styles.knob}
        valueMin={valueMin}
        valueMax={valueMax}
        valueRaw={value}
        valueRawRoundFn={valueRawRoundFn}
        valueRawDisplayFn={valueRawDisplayFn}
        dragSensitivity={dragSensitivity}
        orientation={orientation}
        mapTo01={mapTo01}
        mapFrom01={mapFrom01}
        onValueRawChange={onChange}
        {...keyboardControlHandlers}
      >
        <KnobBaseThumb value01={value01} />
      </KnobHeadless>
      <KnobHeadlessOutput className={styles.label} htmlFor={knobId}>
        {valueRawDisplayFn(value)}
      </KnobHeadlessOutput>
    </div>
  )
}
