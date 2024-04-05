export type KnobProps = {
  label: string
  value: number
  onChange: (newValue: number) => void
  min?: number
  max?: number
}
