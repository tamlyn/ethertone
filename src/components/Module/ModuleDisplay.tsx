import EventEmitter from 'eventemitter3'

import { ModuleProvider } from '~/components/Module/ModuleContext.tsx'
import { getModuleSpec } from '~/modules'
import { DefaultState, MidiEvent, ModuleEvent } from '~/modules/types.ts'
import { Module } from '~/reducer.ts'

import styles from './moduleDisplay.module.css'

type Props = {
  module: Module
  onClickRemove: () => void
  setModuleState: (instanceId: string, moduleState: DefaultState) => void
  triggerMidi: (event: MidiEvent) => void
  eventBus: EventEmitter<Record<string, ModuleEvent>>
}

function ModuleDisplay({
  module,
  onClickRemove,
  setModuleState,
  eventBus,
  triggerMidi,
}: Props) {
  const moduleSpec = getModuleSpec(module.moduleId)

  if (!moduleSpec) {
    console.error('Unknown module "%s"', module.moduleId)
    return null
  }
  return (
    <ModuleProvider
      instanceId={module.instanceId}
      moduleState={module.moduleState}
      setModuleState={setModuleState}
      eventBus={eventBus}
      triggerMidi={triggerMidi}
    >
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>{moduleSpec.title}</h2>
          <div
            role="button"
            onClick={onClickRemove}
            className={styles.headerButton}
            title={'Remove'}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width={24}
              height={24}
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        </div>
        <div className={styles.content}>
          <moduleSpec.Component />
        </div>
      </div>
    </ModuleProvider>
  )
}

export default ModuleDisplay
