import EventEmitter from 'eventemitter3'
import { useContext } from 'react'

import { AppContext } from '~/components/App/AppContext.tsx'
import { Module } from '~/components/App/reducer.ts'
import { ModuleProvider } from '~/components/Module/ModuleContext.tsx'
import { getModuleSpec } from '~/modules'
import { MidiMessage, ModuleEvent } from '~/modules/types.ts'

import styles from './moduleDisplay.module.css'

type Props = {
  module: Module
  triggerMidi: (message: MidiMessage) => void
  eventBus: EventEmitter<Record<string, ModuleEvent>>
}

function ModuleDisplay({ module, eventBus, triggerMidi }: Props) {
  const { dispatch } = useContext(AppContext)
  const moduleSpec = getModuleSpec(module.moduleId)

  const onClickRemove = () =>
    dispatch({ type: 'removeModule', instanceId: module.instanceId })

  if (!moduleSpec) {
    console.error('Unknown module "%s"', module.moduleId)
    return null
  }
  return (
    <ModuleProvider
      instanceId={module.instanceId}
      moduleState={module.moduleState}
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
            title="Remove"
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
