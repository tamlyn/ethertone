export const isDefined = <T>(t: T | undefined | null): t is T => t != null

export function isKeyOf<O extends Record<string, unknown>>(
  object: O,
  key: string | number | symbol,
): key is keyof O {
  return key in object
}
