import { getPosts } from './posts';
import { buildLinkGraph } from './link-graph-source';

export async function getSiteGraph() {
  const posts = await getPosts();
  return buildLinkGraph(posts.map((post) => ({
    id: post.id, title: post.data.title, topic: post.data.topic,
    html: post.rendered?.html as string,
  })));
}
