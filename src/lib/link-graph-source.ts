import { parseFragment, type DefaultTreeAdapterMap } from 'parse5';
import { normalizeNoteLink, type LinkGraph, type LinkGraphNode } from './link-graph.ts';

export interface GraphSourcePost { id: string; title: string; topic: string; html: string; }
const ignoredTags = new Set(['pre', 'code', 'script', 'style', 'template', 'textarea']);

/** Input is Astro-rendered article body, never the final page or frontmatter. */
export function extractBodyLinks(html: string): string[] {
  const links: string[] = [];
  const root = parseFragment(html);
  function walk(node: DefaultTreeAdapterMap['node']) {
    if ('tagName' in node) {
      if (ignoredTags.has(node.tagName)) return;
      if (node.tagName === 'a') {
        const href = node.attrs.find((attribute) => attribute.name === 'href');
        if (href) links.push(href.value);
      }
    }
    if ('childNodes' in node) node.childNodes.forEach(walk);
  }
  walk(root);
  return links;
}

/** Only pass getPosts()'s public registry. Hidden content is never parsed or serialized. */
export function buildLinkGraph(publicPosts: readonly GraphSourcePost[], origin = 'https://wooix.github.io'): LinkGraph {
  const ids = new Set(publicPosts.map((post) => post.id));
  if (ids.size !== publicPosts.length) throw new Error('Link graph: duplicate public post IDs.');
  const nodes: LinkGraphNode[] = publicPosts.map(({ id, title, topic }) => ({ id, title, topic, url: `/notes/${id}/` }));
  const edges = new Map<string, { source: string; target: string }>();
  for (const post of publicPosts) {
    if (typeof post.html !== 'string') throw new Error(`Link graph: rendered body unavailable for public note "${post.id}".`);
    for (const href of extractBodyLinks(post.html)) {
      const target = normalizeNoteLink(href, post.id, origin);
      if (!target || target === post.id || !ids.has(target)) continue;
      edges.set(JSON.stringify([post.id, target]), { source: post.id, target });
    }
  }
  return { nodes, edges: [...edges.values()] };
}
