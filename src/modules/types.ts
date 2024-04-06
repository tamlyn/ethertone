import { ElemNode } from '@elemaudio/core'

export type DefaultState = Record<string, unknown>

export type BuildAudioGraph<State extends DefaultState> = (props: {
  instanceId: string
  state: State
  input: ElemNode
}) => ElemNode

export type ModuleSpec<State extends DefaultState = DefaultState> = {
  title: string
  moduleId: string
  Component: () => JSX.Element
  buildAudioGraph?: BuildAudioGraph<State>
}

export type MeterEvent = {
  type: 'meter'
  source?: string
  min: number
  max: number
}
export type MidiEvent = { type: 'midi'; message: MidiMessage }
export type TickEvent = { type: 'tick'; tick: number }
export type ModuleEvent = MeterEvent | MidiEvent | TickEvent

export type MidiMessage =
  | { type: 'noteOn' | 'noteOff'; note: number; velocity: number }
  | { type: 'allNotesOff' }
  | { type: 'controlChange'; control: number; value: number }
