import { KnobProps } from '~/components/Knob/components/types.ts'

import { stepLargerFn, valueRawRoundFn } from './components/functions.ts'
import { KnobBase } from './components/KnobBase.tsx'

const exponentialStepFn = (valueRaw: number): number => {
  if (valueRaw < 0.1) return 0.01
  if (valueRaw < 1) return 0.1
  if (valueRaw < 10) return 1
  if (valueRaw < 100) return 10
  return 100
}

const mapFrom01Parabolic = (x: number, min: number, max: number): number =>
  min + (max - min) * x * x

const mapTo01Parabolic = (x: number, min: number, max: number): number =>
  Math.sqrt((x - min) / (max - min))

const displaySeconds = (valueRaw: number): string => {
  if (valueRaw < 1) return `${Math.round(valueRaw * 1000)}ms`
  return `${valueRaw.toFixed(1)}s`
}

export const TimeKnob = ({ min = 0, max = 1, ...props }: KnobProps) => {
  return (
    <KnobBase
      stepFn={exponentialStepFn}
      stepLargerFn={stepLargerFn}
      valueMin={min}
      valueMax={max}
      valueRawRoundFn={valueRawRoundFn}
      valueRawDisplayFn={displaySeconds}
      mapTo01={mapTo01Parabolic}
      mapFrom01={mapFrom01Parabolic}
      {...props}
    />
  )
}
