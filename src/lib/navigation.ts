export type NavigationNode =
  | { type: 'folder'; label: string; children: readonly NavigationNode[] }
  | { type: 'post'; postId: string; label?: string; children?: readonly NavigationNode[] };

export type NavigationConfig<TopicId extends string = string> = Partial<Record<TopicId, readonly NavigationNode[]>>;

export interface NavigationPost {
  id: string;
  title: string;
  topic: string;
}

export interface ResolvedNavigationNode {
  key: string;
  type: 'topic' | 'folder' | 'post';
  label: string;
  href?: string;
  postId?: string;
  topicId?: string;
  postCount?: number;
  children: ResolvedNavigationNode[];
}

interface ResolveNavigationOptions {
  topics: readonly { id: string; label: string }[];
  configuration: NavigationConfig;
  allPosts: readonly NavigationPost[];
  publicPosts: readonly { id: string }[];
}

export class NavigationConfigurationError extends Error {
  constructor(path: string, message: string) {
    super(`Invalid navigation at ${path}: ${message}`);
    this.name = 'NavigationConfigurationError';
  }
}

/** Validate the entire configuration before resolving any public navigation. */
export function resolveNavigation({ topics, configuration, allPosts, publicPosts }: ResolveNavigationOptions): ResolvedNavigationNode[] {
  const fail = (path: string, message: string): never => { throw new NavigationConfigurationError(path, message); };
  const topicIds = new Set(topics.map((topic) => topic.id));
  if (topicIds.size !== topics.length) fail('topics', 'Duplicate topic IDs; use unique IDs from src/data/topics.ts.');

  const registry = new Map<string, NavigationPost>();
  for (const post of allPosts) {
    if (!post.id || registry.has(post.id)) fail('allPosts', `Missing or duplicate post ID "${post.id}".`);
    if (!topicIds.has(post.topic)) fail(`allPosts[${post.id}]`, `Unknown topic "${post.topic}"; check src/data/topics.ts.`);
    registry.set(post.id, post);
  }
  const publicIds = new Set<string>();
  for (const post of publicPosts) {
    if (!registry.has(post.id)) fail('publicPosts', `Unknown post ID "${post.id}"; include it in the complete allPosts registry.`);
    if (publicIds.has(post.id)) fail('publicPosts', `Duplicate post ID "${post.id}".`);
    publicIds.add(post.id);
  }
  if (!configuration || typeof configuration !== 'object' || Array.isArray(configuration)) {
    fail('src/data/navigation.ts', 'Expected a topic ID to navigation array mapping.');
  }

  const objectAncestors = new Set<object>();
  function validateNodes(nodes: readonly NavigationNode[], path: string, ancestorPosts: ReadonlySet<string>) {
    if (!Array.isArray(nodes)) fail(path, 'Expected a children array.');
    nodes.forEach((node, index) => {
      const location = `${path}[${index}]`;
      if (!node || typeof node !== 'object' || Array.isArray(node)) fail(location, 'Expected a folder or post object.');
      if (objectAncestors.has(node)) fail(location, 'Circular JavaScript object reference; remove the ancestor from children.');
      objectAncestors.add(node);
      try {
        if (node.type !== 'folder' && node.type !== 'post') fail(location, 'type must be "folder" or "post".');
        const allowed = node.type === 'folder' ? ['type', 'label', 'children'] : ['type', 'postId', 'label', 'children'];
        for (const key of Object.keys(node)) if (!allowed.includes(key)) fail(location, `Unknown property "${key}"; supported fields: ${allowed.join(', ')}.`);
        if (node.type === 'folder' || node.label !== undefined) {
          if (typeof node.label !== 'string' || !node.label.trim()) fail(location, 'label must be a non-empty string.');
        }
        let descendants = ancestorPosts;
        if (node.type === 'post') {
          if (typeof node.postId !== 'string' || !registry.has(node.postId)) {
            fail(location, `Unknown post ID "${node.postId}"; use an existing src/content/posts filename without .md.`);
          }
          if (ancestorPosts.has(node.postId)) fail(location, `Post cycle through "${node.postId}"; a post cannot refer to itself or an ancestor. Separate branches may reuse it.`);
          descendants = new Set([...ancestorPosts, node.postId]);
        }
        if (node.type === 'folder' || node.children !== undefined) {
          validateNodes(node.children!, `${location}.children`, descendants);
        }
      } finally {
        objectAncestors.delete(node);
      }
    });
  }

  for (const [topicId, nodes] of Object.entries(configuration)) {
    if (!topicIds.has(topicId)) fail(`src/data/navigation.ts.${topicId}`, `Unknown topic "${topicId}"; use an ID from src/data/topics.ts.`);
    validateNodes(nodes!, `src/data/navigation.ts.${topicId}`, new Set());
  }

  const visiblePlacementIds = new Map<string, Set<string>>();
  function resolveNodes(nodes: readonly NavigationNode[], key: string, topicPlacements: Set<string>): ResolvedNavigationNode[] {
    return nodes.flatMap<ResolvedNavigationNode>((node, index) => {
      const occurrenceKey = `${key}-${index}`;
      if (node.type === 'post' && !publicIds.has(node.postId)) return [];
      const children = resolveNodes(node.children || [], occurrenceKey, topicPlacements);
      if (node.type === 'folder') {
        return children.length ? [{ key: occurrenceKey, type: 'folder' as const, label: node.label, children }] : [];
      }
      const post = registry.get(node.postId)!;
      topicPlacements.add(post.id);
      return [{ key: occurrenceKey, type: 'post' as const, label: node.label || post.title, href: `/notes/${post.id}/`, postId: post.id, children }];
    });
  }

  // Cross-topic references never remove a post from its original topic.
  const roots: ResolvedNavigationNode[] = topics.map((topic, index) => {
    const placements = new Set<string>();
    visiblePlacementIds.set(topic.id, placements);
    return {
      key: `topic-${index}`, type: 'topic', topicId: topic.id, label: topic.label,
      href: `/topics/${topic.id}/`, children: resolveNodes(configuration[topic.id] || [], `topic-${index}-entry`, placements),
    };
  });
  for (const [topicIndex, root] of roots.entries()) {
    const leftovers = publicPosts.filter(({ id }) => registry.get(id)!.topic === root.topicId && !visiblePlacementIds.get(root.topicId!)!.has(id));
    root.children.push(...leftovers.map(({ id }, index) => ({
      key: `topic-${topicIndex}-auto-${index}`, type: 'post' as const, postId: id,
      label: registry.get(id)!.title, href: `/notes/${id}/`, children: [],
    })));
    const uniquePosts = new Set<string>();
    const count = (nodes: readonly ResolvedNavigationNode[]) => nodes.forEach((node) => { if (node.postId) uniquePosts.add(node.postId); count(node.children); });
    count(root.children);
    root.postCount = uniquePosts.size;
  }
  return roots;
}
