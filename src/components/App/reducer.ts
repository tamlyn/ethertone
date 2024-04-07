import { v4 } from 'uuid'

import { DefaultState } from '../../modules/types.ts'

export type Track = {
  trackId: string
  modules: Array<Module>
}

export type Module = {
  moduleId: string
  instanceId: string
  consumesMidi: boolean
  moduleState?: DefaultState
}

export type AppState = {
  audioContextReady: boolean
  tracks: Array<Track>
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
  tracks: [{ trackId: v4(), modules: [] }],
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

export type AppAction =
  | { type: 'audioContextReady' }
  | { type: 'addTrack' }
  | { type: 'removeTrack'; trackId: string }
  | { type: 'addModule'; trackId: string; moduleId: string }
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
  | { type: 'loadState'; state: AppState }

export function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'audioContextReady':
      return { ...state, audioContextReady: true }

    case 'addTrack': {
      const trackId = v4()
      console.debug('Adding track "%s"', trackId)
      return {
        ...state,
        tracks: [...state.tracks, { trackId, modules: [] }],
      }
    }

    case 'addModule': {
      const instanceId = v4()
      console.debug('Adding module "%s" (%s)', action.moduleId, instanceId)
      const tracks = state.tracks.map((track) => {
        if (track.trackId === action.trackId) {
          return {
            ...track,
            modules: [
              ...track.modules,
              {
                moduleId: action.moduleId,
                instanceId,
                consumesMidi: true, // todo default to false
              },
            ],
          }
        }
        return track
      })
      return { ...state, tracks }
    }

    case 'removeModule': {
      const tracks = state.tracks.map((track) => {
        return {
          ...track,
          modules: track.modules.filter(
            (module) => module.instanceId !== action.instanceId,
          ),
        }
      })
      return { ...state, tracks }
    }

    case 'moduleStateChanged': {
      const tracks = state.tracks.map((track) => {
        const modules = track.modules.map((module) => {
          if (module.instanceId === action.instanceId) {
            return { ...module, moduleState: action.moduleState }
          }
          return module
        })
        return { ...track, modules }
      })
      return { ...state, tracks }
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

    case 'loadState':
      return { ...initialState, tracks: action.state.tracks }

    default:
      return state
  }
}
