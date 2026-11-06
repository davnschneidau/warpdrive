/**
 * Two-run comparison with measurement-context safeguards.
 * @module
 */

import type { GpuEvidenceDocument, GpuMetricObservation } from './types.ts'

/** Why a compare is unsafe or partial. */
export type CompareCompatibility =
  | { ok: true }
  | { ok: false; reasons: string[] }

/** Per-metric delta row. */
export interface MetricDelta {
  name: string
  label: string
  unit?: string
  baseline?: number
  candidate?: number
  /** Absolute delta (candidate − baseline) when both numeric. */
  delta?: number
  /** Relative delta when baseline ≠ 0. */
  rel?: number
  baselineProvenance?: string
  candidateProvenance?: string
  status: 'both' | 'baseline_only' | 'candidate_only'
}

/** Compare result for UI and agent. */
export interface EvidenceCompareResult {
  compatibility: CompareCompatibility
  deltas: MetricDelta[]
}

/**
 * Check whether two runs are comparable under product rules.
 * @param baseline - Baseline evidence.
 * @param candidate - Candidate evidence.
 */
export function assessCompareCompatibility(
  baseline: GpuEvidenceDocument,
  candidate: GpuEvidenceDocument,
): CompareCompatibility {
  const reasons: string[] = []
  if (baseline.run.fixture !== candidate.run.fixture) {
    reasons.push('Cannot compare a fixture document to a non-fixture capture as if they share a collection methodology.')
  }
  const bArch = baseline.run.device.architecture ?? baseline.run.device.computeCapability
  const cArch = candidate.run.device.architecture ?? candidate.run.device.computeCapability
  if (bArch !== undefined && cArch !== undefined && bArch !== cArch) {
    reasons.push(`Device architecture differs (${bArch} vs ${cArch}).`)
  }
  const bCollector = baseline.run.toolchain?.collector
  const cCollector = candidate.run.toolchain?.collector
  if (bCollector !== undefined && cCollector !== undefined && bCollector !== cCollector) {
    reasons.push(`Collector differs (${bCollector} vs ${cCollector}).`)
  }
  if (baseline.run.kernelName !== undefined && candidate.run.kernelName !== undefined
    && baseline.run.kernelName !== candidate.run.kernelName) {
    reasons.push(`Kernel name differs (${baseline.run.kernelName} vs ${candidate.run.kernelName}).`)
  }
  return reasons.length === 0 ? { ok: true } : { ok: false, reasons }
}

/**
 * Compare metrics that share the same `name` across two documents.
 * @param baseline - Baseline evidence.
 * @param candidate - Candidate evidence.
 * @param opts - Optional name filter.
 */
export function compareEvidenceMetrics(
  baseline: GpuEvidenceDocument,
  candidate: GpuEvidenceDocument,
  opts: { names?: string[] } = {},
): EvidenceCompareResult {
  const compatibility = assessCompareCompatibility(baseline, candidate)
  const filter = opts.names === undefined ? undefined : new Set(opts.names)
  const index = (docs: GpuEvidenceDocument): Map<string, GpuMetricObservation> => {
    const map = new Map<string, GpuMetricObservation>()
    for (const m of docs.metrics) {
      if (filter !== undefined && !filter.has(m.name)) continue
      map.set(m.name, m)
    }
    return map
  }
  const b = index(baseline)
  const c = index(candidate)
  const names = new Set([...b.keys(), ...c.keys()])
  const deltas: MetricDelta[] = []
  for (const name of [...names].sort()) {
    const bm = b.get(name)
    const cm = c.get(name)
    if (bm !== undefined && cm !== undefined) {
      const delta = bm.value !== undefined && cm.value !== undefined ? cm.value - bm.value : undefined
      const rel = delta !== undefined && bm.value !== undefined && bm.value !== 0
        ? delta / bm.value
        : undefined
      const unit = cm.unit ?? bm.unit
      deltas.push({
        name,
        label: cm.label || bm.label,
        ...(unit === undefined ? {} : { unit }),
        ...(bm.value === undefined ? {} : { baseline: bm.value }),
        ...(cm.value === undefined ? {} : { candidate: cm.value }),
        ...(delta === undefined ? {} : { delta }),
        ...(rel === undefined ? {} : { rel }),
        baselineProvenance: bm.provenance,
        candidateProvenance: cm.provenance,
        status: 'both',
      })
    } else if (bm !== undefined) {
      deltas.push({
        name,
        label: bm.label,
        ...(bm.unit === undefined ? {} : { unit: bm.unit }),
        ...(bm.value === undefined ? {} : { baseline: bm.value }),
        baselineProvenance: bm.provenance,
        status: 'baseline_only',
      })
    } else if (cm !== undefined) {
      deltas.push({
        name,
        label: cm.label,
        ...(cm.unit === undefined ? {} : { unit: cm.unit }),
        ...(cm.value === undefined ? {} : { candidate: cm.value }),
        candidateProvenance: cm.provenance,
        status: 'candidate_only',
      })
    }
  }
  return { compatibility, deltas }
}
