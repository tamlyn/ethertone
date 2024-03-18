import { KnobBase } from './KnobBase.tsx'

const stepFn = (): number => 0.01
const stepLargerFn = (): number => 0.1

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

const valueRawRoundFn = (num: number) => Math.round(num * 1000) / 1000
const displaySeconds = (valueRaw: number): string => {
  if (valueRaw < 1) return `${Math.round(valueRaw * 1000)}ms`
  return `${valueRaw.toFixed(1)}s`
}

const displayPercent = (valueRaw: number): string =>
  `${(valueRaw * 100).toPrecision(3)}%`

const displayTempo = (valueRaw: number): string => `${Math.round(valueRaw)}bpm`
const displayDiscrete = (valueRaw: number): string => `${Math.round(valueRaw)}`

type KnobProps = {
  label: string
  value: number
  onChange: (newValue: number) => void
  min?: number
  max?: number
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

export const DiscreteKnob = ({ min = 1, max = 10, ...props }: KnobProps) => (
  <KnobBase
    stepFn={stepFn}
    stepLargerFn={stepLargerFn}
    valueMin={min}
    valueMax={max}
    valueRawRoundFn={Math.round}
    valueRawDisplayFn={displayDiscrete}
    steps={max - min}
    {...props}
  />
)
