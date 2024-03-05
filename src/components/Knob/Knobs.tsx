import { KnobBase } from './KnobBase.tsx'

const stepFn = (): number => 0.01
const stepLargerFn = (): number => 0.1
const valueRawRoundFn = (num: number) => Math.round(num * 100) / 100
const displaySeconds = (valueRaw: number): string =>
  `${valueRawRoundFn(valueRaw)}s`
const displayPercent = (valueRaw: number): string =>
  `${valueRawRoundFn(valueRaw) * 100}%`

type KnobProps = {
  label: string
  value: number
  onChange: (newValue: number) => void
}

export const TimeKnob = ({ label, value, onChange }: KnobProps) => {
  return (
    <KnobBase
      label={label}
      value={value}
      onChange={onChange}
      stepFn={stepFn}
      stepLargerFn={stepLargerFn}
      valueMin={0}
      valueMax={5}
      valueRawRoundFn={valueRawRoundFn}
      valueRawDisplayFn={displaySeconds}
    />
  )
}

export const PercentKnob = ({ label, value, onChange }: KnobProps) => {
  return (
    <KnobBase
      label={label}
      value={value}
      onChange={onChange}
      stepFn={stepFn}
      stepLargerFn={stepLargerFn}
      valueMin={0}
      valueMax={1}
      valueRawRoundFn={valueRawRoundFn}
      valueRawDisplayFn={displayPercent}
    />
  )
}
