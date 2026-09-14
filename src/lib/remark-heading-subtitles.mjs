import { parseFragment } from 'parse5';

/** Opt-in presentation marker. Keep Markdown headings so Astro still collects the TOC. */
export default function remarkHeadingSubtitles() {
  return (tree) => {
    const assignedIds = new Set();
    function walk(parent) {
      if (!Array.isArray(parent.children)) return;
      parent.children.forEach((node, index) => {
        if (node.type === 'html' && node.value.includes('heading-subtitle')) {
          const fragment = parseFragment(node.value);
          const paragraph = fragment.childNodes.find((child) => child.nodeName === 'p');
          const attributes = Object.fromEntries((paragraph?.attrs || []).map(({ name, value }) => [name, value]));
          const isMarker = attributes.class?.split(/\s+/).includes('heading-subtitle');
          if (isMarker) {
            const heading = parent.children[index - 1];
            const id = attributes['data-heading-id'];
            if (!id) throw new Error('heading-subtitle requires a non-empty data-heading-id copied from the existing heading anchor.');
            if (heading?.type !== 'heading' || heading.depth < 2) throw new Error('heading-subtitle must immediately follow a Markdown heading of level 2 or deeper.');
            if (/\s|#/.test(id) || assignedIds.has(id)) throw new Error(`heading-subtitle has an invalid or repeated anchor: ${id}`);
            assignedIds.add(id);
            heading.data ??= {};
            heading.data.hProperties ??= {};
            const properties = heading.data.hProperties;
            if (properties.id && properties.id !== id) throw new Error(`heading-subtitle anchor conflicts with the heading: ${id}`);
            properties.id = id;
            properties.className = [...(Array.isArray(properties.className) ? properties.className : []), 'has-heading-subtitle'];
          }
        }
        walk(node);
      });
    }
    walk(tree);
  };
}
