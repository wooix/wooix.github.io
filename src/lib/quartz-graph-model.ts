import type { LinkGraph } from './link-graph.ts';

/** The public data remains directed; reciprocal links share a single visual line. */
export function quartzVisualLinks(graph: LinkGraph) {
  const links = new Map<string, { source: string; target: string; directions: { source: string; target: string }[] }>();
  for (const edge of graph.edges) {
    const pair = [edge.source, edge.target].sort();
    const key = JSON.stringify(pair);
    const link = links.get(key) || { source: pair[0], target: pair[1], directions: [] };
    link.directions.push({ ...edge }); links.set(key, link);
  }
  return [...links.values()];
}

/** Adapted from Quartz's 2 + sqrt(degree): this site's requested incoming degree. */
export function quartzNodeRadius(graph: LinkGraph, id: string, multiplier = 1) {
  return (2 + Math.sqrt(graph.edges.filter((edge) => edge.target === id).length)) * multiplier;
}

export function quartzNeighbours(graph: LinkGraph, id: string | null) {
  const neighbours = new Set<string>();
  if (!id) return neighbours;
  neighbours.add(id);
  for (const edge of graph.edges) if (edge.source === id || edge.target === id) {
    neighbours.add(edge.source); neighbours.add(edge.target);
  }
  return neighbours;
}
