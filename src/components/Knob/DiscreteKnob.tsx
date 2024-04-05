import { useState } from 'react'

import { stepFn, stepLargerFn } from '~/components/Knob/components/functions.ts'
import { KnobBase } from '~/components/Knob/components/KnobBase.tsx'

export type KnobProps<T extends string | number> = {
  label: string
  value: T
  onChange: (newValue: T) => void
  options: T[]
}

export const DiscreteKnob = <T extends string | number>({
  options,
  onChange,
  value,
  ...props
}: KnobProps<T>) => {
  const [rawValue, setRawValue] = useState(options.indexOf(value))
  const min = 0
  const max = options.length - 1
  const clampedValue = Math.max(min, Math.min(max, rawValue))

  function onNumericChange(newRawValue: number) {
    setRawValue(newRawValue)
    const roundedValue = Math.round(newRawValue)
    const option = options[roundedValue]
    if (option !== value) onChange(option)
  }

  return (
    <KnobBase
      stepFn={stepFn}
      stepLargerFn={stepLargerFn}
      valueMin={min}
      valueMax={max}
      valueRawRoundFn={Math.round}
      valueRawDisplayFn={(valueRaw) => String(options[Math.round(valueRaw)])}
      steps={max - min}
      onChange={onNumericChange}
      value={clampedValue}
      {...props}
    />
  )
}
