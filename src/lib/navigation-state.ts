import type { ResolvedNavigationNode } from './navigation.ts';

export const NAVIGATION_STORAGE_KEY = 'wooix-navigation:v1';
export type NavigationState = Record<string, boolean>;
export type StatefulNavigationNode = Omit<ResolvedNavigationNode, 'children'> & { stateKey: string; children: StatefulNavigationNode[] };
const identity = (node: ResolvedNavigationNode): string => `${node.type}:${encodeURIComponent(node.topicId || node.postId || node.label)}`;
const signature = (node: ResolvedNavigationNode): unknown[] => [identity(node), node.label, node.children.map(signature)];

/** Array positions remain DOM IDs only; saved state follows semantic ancestor identities. */
export function withNavigationStateKeys(nodes: readonly ResolvedNavigationNode[], parent = ''): StatefulNavigationNode[] {
  const counts = new Map<string, number>();
  nodes.forEach((node) => counts.set(identity(node), (counts.get(identity(node)) || 0) + 1));
  const occurrences = new Map<string, number>();
  return nodes.map((node) => {
    let segment = identity(node);
    // Distinct aliases/subtrees of the same sibling reference must not exchange saved states.
    if ((counts.get(segment) || 0) > 1) segment += `:${encodeURIComponent(JSON.stringify(signature(node)))}`;
    const occurrence = occurrences.get(segment) || 0; occurrences.set(segment, occurrence + 1);
    const stateKey = `${parent ? `${parent}/` : ''}${segment}${occurrence ? `:copy-${occurrence}` : ''}`;
    return { ...node, stateKey, children: withNavigationStateKeys(node.children, stateKey) };
  });
}

/** Sparse booleans only: missing is unknown, and an explicit false must survive restoration. */
export function parseNavigationState(raw: string | null): NavigationState {
  try {
    const parsed: unknown = JSON.parse(raw || 'null');
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(Object.entries(parsed).filter(([key, value]) => key.startsWith('topic:') && typeof value === 'boolean'));
  } catch { return {}; }
}

export function restoreNavigationState(state: NavigationState, activePathKeys: readonly string[]): NavigationState {
  const restored = { ...state };
  for (const key of activePathKeys) if (!Object.hasOwn(restored, key)) restored[key] = true;
  return restored;
}

/** Explicit topic navigation opens its path and leaves unrelated choices intact. */
export function openNavigationPath(state: NavigationState, pathKeys: readonly string[]): NavigationState {
  const updated = { ...state };
  for (const key of pathKeys) updated[key] = true;
  return updated;
}
