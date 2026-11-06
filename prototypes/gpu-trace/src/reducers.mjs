/**
 * Pure MegakernelTrace reducers. UI and agent tools share these.
 * No DOM. Times are normalized to capture origin before coverage math.
 */

/** @typedef {'controller'|'loader'|'mma'|'math'|'storer'|'other'|string} Role */

/**
 * @param {{ start: number, end: number }[]} intervals
 * @returns {number} covered length of the union
 */
export function unionLength(intervals) {
  const cleaned = intervals
    .map(({ start, end }) => ({ start: Number(start), end: Number(end) }))
    .filter((i) => Number.isFinite(i.start) && Number.isFinite(i.end) && i.end > i.start)
    .sort((a, b) => a.start - b.start || a.end - b.end);
  if (cleaned.length === 0) return 0;
  let covered = 0;
  let curStart = cleaned[0].start;
  let curEnd = cleaned[0].end;
  for (let i = 1; i < cleaned.length; i++) {
    const n = cleaned[i];
    if (n.start <= curEnd) {
      curEnd = Math.max(curEnd, n.end);
    } else {
      covered += curEnd - curStart;
      curStart = n.start;
      curEnd = n.end;
    }
  }
  covered += curEnd - curStart;
  return covered;
}

/**
 * Absolute max/min of all timed records (before origin shift).
 * @param {object} trace
 */
export function absoluteExtent(trace) {
  const points = [];
  for (const s of trace.spans || []) {
    points.push(s.start, s.end);
  }
  for (const w of trace.waits || []) {
    points.push(w.start, w.end);
  }
  if (points.length === 0) return { min: 0, max: 0 };
  return { min: Math.min(...points), max: Math.max(...points) };
}

/**
 * Cross-SM comparable clock check.
 * @param {object} trace
 * @returns {{ ok: true } | { ok: false, code: string, message: string }}
 */
export function validateClock(trace) {
  const source = trace.device?.clockSource;
  const sync = trace.device?.crossSmTimebase;
  if (source === 'clock64' && sync !== 'calibrated') {
    return {
      ok: false,
      code: 'clock64_unsynchronized',
      message:
        'clock64() is not synchronized across SMs. Cross-SM timelines require %globaltimer or a documented calibration (device.crossSmTimebase = "calibrated").',
    };
  }
  if (source !== 'globaltimer' && source !== 'clock64') {
    return {
      ok: false,
      code: 'unknown_clock',
      message: `Unknown clockSource "${source}".`,
    };
  }
  return { ok: true };
}

/**
 * Normalize every timed field relative to capture origin (min timestamp).
 * @param {object} trace
 */
export function normalizeTrace(trace) {
  const { min, max } = absoluteExtent(trace);
  const shift = (t) => t - min;
  return {
    origin: min,
    end: max - min,
    duration: max - min,
    spans: (trace.spans || []).map((s) => ({
      ...s,
      start: shift(s.start),
      end: shift(s.end),
    })),
    waits: (trace.waits || []).map((w) => ({
      ...w,
      start: shift(w.start),
      end: shift(w.end),
    })),
  };
}

/**
 * Per-SM coverage: recorded work union, explicit wait union, unobserved remainder.
 * Overlapping roles do not inflate recorded work.
 * @param {object} trace raw or already-normalized times (pass normalized=true if shifted)
 * @param {{ normalized?: boolean }} [opts]
 */
export function smCoverage(trace, opts = {}) {
  const clock = validateClock(trace);
  const norm = opts.normalized
    ? {
        origin: 0,
        end: absoluteExtent(trace).max - absoluteExtent(trace).min || absoluteExtent(trace).max,
        duration: 0,
        spans: trace.spans || [],
        waits: trace.waits || [],
      }
    : normalizeTrace(trace);
  // When caller already normalized absolute times to start at 0, prefer duration from extent.
  const window = opts.normalized
    ? Math.max(
        0,
        ...[...(trace.spans || []), ...(trace.waits || [])].flatMap((x) => [x.end, x.start]),
      )
    : norm.duration;
  const smCount = trace.device?.smCount ?? 0;
  /** @type {Record<number, { recordedWork: number, explicitWait: number, unobserved: number, window: number, recordedWorkSumNaive: number }>} */
  const bySm = {};
  for (let sm = 0; sm < smCount; sm++) {
    const workIntervals = [];
    let naiveSum = 0;
    for (const s of norm.spans) {
      if (s.sm !== sm) continue;
      if (s.waitOf) continue;
      workIntervals.push({ start: s.start, end: s.end });
      naiveSum += Math.max(0, s.end - s.start);
    }
    const waitIntervals = [];
    for (const w of norm.waits) {
      if (w.sm !== sm) continue;
      waitIntervals.push({ start: w.start, end: w.end });
    }
    // Spans that encode waitOf also count as explicit wait coverage.
    for (const s of norm.spans) {
      if (s.sm !== sm || !s.waitOf) continue;
      waitIntervals.push({ start: s.start, end: s.end });
    }
    const recordedWork = unionLength(workIntervals);
    const explicitWait = unionLength(waitIntervals);
    const observed = unionLength([...workIntervals, ...waitIntervals]);
    bySm[sm] = {
      recordedWork,
      explicitWait,
      unobserved: Math.max(0, window - observed),
      window,
      recordedWorkSumNaive: naiveSum,
    };
  }
  return { clock, window, origin: opts.normalized ? 0 : norm.origin, bySm };
}

/**
 * Index dependency edges for producer lookup.
 * @param {object} trace
 */
export function dependencyIndex(trace) {
  /** @type {Map<string, object>} */
  const byId = new Map();
  for (const d of trace.dependencies || []) {
    byId.set(d.id, d);
  }
  /** @type {Map<string, object>} */
  const byConsumerWait = new Map();
  for (const d of trace.dependencies || []) {
    if (d.consumerWaitId) byConsumerWait.set(d.consumerWaitId, d);
  }
  return { byId, byConsumerWait };
}

/**
 * Findings derived only from artifacts (coverage + dependencies). No fixture narration.
 * @param {object} trace
 * @param {{ unobservedThresholdPct?: number }} [opts]
 */
export function deriveFindings(trace, opts = {}) {
  const threshold = opts.unobservedThresholdPct ?? 25;
  const { clock, bySm, window } = smCoverage(trace);
  /** @type {{ kind: string, title: string, detail: string, severity: string, sm?: number, dependencyId?: string }[]} */
  const findings = [];

  if (!clock.ok) {
    findings.push({
      kind: 'clock',
      title: 'Cross-SM timebase invalid',
      detail: clock.message,
      severity: 'error',
    });
  }

  for (const [smStr, cov] of Object.entries(bySm)) {
    const sm = Number(smStr);
    if (cov.window <= 0) continue;
    const unobservedPct = (100 * cov.unobserved) / cov.window;
    if (unobservedPct >= threshold) {
      findings.push({
        kind: 'coverage',
        title: `SM ${sm}: ${unobservedPct.toFixed(0)}% unobserved in capture window`,
        detail: `Recorded work union ${cov.recordedWork}, explicit wait union ${cov.explicitWait}, unobserved ${cov.unobserved} / window ${cov.window}. Unobserved is missing instrumentation, not proven SM idle.`,
        severity: 'info',
        sm,
      });
    }
    if (cov.recordedWorkSumNaive > cov.window + 1e-9) {
      findings.push({
        kind: 'overlap',
        title: `SM ${sm}: overlapping role spans (naive sum ${cov.recordedWorkSumNaive} > window ${cov.window})`,
        detail: `Union recorded work is ${cov.recordedWork}. Expand role sublanes to inspect overlap.`,
        severity: 'info',
        sm,
      });
    }
  }

  for (const dep of trace.dependencies || []) {
    const wait = (trace.waits || []).find((w) => w.id === dep.consumerWaitId);
    const producer = (trace.spans || []).find((s) => s.id === dep.producerSpanId);
    if (!wait) continue;
    const dur = wait.end - wait.start;
    const prodLabel = producer
      ? `SM ${producer.sm} ${producer.role || ''} task ${producer.taskId} inst ${producer.instanceId ?? '?'}`
      : dep.producerSpanId || 'unknown producer';
    findings.push({
      kind: 'dependency',
      title: `SM ${wait.sm} ${wait.role} waited ${dur} ticks on ${dep.kind}`,
      detail: `Consumer wait ${dep.consumerWaitId} → producer ${prodLabel.trim()}. ${dep.label || ''}`.trim(),
      severity: 'warning',
      sm: wait.sm,
      dependencyId: dep.id,
    });
  }

  // Waits without a dependency edge: still report, but mark incomplete linkage.
  for (const w of trace.waits || []) {
    const linked = (trace.dependencies || []).some((d) => d.consumerWaitId === w.id);
    if (linked) continue;
    findings.push({
      kind: 'wait_unlinked',
      title: `SM ${w.sm} ${w.role} waited ${w.end - w.start} ticks (${w.kind})`,
      detail: `No dependencies[] edge for wait id ${w.id || '(missing)'}. Cannot prove producer.`,
      severity: 'info',
      sm: w.sm,
    });
  }

  const order = { error: 0, warning: 1, info: 2 };
  findings.sort((a, b) => (order[a.severity] ?? 9) - (order[b.severity] ?? 9));
  return { window, findings };
}

/**
 * Selection explanation for investigation UI (not raw JSON dump).
 * @param {object} trace
 * @param {{ type: 'span'|'wait', id: string }} selection
 */
export function explainSelection(trace, selection) {
  const norm = normalizeTrace(trace);
  const tasks = Object.fromEntries((trace.tasks || []).map((t) => [t.id, t]));
  const { byConsumerWait } = dependencyIndex(trace);
  const sources = Object.fromEntries((trace.artifacts?.sources || []).map((s) => [s.id, s]));

  if (selection.type === 'wait') {
    const wait =
      (trace.waits || []).find((w) => w.id === selection.id) ||
      norm.waits.find((w) => w.id === selection.id);
    if (!wait) return { ok: false, message: `Unknown wait ${selection.id}` };
    const dep = byConsumerWait.get(wait.id);
    const producer = dep
      ? (trace.spans || []).find((s) => s.id === dep.producerSpanId)
      : undefined;
    const sourceIds = [
      ...(wait.sourceRefIds || []),
      ...(producer?.sourceRefIds || []),
      ...(dep?.sourceRefIds || []),
    ];
    const sourceList = [...new Set(sourceIds)].map((id) => sources[id]).filter(Boolean);
    return {
      ok: true,
      kind: 'wait',
      headline: `SM ${wait.sm} / ${wait.role} · explicit wait`,
      summary: `Waiting on ${wait.kind}${wait.target ? ` · ${wait.target}` : ''} for ${wait.end - wait.start} ticks (absolute ${wait.start}→${wait.end}).`,
      producer: producer
        ? {
            spanId: producer.id,
            sm: producer.sm,
            role: producer.role,
            taskId: producer.taskId,
            instanceId: producer.instanceId,
            taskLabel: tasks[producer.taskId]?.label,
            interval: { start: producer.start, end: producer.end },
          }
        : null,
      dependencyId: dep?.id ?? null,
      sources: sourceList,
      nextAction: producer
        ? {
            primary: 'Inspect producer',
            secondary: 'Compare variant',
            detail: `Open producer span on SM ${producer.sm}, then edit source and re-measure the same wait id.`,
          }
        : {
            primary: 'Add dependency edge',
            secondary: 'Inspect wait target',
            detail: 'This wait has no dependencies[] producer link; instrumentation or ingest must record it before the relationship is proven.',
          },
      record: wait,
    };
  }

  const span = (trace.spans || []).find((s) => s.id === selection.id);
  if (!span) return { ok: false, message: `Unknown span ${selection.id}` };
  const task = tasks[span.taskId];
  const sourceList = (span.sourceRefIds || []).map((id) => sources[id]).filter(Boolean);
  const asConsumer = (trace.dependencies || []).filter((d) => d.consumerSpanId === span.id);
  const asProducer = (trace.dependencies || []).filter((d) => d.producerSpanId === span.id);
  return {
    ok: true,
    kind: 'span',
    headline: `SM ${span.sm} / ${span.role || 'role?'} · ${task?.label || `task ${span.taskId}`}`,
    summary: `${task?.kind || 'task'} instance ${span.instanceId ?? '?'} · ${span.end - span.start} ticks (${span.start}→${span.end}).`,
    producer: null,
    consumers: asProducer,
    dependsOn: asConsumer,
    sources: sourceList,
    nextAction: {
      primary: asProducer.length ? 'Follow consumers' : 'Inspect source',
      secondary: 'Compare variant',
      detail: asProducer.length
        ? `This span produces ${asProducer.length} downstream wait(s). Select a consumer wait to see the stall.`
        : 'No recorded consumers. Use source refs or re-run with richer instrumentation.',
    },
    record: span,
  };
}
