import { createContext, Dispatch, useReducer } from 'react'

import {
  AppAction,
  AppState,
  initialState,
  reducer,
} from '~/components/App/reducer.ts'

type Context = {
  state: AppState
  dispatch: Dispatch<AppAction>
}

export const AppContext = createContext({} as Context)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}
