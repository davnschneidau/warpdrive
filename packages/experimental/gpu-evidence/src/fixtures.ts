/**
 * Packaged representative fixtures for demos and tests without a live Nsight capture.
 * Safe for Host and Client (no filesystem reads).
 * @module
 */

import { parseGpuEvidence } from './validate.ts'
import type { GpuEvidenceDocument } from './types.ts'
import baselineJson from './fixtures/memory-baseline.ts'
import candidateJson from './fixtures/memory-candidate.ts'

/** Validated baseline memory fixture. */
export const MEMORY_BASELINE_FIXTURE: GpuEvidenceDocument = parseGpuEvidence(baselineJson)

/** Validated candidate memory fixture (tile-size experiment). */
export const MEMORY_CANDIDATE_FIXTURE: GpuEvidenceDocument = parseGpuEvidence(candidateJson)

/**
 * Load a packaged memory fixture by name.
 * @param which - Fixture id.
 * @returns Validated evidence document.
 */
export function loadMemoryFixture(which: 'baseline' | 'candidate'): GpuEvidenceDocument {
  return which === 'baseline' ? MEMORY_BASELINE_FIXTURE : MEMORY_CANDIDATE_FIXTURE
}
