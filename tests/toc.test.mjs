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

// Exercise the real Astro Markdown pipeline, including opt-in anchor preservation.
import { createMarkdownProcessor, parseFrontmatter } from '@astrojs/markdown-remark';
import { readFile } from 'node:fs/promises';
import config from '../astro.config.mjs';
const renderer = await createMarkdownProcessor({ ...config.markdown.processor.options, syntaxHighlight: false });

test('marked Markdown headings retain their old anchors while TOC excludes the separate subtitle', async () => {
  const rendered = await renderer.render(`## 1. 문제 정의

<p class="heading-subtitle" data-heading-id="1-문제-정의-어떤-학습-경험이-부족한가"><span aria-hidden="true">💡</span> 어떤 학습 경험이 부족한가?</p>

### Learning Goals(학습 목표)

<p class="heading-subtitle" data-heading-id="learning-goals학습-목표-읽고-나서-설명할-세-가지"><span aria-hidden="true">💡</span> 읽고 나서 설명할 세 가지</p>`);
  assert.deepEqual(rendered.metadata.headings, [
    { depth: 2, slug: '1-문제-정의-어떤-학습-경험이-부족한가', text: '1. 문제 정의' },
    { depth: 3, slug: 'learning-goals학습-목표-읽고-나서-설명할-세-가지', text: 'Learning Goals(학습 목표)' },
  ]);
  assert.equal(buildToc(rendered.metadata.headings)[0].children.length, 1);
  assert.match(rendered.code, /<h2 id="1-문제-정의-어떤-학습-경험이-부족한가" class="has-heading-subtitle">1\. 문제 정의<\/h2>/);
  assert.match(rendered.code, /<span aria-hidden="true">💡<\/span> 어떤 학습 경험이 부족한가\?/);
});

test('unmarked colon headings and code examples retain normal Markdown behavior', async () => {
  const source = ['## Method: Original Paper Section', '', '```html', '<p class="heading-subtitle" data-heading-id="fake">Example</p>', '```'].join('\n');
  const rendered = await renderer.render(source);
  assert.deepEqual(rendered.metadata.headings, [{ depth: 2, slug: 'method-original-paper-section', text: 'Method: Original Paper Section' }]);
  assert.doesNotMatch(rendered.code, /class="has-heading-subtitle"/);
});

test('an explicit subtitle without its preserved anchor fails instead of silently creating a new slug', async () => {
  for (const marker of ['<p class="heading-subtitle">설명</p>', '<p class="heading-subtitle" data-heading-id="">설명</p>']) {
    await assert.rejects(renderer.render(`## 짧은 제목\n\n${marker}`), /requires a non-empty data-heading-id/);
  }
});

test('lesson one retains its 26-heading outline and opts in only its 25 subtitle paragraphs', async () => {
  const source = await readFile(new URL('../src/content/posts/synthetic-data-study/01-foundations.md', import.meta.url), 'utf8');
  const rendered = await renderer.render(parseFrontmatter(source).content);
  assert.equal(rendered.metadata.headings.length, 26);
  assert.equal(new Set(rendered.metadata.headings.map((heading) => heading.slug)).size, 26);
  assert.deepEqual(rendered.metadata.headings[0], { depth: 2, slug: 'required-reading필수-읽기-자료', text: 'Required Reading(필수 읽기 자료)' });
  assert.equal(rendered.metadata.headings.filter((heading) => heading.depth === 4).length, 3);
  assert.equal(rendered.metadata.headings.filter((heading) => heading.text.includes(': ')).length, 0);
  assert.equal((rendered.code.match(/class="heading-subtitle"/g) || []).length, 25);
});
