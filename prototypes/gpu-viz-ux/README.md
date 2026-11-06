# GPU Visualization UX Prototype

Interactive, harness-inspired prototype for evaluating Explanation Scenes before product implementation.

## Run

```sh
python3 -m http.server 8765 --bind 127.0.0.1 --directory prototypes/gpu-viz-ux
```

Open `http://127.0.0.1:8765/`.

## What this demonstrates

- Flexible workspace modes (code-first, visual-first, chat-first, balanced) mapped onto DSH’s three-column AppFrame + right dock
- Composable Scene IR: recipes seed scenes; the agent adds glyphs/relations/beats dynamically under grounding rules
- Warp-specialized GEMM investigation that evolves through questions, selection, stepping, and a simulated code change
- Grounding taxonomy: **compiled** · **annotated** · **modeled** (measurement reserved, not required for this slice)
- Fixture “compile artifacts” under `fixtures/` standing in for real `nvcc`/`ptxas`/`cuobjdump` until a CUDA host is available

## Not product code

This folder is a design probe. It does not mount Cordis plugins or change shipped profiles.
