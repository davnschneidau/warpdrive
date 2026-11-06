---
description: "Versioned GPU profiling evidence for Warpdrive memory investigations, comparisons, and timeline reducers."
kind: "package-library"
---

# @deepseek-ai/dsh-gpu-evidence

English | [中文](README.zh.md)

## Summary

Typed GPU evidence documents with provenance, validation, Nsight-style memory workload view-models, two-run comparison safeguards, and megakernel timeline reducers. Fixtures are always labeled; measured labels on fixtures name fixture tables, not a live capture.

## Table of Contents

- [Use this package](#use-this-package)
- [Understand the implementation](#understand-the-implementation)
- [Further Exploration](#further-exploration)
- [Model Experience](#model-experience)
- [Known Limitations and Deferred Work](#known-limitations-and-deferred-work)
- [Dev Note](#dev-note)

-----

<a id="use-this-package"></a>
## Use this package

Import `parseGpuEvidence`, `buildMemoryOverview`, `inspectMemoryPath`, `compareEvidenceMetrics`, and `loadMemoryFixture` from Host tools or Client investigation UI. Use `loadMemoryFixture('baseline')` for demos when no Nsight export is present.

### When to choose it

Choose this library when Warpdrive must show or reason about GPU profiling/compiler evidence without inventing metrics. Prefer NVIDIA exports through a future adapter; do not screenshot-parse Nsight UI.

<a id="understand-the-implementation"></a>
## Understand the implementation

Documents carry `ProvenanceKind` on every metric and artifact. Memory paths declare `measured_traffic`, `architectural`, or `unavailable`. Timeline busy coverage uses interval union. Compare refuses mismatched fixture flags, architectures, or collectors.

<a id="further-exploration"></a>
## Further Exploration

- [Architecture review](../../../prototypes/warpdrive-gpu/ARCHITECTURE.md)
- [Design specification](../../../prototypes/warpdrive-gpu/DESIGN.md)
- Client dock: `@deepseek-ai/dsh-client-ui-gpu-investigation`

<a id="model-experience"></a>
## Model Experience

Indirect: `@deepseek-ai/dsh-tool-gpu-evidence` exposes validated summaries and path inspections to the agent. This library does not register tools itself.

<a id="known-limitations-and-deferred-work"></a>
## Known Limitations and Deferred Work

- No live Nsight Compute SQLite/CSV adapter yet — only versioned JSON fixtures and the ingest validation API.
- Megakernel timeline UI is reducer-ready but not the first dock milestone (memory investigation is).
- Instruction↔source maps may be incomplete; callers must surface gaps.

<a id="dev-note"></a>
## Dev Note

Schema version is `GPU_EVIDENCE_SCHEMA_VERSION`. Bump only with a migration story for stored artifacts.
