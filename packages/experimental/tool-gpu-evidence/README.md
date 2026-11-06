---
description: "Model tools for Warpdrive GPU memory evidence overview, path inspection, and compare."
kind: "package-library"
---

# @deepseek-ai/dsh-tool-gpu-evidence

English | [中文](README.zh.md)

## Summary

Registers `gpu_memory_overview`, `gpu_memory_inspect_path`, and `gpu_evidence_compare` so the agent reads the same validated evidence documents as the dock UI. Fixture results stay labeled.

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

Enable the GPU investigation bundle. Tools load packaged fixtures until workspace ingest lands.

<a id="understand-the-implementation"></a>
## Understand the implementation

Thin Cordis plugin over `@deepseek-ai/dsh-gpu-evidence`. No separate metric logic.

<a id="further-exploration"></a>
## Further Exploration

- `@deepseek-ai/dsh-gpu-evidence`
- `@deepseek-ai/dsh-client-ui-gpu-investigation`

<a id="model-experience"></a>
## Model Experience

### System prompt

```text
Use gpu_memory_overview and gpu_memory_inspect_path to reason about Warpdrive GPU memory evidence. Fixture documents are labeled; do not claim they are live Nsight captures. Use gpu_evidence_compare for before/after metrics under compatible collection context. Distinguish evidence-backed conclusions from suggestions for further investigation.
```

### Tools

| Tool | Role |
|---|---|
| `gpu_memory_overview` | Findings and paths for a fixture |
| `gpu_memory_inspect_path` | Metrics, instructions, sources for one path |
| `gpu_evidence_compare` | Baseline vs candidate deltas with compatibility |

<a id="known-limitations-and-deferred-work"></a>
## Known Limitations and Deferred Work

- Tools only open packaged fixtures; workspace file ingest is deferred.
- Does not open the Client dock tab itself (UI registration is separate).

<a id="dev-note"></a>
## Dev Note

Keep tool text aligned with evidence provenance vocabulary.
