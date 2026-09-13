import { getCollection, type CollectionEntry } from 'astro:content';
import { isPublishedByKstDate } from './publication-date';

export type Post = CollectionEntry<'posts'>;
export async function getPosts() {
  return (await getCollection('posts', ({ data }) => !data.draft && isPublishedByKstDate(data.publishedAt)))
    .sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf() || a.id.localeCompare(b.id));
}
export const noteUrl = (post: Post) => `/notes/${post.id}/`;
export const formatDate = (date: Date) => new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' }).format(date).replace(/\. /g, '.').replace(/\.$/, '');
