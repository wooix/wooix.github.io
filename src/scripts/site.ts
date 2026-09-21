import { NAVIGATION_STORAGE_KEY, parseNavigationState, restoreNavigationState, openNavigationPath } from '../lib/navigation-state';

const themeButton = document.querySelector<HTMLButtonElement>('.theme-toggle');
const navButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-nav-disclosure]')];
let navState = {} as Record<string, boolean>;
function readNavState() {
  try { return parseNavigationState(localStorage.getItem(NAVIGATION_STORAGE_KEY)); } catch { return navState; }
}
function saveNavState() {
  try { localStorage.setItem(NAVIGATION_STORAGE_KEY, JSON.stringify(navState)); } catch { /* Toggles still work in memory when storage is unavailable. */ }
}
function nodeButton(node: Element) { return node.querySelector<HTMLButtonElement>(':scope > .nav-tree-row > [data-nav-disclosure]'); }
function pathKeys(node: Element | null, includeSelf = true) {
  const keys: string[] = [];
  let current = includeSelf ? node : node?.parentElement?.closest('[data-nav-node]') || null;
  while (current) {
    const key = nodeButton(current)?.dataset.navKey;
    if (key) keys.push(key);
    current = current.parentElement?.closest('[data-nav-node]') || null;
  }
  return keys;
}
function applyNavState() {
  navButtons.forEach((button) => {
    const branchId = button.getAttribute('aria-controls');
    const branch = branchId ? document.getElementById(branchId) : null;
    if (!branch) return;
    const expanded = navState[button.dataset.navKey!] === true;
    button.setAttribute('aria-expanded', String(expanded));
    button.setAttribute('aria-label', `${button.dataset.navLabel} 하위 항목 ${expanded ? '접기' : '펼치기'}`);
    if (!expanded && branch.contains(document.activeElement)) button.focus();
    branch.hidden = !expanded;
    const sign = button.querySelector('[data-nav-sign]');
    if (sign) sign.textContent = expanded ? '−' : '+';
  });
}
function restoreNavState() {
  const activeKeys: string[] = [];
  document.querySelectorAll<HTMLElement>('[data-nav-active-topic]').forEach((node) => activeKeys.push(...pathKeys(node)));
  document.querySelectorAll<HTMLAnchorElement>('.topic-navigation a[aria-current="page"]').forEach((link) => {
    const node = link.closest('[data-nav-node]');
    activeKeys.push(...pathKeys(node, node?.getAttribute('data-nav-type') === 'topic'));
  });
  navState = restoreNavigationState(readNavState(), activeKeys);
  applyNavState(); saveNavState();
}
navButtons.forEach((button) => button.addEventListener('click', () => {
  navState = { ...navState, [button.dataset.navKey!]: button.getAttribute('aria-expanded') !== 'true' };
  applyNavState(); saveNavState();
}));
document.querySelectorAll<HTMLAnchorElement>('[data-nav-type="topic"] > .nav-tree-row > a').forEach((link) => link.addEventListener('click', () => {
  navState = openNavigationPath(navState, pathKeys(link.closest('[data-nav-node]')));
  applyNavState(); saveNavState();
  // Native navigation, including modified clicks and new tabs, remains untouched.
}));
restoreNavState();
window.addEventListener('pageshow', (event) => { if (event.persisted) restoreNavState(); });
window.addEventListener('storage', (event) => { if (event.key === NAVIGATION_STORAGE_KEY || event.key === null) restoreNavState(); });

function updateThemeLabel() { themeButton?.setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? '밝은 테마로 전환' : '어두운 테마로 전환'); }
updateThemeLabel();
themeButton?.addEventListener('click', () => { const theme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'; document.documentElement.dataset.theme = theme; try { localStorage.setItem('wooix-theme', theme); } catch {} updateThemeLabel(); });

const dialogs = [...document.querySelectorAll<HTMLDialogElement>('dialog')];
const dialogTriggers = new Map<HTMLDialogElement, HTMLElement>();
function openDialog(id: string, trigger?: HTMLElement) {
  const dialog = document.getElementById(id) as HTMLDialogElement | null;
  if (!dialog || dialog.open) return;
  dialogs.filter((other) => other.open).forEach((other) => other.close());
  if (trigger) dialogTriggers.set(dialog, trigger);
  dialog.showModal();
  document.body.style.overflow = 'hidden';
  if (id === 'search-dialog') document.querySelector<HTMLInputElement>('#search-input')?.focus();
}
document.querySelectorAll<HTMLElement>('[data-open-dialog]').forEach((button) => button.addEventListener('click', () => openDialog(button.dataset.openDialog!, button)));
dialogs.forEach((dialog) => {
  dialog.querySelectorAll('[data-close-dialog]').forEach((button) => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', (event) => { if (event.target !== dialog) return; const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); });
  dialog.addEventListener('close', () => { if (!dialogs.some((other) => other.open)) document.body.style.overflow = ''; dialogTriggers.get(dialog)?.focus(); });
  dialog.querySelectorAll('a[href^="#"]').forEach((anchor) => anchor.addEventListener('click', () => dialog.close()));
});
document.addEventListener('keydown', (event) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); if (document.documentElement.classList.contains('focus-mode')) return; const dialog = document.querySelector<HTMLDialogElement>('#search-dialog'); if (dialog?.open) dialog.close(); else openDialog('search-dialog', document.activeElement instanceof HTMLElement ? document.activeElement : undefined); } });

const tocLinks = [...document.querySelectorAll<HTMLAnchorElement>('[data-toc-link]')];
const headingIds = [...new Set(tocLinks.map((link) => decodeURIComponent(link.hash.slice(1))))];
const sections = headingIds.map((id) => document.getElementById(id)).filter((section): section is HTMLElement => !!section);
let scrollQueued = false;
function updateToc() {
  const current = sections.reduce<HTMLElement | undefined>((last, section) => section.getBoundingClientRect().top <= 145 ? section : last, sections[0]);
  tocLinks.forEach((link) => { const active = decodeURIComponent(link.hash.slice(1)) === current?.id; link.classList.toggle('is-active', active); if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
  document.querySelectorAll<HTMLDetailsElement>('.toc-branch').forEach((branch) => {
    branch.classList.toggle('contains-current', !!branch.querySelector('a.is-active'));
  });
  scrollQueued = false;
}
document.addEventListener('scroll', () => { if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateToc); } }, { passive: true });
updateToc();

interface SearchEntry { url: string; meta: { title?: string }; excerpt: string; }
interface Pagefind { search: (term: string) => Promise<{ results: { data: () => Promise<SearchEntry> }[] }>; }
let pagefindPromise: Promise<Pagefind> | undefined;
const searchInput = document.querySelector<HTMLInputElement>('#search-input');
const resultsElement = document.querySelector<HTMLElement>('#search-results');
let searchVersion = 0;
let searchTimer: ReturnType<typeof setTimeout>;
function showSearchMessage(message: string) { if (!resultsElement) return; const p = document.createElement('p'); p.className = 'search-message'; p.textContent = message; resultsElement.replaceChildren(p); }
function appendExcerpt(element: HTMLElement, excerpt: string) {
  const doc = new DOMParser().parseFromString(excerpt, 'text/html');
  function add(source: Node, target: Node) { for (const child of source.childNodes) { if (child.nodeType === Node.TEXT_NODE) target.appendChild(document.createTextNode(child.textContent || '')); else if (child instanceof HTMLElement && child.tagName === 'MARK') { const mark = document.createElement('mark'); mark.textContent = child.textContent; target.appendChild(mark); } else add(child, target); } }
  add(doc.body, element);
}
async function search(term: string, version: number) {
  if (!term || !resultsElement) { showSearchMessage('궁금한 개념이나 논문 이름으로 찾아보세요. 영어와 한국어 모두 검색할 수 있습니다.'); return; }
  showSearchMessage('노트를 찾고 있습니다…');
  try {
    const moduleUrl = '/pagefind/pagefind.js';
    pagefindPromise ??= import(/* @vite-ignore */ moduleUrl) as Promise<Pagefind>;
    const pagefind = await pagefindPromise;
    const result = await pagefind.search(term);
    const entries = await Promise.all(result.results.slice(0, 12).map((entry) => entry.data()));
    if (version !== searchVersion) return;
    if (!entries.length) { showSearchMessage('일치하는 노트가 없습니다. 더 짧은 키워드나 영어 용어로 검색해 보세요.'); return; }
    resultsElement.replaceChildren();
    const count = document.createElement('p'); count.className = 'search-count'; count.textContent = `${result.results.length}개의 노트를 찾았습니다${result.results.length > 12 ? ' · 상위 12개 표시' : ''}`; resultsElement.append(count);
    for (const entry of entries) { const url = new URL(entry.url, location.origin); if (url.origin !== location.origin) continue; const link = document.createElement('a'); link.href = url.pathname + url.hash; link.className = 'search-result'; const title = document.createElement('h3'); title.textContent = entry.meta.title || '연구 노트'; const description = document.createElement('p'); appendExcerpt(description, entry.excerpt); link.append(title, description); resultsElement.append(link); }
  } catch {
    pagefindPromise = undefined;
    if (version !== searchVersion) return;
    showSearchMessage(import.meta.env.DEV ? '개발 모드에서는 검색 색인이 없습니다. npm run build 후 npm run preview에서 검색을 확인할 수 있습니다.' : '검색을 불러오지 못했습니다. 잠시 뒤 다시 입력해 주세요.');
  }
}
searchInput?.addEventListener('input', () => { clearTimeout(searchTimer); const version = ++searchVersion; searchTimer = setTimeout(() => search(searchInput.value.trim(), version), 180); });

const filterButtons = [...document.querySelectorAll<HTMLButtonElement>('[data-filter-kind]')];
const topicSelect = document.querySelector<HTMLSelectElement>('#archive-topic');
if (filterButtons.length) {
  const params = new URLSearchParams(location.search);
  let selectedKind = params.get('kind') || 'all';
  if (!filterButtons.some((button) => button.dataset.filterKind === selectedKind)) selectedKind = 'all';
  if (topicSelect && [...topicSelect.options].some((option) => option.value === params.get('topic'))) topicSelect.value = params.get('topic')!;
  function filterArchive(updateUrl: boolean) {
    let visible = 0;
    const selectedTopic = topicSelect?.value || 'all';
    document.querySelectorAll<HTMLElement>('.archive-group .post-row').forEach((row) => { row.hidden = !(selectedKind === 'all' || row.dataset.kind === selectedKind) || !(selectedTopic === 'all' || row.dataset.topic === selectedTopic); if (!row.hidden) visible++; });
    document.querySelectorAll<HTMLElement>('.archive-group').forEach((group) => { group.hidden = !group.querySelector('.post-row:not([hidden])'); });
    filterButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.filterKind === selectedKind)));
    const empty = document.querySelector<HTMLElement>('.archive-empty'); if (empty) empty.hidden = visible > 0;
    const count = document.querySelector<HTMLElement>('#archive-result-count'); if (count) count.textContent = `${visible}편의 노트`;
    if (updateUrl) { const url = new URL(location.href); selectedKind === 'all' ? url.searchParams.delete('kind') : url.searchParams.set('kind', selectedKind); selectedTopic === 'all' ? url.searchParams.delete('topic') : url.searchParams.set('topic', selectedTopic); history.replaceState({}, '', url); }
  }
  filterButtons.forEach((button) => button.addEventListener('click', () => { selectedKind = button.dataset.filterKind!; filterArchive(true); }));
  topicSelect?.addEventListener('change', () => filterArchive(true));
  filterArchive(false);
}
