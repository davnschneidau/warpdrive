# Causal execution workbench (SM 3 wait)

Radical redesign of the megakernel investigation prototype.

- [CRITIQUE.md](./CRITIQUE.md) — why the prior Gantt + findings-card UI fails
- [directions/EVALUATION.md](./directions/EVALUATION.md) — three structural directions; synthesis chosen
- [investigation.html](./investigation.html) — **the instrument**

```sh
python3 -m http.server 8766 --bind 127.0.0.1 --directory prototypes/gpu-trace
# http://127.0.0.1:8766/investigation.html
```

Default state: **Focus wait** — producer/consumer stage, causal beam, silhouette rail, measured vs inferred vs source in the inspector. Esc → overview. Enter → follow producer.

Synthetic fixture labeled in-chrome. Reducers in `src/reducers.mjs` preserved (union coverage, provenance, dependency explain).
