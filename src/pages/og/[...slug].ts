import { getCollection } from 'astro:content'
import { OGImageRoute } from 'astro-og-canvas'

// Get all entries from the `docs` content collection.
const entries = await getCollection('docs')

// Map the entry array to an object with the page ID as key and the
// frontmatter data as value.
const pages = Object.fromEntries(entries.map(({ data, id }) => [id, { data }]))

export const { getStaticPaths, GET } = await OGImageRoute({
  // Pass down the documentation pages.
  pages,
  // Define the name of the parameter used in the endpoint path, here `slug`
  // as the file is named `[...slug].ts`.
  param: 'slug',
  // Define a function called for each page to customize the generated image.
  getImageOptions: (_id, page: (typeof pages)[number]) => {
    return {
      title: page.data.title,
      description: page.data.description,
      logo: {
        path: './src/assets/logo_small.webp',
      },
      font: {
        title: {
          families: ['IBM Plex Sans JP'],
          weight: 'SemiBold',
          lineHeight: 1.1,
          color: [250, 250, 250],
        },
      },
      fonts: [
        'https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-sans-jp@latest/japanese-400-normal.woff2',
        'https://cdn.jsdelivr.net/fontsource/fonts/ibm-plex-sans-jp@latest/japanese-600-normal.woff2',
      ],
      bgImage: {
        path: './src/assets/og.png',
        fit: 'cover',
      },
      padding: 100,
    }
  },
})
