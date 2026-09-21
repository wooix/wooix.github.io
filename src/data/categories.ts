import reference from './category-reference.json' with { type: 'json' };
import type { ResolvedNavigationNode } from '../lib/navigation.ts';
export const categoryGroups = reference.groups;
export const categories = categoryGroups.flatMap(group => group.children.map(child => ({ ...child, groupId: group.id, groupLabel: group.label })));
export const categoryIds = categories.map(c => c.id) as [string, ...string[]];
export function getCategory(id: string) {
  const category = categories.find(c => c.id === id);
  if (!category) throw new Error(`Unknown category: ${id}. Read docs/category-reference.md.`);
  return category;
}
export function categoryNavigation(posts: readonly { id: string; data: { title: string; category: string; navLabel?: string } }[]): ResolvedNavigationNode[] {
  posts.forEach(p => getCategory(p.data.category));
  return categoryGroups.map(group => {
    const children = group.children.map(category => {
      const entries = posts.filter(p => p.data.category === category.id);
      return { key: `category-${category.id}`, type: 'topic' as const, topicId: `category-${category.id}`, label: category.label, href: `/categories/${category.id}/`, postCount: entries.length,
        children: entries.map(p => ({ key: `category-${category.id}-${p.id.replace(/\//g,'-')}`, type: 'post' as const, postId:p.id, label:p.data.navLabel || p.data.title, href:`/notes/${p.id}/`, children:[] })) };
    }).filter(c => c.postCount > 0);
    return { key:`group-${group.id}`, type:'topic' as const, topicId:`group-${group.id}`, label:group.label, href:`/categories/#${group.id}`, postCount:children.reduce((sum,c)=>sum+c.postCount,0), children };
  }).filter(g => g.postCount > 0);
}
