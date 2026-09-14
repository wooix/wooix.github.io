import type { TopicId } from './topics';
import type { NavigationConfig } from '../lib/navigation';

// Array order is reading order. Unplaced public posts are added to their own topic.
// See docs/navigation.md before adding folders, lessons, or reference posts.
export const navigation = {
  'slm-performance': [
    {
      type: 'folder',
      label: '기초 개념',
      children: [{ type: 'post', postId: 'knowledge-distillation-foundations' }],
    },
  ],
} satisfies NavigationConfig<TopicId>;
