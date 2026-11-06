# Warpdrive GPU visualization design specification

## Principle

Make complex GPU execution comprehensible without pretending GPU programming is simple. Every view answers: what / happening / why / which measurements / where in code / what to try / did it help.

## Visual grammar

| Element | Treatment |
|---|---|
| Memory hierarchy | Distinct geometry per level (DRAM wide base, caches as capacity bars, SM-local as compact). Arrows = measured traffic with direction + units. |
| Hit / miss | Comparative encoding on the selected edge — never equally loud KPI cards. |
| Selection | Strongest emphasis. Related code/SASS ranges highlight; unrelated regions recede. |
| Provenance | Chip: Measured · Compiled · Modeled · Inferred · Unavailable |
| Diff | Before/after deltas dominant; unchanged mute. |
| Timeline (later) | Shared zoomable time axis; SM → role sublanes; waits striped; producers linked |

Color encodes kind (traffic vs wait vs selection vs delta). No neon glow, no decorative KPI strip, no animation that implies measured motion when only modeled.

## Memory investigation interaction

```
Overview (hierarchy + top observations)
  → Subsystem / path select
    → Metric definitions + values + provenance
      → Contributing instructions (when mapped)
        → Source / PTX / SASS
```

Always return to overview without losing selection. Raw tables remain one disclosure away.

## Quality gate

See also salvaged checks (Truth, Meaning, Focus, Continuity, Decision). Acceptance requires difficult fixtures: sparse, dense, missing maps, unsupported metrics, incompatible compare contexts.

## Agent contract

Same evidence document. Tools may focus selection and propose hypotheses labeled as suggestions. Agent must not invent diagrams ungrounded in artifacts. Product usable without agent.
