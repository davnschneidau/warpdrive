# Pixel review — causal workbench

Captured at ~1440×900 and ~1920×1080 after implementing the synthesis.

| State | File |
|---|---|
| Focus wait (default) | `captures/wb_1440_focus.webp`, `captures/wb_1920_focus.webp` |
| Follow producer | `captures/wb_1440_producer.webp` |
| Open source | `captures/wb_1440_source.webp` |
| Overview | `captures/wb_1440_overview.webp` |
| Selected wait @1920 | `captures/wb_1920_selected.webp` |

## Checklist

| Question | Result |
|---|---|
| Excessive unused space? | Some right margin on silhouette rail at 1920 — acceptable; stage owns the frame |
| Important text legible? | Yes at both sizes |
| Clear focal point? | Causal beam + wait band in Focus mode |
| Related items connected? | Beam SM0→SM3 with labeled counter edge |
| Hunt for info? | No findings-card stack; Measured / Interpretation / Source&Next |
| Technically meaningful? | Role bands, wait vs work vs miss, provenance tags |
| Crafted instrument? | Serif question, mono metrics, pair stage — not SaaS cards |

## Iteration applied after first render

- Consumer wait stays partially visible while following producer (`wait.dimmed` opacity 0.42).
- Split **Inferred** (from edge+durations) vs **Hypothesis** (what to try next).

## Remaining craft debt

- True zoom/pan scrubber (window is mode-presets today).
- Missing-evidence dedicated empty state page.
- Port this composition into `client-ui-gpu-investigation` for megakernel mode (memory dock remains a separate investigation).
