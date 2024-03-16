import { el, ElemNode } from '@elemaudio/core'

import { AppState } from './reducer.ts'

export function buildAppAudioGraph(state: AppState) {
  // beats per second
  const beatFreq = state.tempo / 60
  // ticks per second
  const tickFreq = beatFreq * state.ppqn
  // global pulse train that drives everything else
  const pulse = el.train(el.const({ key: 'tickFreq', value: tickFreq }))

  // this signal emits a single sample of 1 when the pulse train goes from 0 to 1
  const risingOnes = el.and(el.eq(el.z(pulse), 0), el.eq(pulse, 1))
  // count the number of rising ones, which is the number of ticks
  const tickCounter = el.accum(risingOnes, 0)
  // emit the tick count as a snapshot event
  const tick = el.mul(0, el.snapshot({ name: 'tick' }, pulse, tickCounter))

  // metronome
  const gate = el.eq(el.mod(tickCounter, el.const({ value: state.ppqn })), 0)
  const downBeatFreq = el.const({ value: 880 })
  const upBeatFreq = el.const({ value: 440 })
  const downBeat = el.eq(
    el.mod(tickCounter, el.const({ value: state.ppqn * 4 })),
    0,
  )
  const freq = el.latch(gate, el.select(downBeat, downBeatFreq, upBeatFreq))
  const metronome = el.mul(
    el.adsr(0.01, 0.1, 0.5, 0.2, gate),
    el.blepsquare(freq),
  )

  const lastModule = state.modules[state.modules.length - 1]
  let out: ElemNode = 0
  if (lastModule) {
    out = el.add(out, lastModule.audioGraph)
  }
  if (state.globalState.metronome && state.globalState.playing) {
    out = el.add(out, metronome)
  }

  return [out, el.add(state.globalState.playing ? tick : 0, out)]
}
