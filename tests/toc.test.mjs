import test from 'node:test';
import assert from 'node:assert/strict';
import { buildToc } from '../src/lib/toc.ts';
const h = (depth, slug) => ({ depth, slug, text: slug });
test('paper sections stay below their chapter and resume at the right ancestor', () => {
  const tree = buildToc([h(2,'method'),h(3,'generation'),h(4,'prompt'),h(4,'filter'),h(3,'training'),h(2,'results')]);
  assert.deepEqual(tree.map(n=>n.slug),['method','results']);
  assert.deepEqual(tree[0].children.map(n=>n.slug),['generation','training']);
  assert.deepEqual(tree[0].children[0].children.map(n=>n.slug),['prompt','filter']);
});
test('skipped heading levels and deep appendices preserve all anchors without fake sections', () => {
  const input=[h(1,'title'),h(3,'intro'),h(5,'detail'),h(6,'formula'),h(2,'appendix')];
  const tree=buildToc(input);
  assert.equal(tree[0].children[0].children[0].slug,'formula');
  assert.equal(tree[1].slug,'appendix');
  assert.equal(input[1].children,undefined);
});
