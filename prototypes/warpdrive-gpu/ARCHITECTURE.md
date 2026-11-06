# Warpdrive GPU investigation — architecture review (Phase A)

## Diagnosis of existing work

| Location | What it is | Verdict |
|---|---|---|
| `prototypes/gpu-viz-ux/` (on master via #1) | Explanation-scene / Stage Theater glyphs | Archived direction. Keep selected *concepts* (MemoryRegion, Barrier, InstrLane) — not the SVG box grammar. |
| `cursor/gpu-trace-timeline-5e3f` prior tip | Megakernel trace schema, static HTML Gantt, reducers | Useful **data-plane** ideas (provenance, union coverage, dependency edges). Not a product shell. Standalone HTML is off the milestone. |
| Shipped DSH | Cordis, tools, jobs, SSH, `sidebarRight` + dockkit, experimental bundles | **Reuse.** Do not invent a parallel app. |

Deficiencies addressed now:

1. No shared evidence model with provenance — visuals were fixtures with hard-coded claims.
2. No integration into Web/Desktop investigation workspace.
3. First milestone was framed as megakernel timeline; the correct first product slice is **Nsight Compute–class memory workload investigation**.
4. No comparison experiment object.
5. No agent-accessible structured evidence API.

## Product loop (protected)

**Observe → Understand → Investigate → Modify → Compile → Measure → Compare.**

Taste chooses what deserves attention. Craft makes that inevitable. Differentiator vs Nsight: discoverability and coherent navigation across source ↔ compiler ↔ hardware evidence, with an optional agent that reads the **same** artifacts — not prettier charts, not chat-required navigation.

## Reused DSH seams

| Need | Seam |
|---|---|
| Investigation UI | `ctx.sidebarRightTabs` + `sidebar.right.pane.tab` (session-inspector / forge pattern) |
| Opt-in shipping | Experimental bundle + `cordis.patch.yml` |
| Design system | `--dsw-alias-*` via ui-theme; ui-primitives for tables/code; no new design system |
| Agent | Host tools returning validated evidence JSON + selection addresses |
| Files | Workspace paths / attachments later; V1 ships labeled fixtures + ingest API |

## Package map (experimental, unprefixed)

| Package | Role |
|---|---|
| `@deepseek-ai/dsh-gpu-evidence` | Versioned evidence document, validation, memory view-model, compare, megakernel timeline reducers |
| `@deepseek-ai/dsh-tool-gpu-evidence` | Model tools: open investigation, summarize path, compare runs |
| `@deepseek-ai/dsh-client-ui-gpu-investigation` | Right-dock Memory Investigation (+ shared selection for timeline later) |
| `@deepseek-ai/dsh-gpu-investigation-bundle` | Optional Official plugin composition |

## Non-goals (this milestone)

- Replacing Nsight wholesale
- Six visualization families at once
- Fabricated metrics or silent fixture→“measured” claims
- Parallel application shell
