---
description: "Right-dock Memory Workload Investigation for Warpdrive GPU evidence documents."
kind: "package-library"
---

# @deepseek-ai/dsh-client-ui-gpu-investigation

English | [中文](README.zh.md)

## Summary

Registers a **GPU memory** sidebar tab that presents a Nsight Compute–inspired memory hierarchy investigation over validated evidence fixtures: path selection, metric provenance, instruction/source correlation, and baseline↔candidate compare.

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

Enable the GPU investigation bundle, then open **GPU memory** from the right-sidebar Guide. Fixture banner remains visible; measured labels name fixture tables.

<a id="understand-the-implementation"></a>
## Understand the implementation

Uses `sidebarRightTabs` + `sidebar.right.pane.tab`. View-models come from `@deepseek-ai/dsh-gpu-evidence`. Styles consume `--dsw-alias-*` only.

<a id="further-exploration"></a>
## Further Exploration

- `@deepseek-ai/dsh-gpu-evidence`
- [Design](../../../prototypes/warpdrive-gpu/DESIGN.md)

<a id="model-experience"></a>
## Model Experience

Indirect: the agent uses `@deepseek-ai/dsh-tool-gpu-evidence` against the same fixtures. This package does not register tools.

<a id="known-limitations-and-deferred-work"></a>
## Known Limitations and Deferred Work

- Loads packaged fixtures only; opening arbitrary workspace JSON is deferred.
- Shared/local nodes are present in data but the overview emphasizes the global→L1→L2→DRAM spine.
- Dark/light rely on theme tokens; interactive tests for the dock body are still thin.

<a id="dev-note"></a>
## Dev Note

Selection state is local to the tab instance. Preserve fixture labeling in any future ingest path.
