import { getBacklinks, type LinkGraph, type LinkGraphNode } from '../lib/link-graph';
import type { QuartzRenderer, QuartzSettings } from './quartz-graph-renderer';

interface GraphPayload { graph: LinkGraph; currentId: string | null; topics: { id: string; label: string; color: string; darkColor: string }[]; }
const launcher = document.querySelector<HTMLButtonElement>('#graph-launcher');
const panel = document.querySelector<HTMLElement>('#graph-panel');
const fullscreen = document.querySelector<HTMLDialogElement>('#graph-fullscreen');
function closePanel(restoreFocus = true) {
  if (!panel || !launcher) return;
  panel.hidden = true; launcher.setAttribute('aria-expanded', 'false');
  if (restoreFocus) launcher.focus();
}
launcher?.addEventListener('click', () => {
  if (!panel) return;
  panel.hidden = !panel.hidden; launcher.setAttribute('aria-expanded', String(!panel.hidden));
  if (!panel.hidden) panel.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]')?.focus();
});
document.querySelector('#graph-panel-close')?.addEventListener('click', () => closePanel());
panel?.addEventListener('keydown', (event) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closePanel(); } });

try {
  const raw = document.querySelector('#link-graph-data')?.textContent;
  if (!raw) throw new Error('Missing graph data');
  const payload = JSON.parse(raw) as GraphPayload;
  if (!Array.isArray(payload.graph?.nodes) || !Array.isArray(payload.graph?.edges) || !Array.isArray(payload.topics)) throw new Error('Invalid graph data');
  const topics = new Map(payload.topics.map((topic) => [topic.id, topic]));
  const views = new Map<string, { select: (mode: string) => void; mode: () => string; refresh: () => void }>();
  document.querySelectorAll<HTMLElement>('[data-graph-view]').forEach((view) => {
    const prefix = view.dataset.graphPrefix!;
    const host = view.querySelector<HTMLElement>('[data-graph-renderer]')!;
    const status = view.querySelector<HTMLElement>('[data-graph-status]')!;
    const detail = view.querySelector<HTMLElement>('[data-graph-detail]')!;
    const empty = view.querySelector<HTMLElement>('[data-graph-empty]')!;
    const list = view.querySelector<HTMLUListElement>('[data-graph-node-list]')!;
    const tabs = [...view.querySelectorAll<HTMLButtonElement>('[data-graph-mode]')];
    const settingsPanel = view.querySelector<HTMLElement>('[data-graph-settings]')!;
    const settingsToggle = view.querySelector<HTMLButtonElement>('[data-graph-settings-toggle]')!;
    let mode = 'global'; let selectedGraph = payload.graph;
    let renderer: QuartzRenderer | null = null; let generation = 0; let initializing = false;
    let config: QuartzSettings = { arrows: false, fade: true, nodeSize: 1.25, linkWidth: 0.8, repel: 0.75, center: 0.2, distance: 70 };
    function visible() { return !document.hidden && (prefix === 'fullscreen' ? !!fullscreen?.open : !panel?.hidden && !fullscreen?.open) && host.clientWidth > 0; }
    function describe(node: LinkGraphNode | null) {
      detail.hidden = !node;
      detail.textContent = node ? `${node.title} · ${topics.get(node.topic)?.label || node.topic}${node.id === payload.currentId ? ' · 현재 글' : ''}` : '';
    }
    async function refresh() {
      const active = visible(); renderer?.setActive(active);
      if (!active || renderer || initializing || !selectedGraph.nodes.length) return;
      initializing = true; const token = generation;
      try {
        const { createQuartzRenderer } = await import('./quartz-graph-renderer');
        if (token !== generation || !visible()) return;
        const instance = await createQuartzRenderer(host, selectedGraph, {
          currentId: payload.currentId, topics, describe,
          onScale(scale) { view.querySelector('[data-graph-scale]')!.textContent = `${Math.round(scale * 100)}%`; },
        });
        if (token !== generation) instance.destroy();
        else { renderer = instance; renderer.settings(config); renderer.setActive(visible()); }
      } catch {
        if (token === generation) { empty.hidden = false; empty.textContent = '그래프 화면을 시작하지 못했습니다. 새로고침하거나 설정의 글 목록을 이용해 주세요.'; status.textContent = '그래프 표시 오류'; }
      } finally {
        initializing = false;
        if (token !== generation) void refresh();
      }
    }
    function select(nextMode: string) {
      generation++; renderer?.destroy(); renderer = null; describe(null);
      mode = nextMode === 'backlinks' ? 'backlinks' : 'global';
      selectedGraph = mode === 'backlinks' ? getBacklinks(payload.graph, payload.currentId) : payload.graph;
      tabs.forEach((tab) => { const active = tab.dataset.graphMode === mode; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
      view.querySelector('[role="tabpanel"]')!.setAttribute('aria-labelledby', `${prefix}-${mode}`);
      const current = payload.graph.nodes.find((node) => node.id === payload.currentId);
      status.textContent = mode === 'global' ? `${selectedGraph.nodes.length}글 · ${selectedGraph.edges.length}개 본문링크` : current ? `역링크 ${selectedGraph.edges.length}글` : '개별 글에서 확인';
      empty.hidden = mode !== 'backlinks' || selectedGraph.edges.length > 0;
      empty.textContent = current ? '이 글을 링크한 다른 글이 아직 없습니다.' : '개별 글에서 Backlinks(역방향 링크)를 확인할 수 있습니다.';
      if (mode === 'global' && !selectedGraph.nodes.length) { empty.hidden = false; empty.textContent = '공개된 연구 노트가 아직 없습니다.'; }
      list.replaceChildren();
      for (const node of selectedGraph.nodes) {
        const item = document.createElement('li'); const link = document.createElement('a'); const title = document.createElement('span'); const topicLabel = document.createElement('small');
        link.href = node.url; title.textContent = node.title; topicLabel.textContent = `${topics.get(node.topic)?.label || node.topic}${node.id === payload.currentId ? ' · 현재 글' : ''}`;
        if (node.id === payload.currentId) link.setAttribute('aria-current', 'page');
        link.append(title, topicLabel); link.addEventListener('focus', () => renderer?.focus(node.id)); link.addEventListener('blur', () => renderer?.focus(null)); item.append(link); list.append(item);
      }
      view.querySelector('[data-graph-list-count]')!.textContent = `${selectedGraph.nodes.length}`;
      void refresh();
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab.dataset.graphMode!));
      tab.addEventListener('keydown', (event) => {
        let target = index;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') target = (index + 1) % tabs.length;
        else if (event.key === 'Home') target = 0; else if (event.key === 'End') target = tabs.length - 1; else return;
        event.preventDefault(); tabs[target].focus(); select(tabs[target].dataset.graphMode!);
      });
    });
    settingsToggle.addEventListener('click', () => { settingsPanel.hidden = !settingsPanel.hidden; settingsToggle.setAttribute('aria-expanded', String(!settingsPanel.hidden)); });
    view.querySelectorAll<HTMLInputElement>('[data-setting]').forEach((input) => input.addEventListener('input', () => {
      config = { ...config, [input.dataset.setting!]: input.type === 'checkbox' ? input.checked : Number(input.value) }; renderer?.settings(config);
    }));
    view.querySelector('[data-graph-zoom="in"]')!.addEventListener('click', () => renderer?.zoom(1.25));
    view.querySelector('[data-graph-zoom="out"]')!.addEventListener('click', () => renderer?.zoom(0.8));
    view.querySelector('[data-graph-reset]')!.addEventListener('click', () => renderer?.reset());
    views.set(prefix, { select, mode: () => mode, refresh: () => void refresh() }); select(payload.currentId ? 'backlinks' : 'global');
  });
  const refreshAll = () => views.forEach((view) => view.refresh());
  const visibilityObserver = new MutationObserver(refreshAll);
  if (panel) visibilityObserver.observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  if (fullscreen) visibilityObserver.observe(fullscreen, { attributes: true, attributeFilter: ['open'] });
  document.addEventListener('visibilitychange', refreshAll);
  document.querySelector('#graph-expand')?.addEventListener('click', () => views.get('fullscreen')?.select(views.get('panel')?.mode() || 'global'));
} catch {
  document.querySelectorAll<HTMLElement>('[data-graph-status]').forEach((status) => { status.textContent = '그래프 데이터 오류. 새로고침해 주세요.'; status.classList.add('graph-data-error'); });
}
