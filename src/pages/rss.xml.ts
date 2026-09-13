import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getPosts, noteUrl } from '../lib/posts';

export async function GET(context: APIContext) {
  const posts = await getPosts();
  return rss({
    title: 'Wooix AI Notes',
    description: 'LLM, Alignment(정렬), Steering(조향), SLM(소형 언어 모델)을 읽고 연결하는 개인 연구 노트.',
    site: context.site!,
    items: posts.map((post) => ({ title: post.data.title, pubDate: post.data.publishedAt, description: post.data.description, link: noteUrl(post), categories: post.data.tags })),
    customData: '<language>ko-KR</language>',
  });
}
