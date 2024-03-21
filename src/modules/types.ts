import { ElemNode } from '@elemaudio/core'

export type DefaultState = Record<string, unknown>

export type MeterEvent = {
  source?: string
  min: number
  max: number
}

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

export type MidiEvent =
  | { type: 'noteOn' | 'noteOff'; note: number; velocity: number }
  | { type: 'controlChange'; control: number; value: number }
