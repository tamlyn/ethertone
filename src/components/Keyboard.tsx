import { useEffect } from 'react'

type Props = {
  onNoteOn: (note: number) => void
  onNoteOff: (note: number) => void
}

function getMidiNote(key: string): number | undefined {
  const keyMap = {
    a: 57, // A
    w: 58, // A#
    s: 59, // B
    d: 60, // C
    r: 61, // C#
    f: 62, // D
    t: 63, // D#
    g: 64, // E
    h: 65, // F`
    u: 66, // F#
    j: 67, // G
    i: 68, // G#
    k: 69, // A
    o: 70, // A#
    l: 71, // B
    ';': 72, // C
  }

  if (key in keyMap) {
    return keyMap[key as keyof typeof keyMap]
  }
}

export default function Keyboard({ onNoteOn, onNoteOff }: Props) {
  useEffect(() => {
    const keydownListener = (e: KeyboardEvent) => {
      const note = getMidiNote(e.key)
      if (note && !e.repeat) {
        onNoteOn(note)
      }
    }
    const keyupListener = (e: KeyboardEvent) => {
      const note = getMidiNote(e.key)
      if (note) {
        onNoteOff(note)
      }
    }
    window.document.addEventListener('keydown', keydownListener)
    window.document.addEventListener('keyup', keyupListener)

    return () => {
      window.document.removeEventListener('keydown', keydownListener)
      window.document.removeEventListener('keyup', keyupListener)
    }
  }, [onNoteOff, onNoteOn])

  return null
}
