---
description: "Optional Official bundle wiring GPU evidence tools and the memory investigation dock."
kind: "bundle"
---

# @deepseek-ai/dsh-gpu-investigation-bundle

English | [中文](README.zh.md)

## Summary

Opt-in composition for Warpdrive GPU memory investigation: shared evidence library, model tools, and the right-dock Memory Investigation UI. Default product profiles do not enable it until selected in Plugins.

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

Enable **GPU investigation** in the Plugins page. Open the **GPU memory** sidebar tab (Guide) to inspect the labeled baseline fixture, select L2↔DRAM, and compare the candidate tile experiment.

<a id="understand-the-implementation"></a>
## Understand the implementation

`cordis.patch.yml` inserts `tool-gpu-evidence` and `client-ui-gpu-investigation`. The evidence package is a library dependency of both.

<a id="further-exploration"></a>
## Further Exploration

- [Architecture](../../../prototypes/warpdrive-gpu/ARCHITECTURE.md)
- [Design](../../../prototypes/warpdrive-gpu/DESIGN.md)

<a id="model-experience"></a>
## Model Experience

Indirect via `@deepseek-ai/dsh-tool-gpu-evidence`.

<a id="known-limitations-and-deferred-work"></a>
## Known Limitations and Deferred Work

- Live Nsight ingest and workspace file open are not in this bundle yet.
- Megakernel timeline UI is deferred; reducers live in `dsh-gpu-evidence`.

<a id="dev-note"></a>
## Dev Note

Keep the bundle default-disabled relative to product isolation rules for experimental Official plugins.
