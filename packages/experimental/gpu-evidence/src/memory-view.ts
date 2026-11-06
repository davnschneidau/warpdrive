/**
 * View-model builders for the Memory Workload Investigation UI and agent tools.
 * @module
 */

import type {
  GpuEvidenceDocument,
  GpuMetricObservation,
  GpuOverviewFinding,
  GpuSourceArtifact,
  GpuInstructionRecord,
  MemoryPathEdge,
  MemorySubsystemNode,
} from './types.ts'
import { PROVENANCE_LABEL } from './provenance.ts'

/** Inspector payload for a selected memory path. */
export interface MemoryPathInspection {
  path: MemoryPathEdge
  from: MemorySubsystemNode
  to: MemorySubsystemNode
  primary?: GpuMetricObservation
  metrics: GpuMetricObservation[]
  instructions: GpuInstructionRecord[]
  sources: GpuSourceArtifact[]
  /** Explicit note when traffic is architectural-only or unavailable. */
  caveat: string
}

/** Overview progressive-disclosure model. */
export interface MemoryOverviewModel {
  fixture: boolean
  fixtureNarration?: string
  kernelName?: string
  deviceName: string
  findings: GpuOverviewFinding[]
  nodes: MemorySubsystemNode[]
  paths: MemoryPathEdge[]
}

/**
 * Build the overview model for the memory investigation.
 * @param doc - Validated evidence document.
 * @returns Overview model, or undefined when the document has no memory section.
 */
export function buildMemoryOverview(doc: GpuEvidenceDocument): MemoryOverviewModel | undefined {
  if (doc.memory === undefined) return undefined
  return {
    fixture: doc.run.fixture,
    ...(doc.run.fixtureNarration === undefined ? {} : { fixtureNarration: doc.run.fixtureNarration }),
    ...(doc.run.kernelName === undefined ? {} : { kernelName: doc.run.kernelName }),
    deviceName: doc.run.device.name,
    findings: doc.memory.overviewFindings,
    nodes: doc.memory.nodes,
    paths: doc.memory.paths,
  }
}

/**
 * Inspect a memory path with supporting metrics, instructions, and sources.
 * @param doc - Validated evidence document.
 * @param pathId - Path id from {@link MemoryPathEdge.id}.
 * @returns Inspection payload, or undefined when the path is missing.
 */
export function inspectMemoryPath(doc: GpuEvidenceDocument, pathId: string): MemoryPathInspection | undefined {
  const memory = doc.memory
  if (memory === undefined) return undefined
  const path = memory.paths.find(p => p.id === pathId)
  if (path === undefined) return undefined
  const from = memory.nodes.find(n => n.id === path.from)
  const to = memory.nodes.find(n => n.id === path.to)
  if (from === undefined || to === undefined) return undefined
  const metricById = new Map(doc.metrics.map(m => [m.id, m]))
  const ids = [
    ...(path.primaryMetricId === undefined ? [] : [path.primaryMetricId]),
    ...(path.metricIds ?? []),
  ]
  const metrics = [...new Set(ids)].map(id => metricById.get(id)).filter((m): m is GpuMetricObservation => m !== undefined)
  const primary = path.primaryMetricId === undefined ? undefined : metricById.get(path.primaryMetricId)
  const instructionIds = new Set(metrics.flatMap(m => m.instructionIds ?? []))
  const instructions = doc.instructions.filter(i => instructionIds.has(i.id))
  const sourceIds = new Set(instructions.flatMap(i => i.sourceRefIds ?? []))
  const sources = doc.sources.filter(s => sourceIds.has(s.id))
  let caveat: string
  if (path.nature === 'architectural') {
    caveat = 'Architectural relationship only — not a claim that every operation traverses this path, and not measured traffic for this collection.'
  } else if (path.nature === 'unavailable') {
    caveat = 'Traffic for this path is unavailable in this evidence document.'
  } else if (doc.run.fixture) {
    caveat = `Representative fixture metrics (${PROVENANCE_LABEL.measured} labels refer to fixture tables, not a live Nsight capture on this machine).`
  } else {
    caveat = 'Measured traffic aggregate for this profiling collection.'
  }
  return {
    path,
    from,
    to,
    ...(primary === undefined ? {} : { primary }),
    metrics,
    instructions,
    sources,
    caveat,
  }
}

/**
 * Format a metric for agent or inspector text.
 * @param metric - Observation.
 * @returns Single-line summary.
 */
export function formatMetricLine(metric: GpuMetricObservation): string {
  const value = metric.value === undefined ? 'n/a' : String(metric.value)
  const unit = metric.unit === undefined ? '' : ` ${metric.unit}`
  return `${metric.name} = ${value}${unit} [${PROVENANCE_LABEL[metric.provenance]}] — ${metric.label}`
}
