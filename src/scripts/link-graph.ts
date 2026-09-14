import { getBacklinks, type LinkGraph, type LinkGraphNode } from '../lib/link-graph';
import { layoutGraph } from '../lib/link-graph-layout';

interface GraphPayload { graph: LinkGraph; currentId: string | null; topics: { id: string; label: string; color: string; darkColor: string }[]; }
const launcher = document.querySelector<HTMLButtonElement>('#graph-launcher');
const panel = document.querySelector<HTMLElement>('#graph-panel');
function closePanel(restoreFocus = true) {
  if (!panel || !launcher) return;
  panel.hidden = true; launcher.setAttribute('aria-expanded', 'false');
  if (restoreFocus) launcher.focus();
}
launcher?.addEventListener('click', () => {
  if (!panel) return;
  panel.hidden = !panel.hidden;
  launcher.setAttribute('aria-expanded', String(!panel.hidden));
  if (!panel.hidden) panel.querySelector<HTMLButtonElement>('[role="tab"][aria-selected="true"]')?.focus();
});
document.querySelector('#graph-panel-close')?.addEventListener('click', () => closePanel());
panel?.addEventListener('keydown', (event) => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closePanel(); } });

const svgNS = 'http://www.w3.org/2000/svg';
function svgElement<K extends keyof SVGElementTagNameMap>(name: K, attributes: Record<string, string> = {}): SVGElementTagNameMap[K] {
  const element = document.createElementNS(svgNS, name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  return element;
}

try {
  const raw = document.querySelector('#link-graph-data')?.textContent;
  if (!raw) throw new Error('Missing graph data');
  const payload = JSON.parse(raw) as GraphPayload;
  if (!Array.isArray(payload.graph?.nodes) || !Array.isArray(payload.graph?.edges) || !Array.isArray(payload.topics)) throw new Error('Invalid graph data');
  const topics = new Map(payload.topics.map((topic) => [topic.id, topic]));
  const views = new Map<string, { select: (mode: string) => void; mode: () => string }>();

  document.querySelectorAll<HTMLElement>('[data-graph-view]').forEach((view) => {
    const prefix = view.dataset.graphPrefix!;
    const canvas = view.querySelector<SVGSVGElement>('[data-graph-canvas]')!;
    const stage = view.querySelector<HTMLElement>('[data-graph-stage]')!;
    const status = view.querySelector<HTMLElement>('[data-graph-status]')!;
    const detail = view.querySelector<HTMLElement>('[data-graph-detail]')!;
    const empty = view.querySelector<HTMLElement>('[data-graph-empty]')!;
    const list = view.querySelector<HTMLUListElement>('[data-graph-node-list]')!;
    const listDetails = view.querySelector<HTMLDetailsElement>('[data-graph-list]')!;
    const tabs = [...view.querySelectorAll<HTMLButtonElement>('[data-graph-mode]')];
    let mode = 'global';
    let selectedGraph = payload.graph;
    let zoom = 1; let panX = 0; let panY = 0;
    let width = 480; let height = 290;
    let scene: SVGGElement | null = null;
    let scheduled = 0;
    let pointer: { id: number; x: number; y: number; panX: number; panY: number } | null = null;

    function describe(node: LinkGraphNode) {
      detail.textContent = `${node.title} · ${topics.get(node.topic)?.label || node.topic}${node.id === payload.currentId ? ' · 현재 글' : ''}`;
    }
    function transform() {
      scene?.setAttribute('transform', `translate(${panX} ${panY}) scale(${zoom})`);
      view.querySelector('[data-graph-scale]')!.textContent = `${Math.round(zoom * 100)}%`;
      view.querySelector<HTMLButtonElement>('[data-graph-zoom="in"]')!.disabled = zoom >= 2.5;
      view.querySelector<HTMLButtonElement>('[data-graph-zoom="out"]')!.disabled = zoom <= 0.6;
      canvas.querySelectorAll<SVGCircleElement>('.graph-node-hit').forEach((hit) => hit.setAttribute('r', String(22 / Math.min(1, zoom))));
      canvas.classList.toggle('show-node-captions', prefix === 'fullscreen' || selectedGraph.nodes.length <= 7 || zoom > 1.4);
    }
    function changeZoom(next: number) {
      const value = Math.max(0.6, Math.min(2.5, next));
      panX = width / 2 - (width / 2 - panX) * value / zoom;
      panY = height / 2 - (height / 2 - panY) * value / zoom;
      zoom = value; transform();
    }
    function draw() {
      scheduled = 0;
      if (!stage.clientWidth) return;
      width = stage.clientWidth; height = stage.clientHeight;
      canvas.setAttribute('viewBox', `0 0 ${width} ${height}`);
      canvas.replaceChildren();
      const defs = svgElement('defs');
      const marker = svgElement('marker', { id: `${prefix}-edge-arrow`, viewBox: '0 0 8 8', refX: '7', refY: '4', markerWidth: '6', markerHeight: '6', orient: 'auto', markerUnits: 'userSpaceOnUse' });
      marker.append(svgElement('path', { d: 'M0 0 8 4 0 8Z', class: 'graph-arrow' })); defs.append(marker); canvas.append(defs);
      scene = svgElement('g'); canvas.append(scene);
      const positions = new Map(layoutGraph(selectedGraph, width, height).map((position) => [position.id, position]));
      const edgeKeys = new Set(selectedGraph.edges.map((edge) => JSON.stringify([edge.source, edge.target])));
      for (const edge of selectedGraph.edges) {
        const a = positions.get(edge.source); const b = positions.get(edge.target);
        if (!a || !b) continue;
        const dx = b.x - a.x; const dy = b.y - a.y; const length = Math.max(1, Math.hypot(dx, dy));
        const bend = edgeKeys.has(JSON.stringify([edge.target, edge.source])) ? 17 : 0;
        const middleX = (a.x + b.x) / 2 - dy / length * bend;
        const middleY = (a.y + b.y) / 2 + dx / length * bend;
        const targetDistance = Math.max(1, Math.hypot(b.x - middleX, b.y - middleY));
        const endX = b.x - (b.x - middleX) / targetDistance * 12;
        const endY = b.y - (b.y - middleY) / targetDistance * 12;
        scene.append(svgElement('path', { d: `M${a.x},${a.y} Q${middleX},${middleY} ${endX},${endY}`, class: 'graph-edge', 'marker-end': `url(#${prefix}-edge-arrow)`, 'aria-hidden': 'true' }));
      }
      for (const node of selectedGraph.nodes) {
        const position = positions.get(node.id)!; const topic = topics.get(node.topic);
        const current = node.id === payload.currentId;
        const link = svgElement('a', { href: node.url, tabindex: '0', class: `graph-node${current ? ' is-current' : ''}`, 'aria-label': `${node.title} — ${topic?.label || node.topic}${current ? ' — 현재 글' : ''}`, 'data-graph-node': node.id, transform: `translate(${position.x} ${position.y})`, style: `--topic-color:${topic?.color || '#6A6A6A'};--topic-color-dark:${topic?.darkColor || '#B0B0B0'}` });
        const title = svgElement('title'); title.textContent = node.title; link.append(title);
        link.append(svgElement('circle', { r: '22', class: 'graph-node-hit' }));
        if (current) link.append(svgElement('circle', { r: '14', class: 'graph-current-ring' }));
        link.append(svgElement('circle', { r: current ? '9' : '7', class: 'graph-node-dot' }));
        const caption = svgElement('text', { y: '26', 'text-anchor': 'middle', class: 'graph-node-caption', 'aria-hidden': 'true' });
        caption.textContent = node.title.length > 18 ? `${node.title.slice(0, 17)}…` : node.title; link.append(caption);
        link.addEventListener('pointerenter', () => describe(node)); link.addEventListener('focus', () => describe(node));
        scene.append(link);
      }
      transform();
    }
    function scheduleDraw() { if (!scheduled) scheduled = requestAnimationFrame(draw); }
    function select(nextMode: string) {
      mode = nextMode === 'backlinks' ? 'backlinks' : 'global';
      selectedGraph = mode === 'backlinks' ? getBacklinks(payload.graph, payload.currentId) : payload.graph;
      tabs.forEach((tab) => { const active = tab.dataset.graphMode === mode; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
      view.querySelector('[role="tabpanel"]')!.setAttribute('aria-labelledby', `${prefix}-${mode}`);
      zoom = 1; panX = 0; panY = 0;
      const current = payload.graph.nodes.find((node) => node.id === payload.currentId);
      status.textContent = mode === 'global' ? `${selectedGraph.nodes.length}편의 글 · ${selectedGraph.edges.length}개 방향 있는 연결` : current ? `이 글을 링크한 글 ${selectedGraph.edges.length}편` : '현재 페이지는 개별 연구 노트가 아닙니다.';
      empty.hidden = mode !== 'backlinks' || selectedGraph.edges.length > 0;
      empty.textContent = current ? '이 글을 본문에서 링크한 다른 글이 아직 없습니다.' : '개별 글에서 Backlinks(역방향 링크)를 확인할 수 있습니다.';
      if (mode === 'global' && !selectedGraph.nodes.length) { empty.hidden = false; empty.textContent = '공개된 연구 노트가 아직 없습니다.'; }
      detail.textContent = current && mode === 'backlinks' ? `현재 글 · ${current.title}` : '노드에 마우스를 올리거나 키보드로 선택하면 전체 제목을 볼 수 있습니다.';
      list.replaceChildren();
      for (const node of selectedGraph.nodes) {
        const item = document.createElement('li'); const link = document.createElement('a'); const title = document.createElement('span'); const topicLabel = document.createElement('small');
        link.href = node.url; title.textContent = node.title; topicLabel.textContent = `${topics.get(node.topic)?.label || node.topic}${node.id === payload.currentId ? ' · 현재 글' : ''}`;
        if (node.id === payload.currentId) link.setAttribute('aria-current', 'page');
        link.append(title, topicLabel); link.addEventListener('focus', () => describe(node)); item.append(link); list.append(item);
      }
      view.querySelector('[data-graph-list-count]')!.textContent = `${selectedGraph.nodes.length}`;
      listDetails.open = mode === 'backlinks' || prefix === 'fullscreen';
      scheduleDraw();
    }
    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab.dataset.graphMode!));
      tab.addEventListener('keydown', (event) => {
        let target = index;
        if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') target = (index + 1) % tabs.length;
        else if (event.key === 'Home') target = 0;
        else if (event.key === 'End') target = tabs.length - 1;
        else return;
        event.preventDefault(); tabs[target].focus(); select(tabs[target].dataset.graphMode!);
      });
    });
    view.querySelector('[data-graph-zoom="in"]')!.addEventListener('click', () => changeZoom(zoom * 1.25));
    view.querySelector('[data-graph-zoom="out"]')!.addEventListener('click', () => changeZoom(zoom / 1.25));
    view.querySelector('[data-graph-reset]')!.addEventListener('click', () => { zoom = 1; panX = 0; panY = 0; transform(); });
    canvas.addEventListener('pointerdown', (event) => {
      if (event.button !== 0 || (event.target as Element).closest('[data-graph-node]')) return;
      pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, panX, panY };
      canvas.setPointerCapture(event.pointerId); canvas.classList.add('is-panning');
    });
    canvas.addEventListener('pointermove', (event) => { if (!pointer || event.pointerId !== pointer.id) return; panX = pointer.panX + event.clientX - pointer.x; panY = pointer.panY + event.clientY - pointer.y; transform(); });
    const stopPan = () => { pointer = null; canvas.classList.remove('is-panning'); };
    canvas.addEventListener('pointerup', stopPan); canvas.addEventListener('pointercancel', stopPan); canvas.addEventListener('lostpointercapture', stopPan);
    new ResizeObserver(scheduleDraw).observe(stage);
    views.set(prefix, { select, mode: () => mode }); select('global');
  });
  document.querySelector('#graph-expand')?.addEventListener('click', () => views.get('fullscreen')?.select(views.get('panel')?.mode() || 'global'));
} catch {
  document.querySelectorAll<HTMLElement>('[data-graph-status]').forEach((status) => { status.textContent = '그래프 데이터를 불러오지 못했습니다. 페이지를 새로고침해 주세요.'; status.classList.add('graph-data-error'); });
}
