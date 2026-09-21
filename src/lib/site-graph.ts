import { getCategory } from '../data/categories';
import { getPosts } from './posts';
import { buildLinkGraph } from './link-graph-source';

export async function getSiteGraph() {
  const posts = await getPosts();
  return buildLinkGraph(posts.map((post) => ({
    id: post.id, title: post.data.title, topic: getCategory(post.data.category).groupId,
    html: post.rendered?.html as string,
  })));
}
