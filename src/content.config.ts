import { defineCollection } from 'astro:content';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';
import { z } from 'zod';
import { stripNumericPrefix } from './utils';

export const collections = {
  docs: defineCollection({
    loader: docsLoader({
      generateId: ({ entry }) => {
        // Remove file extension first
        const withoutExt = entry.replace(/\.(mdx?|md)$/, '')
        // Strip numeric prefixes from each path segment
        return withoutExt.split('/').map(stripNumericPrefix).join('/')
      },
    }),
    schema: docsSchema({
      extend: z.object({
        date: z.date().optional(),
      }),
    }),
  }),
};
