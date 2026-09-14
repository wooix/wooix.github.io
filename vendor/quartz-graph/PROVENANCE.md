# Quartz Graph source provenance

- Upstream: https://github.com/quartz-community/graph
- Exact commit: `411971434ab698c495dfc42870eb02d3bc539b3a`
- File: `src/components/scripts/graph.inline.ts`
- Pinned source: https://github.com/quartz-community/graph/blob/411971434ab698c495dfc42870eb02d3bc539b3a/src/components/scripts/graph.inline.ts
- Copyright: ©2026 Quartz Community
- License: MIT, full text in `LICENSE` and the deployed `/licenses/quartz-graph-MIT.txt`.
- `graph.inline.ts.txt` is the unmodified pinned upstream source. The `.txt` suffix excludes its Quartz-specific imports from this Astro project's TypeScript compilation.

The executable adaptation is `src/scripts/quartz-graph-renderer.ts`. This is source reuse and adaptation, not merely use of the same D3 dependency. It is not Obsidian's proprietary native Graph core.

| Upstream source section | Adapted executable section |
| --- | --- |
| Pixi Application and layers, approximately lines 224–284 | `createQuartzRenderer`: Application, Container, Graphics, Text |
| Force simulation and degree radius, 247–270 and 295–307 | D3 forceSimulation/manyBody/center/link/collide/radial; `quartzNodeRadius` |
| Hover/neighbour states and render passes, 308–387 | `updateHoverInfo`, node/link alpha, label opacity in `render` |
| Node Text/Graphics and pointer handlers, 393–469 | `nodeRenderData`, Pixi Text/Graphics/Circle, pointerover/pointerleave |
| Drag subject/coordinates/fix/release, 471–530 | `nearest` and D3 drag start/drag/end handlers |
| Zoom transform and label opacity, 543–574 | D3 zoom stage transform, opacity formula and zoom limits |
| Pixi drawing positions/links, 577–622 | `render` invoked on simulation ticks and input events |

Changes for this site: use Astro's public body-link JSON instead of Quartz's content index/fetchData; bundle pinned npm dependencies instead of CDN scripts; preserve incoming-only Backlinks; collapse reciprocal *visual* lines without altering directed data; use incoming rather than total degree for radius; retain stable topic colors and current-note ring; replace the original 500ms click heuristic with a 5px movement threshold; use lazy loading, explicit inactive startup, hidden-page pause, finite cooling and reduced-motion handling; add viewport fit, keyboard navigation, wrapped full title and HTML link list; remove visited-state storage, tag nodes, Quartz navigation and tag/slug utilities.

Pixi's ticker is disabled (`autoStart: false`, `sharedTicker: false`). The original perpetual requestAnimationFrame loop is replaced by D3 tick/event-driven render calls. This changes scheduling without replacing the source-derived renderer with SVG or a static layout.
