export function midiToFreq(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12)
}
