import type { TopicId } from './topics';
import type { NavigationConfig } from '../lib/navigation';

// Array order is reading order. Unplaced public posts are added to their own topic.
// See docs/navigation.md before adding folders, lessons, or reference posts.
export const navigation = {
  'synthetic-data-study': [
    { type: 'post', postId: 'synthetic-data-study/00-introduction', label: '0강 · Introduction', children: [
      { type: 'post', postId: 'synthetic-data-study/01-foundations/papers/long-2024', label: 'Long et al. (2024)' },
      { type: 'post', postId: 'synthetic-data-study/00-introduction/papers/wang-2024', label: 'Wang et al. (2024)' },
      { type: 'post', postId: 'synthetic-data-study/01-foundations/papers/nadas-2025', label: 'Nadaș et al. (2025)' },
      { type: 'post', postId: 'synthetic-data-study/01-foundations/papers/zhang-2026', label: 'Zhang et al. (2026)' },
    ] },
    { type: 'post', postId: 'synthetic-data-study/01-foundations', label: '1강 · 역사와 학습 신호', children: [
      { type: 'post', postId: 'synthetic-data-study/01-foundations/papers/long-2024', label: "Long et al. (2024)" },
      { type: 'post', postId: 'synthetic-data-study/01-foundations/papers/nadas-2025', label: "Nadaș et al. (2025)" },
      { type: 'post', postId: 'synthetic-data-study/01-foundations/papers/wang-2023', label: "Wang et al. (2023)" },
      { type: 'post', postId: 'synthetic-data-study/01-foundations/papers/hinton-2015', label: "Hinton et al. (2015)" },
      { type: 'post', postId: 'synthetic-data-study/01-foundations/papers/chawla-2002', label: "Chawla et al. (2002)" },
      { type: 'post', postId: 'synthetic-data-study/01-foundations/papers/goodfellow-2014', label: "Goodfellow et al. (2014)" },
      { type: 'post', postId: 'synthetic-data-study/01-foundations/papers/sennrich-2016', label: "Sennrich et al. (2016)" },
      { type: 'post', postId: 'synthetic-data-study/01-foundations/papers/wei-2019', label: "Wei & Zou (2019)" },
      { type: 'post', postId: 'synthetic-data-study/01-foundations/papers/ge-2024', label: "Ge et al. (2024)" },
      { type: 'post', postId: 'synthetic-data-study/01-foundations/papers/deepseek-2025', label: "DeepSeek-AI (2025)" },
      { type: 'post', postId: 'synthetic-data-study/01-foundations/papers/lee-2026', label: "Lee et al. (2026)" },
      { type: 'post', postId: 'synthetic-data-study/01-foundations/papers/zhang-2026', label: "Zhang et al. (2026)" },
    ] },
    { type: 'post', postId: 'synthetic-data-study/02-text-instructions', label: '2강 · 텍스트·지시문 생성과 데이터셋 설계', children: [
      { type: 'folder', label: '생성 설계 서베이', children: [
        { type: 'post', postId: 'synthetic-data-study/01-foundations/papers/long-2024', label: 'Long et al. (2024)' },
        { type: 'post', postId: 'synthetic-data-study/00-introduction/papers/wang-2024', label: 'Wang et al. (2024)' },
        { type: 'post', postId: 'synthetic-data-study/01-foundations/papers/nadas-2025', label: 'Nadaș et al. (2025)' },
      ] },
      { type: 'folder', label: '지시문 생성 방법', children: [
        { type: 'post', postId: 'synthetic-data-study/01-foundations/papers/wang-2023', label: 'Wang et al. (2023)' },
        { type: 'post', postId: 'synthetic-data-study/02-text-instructions/papers/xu-2023', label: 'Xu et al. (2023)' },
        { type: 'post', postId: 'synthetic-data-study/01-foundations/papers/ge-2024', label: 'Ge et al. (2024)' },
        { type: 'post', postId: 'synthetic-data-study/02-text-instructions/papers/xu-2024', label: 'Xu et al. (2024)' },
      ] },
    ] },
  ],
  'slm-performance': [
    {
      type: 'folder',
      label: '기초 개념',
      children: [{ type: 'post', postId: 'knowledge-distillation-foundations' }],
    },
  ],
} satisfies NavigationConfig<TopicId>;
