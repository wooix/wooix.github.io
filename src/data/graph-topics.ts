import { topics, type TopicId } from './topics';

const colors: Record<TopicId, [string, string]> = {
  'llm-trends': ['#C44D73', '#F58DAA'],
  'llm-tech': ['#5478B8', '#94B4EB'],
  finject: ['#9264AD', '#CDA3E6'],
  alignment: ['#B97632', '#EFB873'],
  steering: ['#38857A', '#7ACABD'],
  'slm-hardware': ['#728141', '#B8CA82'],
  'slm-performance': ['#997049', '#D8AE86'],
  'synthetic-data-study': ['#3B859F', '#83CBE3'],
};

export const graphTopics = topics.map((topic) => ({
  id: topic.id, label: topic.label, color: colors[topic.id][0], darkColor: colors[topic.id][1],
}));
