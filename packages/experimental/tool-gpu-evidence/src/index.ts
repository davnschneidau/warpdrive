/**
 * Model-facing GPU evidence tools backed by the shared evidence library.
 * @module @deepseek-ai/dsh-tool-gpu-evidence
 */

import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'
import {
  buildMemoryOverview,
  compareEvidenceMetrics,
  formatMetricLine,
  inspectMemoryPath,
  loadMemoryFixture,
} from '@deepseek-ai/dsh-gpu-evidence'

/** Cordis plugin name. */
export const name = 'tool-gpu-evidence'

/** Required services. */
export const inject = ['tools', 'systemPrompt']

const TEXT_OUTPUT = {
  schema: { type: 'string' as const },
  render: (_args: unknown, value: string) => [{ type: 'text' as const, text: value }],
}

/**
 * Register GPU evidence tools and model guidance.
 * @param ctx - Host context.
 */
export function apply(ctx: Context): void {
  ctx.systemPrompt.section({
    name: 'tool:gpu-evidence',
    order: 820,
    text:
      'Use gpu_memory_overview and gpu_memory_inspect_path to reason about Warpdrive GPU memory evidence. '
      + 'Fixture documents are labeled; do not claim they are live Nsight captures. '
      + 'Use gpu_evidence_compare for before/after metrics under compatible collection context. '
      + 'Distinguish evidence-backed conclusions from suggestions for further investigation.',
  })

  ctx.tools.register(defineTool({
    name: 'gpu_memory_overview',
    description: 'Summarize the Warpdrive GPU memory workload evidence document (fixture baseline or candidate).',
    parameters: {
      fixture: {
        type: 'string',
        enum: ['baseline', 'candidate'],
        required: true,
        description: 'Which labeled fixture document to open.',
      },
    },
    output: TEXT_OUTPUT,
    isConcurrencySafe: () => true,
    execute: async (args) => {
      const fixture = args.fixture === 'candidate' ? 'candidate' : 'baseline'
      const doc = loadMemoryFixture(fixture)
      const overview = buildMemoryOverview(doc)
      if (overview === undefined) return 'No memory section in document.'
      const lines = [
        `fixture=${String(overview.fixture)} kernel=${overview.kernelName ?? '?'} device=${overview.deviceName}`,
        overview.fixtureNarration === undefined ? undefined : `narration: ${overview.fixtureNarration}`,
        'findings:',
        ...overview.findings.map(f => `- [${f.provenance}/${f.severity}] ${f.title}: ${f.detail} (path=${f.pathId ?? 'none'})`),
        'paths:',
        ...overview.paths.map(p => `- ${p.id} ${p.from}->${p.to} nature=${p.nature} ${p.label}`),
      ].filter((line): line is string => line !== undefined)
      return lines.join('\n')
    },
  }))

  ctx.tools.register(defineTool({
    name: 'gpu_memory_inspect_path',
    description: 'Inspect one memory path: metrics, provenance, correlated instructions and sources.',
    parameters: {
      fixture: {
        type: 'string',
        enum: ['baseline', 'candidate'],
        required: true,
        description: 'Which labeled fixture document to open.',
      },
      pathId: {
        type: 'string',
        required: true,
        description: 'Memory path id, e.g. path-l2-dram.',
      },
    },
    output: TEXT_OUTPUT,
    isConcurrencySafe: () => true,
    execute: async (args) => {
      const fixture = args.fixture === 'candidate' ? 'candidate' : 'baseline'
      const pathId = String(args.pathId)
      const doc = loadMemoryFixture(fixture)
      const inspection = inspectMemoryPath(doc, pathId)
      if (inspection === undefined) return `Unknown path ${pathId}`
      const lines = [
        `${inspection.path.label} (${inspection.path.nature})`,
        inspection.caveat,
        'metrics:',
        ...inspection.metrics.map(m => `- ${formatMetricLine(m)}`),
        'instructions:',
        ...inspection.instructions.map(i => `- ${i.address ?? ''} ${i.text ?? i.id}`),
        'sources:',
        ...inspection.sources.map(s => `- ${s.path}${s.startLine === undefined ? '' : `:${String(s.startLine)}`} [${s.provenance}]`),
      ]
      return lines.join('\n')
    },
  }))

  ctx.tools.register(defineTool({
    name: 'gpu_evidence_compare',
    description: 'Compare baseline vs candidate GPU evidence metrics with compatibility checks.',
    parameters: {},
    output: TEXT_OUTPUT,
    isConcurrencySafe: () => true,
    execute: async () => {
      const baseline = loadMemoryFixture('baseline')
      const candidate = loadMemoryFixture('candidate')
      const result = compareEvidenceMetrics(baseline, candidate)
      const lines: string[] = []
      if (!result.compatibility.ok) {
        lines.push('INCOMPATIBLE:')
        lines.push(...result.compatibility.reasons.map(r => `- ${r}`))
      } else {
        lines.push('compatible collection context')
      }
      for (const d of result.deltas.filter(row => row.status === 'both')) {
        lines.push(`${d.name}: ${String(d.baseline)} → ${String(d.candidate)} (Δ ${String(d.delta)}) [${d.baselineProvenance}/${d.candidateProvenance}]`)
      }
      return lines.join('\n')
    },
  }))
}
