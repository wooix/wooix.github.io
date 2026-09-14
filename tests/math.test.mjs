import test from 'node:test';
import assert from 'node:assert/strict';
import { createMarkdownProcessor } from '@astrojs/markdown-remark';
import config from '../astro.config.mjs';
const renderer = await createMarkdownProcessor({ ...config.markdown.processor.options, syntaxHighlight: false });
test('LaTeX renders inline and display math as accessible HTML and preserves code', async () => {
  const { code } = await renderer.render(String.raw`Inline $D_{\mathrm{gen}}$ and code \`x_y\`.

$$
D_{\mathrm{gen}} \leftarrow M_p(T,D_{\mathrm{sup}})
$$
`.replaceAll('\\`','`'));
  assert.match(code, /class="katex"/);
  assert.match(code, /class="katex-display"/);
  assert.match(code, /<math /);
  assert.match(code, /<code>x_y<\/code>/);
  assert.doesNotMatch(code, /katex-error/);
});
