import EventEmitter from 'eventemitter3'
import { v4 } from 'uuid'

import { DefaultState } from './modules/types.ts'

export type Module = {
  moduleId: string
  instanceId: string
  emitter: EventEmitter
  consumesMidi: boolean
  moduleState?: DefaultState
}

export type AppState = {
  audioContextReady: boolean
  modules: Array<Module>
  globalState: {
    playing: boolean
    metronome: boolean
    measure: number
    beat: number
    teenth: number
  }
  tempo: number
  ppqn: number
  tickCounter: number
  startPlayPosition: number
}

export const initialState: AppState = {
  audioContextReady: false,
  modules: [],
  globalState: {
    playing: false,
    metronome: false,
    measure: 1,
    beat: 1,
    teenth: 1,
  },
  ppqn: 8,
  tempo: 120,
  tickCounter: 0,
  startPlayPosition: 0,
}

type AppAction =
  | { type: 'audioContextReady' }
  | { type: 'addModule'; moduleId: string }
  | { type: 'removeModule'; instanceId: string }
  | {
      type: 'moduleStateChanged'
      instanceId: string
      moduleState: DefaultState
    }
  | { type: 'updateTempo'; tempo: number }
  | { type: 'tick' }
  | { type: 'playToggle' }
  | { type: 'metronomeToggle' }

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'audioContextReady':
      return { ...state, audioContextReady: true }

    case 'addModule': {
      const instanceId = v4()
      console.debug('Adding module "%s" (%s)', action.moduleId, instanceId)
      return {
        ...state,
        modules: [
          ...state.modules,
          {
            moduleId: action.moduleId,
            instanceId,
            emitter: new EventEmitter(),
            consumesMidi: true, // todo default to false
          },
        ],
      }
    }

    case 'removeModule': {
      const newModules = state.modules.filter(
        (module) => module.instanceId !== action.instanceId,
      )
      return { ...state, modules: newModules }
    }

    case 'moduleStateChanged': {
      const moduleIndex = state.modules.findIndex(
        (module) => module.instanceId === action.instanceId,
      )
      if (moduleIndex === -1) {
        console.error('moduleStateChanged: module not found', action.instanceId)
        return state
      }

      const newModules = [...state.modules]
      newModules[moduleIndex] = {
        ...newModules[moduleIndex],
        moduleState: action.moduleState,
      }
      return { ...state, modules: newModules }
    }

    case 'updateTempo':
      return { ...state, tempo: action.tempo }

    case 'tick':
      if (state.globalState.playing) {
        const timeSignature = 4
        const tickCounter = state.tickCounter + 1
        const teenth =
          Math.floor(
            ((tickCounter % state.ppqn) / state.ppqn) * timeSignature,
          ) + 1
        const beat = (Math.floor(tickCounter / state.ppqn) % timeSignature) + 1
        const measure =
          Math.floor(tickCounter / (state.ppqn * timeSignature)) + 1
        return {
          ...state,
          tickCounter,
          globalState: { ...state.globalState, teenth, beat, measure },
        }
      }
      return state

    case 'playToggle':
      return {
        ...state,
        globalState: {
          ...state.globalState,
          playing: !state.globalState.playing,
        },
        startPlayPosition: state.tickCounter,
      }

    case 'metronomeToggle':
      return {
        ...state,
        globalState: {
          ...state.globalState,
          metronome: !state.globalState.metronome,
        },
      }

    default:
      return state
  }
}
