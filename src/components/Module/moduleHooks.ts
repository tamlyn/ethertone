import { useContext, useEffect } from 'react'

import { AppContext } from '~/components/App/AppContext.tsx'
import { ModuleContext } from '~/components/Module/ModuleContext.tsx'
import {
  DefaultState,
  MeterEvent,
  MidiEvent,
  MidiMessage,
  ModuleEvent,
  TickEvent,
} from '~/modules/types.ts'
import { useEffectEvent } from '~/utils/useEffectEvent.ts'

export function useModuleState<S extends DefaultState>(initialState: S) {
  const { instanceId, moduleState } = useContext(ModuleContext)
  const { dispatch } = useContext(AppContext)

  const setModuleState = (moduleState: DefaultState) =>
    dispatch({
      type: 'moduleStateChanged',
      instanceId: instanceId,
      moduleState,
    })

  useEffect(() => {
    setModuleState(initialState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [(moduleState as S) || initialState, setModuleState] as const
}

type Event = MeterEvent | MidiEvent | TickEvent
export function useEvent(
  eventName: 'midi',
  callback: (event: MidiEvent) => void,
): void
export function useEvent(
  eventName: 'meter',
  callback: (event: MeterEvent) => void,
): void
export function useEvent(
  eventName: 'tick',
  callback: (event: TickEvent) => void,
): void
export function useEvent<T extends Event>(
  eventName: string,
  callback: (event: T) => void,
) {
  const context = useContext(ModuleContext)
  const cb = useEffectEvent((event: ModuleEvent) => {
    if (event.type === eventName) {
      // FIXME
      // @ts-ignore
      callback(event)
    }
  })

  useEffect(() => {
    context.eventBus.on(context.instanceId, cb)
    return () => {
      context.eventBus.off(context.instanceId, cb)
    }
  }, [cb, context.eventBus, context.instanceId])
}

export function useMidi(callback?: (message: MidiMessage) => void) {
  useEvent('midi', (event) => {
    if (callback) {
      callback(event.message)
    }
  })
  const context = useContext(ModuleContext)

  if (callback) {
    // todo set consumesMidi to true
  }

  return {
    trigger: (message: MidiMessage) =>
      context.triggerMidi(message, context.instanceId),
  }
}
