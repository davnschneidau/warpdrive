# Three directions — SM 3 dependency wait

Same task: *Why did SM 3 wait 280 ticks on a counter from SM 0?*

## A — Execution microscope

**Structure:** Dominant “lens” shows only SM 0 + SM 3 role bands at large scale; other SMs collapse to a 24px activity silhouette. Time window defaults to the wait±margin. Context strip expands on demand.

**Pros:** Immediate focus; space for overlapping loader/MMA; silhouettes preserve global awareness.
**Cons:** Dependency is still mostly vertical adjacency unless an overlay link is added; easy to lose “where am I in the full run.”

## B — Spatial dependency investigation

**Structure:** Two-actor stage: producer column (SM 0) above, consumer (SM 3) below, shared time axis. A thick causal beam connects producer MMA end region to consumer wait. Sync object annotated on the beam. Other SMs are a dense sparkline rail, not peers.

**Pros:** Relationship is the composition; concurrency within an SM stays in role bands; text explains less.
**Cons:** Less natural for investigations that are not pairwise; needs careful empty states.

## C — Source ↔ execution workbench

**Structure:** Left: CUDA/ptxas excerpts with stable anchors. Right: execution focused on the linked spans. Selecting wait highlights `vm_wait` and producer GEMM source together.

**Pros:** Programming workflow; mappings become first-class.
**Cons:** Without a strong execution focal graphic, it becomes a code browser with a mini-Gantt.

## Choice

**Synthesize B as primary stage + A’s silhouette rail + C’s linked evidence drawer** (not a permanent third column of cards).

Name: **Causal execution workbench**.

Default state opens already focused on the SM 3 wait with the producer beam drawn. Evidence/source is a bottom inspector that rises on demand. Overview restores the silhouette rail + pair stage without dumping findings cards.
