import {
  stepFn,
  stepLargerFn,
  valueRawRoundFn,
} from './components/functions.ts'
import { KnobBase } from './components/KnobBase.tsx'
import { KnobProps } from './components/types.ts'

const displayPercent = (valueRaw: number): string =>
  `${(valueRaw * 100).toPrecision(3)}%`

export const PercentKnob = ({ min = 0, max = 1, ...props }: KnobProps) => (
  <KnobBase
    stepFn={stepFn}
    stepLargerFn={stepLargerFn}
    valueMin={min}
    valueMax={max}
    valueRawRoundFn={valueRawRoundFn}
    valueRawDisplayFn={displayPercent}
    {...props}
  />
)
