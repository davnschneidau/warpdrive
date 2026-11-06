import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import {
  absoluteExtent,
  deriveFindings,
  explainSelection,
  normalizeTrace,
  smCoverage,
  unionLength,
  validateClock,
} from './reducers.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sample = JSON.parse(readFileSync(join(root, 'fixtures/sample-trace.json'), 'utf8'));

test('unionLength merges overlaps instead of summing', () => {
  assert.equal(unionLength([{ start: 0, end: 100 }, { start: 40, end: 160 }, { start: 150, end: 190 }]), 190);
  assert.equal(unionLength([{ start: 0, end: 50 }, { start: 50, end: 100 }]), 100);
  assert.equal(unionLength([{ start: 10, end: 20 }, { start: 30, end: 40 }]), 20);
});

test('normalizeTrace shifts non-zero origin', () => {
  const t = {
    device: { clockSource: 'globaltimer', smCount: 1 },
    spans: [{ id: 'a', sm: 0, taskId: 1, start: 1000, end: 1100 }],
    waits: [{ id: 'w', sm: 0, role: 'mma', start: 1100, end: 1200, kind: 'counter' }],
  };
  const n = normalizeTrace(t);
  assert.equal(n.origin, 1000);
  assert.equal(n.duration, 200);
  assert.equal(n.spans[0].start, 0);
  assert.equal(n.spans[0].end, 100);
  assert.equal(n.waits[0].start, 100);
  assert.equal(n.waits[0].end, 200);
});

test('validateClock rejects unsynchronized clock64 for cross-SM use', () => {
  const bad = validateClock({ device: { clockSource: 'clock64', smCount: 2 } });
  assert.equal(bad.ok, false);
  assert.equal(bad.code, 'clock64_unsynchronized');
  const ok = validateClock({ device: { clockSource: 'globaltimer', smCount: 2 } });
  assert.equal(ok.ok, true);
  const cal = validateClock({
    device: { clockSource: 'clock64', crossSmTimebase: 'calibrated', smCount: 2 },
  });
  assert.equal(cal.ok, true);
});

test('smCoverage uses union; naive sum can exceed window', () => {
  const { bySm, window } = smCoverage(sample);
  assert.equal(window, 520);
  // SM 0 overlapping loader/mma/storer — naive sum > window, union < window
  assert.ok(bySm[0].recordedWorkSumNaive > window);
  assert.equal(bySm[0].recordedWork, 450);
  assert.equal(bySm[0].unobserved, 70);
  assert.equal(bySm[0].explicitWait, 0);
  // SM 3: work then long wait
  assert.ok(bySm[3].explicitWait >= 280);
  assert.ok(bySm[3].recordedWork < window);
});

test('deriveFindings has no hard-coded SM3 narration; uses dependencies', () => {
  const { findings } = deriveFindings(sample);
  assert.ok(findings.every((f) => !/fixture narration/i.test(f.title)));
  const dep = findings.find((f) => f.kind === 'dependency' && f.sm === 3);
  assert.ok(dep, 'expected dependency finding for SM 3');
  assert.match(dep.detail, /producer/i);
  assert.ok(dep.dependencyId);
  // Overlap callout for SM 0
  assert.ok(findings.some((f) => f.kind === 'overlap' && f.sm === 0));
});

test('explainSelection links wait to producer and sources', () => {
  const ex = explainSelection(sample, { type: 'wait', id: 'wait-sm3-mma' });
  assert.equal(ex.ok, true);
  assert.equal(ex.kind, 'wait');
  assert.equal(ex.producer.sm, 0);
  assert.equal(ex.producer.instanceId, 1);
  assert.ok(ex.sources.length >= 1);
  assert.equal(ex.nextAction.primary, 'Inspect producer');
  assert.ok(ex.record);
});

test('absoluteExtent handles empty', () => {
  assert.deepEqual(absoluteExtent({ spans: [], waits: [] }), { min: 0, max: 0 });
});
