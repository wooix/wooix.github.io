export interface LinkGraphNode { id: string; title: string; topic: string; url: string; }
export interface LinkGraphEdge { source: string; target: string; }
export interface LinkGraph { nodes: LinkGraphNode[]; edges: LinkGraphEdge[]; }

/** Resolve only published note URL shapes; fragments and queries do not change a note. */
export function normalizeNoteLink(href: string, sourceId: string, origin = 'https://wooix.github.io'): string | null {
  if (!href.trim() || /[\u0000-\u001f\\]/.test(href)) return null;
  try {
    const site = new URL(origin);
    const url = new URL(href.trim(), new URL(`/notes/${sourceId}/`, site));
    if (!['http:', 'https:'].includes(url.protocol) || url.origin !== site.origin || url.username || url.password) return null;
    // Encoded slashes/backslashes must not become different routing segments.
    if (/%2f|%5c/i.test(url.pathname)) return null;
    const path = decodeURIComponent(url.pathname);
    const match = /^\/notes\/([^?#]+?)\/?$/.exec(path);
    if (!match) return null;
    const id = match[1];
    if (id.endsWith('/') || id.split('/').some((segment) => !segment || segment === '.' || segment === '..' || segment.includes('.'))) return null;
    return id;
  } catch { return null; }
}

export function currentGraphPostId(graph: LinkGraph, pathname: string, origin = 'https://wooix.github.io'): string | null {
  const id = normalizeNoteLink(pathname, '', origin);
  return id && graph.nodes.some((node) => node.id === id) ? id : null;
}

/** Incoming edges only: never include outbound or links among incoming sources. */
export function getBacklinks(graph: LinkGraph, currentId: string | null): LinkGraph {
  if (!currentId || !graph.nodes.some((node) => node.id === currentId)) return { nodes: [], edges: [] };
  const edges = graph.edges.filter((edge) => edge.target === currentId && edge.source !== currentId);
  const ids = new Set([currentId, ...edges.map((edge) => edge.source)]);
  return { nodes: graph.nodes.filter((node) => ids.has(node.id)), edges };
}
