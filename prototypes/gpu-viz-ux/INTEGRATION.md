# DSH UI integration map (from live package contracts)

This prototype mirrors current DeepSeek Harness layout seats; it does not patch them yet.

## Existing shell

| DSH surface | Owner | GPU experience use |
|---|---|---|
| Three-column `AppFrame` | `ui-layout` | Keep. Modes change *emphasis*, not a new chrome. |
| Left sidebar | `ui-sidebar` | Sessions, workspace, future GPU target / scene list |
| Main `conversation` panel | `ui-conversation` / `ui-chat` | Chat + optional inline Scene ConversationNodes |
| Right dock (`sidebarRight` + dockkit) | `ui-sidebar-right`, `ui-dockkit` | Primary Investigation Workspace: Scene / Source / PTX / SASS / Resources / IR |
| Existing right tabs | files, browser, terminal, document preview | Scene & triad tabs sit beside these; do not replace them |
| Tool cards | `ui-tool` + presenters | Compile/resource tools remain cards; scenes are separate durable nodes |
| Trajectory view | `ui-trajectory` | Sibling conversation View for agent activity — not the GPU viz host |
| Theme tokens | `ui-theme` `--dsw-*` | Scene glyphs must consume aliases; prototype approximates them |

## Flexible workflows (not chat-first)

1. **Code-first** — Source dominates center; right dock holds the live scene; chat is secondary or collapsed.
2. **Visual-first** — Right dock (or fullscreen rightbar) is the investigation canvas; chat can steer without owning the layout.
3. **Chat-first** — Inline Scene card in the transcript; “Open in workspace” promotes the same Scene Document into the dock.
4. **Balanced** — Source + chat + compact inline card, dock for depth (prototype default).

Same Scene Document identity in all modes. Focus is a shared service (`Investigation Focus`), not owned by chat.

## Vertical slice (minimal product path)

1. Host: parse fixture or real `ptxas -v` / `cuobjdump` into Artifact Graph nodes (`resourceReport`, `ptxRange`, `sassRange`).
2. Host: load optional `@gpu.*` annotations as `annotation` artifacts (intent, not proof).
3. Host: `gpu_scene_present` validates Scene IR (schema + grounding policy).
4. Client: ConversationNode inline card + `sidebarRight` Scene tab bind to one scene id.
5. Agent tools: `present`, `focus`, `step`, `compose` (add glyphs/relations), `expand`.
6. Golden path: warp-specialized GEMM question → scene → step → triad → stages conflict compare.

CUDA toolkit optional for the UX probe (fixtures). Required for claiming “real compilation” in CI on a GPU/CUDA runner.
