/**
 * Evidence provenance labels shared by UI chips and agent tool results.
 * @module
 */

/** How an observation was obtained. */
export type ProvenanceKind =
  | 'measured'
  | 'compiled'
  | 'modeled'
  | 'inferred'
  | 'unavailable'

/** Stable display labels for provenance chips (English product copy; UI locales may remap). */
export const PROVENANCE_LABEL: Readonly<Record<ProvenanceKind, string>> = {
  measured: 'Measured',
  compiled: 'Compiled',
  modeled: 'Modeled',
  inferred: 'Inferred',
  unavailable: 'Unavailable',
}

/**
 * True when a value may be shown as a factual measurement in product copy.
 * @param kind - Provenance of the observation.
 * @returns Whether the value is measured instrumentation or profiling output.
 */
export function isMeasured(kind: ProvenanceKind): boolean {
  return kind === 'measured'
}

/**
 * True when the observation must not be presented as hardware fact.
 * @param kind - Provenance of the observation.
 */
export function isNonFactual(kind: ProvenanceKind): boolean {
  return kind === 'modeled' || kind === 'inferred' || kind === 'unavailable'
}
