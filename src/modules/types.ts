import { NodeRepr_t } from '@elemaudio/core'
import EventEmitter from 'eventemitter3'

export type DefaultState = Record<string, unknown>

export type DefaultAction = { type: string }

export type AudioNode = NodeRepr_t | number

export type ModuleSpec<State extends DefaultState = DefaultState> = {
  title: string
  Component: (props: {
    globalState: State
    telephone: EventEmitter
    inputNode: AudioNode
    moduleId: string
  }) => JSX.Element
}
