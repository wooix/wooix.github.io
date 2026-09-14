export interface Heading { depth: number; slug: string; text: string; }
export interface TocNode extends Heading { children: TocNode[]; }

/** Attach each heading to the closest preceding shallower heading. */
export function buildToc(headings: Heading[]): TocNode[] {
  const roots: TocNode[] = [];
  const stack: TocNode[] = [];
  for (const heading of headings) {
    if (heading.depth < 2 || heading.depth > 6) continue;
    const node: TocNode = { ...heading, children: [] };
    while (stack.length && stack[stack.length - 1].depth >= node.depth) stack.pop();
    (stack.length ? stack[stack.length - 1].children : roots).push(node);
    stack.push(node);
  }
  return roots;
}
