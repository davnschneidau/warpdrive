/**
 * Structural validation for {@link GpuEvidenceDocument}.
 * Rejects fabricated-looking documents that claim measured provenance on fixtures incorrectly only when
 * `run.fixture` is false yet fixture narration is present — fixtures must set `fixture: true`.
 * @module
 */

import { GPU_EVIDENCE_SCHEMA_VERSION, type GpuEvidenceDocument } from './types.ts'

/** Validation failure. */
export interface GpuEvidenceValidationIssue {
  path: string
  message: string
}

/** Validation result. */
export interface GpuEvidenceValidationResult {
  ok: boolean
  issues: GpuEvidenceValidationIssue[]
}

/**
 * Validate a parsed GPU evidence document.
 * @param value - Unknown JSON value.
 * @returns Issues when the document is unsafe for product presentation.
 */
export function validateGpuEvidence(value: unknown): GpuEvidenceValidationResult {
  const issues: GpuEvidenceValidationIssue[] = []
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return { ok: false, issues: [{ path: '', message: 'Document must be a JSON object.' }] }
  }
  const doc = value as Partial<GpuEvidenceDocument>
  if (doc.schemaVersion !== GPU_EVIDENCE_SCHEMA_VERSION) {
    issues.push({
      path: 'schemaVersion',
      message: `Expected schemaVersion ${GPU_EVIDENCE_SCHEMA_VERSION}, got ${String(doc.schemaVersion)}.`,
    })
  }
  if (doc.run === undefined || typeof doc.run !== 'object') {
    issues.push({ path: 'run', message: 'Missing run object.' })
  } else {
    if (typeof doc.run.id !== 'string' || doc.run.id.length === 0) {
      issues.push({ path: 'run.id', message: 'run.id is required.' })
    }
    if (typeof doc.run.fixture !== 'boolean') {
      issues.push({ path: 'run.fixture', message: 'run.fixture must be boolean (fixtures must be labeled).' })
    }
    if (doc.run.fixtureNarration !== undefined && doc.run.fixture !== true) {
      issues.push({
        path: 'run.fixtureNarration',
        message: 'fixtureNarration requires run.fixture === true.',
      })
    }
    if (doc.run.device === undefined || typeof doc.run.device.name !== 'string') {
      issues.push({ path: 'run.device.name', message: 'run.device.name is required.' })
    }
  }
  if (!Array.isArray(doc.metrics)) {
    issues.push({ path: 'metrics', message: 'metrics must be an array.' })
  } else {
    const ids = new Set<string>()
    for (let i = 0; i < doc.metrics.length; i++) {
      const m = doc.metrics[i]
      if (m === undefined || typeof m.id !== 'string') {
        issues.push({ path: `metrics[${String(i)}].id`, message: 'metric id required.' })
        continue
      }
      if (ids.has(m.id)) issues.push({ path: `metrics[${String(i)}].id`, message: `Duplicate metric id ${m.id}.` })
      ids.add(m.id)
      if (m.provenance === 'measured' && doc.run?.fixture === true && m.sourceArtifact === undefined) {
        issues.push({
          path: `metrics[${String(i)}].sourceArtifact`,
          message: `Fixture measured metric ${m.id} must name a sourceArtifact (fixture table id).`,
        })
      }
    }
  }
  if (!Array.isArray(doc.sources)) issues.push({ path: 'sources', message: 'sources must be an array.' })
  if (!Array.isArray(doc.instructions)) issues.push({ path: 'instructions', message: 'instructions must be an array.' })
  if (doc.memory !== undefined) {
    if (!Array.isArray(doc.memory.nodes) || !Array.isArray(doc.memory.paths)) {
      issues.push({ path: 'memory', message: 'memory.nodes and memory.paths must be arrays.' })
    } else {
      const nodeIds = new Set(doc.memory.nodes.map(n => n.id))
      for (const p of doc.memory.paths) {
        if (!nodeIds.has(p.from) || !nodeIds.has(p.to)) {
          issues.push({ path: `memory.paths.${p.id}`, message: `Path ${p.id} references unknown nodes.` })
        }
        if (p.nature === 'measured_traffic' && p.primaryMetricId === undefined) {
          issues.push({
            path: `memory.paths.${p.id}`,
            message: `measured_traffic path ${p.id} requires primaryMetricId.`,
          })
        }
      }
    }
  }
  if (doc.megakernelTimeline !== undefined) {
    const tl = doc.megakernelTimeline
    if (tl.clockSource === 'clock64' && tl.crossSmTimebase !== 'calibrated') {
      issues.push({
        path: 'megakernelTimeline.crossSmTimebase',
        message: 'clock64 requires crossSmTimebase "calibrated" for cross-SM schedules.',
      })
    }
  }
  return { ok: issues.length === 0, issues }
}

/**
 * Parse and validate JSON into a document, or throw.
 * @param value - Unknown JSON.
 * @returns Validated document.
 */
export function parseGpuEvidence(value: unknown): GpuEvidenceDocument {
  const result = validateGpuEvidence(value)
  if (!result.ok) {
    throw new Error(`Invalid GpuEvidenceDocument: ${result.issues.map(i => `${i.path}: ${i.message}`).join('; ')}`)
  }
  return value as GpuEvidenceDocument
}
