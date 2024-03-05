import { ElemNode } from '@elemaudio/core'
import EventEmitter from 'eventemitter3'

export type DefaultState = Record<string, unknown>

export type RenderAudioGraph<State extends DefaultState> = (props: {
  id: string
  state: State
  input: ElemNode
}) => ElemNode

export type ModuleSpec<State extends DefaultState = DefaultState> = {
  title: string
  Component: (props: {
    globalState: State
    telephone: EventEmitter
    inputNode: ElemNode
    moduleId: string
  }) => JSX.Element
}
