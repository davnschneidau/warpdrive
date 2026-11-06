# Design direction evaluation

The earlier rectangle-flow captures under `../captures/` are **discarded** as a visual foundation. They validated Artifact Graph / Scene IR / grounding ideas only.

## Shared architecture retained

- Declarative Scene IR + Artifact Graph bindings
- Grounding: compiled / annotated / modeled / documented
- Agent can compose explanations; recipes seed but do not limit
- Flexible coding + AI + visualization surfaces (no mandated chat-first layout)
- DeepSeek Harness tokens / materials as the visual language reference

## Direction A — Stage Theater

**Concept:** Classic three-column programming shell, but the center is a large spatial mechanism: HBM tile grids, a multi-stage SMEM ring with resident tile cells, warp strips with lane dots, a barrier gate that opens, twin accumulators, epilogue band.

**Interaction:** Explain → step beats → click stage/warp/barrier (code highlights) → propose STAGES=5 conflict.

**Strengths:** Feels like a serious coding environment; mechanism is readable at desktop size; easiest path to productize beside existing AppFrame + right dock; progressive beats map cleanly to Scene IR `beats`.

**Weaknesses:** Still somewhat “diagram beside chat”; less immersive than B; barrier gate is metaphorical.

## Direction B — Living Kernel Canvas

**Concept:** Visualization-first canvas is the primary surface. Pan/zoom a memory machine. Code docks; chat floats.

**Interaction:** Explain → advance stage → “where is the tile?” lights footprints → +1 stage conflict → click regions to rebind dock.

**Strengths:** Strongest answer to “show the tile / memory”; matches “explore with an expert” energy; flexible without a fixed panel religion.

**Weaknesses:** Risk of feeling like a separate viz app if dock/chat are weak; denser implementation (camera, hit targets); harder for long coding sessions unless code dock is excellent.

## Direction C — Cutaway CTA

**Concept:** Textbook-quality vertical cutaway of one CTA; time scrub is the primary control; source + AI linked on the right.

**Interaction:** Explain → scrub/step → select bands → STAGES=5 grows a column then conflicts.

**Strengths:** Clearest causality and specialization stacking; scrubber is an outstanding mapped control for modeled time; excellent for warp-specialization pedagogy.

**Weaknesses:** Less natural for HBM↔tile global questions than B; vertical metaphor may not extend as gracefully to megakernels/multi-GPU without new cutaways.

## Recommendation

**Lead with A as the product shell integration path, adopt B’s spatial memory/tile language inside A’s center stage, and steal C’s time scrubber + vertical role stacking for pipeline walkthroughs.**

In other words: do not ship pure A/B/C — synthesize:

1. Harness-native shell (A)
2. Spatial tensors / SMEM residency / lane strips (B + A)
3. Scrubbed beats and cutaway stacking when explaining specialization (C)

V1 acceptance should look like Direction A’s desktop composition with B-quality tile/SMEM rendering and C’s scrub control — not like the discarded wireframe captures.
