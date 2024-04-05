import { useContext, useEffect } from 'react'

import { ModuleContext } from '~/components/Module/ModuleContext.tsx'
import {
  DefaultState,
  MeterEvent,
  MidiEvent,
  TickEvent,
} from '~/modules/types.ts'
import { useEffectEvent } from '~/utils/useEffectEvent.ts'

export function useModuleState<S extends DefaultState>(initialState: S) {
  const context = useContext(ModuleContext)

  useEffect(() => {
    context.setModuleState(context.instanceId, initialState)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return [
    (context.moduleState as S) || initialState,
    (state: S) => context.setModuleState(context.instanceId, state),
  ] as const
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
  const cb = useEffectEvent(callback)

  useEffect(() => {
    context.telephone.on(eventName, cb)
    return () => {
      context.telephone.off(eventName, cb)
    }
  }, [cb, context.telephone, eventName])
}

export function useMidi(callback?: (event: MidiEvent) => void) {
  useEvent('midi', callback ?? (() => {}))
  const context = useContext(ModuleContext)

  if (callback) {
    // todo set consumesMidi to true
  }

  return {
    trigger: (event: MidiEvent) =>
      context.triggerMidi(event, context.instanceId),
  }
}
