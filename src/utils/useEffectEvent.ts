import { useCallback, useRef } from 'react'

export function useEffectEvent<T>(callback: (event: T) => void) {
  const ref = useRef(callback)
  ref.current = callback

  return useCallback((event: T) => {
    ref.current(event)
  }, [])
}
