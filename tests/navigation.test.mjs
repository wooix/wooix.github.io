import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveNavigation, NavigationConfigurationError } from '../src/lib/navigation.ts';

const topics = [{ id: 'llm-tech', label: 'LLM 기술' }, { id: 'slm-performance', label: 'SLM 성능' }];
const post = (id, topic = 'llm-tech') => ({ id, title: `Public ${id}`, topic });
const reference = (postId, children, label) => ({ type: 'post', postId, ...(children ? { children } : {}), ...(label ? { label } : {}) });
const folder = (label, children) => ({ type: 'folder', label, children });
const fixture = (configuration, allPosts, publicPosts = allPosts) => resolveNavigation({ topics, configuration, allPosts, publicPosts });
const flatten = (nodes) => nodes.flatMap((node) => [node, ...flatten(node.children)]);

test('mixed folders and post references retain 4+ levels without moving post URLs', () => {
  const all = ['lesson', 'paper', 'detail'].map((id) => post(id));
  const result = fixture({ 'llm-tech': [folder('Course', [folder('Part', [reference('lesson', [folder('Sources', [reference('paper', [reference('detail')])])])])]) ] }, all);
  assert.deepEqual(flatten(result).filter((node) => node.postId).map((node) => [node.postId, node.href]), [
    ['lesson', '/notes/lesson/'], ['paper', '/notes/paper/'], ['detail', '/notes/detail/'],
  ]);
  assert.equal(result[0].children[0].children[0].children[0].children[0].children[0].children[0].postId, 'detail');
});

test('six explicitly ordered lessons and additional siblings are never truncated', () => {
  const all = Array.from({ length: 9 }, (_, index) => post(`lesson-${index + 1}`));
  const order = ['lesson-3', 'lesson-1', 'lesson-6', 'lesson-2', 'lesson-5', 'lesson-4'];
  const result = fixture({ 'llm-tech': order.map((id, i) => ({ ...reference(id), label: `${i + 1}강` })) }, all.toReversed());
  assert.deepEqual(result[0].children.map((node) => node.postId), [...order, 'lesson-9', 'lesson-8', 'lesson-7']);
  assert.deepEqual(result[0].children.slice(0, 6).map((node) => node.label), ['1강', '2강', '3강', '4강', '5강', '6강']);
  assert.equal(result[0].postCount, 9);
});

test('cross-topic references retain the post in its original topic; local placements suppress only local automatic duplicates', () => {
  const all = [post('a'), post('b', 'slm-performance')];
  const result = fixture({ 'slm-performance': [reference('a')] }, all);
  assert.deepEqual(result[0].children.map((node) => node.postId), ['a']);
  assert.equal(result[0].postCount, 1);
  assert.deepEqual(result[1].children.map((node) => node.postId), ['a', 'b']);
  assert.equal(result.length, 2);
});

test('the same post and object may appear on different branches with unique occurrence keys', () => {
  const reused = reference('shared');
  const result = fixture({ 'llm-tech': [folder('A', [reused]), folder('B', [reused])], 'slm-performance': [reused] }, [post('shared')]);
  const nodes = flatten(result);
  assert.equal(nodes.filter((node) => node.postId === 'shared').length, 3);
  assert.equal(new Set(nodes.map((node) => node.key)).size, nodes.length);
  assert.equal(result[0].postCount, 1);
});

test('hidden branches remove private labels and relationships while public descendants fall back to their own topic', () => {
  const all = [post('draft'), post('future'), post('public', 'slm-performance')];
  const config = { 'llm-tech': [
    folder('Private folder title', [reference('draft', [reference('public', undefined, 'Private relationship label')], 'Private draft title')]),
    reference('future', [folder('Hidden nested folder', [reference('public')])]),
    folder('Empty folder title', []),
  ] };
  const result = fixture(config, all, [{ id: 'public' }]);
  assert.equal(result[0].children.length, 0);
  assert.deepEqual(result[1].children.map((node) => [node.postId, node.label]), [['public', 'Public public']]);
  const encoded = JSON.stringify(result);
  for (const hidden of ['Private', 'Hidden nested', 'Empty folder', '/notes/draft/', '/notes/future/']) assert.equal(encoded.includes(hidden), false);
});

test('a public post remains explicitly visible elsewhere despite a hidden occurrence', () => {
  const result = fixture({ 'llm-tech': [reference('draft', [reference('shared')]), folder('Visible', [reference('shared')])] }, [post('draft'), post('shared')], [{ id: 'shared' }]);
  assert.equal(flatten(result).filter((node) => node.postId === 'shared').length, 1);
  assert.equal(result[0].children[0].label, 'Visible');
});

test('unknown post IDs fail with an actionable configuration path, including below hidden parents', () => {
  for (const nodes of [[reference('missing')], [reference('draft', [reference('missing')])]]) {
    assert.throws(() => fixture({ 'llm-tech': nodes }, [post('draft')], []), (error) => error instanceof NavigationConfigurationError && /src\/data\/navigation.ts.llm-tech\[0\]/.test(error.message) && /Unknown post ID "missing"/.test(error.message));
  }
});

test('self and ancestor post cycles fail, including hidden subtrees', () => {
  for (const children of [[reference('a')], [reference('b', [folder('Deep', [reference('a')])])]]) {
    assert.throws(() => fixture({ 'llm-tech': [reference('a', children)] }, [post('a'), post('b')], []), /Post cycle through "a"/);
  }
});

test('circular JavaScript object references fail rather than recurse indefinitely', () => {
  const cyclic = folder('Cycle', []);
  cyclic.children.push(cyclic);
  assert.throws(() => fixture({ 'llm-tech': [cyclic] }, []), /Circular JavaScript object reference/);
});

test('wrong topics and malformed node fields fail before rendering', () => {
  assert.throws(() => fixture({ typo: [] }, []), /Unknown topic "typo"/);
  assert.throws(() => fixture({}, [post('bad', 'typo')]), /Unknown topic "typo"/);
  for (const node of [null, { type: 'directory', label: 'X' }, { type: 'folder', label: 'X' }, folder(' ', []), { type: 'post', postId: 'a', childen: [] }]) {
    assert.throws(() => fixture({ 'llm-tech': [node] }, [post('a')]), NavigationConfigurationError);
  }
});

test('visibility registry must be a unique subset of all known posts', () => {
  assert.throws(() => fixture({}, [], [{ id: 'unknown' }]), /complete allPosts registry/);
  assert.throws(() => fixture({}, [post('a')], [{ id: 'a' }, { id: 'a' }]), /Duplicate post ID/);
});

test('resolution does not mutate the configuration or post registry', () => {
  const config = { 'llm-tech': [folder('Foundations', [reference('a')])] };
  const all = [post('a'), post('b')];
  const before = JSON.stringify({ config, all });
  fixture(config, all);
  assert.equal(JSON.stringify({ config, all }), before);
});
