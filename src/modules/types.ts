import { NodeRepr_t } from '@elemaudio/core'

export type DefaultState = Record<string, unknown>

export type DefaultAction = { type: string }

export type ModuleSpec<
  State extends DefaultState = DefaultState,
  Action extends DefaultAction = DefaultAction,
> = {
  title: string
  Component: (props: {
    state: State
    dispatch: (action: Action) => void
  }) => JSX.Element
  renderAudioGraph: (props: {
    state: State
    input?: NodeRepr_t | number
  }) => number | NodeRepr_t
  stateReducer: (state: State, action: Action) => State
}
