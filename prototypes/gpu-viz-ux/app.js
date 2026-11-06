/**
 * GPU Visualization UX prototype — harness-inspired shell + composable Scene IR.
 * Design probe only; not a Cordis plugin.
 */

const GROUND = {
  compiled: { label: 'Compiled', hint: 'Established by toolchain output' },
  annotated: { label: 'Annotated', hint: 'Programmer intent — not compiler-proven' },
  modeled: { label: 'Modeled', hint: 'Explanatory walkthrough with stated assumptions' },
  documented: { label: 'Documented', hint: 'Target Pack / ISA fact' },
  measured: { label: 'Measured', hint: 'Hardware profile run' },
};

const FIXTURES = {
  resources: `Used 168 registers, 248576 bytes smem`,
  ptx: `mbarrier.try_wait.parity... ; elect ; tcgen05/mma issue`,
  sass: `SYNCS.PHASECHK... ; ELECT ; UTCOMMA ; UTCBAR`,
  source: `// @gpu.role producer warp=1\n// @gpu.role mma warp=2\n// @gpu.role epilogue warps=4..11\n// @gpu.tile BM=128 BN=256 BK=256 STAGES=4`,
};

/** Closed glyph vocabulary — recipes and free composition both use these. */
const GLYPH_TYPES = [
  'Warp', 'Warpgroup', 'RoleLane', 'SmRegion', 'TensorCore', 'RegisterFile',
  'MemoryRegion', 'BufferSlot', 'Barrier', 'Transfer', 'Tensor', 'Tile',
  'InstrLane', 'ResourceBudget', 'CompareBand', 'Caption', 'Group',
];

function recipeWarpSpecializationPipeline() {
  return {
    schemaVersion: '0.1.0',
    id: 'scene-ws-gemm-1',
    title: 'Warp-specialized GEMM pipeline',
    recipeOrigin: 'WarpSpecializationPipeline',
    layout: { kind: 'flow-horizontal', gap: 18 },
    camera: { level: 'story', focusIds: [] },
    groundingPolicy: {
      denyUngroundedHardwareClaims: true,
      allowModeledMotion: true,
    },
    assumptions: [
      'Phase/parity walkthrough abstracts hardware hold windows; not cycle-accurate.',
      'Role lanes come from source annotations, not SASS recovery.',
    ],
    glyphs: [
      { id: 'producer', type: 'RoleLane', label: 'Producer warp', grounding: 'annotated', props: { role: 'producer', warp: 1 } },
      { id: 'ring', type: 'MemoryRegion', label: 'SMEM ring · 4 stages', grounding: 'annotated', props: { stages: 4, bytes: 248576 } },
      { id: 'stage0', type: 'BufferSlot', label: 'stage 0', grounding: 'annotated', props: { index: 0 } },
      { id: 'stage1', type: 'BufferSlot', label: 'stage 1', grounding: 'annotated', props: { index: 1 } },
      { id: 'stage2', type: 'BufferSlot', label: 'stage 2', grounding: 'annotated', props: { index: 2 } },
      { id: 'stage3', type: 'BufferSlot', label: 'stage 3', grounding: 'annotated', props: { index: 3 } },
      { id: 'fullBar', type: 'Barrier', label: 'full[] mbarrier', grounding: 'compiled', bindingKeys: ['ptx-mbar', 'sass-sync'] },
      { id: 'mma', type: 'RoleLane', label: 'MMA issuer', grounding: 'annotated', props: { role: 'mma', warp: 2 } },
      { id: 'tc', type: 'TensorCore', label: 'Tensor Core path', grounding: 'documented', bindingKeys: ['target-tc'] },
      { id: 'acc0', type: 'BufferSlot', label: 'acc 0', grounding: 'annotated', props: { index: 0 } },
      { id: 'acc1', type: 'BufferSlot', label: 'acc 1', grounding: 'annotated', props: { index: 1 } },
      { id: 'epilogue', type: 'RoleLane', label: 'Epilogue warpgroups', grounding: 'annotated', props: { role: 'epilogue' } },
      { id: 'budget', type: 'ResourceBudget', label: '168 regs · 243 KB SMEM', grounding: 'compiled', bindingKeys: ['res-ptxas'] },
      { id: 'tma', type: 'Transfer', label: 'TMA loads', grounding: 'compiled', bindingKeys: ['ptx-tma'] },
    ],
    relations: [
      { id: 'r1', from: 'producer', to: 'tma', kind: 'produces', grounding: 'annotated', style: 'solid' },
      { id: 'r2', from: 'tma', to: 'ring', kind: 'transfers', grounding: 'modeled', style: 'dashed' },
      { id: 'r3', from: 'ring', to: 'fullBar', kind: 'signals', grounding: 'modeled', style: 'dashed' },
      { id: 'r4', from: 'mma', to: 'fullBar', kind: 'waitsOn', grounding: 'modeled', style: 'dashed' },
      { id: 'r5', from: 'mma', to: 'tc', kind: 'produces', grounding: 'annotated', style: 'solid' },
      { id: 'r6', from: 'tc', to: 'acc0', kind: 'produces', grounding: 'modeled', style: 'dashed' },
      { id: 'r7', from: 'epilogue', to: 'acc0', kind: 'consumes', grounding: 'annotated', style: 'solid' },
    ],
    beats: [
      {
        id: 'b0',
        label: 'Overview',
        caption: 'Three cooperating roles fill a SMEM ring, issue MMA, and drain accumulators.',
        reveal: ['producer', 'ring', 'mma', 'epilogue', 'budget'],
        focus: [],
        grounding: 'annotated',
      },
      {
        id: 'b1',
        label: 'Loader finishes a stage',
        caption: 'Producer arms full[stage] and TMA lands bytes. Modeled: the wait releases when phase completes.',
        reveal: ['tma', 'stage0', 'fullBar'],
        focus: ['producer', 'stage0', 'fullBar'],
        grounding: 'modeled',
      },
      {
        id: 'b2',
        label: 'MMA was waiting',
        caption: 'MMA issuer waits on full[stage] parity, then issues Tensor Core work into an accumulator.',
        reveal: ['tc', 'acc0'],
        focus: ['mma', 'fullBar', 'tc'],
        grounding: 'modeled',
      },
      {
        id: 'b3',
        label: 'Epilogue drains',
        caption: 'While MMA fills acc1, epilogue drains acc0 — double buffering hides the store path.',
        reveal: ['acc1'],
        focus: ['epilogue', 'acc0', 'acc1'],
        grounding: 'modeled',
      },
    ],
    bindings: {
      'res-ptxas': [{ kind: 'resourceReport', id: 'fixture-resources' }],
      'ptx-mbar': [{ kind: 'ptxRange', id: 'fixture-mma-ptx' }],
      'sass-sync': [{ kind: 'sassRange', id: 'fixture-mma-sass' }],
      'ptx-tma': [{ kind: 'ptxRange', id: 'fixture-tma' }],
      'target-tc': [{ kind: 'targetPackFact', id: 'sm90-tensor-core' }],
    },
  };
}

/** Free composition example: agent answers “where is the tile?” by composing MemoryPath glyphs. */
function composeMemoryPath(base) {
  const scene = structuredClone(base);
  scene.id = 'scene-ws-gemm-mempath';
  scene.title = 'Where tile A lives (composed)';
  scene.recipeOrigin = base.recipeOrigin;
  scene.layout = { kind: 'spatial-memory', gap: 16 };
  scene.camera = { level: 'mechanism', focusIds: ['tileA', 'smemA'] };
  scene.glyphs.push(
    { id: 'hbmA', type: 'Tensor', label: 'A in HBM', grounding: 'annotated', props: { space: 'global' } },
    { id: 'tileA', type: 'Tile', label: 'Tile 128×256', grounding: 'annotated', props: { bm: 128, bk: 256 } },
    { id: 'smemA', type: 'BufferSlot', label: 'SMEM a[stage]', grounding: 'annotated' },
    { id: 'tmemAcc', type: 'MemoryRegion', label: 'TMEM accumulator', grounding: 'documented', bindingKeys: ['target-tc'] },
  );
  scene.relations.push(
    { id: 'm1', from: 'hbmA', to: 'tma', kind: 'transfers', grounding: 'modeled', style: 'dashed' },
    { id: 'm2', from: 'tma', to: 'smemA', kind: 'transfers', grounding: 'modeled', style: 'dashed' },
    { id: 'm3', from: 'smemA', to: 'tc', kind: 'consumes', grounding: 'modeled', style: 'dashed' },
    { id: 'm4', from: 'tc', to: 'tmemAcc', kind: 'produces', grounding: 'documented', style: 'solid' },
    { id: 'm5', from: 'tileA', to: 'smemA', kind: 'mapsTo', grounding: 'annotated', style: 'solid' },
  );
  scene.beats = [
    {
      id: 'mp0',
      label: 'Tile path',
      caption: 'Annotation maps the logical tile onto a[stage]; TMA/SMEM/TMEM edges are explanatory.',
      reveal: ['hbmA', 'tileA', 'tma', 'smemA', 'tc', 'tmemAcc'],
      focus: ['tileA', 'smemA'],
      grounding: 'modeled',
    },
  ];
  return scene;
}

function composeStagesCompare(base) {
  const scene = structuredClone(base);
  scene.id = 'scene-ws-gemm-compare';
  scene.title = 'Stages 4 → 5 (compare after rebuild)';
  scene.layout = { kind: 'flow-horizontal', gap: 14 };
  scene.camera = { level: 'structure', focusIds: ['budget', 'compare'] };
  scene.glyphs.push({
    id: 'compare',
    type: 'CompareBand',
    label: 'SMEM 243 KB → 303 KB (would exceed 256 KB tcgen05 window)',
    grounding: 'compiled',
    bindingKeys: ['res-ptxas'],
    props: { before: '4 stages · 243 KB', after: '5 stages · ~303 KB', conflict: true },
  });
  scene.glyphs = scene.glyphs.map((g) =>
    g.id === 'ring'
      ? { ...g, label: 'SMEM ring · proposed 5 stages', props: { ...g.props, stages: 5 } }
      : g.id === 'budget'
        ? { ...g, label: 'Conflict · stage bytes × 5 > 256 KB window', grounding: 'compiled' }
        : g,
  );
  scene.beats = [
    {
      id: 'c0',
      label: 'Budget conflict',
      caption: 'Compiled stage-byte math against the documented operand window — no fabricated successful timeline.',
      reveal: ['ring', 'budget', 'compare'],
      focus: ['compare', 'budget'],
      grounding: 'compiled',
    },
  ];
  return scene;
}

function composeTriad(base) {
  const scene = structuredClone(base);
  scene.id = 'scene-ws-gemm-triad';
  scene.title = 'Focused MMA · CUDA ↔ PTX ↔ SASS';
  scene.layout = { kind: 'triad', gap: 12 };
  scene.camera = { level: 'artifact', focusIds: ['mma', 'tc'] };
  scene.glyphs.push(
    { id: 'srcMma', type: 'InstrLane', label: 'CUDA · mma_issuer()', grounding: 'annotated' },
    { id: 'ptxMma', type: 'InstrLane', label: 'PTX · mbarrier + elect + mma', grounding: 'compiled', bindingKeys: ['ptx-mbar'] },
    { id: 'sassMma', type: 'InstrLane', label: 'SASS · SYNCS + ELECT + UTCOMMA', grounding: 'compiled', bindingKeys: ['sass-sync'] },
  );
  scene.relations.push(
    { id: 't1', from: 'srcMma', to: 'ptxMma', kind: 'mapsTo', grounding: 'compiled', style: 'solid' },
    { id: 't2', from: 'ptxMma', to: 'sassMma', kind: 'mapsTo', grounding: 'compiled', style: 'solid' },
    { id: 't3', from: 'mma', to: 'srcMma', kind: 'mapsTo', grounding: 'annotated', style: 'solid' },
  );
  scene.beats = [
    {
      id: 't0',
      label: 'Triad',
      caption: 'Lineinfo confidence is high for the barrier wait; MMA issue correlation is fixture-representative.',
      reveal: ['srcMma', 'ptxMma', 'sassMma', 'mma', 'tc'],
      focus: ['ptxMma', 'sassMma'],
      grounding: 'compiled',
    },
  ];
  return scene;
}

const state = {
  mode: 'balanced', // code | balanced | visual | chat
  scene: recipeWarpSpecializationPipeline(),
  beatIndex: 0,
  selectedId: null,
  showIr: false,
  showAssumptions: false,
  chatLog: [
    { who: 'user', text: 'Can you show me how these warps are cooperating to execute this GEMM?' },
    {
      who: 'assistant',
      text: 'I seeded a WarpSpecializationPipeline scene from your role annotations, then bound resource numbers from the ptxas fixture. Roles are annotated intent — not compiler-proven.',
    },
  ],
  artifactTab: 'scene', // scene | source | ptx | sass | resources | ir
};

const QUESTIONS = [
  {
    id: 'loader',
    label: 'Loader finishes?',
    apply() {
      state.scene = recipeWarpSpecializationPipeline();
      state.beatIndex = 1;
      state.selectedId = 'fullBar';
      state.chatLog.push(
        { who: 'user', text: 'Show me what happens when the loader warp finishes.' },
        {
          who: 'assistant',
          text: 'Stepping a modeled beat: producer signals full[stage]. Dashed edges mean explanatory timing — assumptions are on the Model sheet.',
        },
      );
    },
  },
  {
    id: 'waiting',
    label: 'Why waiting?',
    apply() {
      state.scene = recipeWarpSpecializationPipeline();
      state.beatIndex = 2;
      state.selectedId = 'mma';
      state.chatLog.push(
        { who: 'user', text: 'Why is this consumer warp waiting?' },
        {
          who: 'assistant',
          text: 'Focusing the MMA issuer’s waitsOn edge to full[]. I composed the same scene — no new dashboard — just camera + beat.',
        },
      );
    },
  },
  {
    id: 'tile',
    label: 'Where is the tile?',
    apply() {
      state.scene = composeMemoryPath(recipeWarpSpecializationPipeline());
      state.beatIndex = 0;
      state.selectedId = 'tileA';
      state.mode = state.mode === 'chat' ? 'balanced' : state.mode;
      state.chatLog.push(
        { who: 'user', text: 'Where is this tensor tile actually stored?' },
        {
          who: 'assistant',
          text: 'Free composition: I added Tensor/Tile/MemoryRegion glyphs and mapsTo/transfers relations — still the same Scene IR, not a special “memory app”.',
        },
      );
    },
  },
  {
    id: 'stages',
    label: 'More stages?',
    apply() {
      state.scene = composeStagesCompare(recipeWarpSpecializationPipeline());
      state.beatIndex = 0;
      state.selectedId = 'compare';
      state.chatLog.push(
        { who: 'user', text: 'What happens if I increase the number of pipeline stages?' },
        {
          who: 'assistant',
          text: 'After a rebuild check against the documented 256 KB operand window, five stages conflict. Showing a CompareBand grounded in compiled byte math — not a fake win.',
        },
      );
    },
  },
  {
    id: 'triad',
    label: 'PTX vs SASS',
    apply() {
      state.scene = composeTriad(recipeWarpSpecializationPipeline());
      state.beatIndex = 0;
      state.selectedId = 'sassMma';
      state.artifactTab = 'sass';
      state.mode = 'visual';
      state.chatLog.push(
        { who: 'user', text: 'Show me the difference between the PTX and the generated SASS.' },
        {
          who: 'assistant',
          text: 'Composed a triad layout linking the focused MMA role to InstrLane glyphs bound to fixture PTX/SASS. Expanding the investigation dock.',
        },
      );
    },
  },
  {
    id: 'reset',
    label: 'Reset scene',
    apply() {
      state.scene = recipeWarpSpecializationPipeline();
      state.beatIndex = 0;
      state.selectedId = null;
      state.artifactTab = 'scene';
      state.chatLog.push({
        who: 'assistant',
        text: 'Back to the recipe seed. You can keep composing from here.',
      });
    },
  },
];

function currentBeat() {
  const beats = state.scene.beats || [];
  return beats[Math.min(state.beatIndex, Math.max(beats.length - 1, 0))] || null;
}

function visibleIds() {
  const beat = currentBeat();
  if (!beat) return new Set(state.scene.glyphs.map((g) => g.id));
  const ids = new Set();
  for (let i = 0; i <= state.beatIndex; i++) {
    for (const id of state.scene.beats[i].reveal || []) ids.add(id);
  }
  return ids;
}

function focusIds() {
  const beat = currentBeat();
  return new Set([...(beat?.focus || []), ...(state.selectedId ? [state.selectedId] : [])]);
}

function glyphById(id) {
  return state.scene.glyphs.find((g) => g.id === id);
}

function selectGlyph(id) {
  state.selectedId = id;
  const g = glyphById(id);
  if (g?.bindingKeys?.length) {
    const key = g.bindingKeys[0];
    if (key.includes('sass')) state.artifactTab = 'sass';
    else if (key.includes('ptx')) state.artifactTab = 'ptx';
    else if (key.includes('res')) state.artifactTab = 'resources';
  }
  render();
}

function renderSceneSvg() {
  const visible = visibleIds();
  const focus = focusIds();
  const layout = state.scene.layout?.kind || 'flow-horizontal';

  const primary = state.scene.glyphs.filter((g) =>
    ['RoleLane', 'MemoryRegion', 'TensorCore', 'Transfer', 'CompareBand', 'Tensor', 'Tile', 'InstrLane'].includes(g.type)
    && visible.has(g.id),
  );
  const secondary = state.scene.glyphs.filter((g) =>
    ['BufferSlot', 'Barrier', 'ResourceBudget'].includes(g.type) && visible.has(g.id),
  );

  const W = 920;
  const H = layout === 'triad' ? 280 : layout === 'spatial-memory' ? 320 : 260;
  const n = Math.max(primary.length, 1);
  const slotW = Math.min(150, (W - 40) / n - 10);

  const positions = {};
  primary.forEach((g, i) => {
    const x = 30 + i * ((W - 60) / n);
    const y = layout === 'spatial-memory' && (g.type === 'Tensor' || g.type === 'Tile') ? 36 : 70;
    positions[g.id] = { x, y, w: slotW, h: 64 };
  });
  secondary.forEach((g, i) => {
    positions[g.id] = {
      x: 40 + (i % 6) * 145,
      y: layout === 'spatial-memory' ? 210 : 175,
      w: 130,
      h: 44,
    };
  });

  const nodes = [...primary, ...secondary]
    .map((g) => {
      const p = positions[g.id];
      if (!p) return '';
      const isFocus = focus.has(g.id);
      const isSel = state.selectedId === g.id;
      const ground = g.grounding;
      const dashed = ground === 'modeled';
      return `
        <g class="glyph ${ground} ${isFocus ? 'focus' : ''} ${isSel ? 'selected' : ''}" data-id="${g.id}" transform="translate(${p.x},${p.y})">
          <rect width="${p.w}" height="${p.h}" rx="10"
            fill="${fillFor(ground, isFocus)}"
            stroke="${strokeFor(ground, isSel)}"
            stroke-width="${isSel ? 2 : 1}"
            stroke-dasharray="${dashed ? '5 4' : 'none'}" />
          <text x="12" y="22" class="glyph-type">${g.type}</text>
          <text x="12" y="42" class="glyph-label">${escapeXml(g.label)}</text>
        </g>`;
    })
    .join('');

  const edges = state.scene.relations
    .filter((r) => visible.has(r.from) && visible.has(r.to) && positions[r.from] && positions[r.to])
    .map((r) => {
      const a = positions[r.from];
      const b = positions[r.to];
      const x1 = a.x + a.w;
      const y1 = a.y + a.h / 2;
      const x2 = b.x;
      const y2 = b.y + b.h / 2;
      const mid = (x1 + x2) / 2;
      const modeled = r.grounding === 'modeled' || r.style === 'dashed';
      return `<path d="M${x1},${y1} C${mid},${y1} ${mid},${y2} ${x2},${y2}"
        fill="none" stroke="${modeled ? 'rgba(65,118,230,0.45)' : 'rgba(60,60,61,0.35)'}"
        stroke-width="1.5" stroke-dasharray="${modeled ? '6 5' : 'none'}" marker-end="url(#arrow)" />`;
    })
    .join('');

  return `
    <svg viewBox="0 0 ${W} ${H}" class="scene-svg" role="img" aria-label="${escapeXml(state.scene.title)}">
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" fill="rgba(60,60,61,0.45)" />
        </marker>
      </defs>
      ${edges}
      ${nodes}
    </svg>`;
}

function fillFor(ground, focus) {
  if (ground === 'compiled') return focus ? 'rgba(34,197,94,0.14)' : 'rgba(34,197,94,0.08)';
  if (ground === 'annotated') return focus ? 'rgba(65,118,230,0.14)' : 'rgba(65,118,230,0.07)';
  if (ground === 'modeled') return focus ? 'rgba(245,158,11,0.14)' : 'rgba(245,158,11,0.07)';
  if (ground === 'documented') return focus ? 'rgba(96,165,250,0.16)' : 'rgba(96,165,250,0.08)';
  return 'rgba(0,0,0,0.03)';
}

function strokeFor(ground, selected) {
  if (selected) return 'rgb(65,118,230)';
  if (ground === 'compiled') return 'rgba(34,197,94,0.45)';
  if (ground === 'annotated') return 'rgba(65,118,230,0.4)';
  if (ground === 'modeled') return 'rgba(245,158,11,0.45)';
  return 'rgba(0,0,0,0.12)';
}

function escapeXml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function detailPanel() {
  const g = state.selectedId ? glyphById(state.selectedId) : null;
  const beat = currentBeat();
  if (!g && !beat) {
    return `<div class="muted">Select a glyph or step a beat. Agent and human share this focus.</div>`;
  }
  const ground = GROUND[g?.grounding || beat?.grounding] || GROUND.modeled;
  return `
    <div class="detail">
      <div class="detail-title">${escapeXml(g?.label || beat.label)}</div>
      <div class="pill-row">
        <span class="pill ${g?.grounding || beat.grounding}">${ground.label}</span>
        ${g ? `<span class="pill quiet">${g.type}</span>` : ''}
      </div>
      <p class="detail-body">${escapeXml(g ? ground.hint : beat.caption)}</p>
      ${g?.bindingKeys?.length ? `<div class="muted">Bindings: ${g.bindingKeys.map(escapeXml).join(', ')}</div>` : ''}
      ${beat && !g ? `<p class="detail-body">${escapeXml(beat.caption)}</p>` : ''}
    </div>`;
}

function artifactBody() {
  switch (state.artifactTab) {
    case 'source':
      return `<pre class="code">${escapeXml(FIXTURES.source)}</pre>`;
    case 'ptx':
      return `<pre class="code">${escapeXml(FIXTURES.ptx)}</pre>`;
    case 'sass':
      return `<pre class="code">${escapeXml(FIXTURES.sass)}</pre>`;
    case 'resources':
      return `<pre class="code">${escapeXml(FIXTURES.resources)}</pre>`;
    case 'ir':
      return `<pre class="code">${escapeXml(JSON.stringify(state.scene, null, 2))}</pre>`;
    default:
      return `
        <div class="scene-head">
          <div>
            <div class="scene-title">${escapeXml(state.scene.title)}</div>
            <div class="muted">layout: ${state.scene.layout.kind}${state.scene.recipeOrigin ? ` · seeded by ${state.scene.recipeOrigin}` : ' · free composition'}</div>
          </div>
          <button class="ghost" data-action="toggle-assumptions">${state.showAssumptions ? 'Hide model notes' : 'Model notes'}</button>
        </div>
        ${state.showAssumptions ? `<div class="assumptions">${state.scene.assumptions.map((a) => `<div>• ${escapeXml(a)}</div>`).join('')}</div>` : ''}
        <div class="scene-canvas">${renderSceneSvg()}</div>
        <div class="beat-bar">
          <button class="ghost" data-action="beat-prev" ${state.beatIndex <= 0 ? 'disabled' : ''}>Back</button>
          <div class="beat-label">${escapeXml(currentBeat()?.label || '')}</div>
          <button class="ghost" data-action="beat-next" ${state.beatIndex >= (state.scene.beats?.length || 1) - 1 ? 'disabled' : ''}>Step</button>
        </div>
        ${detailPanel()}
      `;
  }
}

function chatHtml() {
  return state.chatLog
    .map((m) => `<div class="msg ${m.who}"><div class="bubble">${escapeXml(m.text)}</div></div>`)
    .join('');
}

function render() {
  const root = document.getElementById('app');
  root.dataset.mode = state.mode;
  root.innerHTML = `
    <aside class="left">
      <div class="brand">DeepSeek Harness <span class="proto">GPU viz prototype</span></div>
      <div class="nav-label">Workspace</div>
      <div class="mode-switch">
        ${['code', 'balanced', 'visual', 'chat'].map((m) => `
          <button class="mode ${state.mode === m ? 'active' : ''}" data-mode="${m}">${labelMode(m)}</button>
        `).join('')}
      </div>
      <div class="nav-label">Sessions</div>
      <div class="session active">nvfp4_gemm_ws · investigate</div>
      <div class="session">ordinary vector add</div>
      <div class="nav-label">Ask the scene</div>
      <div class="q-list">
        ${QUESTIONS.map((q) => `<button class="q" data-q="${q.id}">${q.label}</button>`).join('')}
      </div>
      <div class="legend">
        <div class="nav-label">Grounding</div>
        <div><span class="swatch compiled"></span> Compiled</div>
        <div><span class="swatch annotated"></span> Annotated (intent)</div>
        <div><span class="swatch modeled"></span> Modeled</div>
        <div><span class="swatch documented"></span> Documented</div>
      </div>
    </aside>

    <main class="center">
      <section class="pane code-pane">
        <header class="pane-h">Source <span class="muted">annotations ≠ proofs</span></header>
        <pre class="code fill">${escapeXml(`// fixtures/nvfp4_gemm_ws.cu.excerpt.cpp
${FIXTURES.source}

__global__ void __launch_bounds__(384, 1)
nvfp4_gemm_ws(...) {
  // producer / mma / epilogue roles
}`)}</pre>
      </section>

      <section class="pane chat-pane">
        <header class="pane-h">Conversation</header>
        <div class="chat">${chatHtml()}</div>
        <div class="composer muted">Ask follow-ups — or drive the scene from the left / dock. Chat is one surface, not the only one.</div>
      </section>

      <section class="pane scene-inline-pane">
        <header class="pane-h">Inline explanation card <span class="muted">also lives in the dock</span></header>
        <div class="inline-card">
          ${renderSceneSvg()}
          <div class="inline-caption">${escapeXml(currentBeat()?.caption || '')}</div>
        </div>
      </section>
    </main>

    <aside class="right">
      <div class="tabs">
        ${['scene', 'source', 'ptx', 'sass', 'resources', 'ir'].map((t) => `
          <button class="tab ${state.artifactTab === t ? 'active' : ''}" data-tab="${t}">${t}</button>
        `).join('')}
      </div>
      <div class="dock-body">${artifactBody()}</div>
      <div class="vocab muted">Glyph vocabulary (${GLYPH_TYPES.length}): ${GLYPH_TYPES.join(' · ')}</div>
    </aside>
  `;

  root.querySelectorAll('[data-mode]').forEach((el) => {
    el.addEventListener('click', () => {
      state.mode = el.dataset.mode;
      render();
    });
  });
  root.querySelectorAll('[data-q]').forEach((el) => {
    el.addEventListener('click', () => {
      QUESTIONS.find((q) => q.id === el.dataset.q)?.apply();
      render();
      const chat = root.querySelector('.chat');
      if (chat) chat.scrollTop = chat.scrollHeight;
    });
  });
  root.querySelectorAll('[data-tab]').forEach((el) => {
    el.addEventListener('click', () => {
      state.artifactTab = el.dataset.tab;
      render();
    });
  });
  root.querySelectorAll('[data-action="beat-prev"]').forEach((el) => {
    el.addEventListener('click', () => {
      state.beatIndex = Math.max(0, state.beatIndex - 1);
      render();
    });
  });
  root.querySelectorAll('[data-action="beat-next"]').forEach((el) => {
    el.addEventListener('click', () => {
      state.beatIndex = Math.min((state.scene.beats?.length || 1) - 1, state.beatIndex + 1);
      render();
    });
  });
  root.querySelectorAll('[data-action="toggle-assumptions"]').forEach((el) => {
    el.addEventListener('click', () => {
      state.showAssumptions = !state.showAssumptions;
      render();
    });
  });
  root.querySelectorAll('.glyph').forEach((el) => {
    el.addEventListener('click', () => selectGlyph(el.getAttribute('data-id')));
  });
}

function labelMode(m) {
  return ({ code: 'Code', balanced: 'Balanced', visual: 'Visual', chat: 'Chat' })[m];
}

document.addEventListener('DOMContentLoaded', render);
