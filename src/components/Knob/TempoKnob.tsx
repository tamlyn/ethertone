import { KnobProps } from '~/components/Knob/components/types.ts'

import { stepFn, stepLargerFn } from './components/functions.ts'
import { KnobBase } from './components/KnobBase.tsx'

const displayTempo = (valueRaw: number): string => `${Math.round(valueRaw)}bpm`

export const TempoKnob = ({ min = 20, max = 200, ...props }: KnobProps) => (
  <KnobBase
    stepFn={stepFn}
    stepLargerFn={stepLargerFn}
    valueMin={min}
    valueMax={max}
    valueRawRoundFn={Math.round}
    valueRawDisplayFn={displayTempo}
    {...props}
  />
)
