import { describe, expect, it } from 'vitest'
import {
  assessCompareCompatibility,
  buildMemoryOverview,
  compareEvidenceMetrics,
  inspectMemoryPath,
  loadMemoryFixture,
  smCoverage,
  unionLength,
  validateGpuEvidence,
  validateTimelineClock,
} from '../src/index.ts'

const baseline = loadMemoryFixture('baseline')
const candidate = loadMemoryFixture('candidate')

describe('validateGpuEvidence', () => {
  it('accepts labeled fixtures', () => {
    expect(validateGpuEvidence(baseline).ok).toBe(true)
  })

  it('rejects measured fixture metrics without sourceArtifact', () => {
    const bad = structuredClone(baseline)
    bad.metrics[0]!.sourceArtifact = undefined
    const result = validateGpuEvidence(bad)
    expect(result.ok).toBe(false)
    expect(result.issues.some(i => i.path.includes('sourceArtifact'))).toBe(true)
  })

  it('rejects clock64 timelines without calibration', () => {
    const bad = structuredClone(baseline)
    bad.megakernelTimeline = {
      timeUnit: 'device_ticks',
      clockSource: 'clock64',
      crossSmTimebase: 'none',
      tasks: [],
      spans: [],
      waits: [],
      dependencies: [],
    }
    expect(validateGpuEvidence(bad).ok).toBe(false)
  })
})

describe('memory investigation', () => {
  it('builds overview with fixture banner data', () => {
    const overview = buildMemoryOverview(baseline)
    expect(overview?.fixture).toBe(true)
    expect(overview?.findings.length).toBeGreaterThan(0)
  })

  it('inspects L2↔DRAM with metrics, instructions, and caveat', () => {
    const inspection = inspectMemoryPath(baseline, 'path-l2-dram')
    expect(inspection).toBeDefined()
    expect(inspection!.primary?.name).toBe('dram__bytes_read.sum')
    expect(inspection!.metrics.length).toBeGreaterThan(1)
    expect(inspection!.instructions.some(i => i.id === 'insn-ld-global-a')).toBe(true)
    expect(inspection!.sources.length).toBeGreaterThan(0)
    expect(inspection!.caveat).toMatch(/fixture/i)
  })

  it('does not invent traffic for unavailable local path', () => {
    const inspection = inspectMemoryPath(baseline, 'path-instr-local')
    expect(inspection?.path.nature).toBe('unavailable')
    expect(inspection?.caveat).toMatch(/unavailable/i)
  })
})

describe('compare', () => {
  it('computes DRAM read delta when compatible', () => {
    const compat = assessCompareCompatibility(baseline, candidate)
    expect(compat.ok).toBe(true)
    const { deltas } = compareEvidenceMetrics(baseline, candidate, {
      names: ['dram__bytes_read.sum', 'launch__registers_per_thread'],
    })
    const dram = deltas.find(d => d.name === 'dram__bytes_read.sum')
    expect(dram?.status).toBe('both')
    expect(dram?.delta).toBe(3221225472 - 4294967296)
    const regs = deltas.find(d => d.name === 'launch__registers_per_thread')
    expect(regs?.baseline).toBe(128)
    expect(regs?.candidate).toBe(160)
  })

  it('flags incompatible architecture', () => {
    const other = structuredClone(candidate)
    other.run.device.architecture = 'blackwell'
    const compat = assessCompareCompatibility(baseline, other)
    expect(compat.ok).toBe(false)
    if (!compat.ok) expect(compat.reasons.join(' ')).toMatch(/architecture/i)
  })
})

describe('timeline reducers', () => {
  it('unions overlapping intervals', () => {
    expect(unionLength([
      { start: 0, end: 100 },
      { start: 40, end: 160 },
      { start: 150, end: 190 },
    ])).toBe(190)
  })

  it('rejects unsynchronized clock64', () => {
    expect(validateTimelineClock({
      timeUnit: 'device_ticks',
      clockSource: 'clock64',
      crossSmTimebase: 'none',
      tasks: [],
      spans: [],
      waits: [],
      dependencies: [],
    }).ok).toBe(false)
  })

  it('reports unobserved separately from waits', () => {
    const { bySm, window } = smCoverage({
      timeUnit: 'device_ticks',
      clockSource: 'globaltimer',
      crossSmTimebase: 'globaltimer',
      tasks: [{ id: 1, kind: 'gemm_tile', label: 'GEMM' }],
      spans: [
        { id: 'a', sm: 0, role: 'loader', taskId: 1, start: 0, end: 100 },
        { id: 'b', sm: 0, role: 'mma', taskId: 1, start: 40, end: 160 },
      ],
      waits: [{ id: 'w', sm: 0, role: 'mma', start: 160, end: 200, kind: 'counter' }],
      dependencies: [],
    }, 1)
    expect(window).toBe(200)
    expect(bySm[0]!.recordedWork).toBe(160)
    expect(bySm[0]!.recordedWorkSumNaive).toBe(220)
    expect(bySm[0]!.explicitWait).toBe(40)
    expect(bySm[0]!.unobserved).toBe(0)
  })
})
