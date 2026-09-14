import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';
import { topicIds } from './data/topics';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    topic: z.enum(topicIds),
    tags: z.array(z.string()),
    kind: z.enum(['milestone', 'research-note', 'research-review']),
    readingTime: z.number().positive(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    sourceLinks: z.array(z.object({ title: z.string(), url: z.url(), kind: z.string().optional() })),
    takeaway: z.string(),
    // Presentation metadata for a paper beneath its lesson; sidebar order remains in navigation.ts.
    parentPost: z.string().optional(),
    navLabel: z.string().optional(),
  }),
});

export const collections = { posts };
