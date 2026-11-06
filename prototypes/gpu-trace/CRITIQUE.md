# Critique — current investigation surfaces (do not ship)

Targets: restored `investigation.html` (SM timeline) and `client-ui-gpu-investigation` Memory dock.

## Information hierarchy

- Every SM lane is equal weight. The SM 3 wait — the reason the page exists — is one more striped rectangle among dozens of blue bars.
- Findings are a vertical stack of near-identical cards. Coverage “miss” on quiet SMs competes with the proven dependency.
- Header burns space on loop slogans and meta chips before any execution relationship appears.
- Memory dock: path list and findings share visual weight; L2↔DRAM does not dominate as the investigation focus.

## Visual composition

- Classic board + 360px sidebar. The visualization is starved; the sidebar is a JSON/text landfill.
- Large unused track background per SM; critical producer–consumer pair is never given a dedicated stage.
- Rounded cards, pills, pale tracks = generic SaaS dashboard, not an instrument.
- Memory dock: labeled boxes for hierarchy levels with muted path buttons — architecture reduced to rectangles again.

## GPU-specific visual semantics

- Loader overlapping MMA is painted as overlapping opaque bars on one track (or separate sublanes that still look like Gantt rows). Concurrency is not readable as cooperation.
- Wait is “striped red rectangle,” not a blocked consumer awaiting a producer signal.
- No warp-role geometry distinct from a task bar. No CTA nesting. No spatial sense of SM as hardware.
- Memory: no volume encoding, no directional flow mass, no sector/request geometry — only text metrics after click.

## Spatial relationships and density

- Dependency is prose in the sidebar (`producer: SM 0…`), not a line/beam in the plot.
- Eight equal lanes force either scrolling or microscopic bars; density without hierarchy.
- Selection dims unrelated spans slightly but never re-composes the layout around the causal pair.

## Typography and labeling

- 10px mono labels clipped inside bars; axis is a text string, not a calibrated ruler.
- Coverage `W450 · wait 0 · miss 70` is cryptic and competes with the lane.
- Memory metric names are monospace dumps; values not tabular-aligned as a instrument panel.

## Interaction quality

- Click → selection border + explain panel. Understanding barely changes.
- No time focus/zoom to the wait interval.
- No transformative “follow producer” as a spatial transition (only a button that swaps selection).
- No keyboard path for investigation steps. Hover does little.
- Memory: baseline/candidate toggles are app chrome, not investigation mode.

## Investigative usefulness

- Engineer must read findings to learn what the picture should have shown.
- Unobserved coverage is presented adjacent to dependency warnings — risk of diagnosing missing instrumentation as performance.
- Returning to overview is “click elsewhere,” not a deliberate scope control.

## Technical accuracy

- Reducers underneath are mostly correct (union, provenance, deps). The UI fails to *perform* those distinctions visually.
- Fixture narration is labeled (good) but still lives in the same visual band as derived findings (weak).

## Workflow relationship

- Does not feel like edit → measure → compare. It feels like open-trace-file-viewer.
- Source excerpts appear as `<pre>` dumps, not a linked workbench column.

## Verdict

Keep the evidence model and reducers. **Discard the composition**: equal Gantt lanes + findings-card sidebar + selection-as-JSON. Rebuild as a causal investigation instrument whose layout is owned by the current question (here: why SM 3 waited on SM 0).
