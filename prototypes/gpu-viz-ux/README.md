# GPU Visualization UX Prototype

Design probes for Explanation Scenes before product implementation.

## Start here (current)

High-fidelity **visual directions** (supersede the early wireframe captures):

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory prototypes/gpu-viz-ux/directions
```

Open `http://127.0.0.1:8765/` — Directions A / B / C.

See `directions/EVALUATION.md` for the recommendation (synthesize A shell + B spatial memory + C scrubber).

Scene IR schema and fixtures remain useful architecture probes (`scene-ir.schema.json`, `fixtures/`).

## Discarded visual foundation

`captures/` holds the early labeled-rectangle wireframes. Keep only as historical contrast; do not polish them.

## Not product code

This folder does not mount Cordis plugins or change shipped profiles.
