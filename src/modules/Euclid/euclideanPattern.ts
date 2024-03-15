export function euclideanPattern(
  steps: number,
  onsets: number,
  rotate: number = 0,
) {
  let yPrev = null
  const pattern = []
  const slope = onsets / steps

  for (let x = 0; x < steps; x++) {
    const y = Math.floor(x * slope)
    pattern.push(y === yPrev ? 0 : 1)
    yPrev = y
  }

  const split = steps - rotate
  return [...pattern.slice(split), ...pattern.slice(0, split)]
}
