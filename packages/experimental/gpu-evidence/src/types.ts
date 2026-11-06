/**
 * Versioned Warpdrive GPU evidence document — profiling runs, compiler artifacts,
 * memory hierarchy metrics, correlations, and optional megakernel traces.
 * @module
 */

import type { ProvenanceKind } from './provenance.ts'

/** Current schema version for {@link GpuEvidenceDocument}. */
export const GPU_EVIDENCE_SCHEMA_VERSION = '0.1.0' as const

/** Schema version string type. */
export type GpuEvidenceSchemaVersion = typeof GPU_EVIDENCE_SCHEMA_VERSION

/** Hardware / collection context for a profiling or compile artifact. */
export interface GpuDeviceContext {
  /** Human device name. */
  name: string
  /** SM count when known. */
  smCount?: number
  /** Compute capability string, e.g. `9.0`. */
  computeCapability?: string
  /** Architecture family label, e.g. `hopper`. */
  architecture?: string
}

/** Toolchain versions that produced binaries or reports. */
export interface GpuToolchainContext {
  cudaVersion?: string
  nvcc?: string
  ptxas?: string
  driverVersion?: string
  /** Profiler or exporter identity, e.g. `ncu-fixture-v0`. */
  collector?: string
}

/** One profiling or compilation run under comparison. */
export interface GpuEvidenceRun {
  /** Stable run id. */
  id: string
  /** Host ISO time when the run was recorded or fixture authored. */
  startedAtHost: string
  /** Build stamp of the binary under test. */
  buildId?: string
  /** Named experiment variant. */
  variantId?: string
  /** Prior run id when this run is an intentional compare. */
  compareToRunId?: string
  /** Kernel name for kernel-scoped collections. */
  kernelName?: string
  /** True when this document uses representative fixture data, not a live capture. */
  fixture: boolean
  /** Human narration for fixtures; never treat as a derived finding. */
  fixtureNarration?: string
  device: GpuDeviceContext
  toolchain?: GpuToolchainContext
}

/** A single metric observation with full provenance. */
export interface GpuMetricObservation {
  /** Stable id within the document. */
  id: string
  /** Owning run id. */
  runId: string
  /**
   * Actual profiler / compiler metric name when known
   * (e.g. `l1tex__t_sector_hit_rate.pct`).
   */
  name: string
  /** Short human label for dense UI. */
  label: string
  /** Definition shown in the inspector. */
  definition: string
  /** Numeric value when available. */
  value?: number
  /** Unit string (`bytes`, `%`, `requests`, `sectors`, …). */
  unit?: string
  provenance: ProvenanceKind
  /** Artifact path or exporter table that supplied the value. */
  sourceArtifact?: string
  /** Memory path or subsystem this metric describes. */
  pathId?: string
  /** Instruction ids that contribute when correlation exists. */
  instructionIds?: string[]
}

/** Memory subsystem node in the hierarchy diagram. */
export type MemorySubsystemKind =
  | 'sm_instr'
  | 'global'
  | 'local'
  | 'shared'
  | 'l1tex'
  | 'l2'
  | 'dram'

/** Node in the memory investigation architecture view. */
export interface MemorySubsystemNode {
  id: string
  kind: MemorySubsystemKind
  label: string
  /** Optional capacity hint for spatial encoding (bytes), modeled or compiled. */
  capacityBytes?: number
  capacityProvenance?: ProvenanceKind
}

/** Directed traffic / relationship between subsystems. */
export interface MemoryPathEdge {
  id: string
  from: string
  to: string
  label: string
  /**
   * Whether this edge is a measured traffic aggregate for this collection,
   * a documented architectural possibility, or unavailable.
   */
  nature: 'measured_traffic' | 'architectural' | 'unavailable'
  /** Primary bytes or request metric id when measured. */
  primaryMetricId?: string
  /** Secondary metrics (hit rate, sectors, …). */
  metricIds?: string[]
}

/** CUDA / PTX / SASS / report artifact reference. */
export interface GpuSourceArtifact {
  id: string
  path: string
  kind: 'cuda' | 'cpp' | 'ptx' | 'sass' | 'ptxas' | 'ncu_report' | 'other'
  startLine?: number
  endLine?: number
  excerpt?: string
  provenance: ProvenanceKind
}

/** One correlated instruction or memory op. */
export interface GpuInstructionRecord {
  id: string
  runId: string
  /** Disassembly text when available. */
  text?: string
  /** Instruction address when available. */
  address?: string
  kind?: 'ld' | 'st' | 'ldgsts' | 'atom' | 'other'
  addressSpace?: 'global' | 'local' | 'shared' | 'unknown'
  sourceRefIds?: string[]
  metricIds?: string[]
  provenance: ProvenanceKind
}

/** Top-level observation for overview progressive disclosure. */
export interface GpuOverviewFinding {
  id: string
  severity: 'info' | 'warning' | 'error'
  title: string
  detail: string
  /** Supporting metric ids. */
  metricIds: string[]
  /** Path to focus when the finding is selected. */
  pathId?: string
  provenance: ProvenanceKind
}

/** Memory workload analysis section. */
export interface MemoryWorkloadSection {
  nodes: MemorySubsystemNode[]
  paths: MemoryPathEdge[]
  overviewFindings: GpuOverviewFinding[]
}

/** Optional megakernel task timeline (shares provenance rules). */
export interface MegakernelTimelineSection {
  timeUnit: 'device_ticks' | 'ns'
  clockSource: 'globaltimer' | 'clock64'
  crossSmTimebase: 'globaltimer' | 'calibrated' | 'none'
  tasks: { id: number; kind: string; label: string }[]
  spans: {
    id: string
    sm: number
    role?: string
    taskId: number
    instanceId?: number
    start: number
    end: number
    sourceRefIds?: string[]
  }[]
  waits: {
    id: string
    sm: number
    role: string
    start: number
    end: number
    kind: string
    target?: string
    sourceRefIds?: string[]
  }[]
  dependencies: {
    id: string
    kind: string
    label?: string
    consumerWaitId: string
    producerSpanId: string
    sourceRefIds?: string[]
  }[]
  instrumentation?: {
    recordsDropped?: number
    overheadEstimateTicks?: number
  }
}

/** Complete evidence document. */
export interface GpuEvidenceDocument {
  schemaVersion: GpuEvidenceSchemaVersion
  run: GpuEvidenceRun
  metrics: GpuMetricObservation[]
  sources: GpuSourceArtifact[]
  instructions: GpuInstructionRecord[]
  memory?: MemoryWorkloadSection
  megakernelTimeline?: MegakernelTimelineSection
}
