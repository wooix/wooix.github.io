import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeNoteLink, currentGraphPostId, getBacklinks } from '../src/lib/link-graph.ts';
import { buildLinkGraph, extractBodyLinks } from '../src/lib/link-graph-source.ts';
import { quartzVisualLinks, quartzNodeRadius, quartzNeighbours } from '../src/lib/quartz-graph-model.ts';

const post = (id, html = '', topic = 'llm-tech') => ({ id, title: `${id} title`, topic, html });
const link = (id) => `<a href="/notes/${id}/">${id}</a>`;
const graph = buildLinkGraph([post('a', link('b') + link('c')), post('b', link('d')), post('c', link('b')), post('d'), post('isolated')]);

test('published note URLs normalize relative, fragment, query and exact same-origin URLs', () => {
  for (const href of ['/notes/series/target/', '/notes/series/target#section', '/notes/series/target/?query=1', '../target/', 'https://wooix.github.io/notes/series/target/', '//wooix.github.io/notes/series/target/']) {
    assert.equal(normalizeNoteLink(href, 'series/source'), 'series/target', href);
  }
  assert.equal(normalizeNoteLink('#section', 'series/source'), 'series/source');
  assert.equal(normalizeNoteLink('../../target/', 'series/source'), 'target');
  assert.equal(normalizeNoteLink('/notes/%ED%95%9C%EA%B8%80/', 'source'), '한글');
});

test('external, deceptive, non-HTTP, malformed, asset and source-file links are excluded', () => {
  for (const href of ['https://example.com/notes/b/', 'https://wooix.github.io.example.com/notes/b/', 'http://wooix.github.io/notes/b/', 'javascript:alert(1)', 'mailto:x@y.com', 'data:text/html,test', '/other/notes/b/', '/notes/file.pdf', '/notes/b.md', '../b.md', '/notes/a%2Fb/', '/notes/%ZZ/', '/notes/a//b/', '//user@wooix.github.io/notes/b/', '/notes/a\\b/', '', '/notes/a\nb/']) {
    assert.equal(normalizeNoteLink(href, 'a'), null, href);
  }
});

test('HTML parsing includes actual body links and excludes rendered code and non-content examples', () => {
  const html = `<p>${link('a')}</p><details><summary>Read</summary>${link('b')}</details>
    <pre><code>${link('fake-pre')}</code></pre><code>${link('fake-inline')}</code>
    <pre>&lt;a href="/notes/fake-escaped/"&gt;example&lt;/a&gt; [fake](/notes/fake-md/)</pre>
    <!-- ${link('fake-comment')} --><script>${link('fake-script')}</script>
    <style>${link('fake-style')}</style><template>${link('fake-template')}</template>
    <textarea>${link('fake-textarea')}</textarea><a href="/notes/c/?a=1&amp;b=2">C</a>`;
  assert.deepEqual(extractBodyLinks(html), ['/notes/a/', '/notes/b/', '/notes/c/?a=1&b=2']);
});

test('only body links form directed edges; reciprocal edges remain and duplicate/self edges do not', () => {
  const result = buildLinkGraph([post('a', link('a') + link('b') + '<a href="../b/#again">B</a>'), post('b', link('a')), post('c')]);
  assert.deepEqual(result.edges, [{ source: 'a', target: 'b' }, { source: 'b', target: 'a' }]);
  assert.equal(result.nodes.length, 3);
  assert.ok(result.nodes.some((node) => node.id === 'c'));
});

test('hidden and unknown targets cannot add nodes or edges to the public registry', () => {
  const result = buildLinkGraph([post('public', link('draft') + link('future') + link('unknown'))]);
  assert.deepEqual(result.edges, []);
  assert.deepEqual(result.nodes.map((node) => node.id), ['public']);
  assert.ok(!JSON.stringify(result).includes('draft'));
});

test('missing rendered public content fails explicitly; an intentionally empty body is allowed', () => {
  assert.throws(() => buildLinkGraph([{ ...post('missing'), html: undefined }]), /rendered body unavailable.*missing/);
  assert.throws(() => buildLinkGraph([post('same'), post('same')]), /duplicate public post IDs/);
  assert.equal(buildLinkGraph([post('empty')]).nodes.length, 1);
  assert.deepEqual(buildLinkGraph([]), { nodes: [], edges: [] });
});

test('Backlinks contains current plus incoming only, excluding outbound and cross-source connections', () => {
  const result = getBacklinks(graph, 'b');
  assert.deepEqual(result.nodes.map((node) => node.id), ['a', 'b', 'c']);
  assert.deepEqual(result.edges, [{ source: 'a', target: 'b' }, { source: 'c', target: 'b' }]);
  assert.deepEqual(getBacklinks(graph, 'isolated').nodes.map((node) => node.id), ['isolated']);
  assert.equal(getBacklinks(graph, 'isolated').edges.length, 0);
});

test('non-note pages and absent current notes have an honest empty backlink view', () => {
  assert.equal(currentGraphPostId(graph, '/notes/b/#title'), 'b');
  for (const path of ['/topics/llm-tech/', '/', '/notes/missing/', '/archive/']) assert.equal(currentGraphPostId(graph, path), null);
  assert.deepEqual(getBacklinks(graph, null), { nodes: [], edges: [] });
  assert.deepEqual(getBacklinks(graph, 'missing'), { nodes: [], edges: [] });
});

test('Quartz visual lines merge reciprocal directions without changing public directed edges', () => {
  const input = buildLinkGraph([post('a', link('b')), post('b', link('a')), post('isolated')]);
  const snapshot = structuredClone(input);
  const visual = quartzVisualLinks(input);
  assert.equal(visual.length, 1);
  assert.equal(visual[0].directions.length, 2);
  assert.deepEqual(input, snapshot);
  assert.equal(input.nodes.length, 3);
});

test('Quartz node radius uses incoming degree, preserving zero-degree isolated notes', () => {
  assert.ok(quartzNodeRadius(graph, 'b') > quartzNodeRadius(graph, 'd'));
  assert.ok(quartzNodeRadius(graph, 'd') > quartzNodeRadius(graph, 'isolated'));
  assert.equal(quartzNodeRadius(graph, 'isolated'), 2);
  assert.equal(quartzNodeRadius(graph, 'b', 2), quartzNodeRadius(graph, 'b') * 2);
});

test('Quartz hover highlights exactly one hop without altering backlink direction', () => {
  assert.deepEqual([...quartzNeighbours(graph, 'b')].sort(), ['a', 'b', 'c', 'd']);
  assert.deepEqual([...quartzNeighbours(graph, 'isolated')], ['isolated']);
  assert.equal(quartzNeighbours(graph, null).size, 0);
  assert.deepEqual(getBacklinks(graph, 'b').edges, [{ source: 'a', target: 'b' }, { source: 'c', target: 'b' }]);
  assert.deepEqual(quartzVisualLinks({ nodes: [], edges: [] }), []);
});
