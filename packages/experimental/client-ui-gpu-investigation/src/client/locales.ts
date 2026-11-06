/** Locale-owned copy for the GPU memory investigation dock tab. */

/** Dictionary namespace. */
export const NS = 'gpu-investigation'

/** Chinese dictionary (key source). */
export const zh = {
  'tab.title': 'GPU 内存',
  'tab.description': '当前证据文档的内存负载调查。',
  'ui.loop': '观察 · 理解 · 调查 · 修改 · 编译 · 测量 · 对比',
  'ui.fixtureBanner': '代表性夹具——并非本机上的实时 Nsight 采集。',
  'ui.overview': '总览',
  'ui.selection': '选中项',
  'ui.metrics': '指标',
  'ui.instructions': '指令',
  'ui.sources': '源码/产物',
  'ui.compare': '与候选夹具对比',
  'ui.compareTitle': '实验对比',
  'ui.incompatible': '对比上下文不可靠',
  'ui.emptySelection': '选择一条内存路径或发现项以检查支撑证据。',
  'ui.backOverview': '返回总览',
  'ui.nature.measured_traffic': '实测流量',
  'ui.nature.architectural': '架构关系',
  'ui.nature.unavailable': '不可用',
  'ui.provenance.measured': '实测',
  'ui.provenance.compiled': '编译',
  'ui.provenance.modeled': '建模',
  'ui.provenance.inferred': '推断',
  'ui.provenance.unavailable': '不可用',
} as const

/** Dictionary keys. */
export type GpuInvestigationKey = keyof typeof zh

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** GPU memory investigation dock labels. */
    'gpu-investigation': GpuInvestigationKey
  }
}

/** English labels. */
export const en: Record<GpuInvestigationKey, string> = {
  'tab.title': 'GPU memory',
  'tab.description': 'Memory workload investigation for the active evidence document.',
  'ui.loop': 'Observe · Understand · Investigate · Modify · Compile · Measure · Compare',
  'ui.fixtureBanner': 'Representative fixture — not a live Nsight capture on this machine.',
  'ui.overview': 'Overview',
  'ui.selection': 'Selection',
  'ui.metrics': 'Metrics',
  'ui.instructions': 'Instructions',
  'ui.sources': 'Sources',
  'ui.compare': 'Compare to candidate fixture',
  'ui.compareTitle': 'Experiment compare',
  'ui.incompatible': 'Comparison context is unreliable',
  'ui.emptySelection': 'Select a memory path or finding to inspect supporting evidence.',
  'ui.backOverview': 'Back to overview',
  'ui.nature.measured_traffic': 'Measured traffic',
  'ui.nature.architectural': 'Architectural',
  'ui.nature.unavailable': 'Unavailable',
  'ui.provenance.measured': 'Measured',
  'ui.provenance.compiled': 'Compiled',
  'ui.provenance.modeled': 'Modeled',
  'ui.provenance.inferred': 'Inferred',
  'ui.provenance.unavailable': 'Unavailable',
}

/** Interim locales reuse English until specialized copy lands. */
export const ja = { ...en } satisfies Record<GpuInvestigationKey, string>
/** @see ja */
export const es = { ...en } satisfies Record<GpuInvestigationKey, string>
/** @see ja */
export const fr = { ...en } satisfies Record<GpuInvestigationKey, string>
/** @see ja */
export const de = { ...en } satisfies Record<GpuInvestigationKey, string>
/** @see ja */
export const ru = { ...en } satisfies Record<GpuInvestigationKey, string>
/** @see ja */
export const pt = { ...en } satisfies Record<GpuInvestigationKey, string>
