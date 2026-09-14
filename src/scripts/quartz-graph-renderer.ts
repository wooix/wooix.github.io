/**
 * Adapted from Quartz Community Graph, MIT ©2026 Quartz Community.
 * Upstream: 411971434ab698c495dfc42870eb02d3bc539b3a
 * src/components/scripts/graph.inline.ts (renderGraph / Pixi / drag / zoom).
 * Original and license: vendor/quartz-graph/. See docs/link-graph.md for changes.
 */
import * as d3 from 'd3';
import { Application, Container, Graphics, Text, Circle } from 'pixi.js';
import type { LinkGraph, LinkGraphNode } from '../lib/link-graph';
import { quartzVisualLinks, quartzNodeRadius, quartzNeighbours } from '../lib/quartz-graph-model';

interface Node extends d3.SimulationNodeDatum { id: string; text: string; post: LinkGraphNode; }
interface Link extends d3.SimulationLinkDatum<Node> { source: Node; target: Node; directions: { source: string; target: string }[]; }
export interface QuartzSettings { arrows: boolean; fade: boolean; nodeSize: number; linkWidth: number; repel: number; center: number; distance: number; }
export const quartzDefaults: QuartzSettings = { arrows: false, fade: true, nodeSize: 1.25, linkWidth: 0.8, repel: 0.75, center: 0.2, distance: 70 };
interface Options {
  currentId: string | null;
  topics: Map<string, { color: string; darkColor: string }>;
  describe: (node: LinkGraphNode | null) => void;
  onScale: (scale: number) => void;
}
export interface QuartzRenderer { setActive: (active: boolean) => void; zoom: (factor: number) => void; reset: () => void; settings: (settings: QuartzSettings) => void; focus: (id: string | null) => void; destroy: () => void; }

export async function createQuartzRenderer(host: HTMLElement, graph: LinkGraph, options: Options): Promise<QuartzRenderer> {
  let width = Math.max(120, host.clientWidth); let height = Math.max(180, host.clientHeight);
  let config = { ...quartzDefaults }; let active = false; let destroyed = false;
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const nodes: Node[] = graph.nodes.map((post, index) => {
    const angle = index * 2.3999632297;
    const radius = 20 * Math.sqrt(index);
    return { id: post.id, text: post.title, post, x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, vx: 0, vy: 0 };
  });
  const nodeMap = new Map(nodes.map((node) => [node.id, node]));
  const graphLinks: Link[] = quartzVisualLinks(graph).map((link) => ({ ...link, source: nodeMap.get(link.source)!, target: nodeMap.get(link.target)! }));

  // Quartz's Pixi application and separate layers (upstream lines 224–284).
  const app = new Application();
  await app.init({ width, height, antialias: true, backgroundAlpha: 0, resolution: Math.min(devicePixelRatio || 1, 2), autoDensity: true, autoStart: false, sharedTicker: false, preference: 'webgl' });
  app.stop();
  host.prepend(app.canvas);
  app.canvas.className = 'graph-canvas'; app.canvas.tabIndex = 0;
  app.canvas.setAttribute('role', 'img');
  app.canvas.setAttribute('aria-label', '글 연결 그래프. 방향키로 글 선택, Enter로 열기. 설정의 글 목록에서도 탐색할 수 있습니다.');
  const stage = new Container(); app.stage.addChild(stage);
  const linkContainer = new Container(); const nodesContainer = new Container(); const labelsContainer = new Container();
  stage.addChild(linkContainer, nodesContainer, labelsContainer);

  // Quartz's D3 forces, collision and node radius. The simulation is real and reheated after dragging.
  const simulation = d3.forceSimulation(nodes)
    .force('charge', d3.forceManyBody<Node>().strength(-100 * config.repel))
    .force('center', d3.forceCenter<Node>().strength(config.center))
    .force('link', d3.forceLink<Node, Link>(graphLinks).distance(config.distance))
    .force('collide', d3.forceCollide<Node>().radius((node) => nodeRadius(node) + 3).iterations(3))
    .force('radial', d3.forceRadial<Node>(nodes.length > 1 ? Math.min(width, height) * 0.3 : 0).strength(nodes.length > 1 ? 0.12 : 0))
    .stop();
  let hoveredNodeId: string | null = null;
  let hoveredNeighbours = new Set<string>();
  let dragging = false; let currentTransform = d3.zoomIdentity; let fitScale = 1;
  let dragOrigin = { x: 0, y: 0 }; let dragDistance = 0;
  let dragOffset = { x: 0, y: 0 }; let keyboardIndex = -1;
  let initialFit = true;
  let palette = readPalette();
  const nodeRenderData: { simulationData: Node; gfx: Graphics; label: Text; active: boolean }[] = [];
  const linkRenderData = graphLinks.map((simulationData) => {
    const gfx = new Graphics(); gfx.eventMode = 'none'; linkContainer.addChild(gfx);
    return { simulationData, gfx, active: false };
  });
  function nodeRadius(node: Node) { return quartzNodeRadius(graph, node.id, config.nodeSize); }
  function readPalette() {
    const styles = getComputedStyle(document.documentElement);
    return { text: styles.getPropertyValue('--text').trim(), line: styles.getPropertyValue('--muted').trim(), accent: styles.getPropertyValue('--accent').trim(), font: styles.getPropertyValue('--font').trim(), dark: document.documentElement.dataset.theme === 'dark' };
  }
  function nodeColor(node: Node) {
    const topic = options.topics.get(node.post.topic);
    return (palette.dark ? topic?.darkColor : topic?.color) || palette.line;
  }
  // Quartz updateHoverInfo/renderNodes/renderLinks: highlight exactly one hop, dim other nodes/lines.
  function updateHoverInfo(id: string | null) {
    hoveredNodeId = id; hoveredNeighbours = quartzNeighbours(graph, id);
    nodeRenderData.forEach((node) => { node.active = hoveredNeighbours.has(node.simulationData.id); });
    linkRenderData.forEach((link) => { link.active = link.simulationData.source.id === id || link.simulationData.target.id === id; });
    options.describe(id ? nodeMap.get(id)?.post || null : null);
    render();
  }
  for (const node of nodes) {
    const label = new Text({ text: node.text, style: { fontSize: 13, fill: palette.text, fontFamily: palette.font }, resolution: Math.min(devicePixelRatio || 1, 2) * 2 });
    label.anchor.set(0.5, 1.35); label.alpha = 0; label.eventMode = 'none'; labelsContainer.addChild(label);
    const gfx = new Graphics(); gfx.eventMode = 'static'; gfx.cursor = 'pointer'; gfx.label = node.id;
    gfx.on('pointerover', () => { if (!dragging) updateHoverInfo(node.id); });
    gfx.on('pointerleave', () => { if (!dragging) updateHoverInfo(null); });
    nodesContainer.addChild(gfx); nodeRenderData.push({ simulationData: node, gfx, label, active: false });
  }
  // Quartz animate() drawing, invoked by simulation ticks and interactions instead of an endless RAF.
  function render() {
    if (!active || destroyed) return;
    const labelOpacity = config.fade ? Math.min(1, Math.max((currentTransform.k / fitScale - 1) / 3.75, 0)) : 1;
    for (const data of nodeRenderData) {
      const node = data.simulationData; const radius = nodeRadius(node);
      data.gfx.clear().circle(0, 0, radius).fill(nodeColor(node));
      if (node.id === options.currentId) data.gfx.circle(0, 0, radius + 3).stroke({ width: 1.3, color: palette.accent });
      data.gfx.alpha = hoveredNodeId && !data.active ? 0.22 : 1;
      data.gfx.position.set((node.x || 0) + width / 2, (node.y || 0) + height / 2);
      data.gfx.hitArea = new Circle(0, 0, Math.max(radius + 5, 22 / currentTransform.k));
      data.label.position.copyFrom(data.gfx.position); data.label.style.fill = palette.text;
      data.label.scale.set(1 / currentTransform.k);
      data.label.alpha = hoveredNodeId === node.id ? 1 : hoveredNodeId && !data.active ? labelOpacity * 0.15 : labelOpacity;
    }
    for (const data of linkRenderData) {
      const { source, target, directions } = data.simulationData;
      const sx = (source.x || 0) + width / 2; const sy = (source.y || 0) + height / 2;
      const tx = (target.x || 0) + width / 2; const ty = (target.y || 0) + height / 2;
      const alpha = hoveredNodeId ? data.active ? 0.9 : 0.1 : 0.42;
      data.gfx.clear().moveTo(sx, sy).lineTo(tx, ty).stroke({ width: config.linkWidth / Math.sqrt(currentTransform.k), color: data.active ? palette.accent : palette.line, alpha });
      if (config.arrows) for (const direction of directions) {
        const toTarget = direction.target === target.id;
        const from = toTarget ? source : target; const to = toTarget ? target : source;
        const angle = Math.atan2((to.y || 0) - (from.y || 0), (to.x || 0) - (from.x || 0));
        const x = (to.x || 0) + width / 2 - Math.cos(angle) * (nodeRadius(to) + 3);
        const y = (to.y || 0) + height / 2 - Math.sin(angle) * (nodeRadius(to) + 3);
        data.gfx.moveTo(x - Math.cos(angle - 0.5) * 5, y - Math.sin(angle - 0.5) * 5).lineTo(x, y).lineTo(x - Math.cos(angle + 0.5) * 5, y - Math.sin(angle + 0.5) * 5).stroke({ width: config.linkWidth, color: palette.line, alpha });
      }
    }
    app.render();
  }
  simulation.on('tick', () => { if (initialFit && active) fit(); else render(); });
  function reheat(alpha = 0.5) {
    if (!active || destroyed) return;
    simulation.alpha(alpha);
    if (reducedMotion.matches) { simulation.stop(); simulation.tick(180); if (initialFit) { initialFit = false; fit(); } render(); }
    else simulation.restart();
  }
  function nearest(x: number, y: number) {
    const px = (x - currentTransform.x) / currentTransform.k - width / 2;
    const py = (y - currentTransform.y) / currentTransform.k - height / 2;
    return nodes.map((node) => ({ node, distance: Math.hypot(px - (node.x || 0), py - (node.y || 0)) }))
      .filter(({ node, distance }) => distance < Math.max(nodeRadius(node) + 5, 22 / currentTransform.k))
      .sort((a, b) => a.distance - b.distance)[0]?.node || null;
  }
  const selection = d3.select(app.canvas);
  // Port of Quartz dragSubject/dragStarted/dragDragged/dragEnded. Movement, not elapsed time, identifies a click.
  const drag = d3.drag<HTMLCanvasElement, unknown, Node>()
    .container(app.canvas)
    .filter((event: MouseEvent & { touches?: TouchList }) => !event.button && (!event.touches || event.touches.length === 1))
    .subject((event) => nearest(event.x, event.y) as Node)
    .on('start', (event) => {
      const node = event.subject; dragging = true; initialFit = false; dragOrigin = { x: event.x, y: event.y }; dragDistance = 0;
      node.fx = node.x; node.fy = node.y;
      dragOffset = { x: (event.x - currentTransform.x) / currentTransform.k - width / 2 - (node.x || 0), y: (event.y - currentTransform.y) / currentTransform.k - height / 2 - (node.y || 0) };
      if (!event.active && !reducedMotion.matches) simulation.alphaTarget(0.3);
      updateHoverInfo(node.id); reheat();
    })
    .on('drag', (event) => {
      dragDistance = Math.max(dragDistance, Math.hypot(event.x - dragOrigin.x, event.y - dragOrigin.y));
      event.subject.fx = (event.x - currentTransform.x) / currentTransform.k - width / 2 - dragOffset.x;
      event.subject.fy = (event.y - currentTransform.y) / currentTransform.k - height / 2 - dragOffset.y;
      if (reducedMotion.matches) { simulation.tick(1); render(); }
    })
    .on('end', (event) => {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null; event.subject.fy = null; dragging = false;
      if (active && dragDistance < 5) window.location.assign(event.subject.post.url);
      else { updateHoverInfo(null); reheat(0.3); }
    });
  selection.call(drag);
  // Quartz zoomed() stage transform + label opacity. D3 provides wheel, touch pinch and blank-space pan.
  const zoom = d3.zoom<HTMLCanvasElement, unknown>().extent((): [[number, number], [number, number]] => [[0, 0], [width, height]])
    .scaleExtent([0.25, 4]).on('zoom', (event) => {
      currentTransform = event.transform;
      if (event.sourceEvent) initialFit = false;
      stage.scale.set(currentTransform.k); stage.position.set(currentTransform.x, currentTransform.y);
      options.onScale(currentTransform.k / fitScale); render();
    });
  selection.call(zoom).on('dblclick.zoom', null);
  function fit() {
    if (!nodes.length) return;
    const xs = nodes.map((node) => (node.x || 0) + width / 2);
    const ys = nodes.map((node) => (node.y || 0) + height / 2);
    const minX = Math.min(...xs); const maxX = Math.max(...xs); const minY = Math.min(...ys); const maxY = Math.max(...ys);
    fitScale = nodes.length === 1 ? 1 : Math.min(1.6, (width - 70) / Math.max(1, maxX - minX), (height - 70) / Math.max(1, maxY - minY));
    zoom.scaleExtent([fitScale * 0.25, fitScale * 4]);
    selection.call(zoom.transform, d3.zoomIdentity.translate(width / 2 - (minX + maxX) / 2 * fitScale, height / 2 - (minY + maxY) / 2 * fitScale).scale(fitScale));
  }
  function reset() { initialFit = simulation.alpha() > simulation.alphaMin(); fit(); }
  simulation.on('end', () => { if (initialFit && active) { initialFit = false; fit(); } });
  const onKey = (event: KeyboardEvent) => {
    if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key) && nodes.length) {
      event.preventDefault();
      if (event.key === 'Home') keyboardIndex = 0;
      else if (event.key === 'End') keyboardIndex = nodes.length - 1;
      else keyboardIndex = (keyboardIndex + (event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1) + nodes.length) % nodes.length;
      updateHoverInfo(nodes[keyboardIndex].id);
      app.canvas.setAttribute('aria-label', `${nodes[keyboardIndex].text}. Enter로 글 열기.`);
    } else if (event.key === 'Enter' && keyboardIndex >= 0) window.location.assign(nodes[keyboardIndex].post.url);
    else if (event.key === '+' || event.key === '=') { event.preventDefault(); initialFit = false; selection.call(zoom.scaleBy, 1.25); }
    else if (event.key === '-') { event.preventDefault(); initialFit = false; selection.call(zoom.scaleBy, 0.8); }
  };
  app.canvas.addEventListener('keydown', onKey);
  app.canvas.addEventListener('blur', () => updateHoverInfo(null));
  const resize = new ResizeObserver(() => {
    if (!host.clientWidth || !host.clientHeight || destroyed) return;
    width = host.clientWidth; height = host.clientHeight; app.renderer.resize(width, height);
    simulation.force('radial', d3.forceRadial<Node>(nodes.length > 1 ? Math.min(width, height) * 0.3 : 0).strength(nodes.length > 1 ? 0.12 : 0));
    if (active) fit(); render();
  }); resize.observe(host);
  const theme = new MutationObserver(() => { palette = readPalette(); render(); });
  theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  const onMotion = () => { simulation.alphaTarget(0); reheat(0.3); }; reducedMotion.addEventListener('change', onMotion);
  reheat(1); render();
  return {
    setActive(value) { active = value; if (value) { if (simulation.alpha() > simulation.alphaMin()) reheat(simulation.alpha()); else render(); } else { dragging = false; nodes.forEach((node) => { node.fx = null; node.fy = null; }); simulation.alphaTarget(0).stop(); } },
    zoom(factor) { initialFit = false; selection.call(zoom.scaleBy, factor); }, reset,
    focus(id) { updateHoverInfo(id); },
    settings(settings) {
      config = { ...settings };
      simulation.force('charge', d3.forceManyBody<Node>().strength(-100 * config.repel));
      simulation.force('center', d3.forceCenter<Node>().strength(config.center));
      simulation.force('link', d3.forceLink<Node, Link>(graphLinks).distance(config.distance));
      simulation.force('collide', d3.forceCollide<Node>().radius((node) => nodeRadius(node) + 3).iterations(3));
      reheat(0.7); render();
    },
    destroy() { destroyed = true; simulation.stop(); resize.disconnect(); theme.disconnect(); reducedMotion.removeEventListener('change', onMotion); selection.on('.drag', null).on('.zoom', null); app.destroy(true, { children: true, texture: true, textureSource: true }); },
  };
}
