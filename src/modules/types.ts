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
export type MidiEvent =
  | { type: 'midi'; midiType: 'noteOn'; note: number; velocity: number }
  | { type: 'midi'; midiType: 'noteOff'; note: number; velocity: number }
  | { type: 'midi'; midiType: 'allNotesOff' }
  | { type: 'midi'; midiType: 'controlChange'; control: number; value: number }
export type TickEvent = { type: 'tick'; tick: number }
export type ModuleEvent = MeterEvent | MidiEvent | TickEvent
