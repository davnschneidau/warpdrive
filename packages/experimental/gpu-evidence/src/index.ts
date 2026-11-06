/**
 * GPU evidence library for Warpdrive investigations: provenance, validation,
 * memory workload view-models, run comparison, and megakernel timeline reducers.
 * @module @deepseek-ai/dsh-gpu-evidence
 */

export {
  GPU_EVIDENCE_SCHEMA_VERSION,
  type GpuDeviceContext,
  type GpuEvidenceDocument,
  type GpuEvidenceRun,
  type GpuEvidenceSchemaVersion,
  type GpuInstructionRecord,
  type GpuMetricObservation,
  type GpuOverviewFinding,
  type GpuSourceArtifact,
  type GpuToolchainContext,
  type MegakernelTimelineSection,
  type MemoryPathEdge,
  type MemorySubsystemKind,
  type MemorySubsystemNode,
  type MemoryWorkloadSection,
} from './types.ts'

export {
  PROVENANCE_LABEL,
  isMeasured,
  isNonFactual,
  type ProvenanceKind,
} from './provenance.ts'

export {
  parseGpuEvidence,
  validateGpuEvidence,
  type GpuEvidenceValidationIssue,
  type GpuEvidenceValidationResult,
} from './validate.ts'

export {
  buildMemoryOverview,
  formatMetricLine,
  inspectMemoryPath,
  type MemoryOverviewModel,
  type MemoryPathInspection,
} from './memory-view.ts'

export {
  assessCompareCompatibility,
  compareEvidenceMetrics,
  type CompareCompatibility,
  type EvidenceCompareResult,
  type MetricDelta,
} from './compare.ts'

export {
  explainTimelineWait,
  normalizeTimeline,
  smCoverage,
  unionLength,
  validateTimelineClock,
  type SmCoverageRow,
  type TimeInterval,
} from './timeline.ts'

export { loadMemoryFixture } from './fixtures.ts'
