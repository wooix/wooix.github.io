type Anchor = { start: number; end: number; quote: string; prefix: string; suffix: string };
type Entry = { id: string; anchor: Anchor | null; kind: 'highlight' | 'underline' | 'note'; color: number; opinion: string };
type Data = { version: 1; note: string; draft: string; entries: Entry[] };
const article = document.querySelector<HTMLElement>('article[data-pagefind-body]');
const panel = document.querySelector<HTMLElement>('#annotation-panel');
if (article && panel) {
  const root = article;
  const get = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
  const note = get<HTMLTextAreaElement>('annotation-note');
  const opinion = get<HTMLTextAreaElement>('annotation-opinion');
  const status = get('annotation-status');
  const toggle = document.querySelector<HTMLButtonElement>('.annotation-toggle')!;
  const key = `wooix-annotations-v1:${location.pathname.replace(/\/$/, '')}`;
  let data: Data = { version: 1, note: '', draft: '', entries: [] };
  let selected: Anchor | null = null;
  let color = 0;
  let writable = true;
  function valid(value: unknown): value is Data {
    const d = value as Data;
    return !!d && d.version === 1 && typeof d.note === 'string' && typeof d.draft === 'string' && Array.isArray(d.entries) && d.entries.every(e =>
      e && typeof e.id === 'string' && ['highlight', 'underline', 'note'].includes(e.kind) && Number.isInteger(e.color) && e.color >= 0 && e.color < 5 && typeof e.opinion === 'string' &&
      (e.anchor === null || (Number.isInteger(e.anchor.start) && Number.isInteger(e.anchor.end) && e.anchor.start >= 0 && e.anchor.end > e.anchor.start && typeof e.anchor.quote === 'string' && e.anchor.quote.length > 0 && typeof e.anchor.prefix === 'string' && typeof e.anchor.suffix === 'string')));
  }
  try { const saved = localStorage.getItem(key); if (saved) { const parsed = JSON.parse(saved); if (!valid(parsed)) throw new Error(); data = parsed; } }
  catch { writable = false; status.textContent = '기존 기록을 읽을 수 없습니다. 덮어쓰지 않으며, 새 기록은 백업으로 보관하세요.'; }
  function save() {
    if (!writable) return;
    try { localStorage.setItem(key, JSON.stringify(data)); status.textContent = '이 브라우저에 저장됨'; }
    catch { status.textContent = '저장하지 못했습니다. 브라우저 저장 공간을 확인하거나 백업하세요.'; }
  }
  function nodes() {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const list: Text[] = []; let n: Node | null;
    while ((n = walker.nextNode())) list.push(n as Text);
    return list;
  }
  function resolve(a: Anchor, text: string): Anchor | null {
    if (text.slice(a.start, a.end) === a.quote) return a;
    const matches: number[] = []; let pos = text.indexOf(a.quote);
    while (pos !== -1) { matches.push(pos); pos = text.indexOf(a.quote, pos + 1); }
    const contextual = matches.filter(i => text.slice(Math.max(0, i - a.prefix.length), i) === a.prefix && text.slice(i + a.quote.length, i + a.quote.length + a.suffix.length) === a.suffix);
    const start = contextual.length === 1 ? contextual[0] : matches.length === 1 ? matches[0] : undefined;
    return start === undefined ? null : { ...a, start, end: start + a.quote.length };
  }
  function paint() {
    root.querySelectorAll('.reader-mark').forEach(el => el.replaceWith(...el.childNodes)); root.normalize();
    const text = root.textContent || '';
    for (const entry of data.entries) {
      if (!entry.anchor || entry.kind === 'note') continue;
      const anchor = resolve(entry.anchor, text); if (!anchor) continue;
      let offset = 0;
      for (const node of nodes()) {
        const start = offset; offset += node.length;
        if (offset <= anchor.start || start >= anchor.end || !node.textContent?.trim()) continue;
        // Leave mathematical and executable content structurally intact.
        if (node.parentElement?.closest('script,style,.katex,svg,mjx-container')) continue;
        const range = document.createRange();
        range.setStart(node, Math.max(0, anchor.start - start)); range.setEnd(node, Math.min(node.length, anchor.end - start));
        const mark = document.createElement('mark'); mark.className = 'reader-mark'; mark.dataset.kind = entry.kind; mark.dataset.annotationId = entry.id; mark.style.setProperty('--swatch', `var(--annotation-${entry.color})`);
        range.surroundContents(mark);
      }
    }
  }
  function show(open: boolean) { panel!.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); }
  toggle.addEventListener('click', () => show(panel!.hidden));
  get('annotation-close').addEventListener('click', () => { show(false); toggle.focus(); });
  panel.addEventListener('keydown', e => { if (e.key === 'Escape') { show(false); toggle.focus(); } });
  function selectionLabel() {
    get('annotation-selection').textContent = selected ? selected.quote : '선택한 문장이 없습니다.';
    panel!.querySelectorAll<HTMLButtonElement>('[data-mark]').forEach(b => b.disabled = !selected);
  }
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection(); if (!selection?.rangeCount || selection.isCollapsed) return;
    const range = selection.getRangeAt(0);
    if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return;
    const before = document.createRange(); before.selectNodeContents(root); before.setEnd(range.startContainer, range.startOffset);
    const start = before.toString().length; const quote = range.toString(); if (!quote.trim()) return;
    const text = root.textContent || ''; const end = start + quote.length;
    selected = { start, end, quote, prefix: text.slice(Math.max(0, start - 32), start), suffix: text.slice(end, end + 32) };
    selectionLabel(); show(true);
  });
  panel.querySelectorAll<HTMLButtonElement>('[data-color]').forEach(b => b.addEventListener('click', () => {
    color = Number(b.dataset.color); panel!.querySelectorAll('[data-color]').forEach(el => el.setAttribute('aria-pressed', String(el === b)));
  }));
  get('annotation-clear-selection').addEventListener('click', () => { selected = null; window.getSelection()?.removeAllRanges(); selectionLabel(); });
  function add(kind: Entry['kind']) {
    if (kind !== 'note' && !selected) return;
    if (kind === 'note' && !opinion.value.trim()) { opinion.focus(); return; }
    data.entries.push({ id: crypto.randomUUID(), anchor: selected ? { ...selected } : null, kind, color, opinion: opinion.value });
    opinion.value = ''; data.draft = ''; save(); render();
  }
  panel.querySelectorAll<HTMLButtonElement>('[data-mark]').forEach(b => b.addEventListener('click', () => add(b.dataset.mark as Entry['kind'])));
  get('annotation-add').addEventListener('click', () => add('note'));
  note.value = data.note; opinion.value = data.draft;
  note.addEventListener('input', () => { data.note = note.value; save(); });
  opinion.addEventListener('input', () => { data.draft = opinion.value; save(); });
  function render() {
    paint(); const list = get('annotation-list'); list.replaceChildren();
    if (!data.entries.length) { list.textContent = '아직 저장한 표시나 의견이 없습니다.'; return; }
    for (const entry of data.entries) {
      const item = document.createElement('div'); item.className = 'annotation-entry'; item.style.setProperty('--swatch', `var(--annotation-${entry.color})`);
      const title = document.createElement('strong'); title.textContent = `${['노랑', '초록', '파랑', '분홍', '보라'][entry.color]} · ${{ highlight: '형광펜', underline: '밑줄', note: '의견' }[entry.kind]}`; item.append(title);
      if (entry.anchor) {
        const quote = document.createElement('blockquote'); quote.textContent = entry.anchor.quote; item.append(quote);
        if (!resolve(entry.anchor, root.textContent || '')) { const warning = document.createElement('p'); warning.textContent = '본문이 바뀌어 위치를 찾지 못했습니다. 저장한 문장은 보존됩니다.'; item.append(warning); }
      }
      const text = document.createElement('p'); text.textContent = entry.opinion; item.append(text);
      const edit = document.createElement('button'); edit.textContent = '의견 수정'; edit.addEventListener('click', () => {
        const input = document.createElement('textarea'); input.value = entry.opinion; input.setAttribute('aria-label', '저장한 의견 수정');
        input.addEventListener('input', () => { entry.opinion = input.value; save(); }); text.replaceWith(input); edit.disabled = true; input.focus();
      });
      const remove = document.createElement('button'); remove.textContent = '삭제'; remove.addEventListener('click', () => { data.entries = data.entries.filter(e => e.id !== entry.id); save(); render(); });
      item.append(edit, remove); list.append(item);
    }
  }
  get('annotation-export').addEventListener('click', () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ path: location.pathname, data }, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `notes-${location.pathname.split('/').filter(Boolean).pop()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  get<HTMLInputElement>('annotation-import').addEventListener('change', async e => {
    const input = e.target as HTMLInputElement; const file = input.files?.[0]; if (!file) return;
    try {
      const backup = JSON.parse(await file.text());
      if (backup.path !== location.pathname || !valid(backup.data)) throw new Error();
      const incoming: Data = backup.data;
      for (const entry of incoming.entries) if (!data.entries.some(existing => JSON.stringify({ ...existing, id: '' }) === JSON.stringify({ ...entry, id: '' }))) data.entries.push({ ...entry, id: crypto.randomUUID() });
      if (incoming.note && incoming.note !== data.note) data.note = [data.note, incoming.note].filter(Boolean).join('\n\n');
      if (incoming.draft && incoming.draft !== data.draft) data.draft = [data.draft, incoming.draft].filter(Boolean).join('\n\n');
      note.value = data.note; opinion.value = data.draft; save(); render();
    } catch { status.textContent = '이 글의 유효한 메모 백업 파일을 선택하세요.'; }
    input.value = '';
  });
  window.addEventListener('storage', e => {
    if (e.key !== key || !e.newValue) return;
    try { const incoming = JSON.parse(e.newValue); if (valid(incoming)) { data = incoming; note.value = data.note; opinion.value = data.draft; render(); } } catch { /* Keep current records. */ }
  });
  selectionLabel(); render();
}
