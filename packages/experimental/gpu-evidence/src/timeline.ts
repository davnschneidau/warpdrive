/**
 * Megakernel timeline reducers (salvaged and typed from the prototype).
 * Busy coverage is the union of intervals; unobserved ≠ hardware idle.
 * @module
 */

import type { MegakernelTimelineSection } from './types.ts'

/** Interval for union coverage. */
export interface TimeInterval {
  start: number
  end: number
}

/**
 * Covered length of the union of intervals.
 * @param intervals - Possibly overlapping intervals.
 */
export function unionLength(intervals: readonly TimeInterval[]): number {
  const cleaned = intervals
    .map(({ start, end }) => ({ start, end }))
    .filter(i => Number.isFinite(i.start) && Number.isFinite(i.end) && i.end > i.start)
    .sort((a, b) => a.start - b.start || a.end - b.end)
  const first = cleaned[0]
  if (first === undefined) return 0
  let covered = 0
  let curStart = first.start
  let curEnd = first.end
  for (let i = 1; i < cleaned.length; i++) {
    const n = cleaned[i]
    if (n === undefined) continue
    if (n.start <= curEnd) {
      curEnd = Math.max(curEnd, n.end)
    } else {
      covered += curEnd - curStart
      curStart = n.start
      curEnd = n.end
    }
  }
  covered += curEnd - curStart
  return covered
}

/**
 * Validate cross-SM clock comparability for a timeline section.
 * @param timeline - Timeline section.
 */
export function validateTimelineClock(timeline: MegakernelTimelineSection):
  { ok: true } | { ok: false; code: string; message: string } {
  if (timeline.clockSource === 'clock64' && timeline.crossSmTimebase !== 'calibrated') {
    return {
      ok: false,
      code: 'clock64_unsynchronized',
      message: 'clock64() is not synchronized across SMs without calibration.',
    }
  }
  return { ok: true }
}

/**
 * Normalize timeline timestamps relative to capture origin.
 * @param timeline - Timeline section.
 */
export function normalizeTimeline(timeline: MegakernelTimelineSection): {
  origin: number
  duration: number
  spans: MegakernelTimelineSection['spans']
  waits: MegakernelTimelineSection['waits']
} {
  const points: number[] = []
  for (const s of timeline.spans) points.push(s.start, s.end)
  for (const w of timeline.waits) points.push(w.start, w.end)
  const min = points.length === 0 ? 0 : Math.min(...points)
  const max = points.length === 0 ? 0 : Math.max(...points)
  const shift = (t: number): number => t - min
  return {
    origin: min,
    duration: max - min,
    spans: timeline.spans.map(s => ({ ...s, start: shift(s.start), end: shift(s.end) })),
    waits: timeline.waits.map(w => ({ ...w, start: shift(w.start), end: shift(w.end) })),
  }
}

/** Per-SM coverage breakdown. */
export interface SmCoverageRow {
  recordedWork: number
  explicitWait: number
  unobserved: number
  window: number
  recordedWorkSumNaive: number
}

/**
 * Compute per-SM coverage for a timeline. Requires `smCount` from the run device.
 * @param timeline - Timeline section.
 * @param smCount - Device SM count.
 */
export function smCoverage(timeline: MegakernelTimelineSection, smCount: number): {
  clock: ReturnType<typeof validateTimelineClock>
  window: number
  bySm: Record<number, SmCoverageRow>
} {
  const clock = validateTimelineClock(timeline)
  const norm = normalizeTimeline(timeline)
  const window = norm.duration
  const bySm: Record<number, SmCoverageRow> = {}
  for (let sm = 0; sm < smCount; sm++) {
    const work: TimeInterval[] = []
    let naive = 0
    for (const s of norm.spans) {
      if (s.sm !== sm) continue
      work.push({ start: s.start, end: s.end })
      naive += Math.max(0, s.end - s.start)
    }
    const waits: TimeInterval[] = []
    for (const w of norm.waits) {
      if (w.sm !== sm) continue
      waits.push({ start: w.start, end: w.end })
    }
    const recordedWork = unionLength(work)
    const explicitWait = unionLength(waits)
    const observed = unionLength([...work, ...waits])
    bySm[sm] = {
      recordedWork,
      explicitWait,
      unobserved: Math.max(0, window - observed),
      window,
      recordedWorkSumNaive: naive,
    }
  }
  return { clock, window, bySm }
}

/**
 * Explain a wait selection using dependency edges.
 * @param timeline - Timeline section.
 * @param waitId - Wait id.
 */
export function explainTimelineWait(timeline: MegakernelTimelineSection, waitId: string): {
  ok: boolean
  headline?: string
  summary?: string
  producerSpanId?: string
  dependencyId?: string
  message?: string
} {
  const wait = timeline.waits.find(w => w.id === waitId)
  if (wait === undefined) return { ok: false, message: `Unknown wait ${waitId}` }
  const dep = timeline.dependencies.find(d => d.consumerWaitId === waitId)
  const producer = dep === undefined
    ? undefined
    : timeline.spans.find(s => s.id === dep.producerSpanId)
  return {
    ok: true,
    headline: `SM ${String(wait.sm)} / ${wait.role} · explicit wait`,
    summary: `Waiting on ${wait.kind}${wait.target === undefined ? '' : ` · ${wait.target}`} for ${String(wait.end - wait.start)} ticks.`,
    ...(producer?.id === undefined ? {} : { producerSpanId: producer.id }),
    ...(dep?.id === undefined ? {} : { dependencyId: dep.id }),
  }
}
