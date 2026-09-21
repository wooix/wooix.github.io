import { categoryGroups } from './categories';

export const graphTopics = categoryGroups.map(group => ({ id: group.id, label: group.label, color: group.color, darkColor: group.color }));
