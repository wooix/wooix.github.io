import type { LinkGraph } from './link-graph.ts';

export interface GraphPosition { id: string; x: number; y: number; }

/** A bounded, deterministic layout. No timers, random seeds, or live simulation. */
export function layoutGraph(graph: LinkGraph, width = 480, height = 300): GraphPosition[] {
  const w = Number.isFinite(width) ? Math.max(120, width) : 480;
  const h = Number.isFinite(height) ? Math.max(120, height) : 300;
  const ids = graph.nodes.map((node) => node.id).sort();
  if (!ids.length) return [];
  if (ids.length === 1) return [{ id: ids[0], x: w / 2, y: h / 2 }];
  const positions = ids.map((id, index) => {
    const angle = index * 2.399963229728653;
    const radius = Math.sqrt((index + 0.5) / ids.length);
    return { id, x: w / 2 + Math.cos(angle) * (w / 2 - 34) * radius, y: h / 2 + Math.sin(angle) * (h / 2 - 34) * radius };
  });
  const byId = new Map(positions.map((position, index) => [position.id, index]));
  const links = graph.edges.filter((edge) => byId.has(edge.source) && byId.has(edge.target));
  // Larger archives get deterministic initial positions rather than expensive O(n²) simulation.
  const steps = ids.length > 180 ? 0 : ids.length > 70 ? 45 : 130;
  const ideal = Math.max(62, Math.min(w, h) * 0.34);
  for (let step = 0; step < steps; step++) {
    const force = positions.map(() => ({ x: 0, y: 0 }));
    for (let i = 0; i < positions.length; i++) for (let j = i + 1; j < positions.length; j++) {
      const dx = positions[i].x - positions[j].x;
      const dy = positions[i].y - positions[j].y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const repel = 1550 / (distance * distance);
      force[i].x += dx / distance * repel; force[i].y += dy / distance * repel;
      force[j].x -= dx / distance * repel; force[j].y -= dy / distance * repel;
    }
    for (const edge of links) {
      const a = byId.get(edge.source)!; const b = byId.get(edge.target)!;
      const dx = positions[b].x - positions[a].x; const dy = positions[b].y - positions[a].y;
      const distance = Math.max(1, Math.hypot(dx, dy));
      const pull = (distance - ideal) * 0.008;
      force[a].x += dx / distance * pull; force[a].y += dy / distance * pull;
      force[b].x -= dx / distance * pull; force[b].y -= dy / distance * pull;
    }
    positions.forEach((position, i) => {
      position.x = Math.max(27, Math.min(w - 27, position.x + force[i].x + (w / 2 - position.x) * 0.001));
      position.y = Math.max(28, Math.min(h - 28, position.y + force[i].y + (h / 2 - position.y) * 0.001));
    });
  }
  return positions;
}
