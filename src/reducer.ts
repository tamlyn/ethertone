import { el, ElemNode } from '@elemaudio/core'
import EventEmitter from 'eventemitter3'

import { ModuleSpec } from './modules/types.ts'

type Module = {
  spec: ModuleSpec
  moduleId: string
  emitter: EventEmitter
  audioGraph: ElemNode
  inputNode: ElemNode
}

type AppState = {
  audioContextReady: boolean
  modules: Array<Module>
  globalState: {
    playing: boolean
    measure: number
    beat: number
    teenth: number
  }
  tempo: number
  ppqn: number
  tickCounter: number
}

type AppAction =
  | { type: 'audioContextReady' }
  | {
      type: 'addModule'
      moduleId: string
      moduleSpec: ModuleSpec
      emitter: EventEmitter
    }
  | { type: 'removeModule'; moduleId: string }
  | {
      type: 'moduleAudioGraphChanged'
      moduleId: string
      audioGraph: ElemNode
    }
  | { type: 'updateTempo'; tempo: number }
  | { type: 'tick' }
  | { type: 'playToggle' }

export const initialState: AppState = {
  audioContextReady: false,
  modules: [],
  globalState: { playing: false, measure: 1, beat: 1, teenth: 1 },
  ppqn: 8,
  tempo: 120,
  tickCounter: 0,
}

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'audioContextReady':
      return { ...state, audioContextReady: true }

    case 'addModule':
      return {
        ...state,
        modules: [
          ...state.modules,
          {
            spec: action.moduleSpec,
            moduleId: action.moduleId,
            emitter: action.emitter,
            audioGraph: el.const({ value: 0 }),
            inputNode: state.modules[state.modules.length - 1]?.audioGraph ?? 0,
          },
        ],
      }

    case 'removeModule': {
      const newModules = state.modules.filter(
        (module) => module.moduleId !== action.moduleId,
      )
      return { ...state, modules: newModules }
    }

    case 'moduleAudioGraphChanged': {
      const moduleIndex = state.modules.findIndex(
        (module) => module.moduleId === action.moduleId,
      )
      if (moduleIndex === -1) return state

      const newModules = [...state.modules]
      newModules[moduleIndex] = {
        ...newModules[moduleIndex],
        audioGraph: action.audioGraph,
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
      }

    default:
      return state
  }
}
