import { ModuleSpec } from '~/modules/types.ts'

import Delay from './Delay/Delay.tsx'
import Euclid from './Euclid/Euclid'
import Meter from './Meter/Meter'
import Reverb from './Srvb/Srvb'
import Synth from './Synth/Synth'

const specs = [Delay, Euclid, Meter, Reverb, Synth] as ModuleSpec[]

export function getModuleSpec(moduleId: string) {
  const spec = specs.find((spec) => spec.moduleId === moduleId)
  if (!spec) throw new Error(`Module spec not found: ${moduleId}`)
  return spec
}

export default specs
