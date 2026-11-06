/**
 * Memory workload investigation body for the right dock.
 */

import { useMemo, useState, type ReactElement } from 'react'
import {
  buildMemoryOverview,
  compareEvidenceMetrics,
  formatMetricLine,
  inspectMemoryPath,
  loadMemoryFixture,
  PROVENANCE_LABEL,
  type GpuEvidenceDocument,
  type MemoryPathInspection,
} from '@deepseek-ai/dsh-gpu-evidence'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { NS, type GpuInvestigationKey } from './locales.ts'
import styles from './memory.module.css'

/** Props from the sidebar tab seat (locale + standard tab runtime fields). */
export type MemoryInvestigationProps = PropsLocale<typeof NS>

function formatBytes(value: number | undefined): string {
  if (value === undefined) return 'n/a'
  if (Math.abs(value) >= 1024 ** 3) return `${(value / 1024 ** 3).toFixed(2)} GiB`
  if (Math.abs(value) >= 1024 ** 2) return `${(value / 1024 ** 2).toFixed(1)} MiB`
  return String(value)
}

function natureKey(nature: string): GpuInvestigationKey {
  if (nature === 'measured_traffic') return 'ui.nature.measured_traffic'
  if (nature === 'architectural') return 'ui.nature.architectural'
  return 'ui.nature.unavailable'
}

/**
 * Dock tab body: hierarchy overview, path inspection, source correlation, compare.
 * @param props - Sidebar tab props including locale `t`.
 * @returns Investigation view.
 */
export function MemoryInvestigationView(props: MemoryInvestigationProps): ReactElement {
  const { t } = props
  const baseline = useMemo(() => loadMemoryFixture('baseline'), [])
  const candidate = useMemo(() => loadMemoryFixture('candidate'), [])
  const [doc, setDoc] = useState<GpuEvidenceDocument>(baseline)
  const [pathId, setPathId] = useState<string | undefined>('path-l2-dram')
  const [showCompare, setShowCompare] = useState(false)

  const overview = buildMemoryOverview(doc)
  const inspection: MemoryPathInspection | undefined = pathId === undefined
    ? undefined
    : inspectMemoryPath(doc, pathId)
  const compare = showCompare ? compareEvidenceMetrics(baseline, candidate) : undefined

  const nodeById = useMemo(() => {
    const map = new Map<string, string>()
    for (const n of overview?.nodes ?? []) map.set(n.id, n.label)
    return map
  }, [overview])

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <p className={styles.loop}>{t('ui.loop')}</p>
        <div className={styles.titleRow}>
          <h2 className={styles.title}>{overview?.kernelName ?? t('tab.title')}</h2>
          <span className={styles.meta}>{overview?.deviceName}</span>
        </div>
        {overview?.fixture === true ? <p className={styles.banner}>{t('ui.fixtureBanner')}</p> : null}
        <div className={styles.actions}>
          <button type="button" className={`${styles.button} ${styles.buttonSecondary}`} onClick={() => { setDoc(baseline); setShowCompare(false) }}>
            baseline
          </button>
          <button type="button" className={`${styles.button} ${styles.buttonSecondary}`} onClick={() => { setDoc(candidate); setShowCompare(false) }}>
            candidate
          </button>
          <button type="button" className={styles.button} onClick={() => setShowCompare(v => !v)}>
            {t('ui.compare')}
          </button>
        </div>
      </header>
      <div className={styles.body}>
        <section className={styles.board} aria-label={t('ui.overview')}>
          <h3 className={styles.sectionLabel}>{t('ui.overview')}</h3>
          <div className={styles.hierarchy}>
            {(['node-instr', 'node-global', 'node-l1', 'node-l2', 'node-dram'] as const).map((id) => {
              const node = overview?.nodes.find(n => n.id === id)
              if (node === undefined) return null
              const className = node.kind === 'dram'
                ? `${styles.node} ${styles.nodeDram}`
                : node.kind === 'l1tex' || node.kind === 'l2'
                  ? `${styles.node} ${styles.nodeCache}`
                  : styles.node
              return (
                <div key={id} className={styles.row}>
                  <div className={className}>{node.label}</div>
                  <div className={styles.paths}>
                    {(overview?.paths ?? [])
                      .filter(p => p.from === id || p.to === id)
                      .map((p) => {
                        const selected = pathId === p.id
                        const muted = p.nature !== 'measured_traffic'
                        return (
                          <button
                            key={p.id}
                            type="button"
                            className={`${styles.path} ${selected ? styles.pathSelected : ''} ${muted ? styles.pathMuted : ''}`}
                            onClick={() => setPathId(p.id)}
                          >
                            <span className={styles.pathLabel}>{p.label}</span>
                            <span className={styles.pathNature}>{t(natureKey(p.nature))}</span>
                          </button>
                        )
                      })}
                  </div>
                </div>
              )
            })}
          </div>
          <div className={styles.findings}>
            {(overview?.findings ?? []).map(f => (
              <button
                key={f.id}
                type="button"
                className={styles.finding}
                onClick={() => { if (f.pathId !== undefined) setPathId(f.pathId) }}
              >
                <span className={styles.findingTitle}>{f.title}</span>
                <p className={styles.findingDetail}>{f.detail}</p>
              </button>
            ))}
          </div>
        </section>
        <aside className={styles.side}>
          <div>
            <h3 className={styles.sectionLabel}>{t('ui.selection')}</h3>
            {inspection === undefined ? (
              <p className={styles.empty}>{t('ui.emptySelection')}</p>
            ) : (
              <>
                <div className={styles.chipRow}>
                  <span className={styles.chip}>{t(natureKey(inspection.path.nature))}</span>
                  <span className={styles.chip}>{nodeById.get(inspection.from.id)} → {nodeById.get(inspection.to.id)}</span>
                </div>
                <p className={styles.caveat}>{inspection.caveat}</p>
                <h3 className={styles.sectionLabel}>{t('ui.metrics')}</h3>
                {inspection.metrics.length === 0 ? <p className={styles.empty}>—</p> : null}
                {inspection.metrics.map(m => (
                  <div key={m.id} className={styles.metric}>
                    <div className={styles.metricName}>{m.name}</div>
                    <div className={styles.metricValue}>
                      {m.unit === 'bytes' ? formatBytes(m.value) : `${m.value ?? 'n/a'}${m.unit === undefined ? '' : ` ${m.unit}`}`}
                      {' · '}
                      {PROVENANCE_LABEL[m.provenance]}
                    </div>
                    <p className={styles.metricDef}>{m.definition}</p>
                    <p className={styles.metricDef}>{formatMetricLine(m)}</p>
                  </div>
                ))}
                <h3 className={styles.sectionLabel}>{t('ui.instructions')}</h3>
                {inspection.instructions.length === 0
                  ? <p className={styles.empty}>No correlated instructions in this document.</p>
                  : inspection.instructions.map(insn => (
                    <pre key={insn.id} className={styles.code}>{insn.address ?? ''}  {insn.text ?? insn.id}</pre>
                  ))}
                <h3 className={styles.sectionLabel}>{t('ui.sources')}</h3>
                {inspection.sources.length === 0
                  ? <p className={styles.empty}>No source mapping for this selection.</p>
                  : inspection.sources.map(s => (
                    <pre key={s.id} className={styles.code}>{s.path}{s.startLine === undefined ? '' : `:${String(s.startLine)}`}{'\n'}{s.excerpt ?? ''}</pre>
                  ))}
              </>
            )}
          </div>
          {showCompare && compare !== undefined ? (
            <div>
              <h3 className={styles.sectionLabel}>{t('ui.compareTitle')}</h3>
              {!compare.compatibility.ok ? (
                <div className={styles.warning}>
                  <strong>{t('ui.incompatible')}</strong>
                  <ul>
                    {compare.compatibility.reasons.map(r => <li key={r}>{r}</li>)}
                  </ul>
                </div>
              ) : null}
              {compare.deltas.filter(d => d.status === 'both').slice(0, 8).map(d => (
                <div key={d.name} className={styles.compareRow}>
                  <span>{d.label}</span>
                  <span>{d.unit === 'bytes' ? formatBytes(d.baseline) : d.baseline}</span>
                  <span>{d.unit === 'bytes' ? formatBytes(d.candidate) : d.candidate}</span>
                  <span className={styles.compareDelta}>
                    {d.delta === undefined
                      ? '—'
                      : d.unit === 'bytes'
                        ? formatBytes(d.delta)
                        : typeof d.delta === 'number'
                          ? d.delta.toFixed(2)
                          : String(d.delta)}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  )
}
