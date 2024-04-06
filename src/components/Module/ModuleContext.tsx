import EventEmitter from 'eventemitter3'
import { createContext, ReactNode } from 'react'

import { DefaultState, MidiMessage, ModuleEvent } from '~/modules/types.ts'

type Context = {
  instanceId: string
  moduleState: unknown
  setModuleState: (id: string, state: DefaultState) => void
  eventBus: EventEmitter<Record<string, ModuleEvent>>
  triggerMidi: (message: MidiMessage, instanceId: string) => void
}

export const ModuleContext = createContext<Context>({} as Context)

type Props = Context & {
  children: ReactNode
}

export function ModuleProvider({ children, ...contextValue }: Props) {
  return (
    <ModuleContext.Provider value={contextValue}>
      {children}
    </ModuleContext.Provider>
  )
}
