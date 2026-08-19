// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSiteGraph from 'starlight-site-graph'
import starlightImageZoome from 'starlight-image-zoom'
import remarkLinkResolver from './tools/remark-link-resolver.js';
import { fileNameToSlugMap, memoSiteGraphSitemap } from './tools/site-graph-sitemap.js';

export default defineConfig({
    devToolbar: { enabled: false },
    site: 'https://memo.yuzumone.net',
    integrations: [starlight({
        title: '🌱',
        plugins: [
            starlightSiteGraph(),
            starlightImageZoome({
                showCaptions: false,
            }),
        ],
        pagination: false,
        customCss: [
            '@fontsource/ibm-plex-sans-jp',
            '@fontsource/ibm-plex-mono',
            './src/styles/custom.css',
        ],
        components: {
            PageTitle: './src/components/PageTitle.astro',
        },
        routeMiddleware: './src/routeData.ts',
        favicon: 'favicon.ico',
        head: [
            {
                tag: 'script',
                attrs: {
                    async: true,
                    crossorigin: 'anonymous',
                    src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3505762518532398',
                },
            },
            {
                tag: 'meta',
                attrs: {
                    name: 'Hatena::Bookmark',
                    content: 'nocomment',
                },
            },
            {
                tag: 'meta',
                attrs: {
                    name: 'robots',
                    content: "noindex, nofollow",
                },
            },
        ],
        sidebar: [
            { label: 'Home', link: '/' },
            {
                label: 'Articles',
                autogenerate: { directory: 'articles' },
                collapsed: true,
            },
            {
                label: 'Disney',
                collapsed: true,
                items: [
                    {
                        label: 'Parks',
                        autogenerate: { directory: 'disney/parks' },
                        collapsed: true,
                    },
                    {
                        label: 'Areas',
                        autogenerate: { directory: 'disney/areas' },
                        collapsed: true,
                    },
                    {
                        label: 'Attractions',
                        autogenerate: { directory: 'disney/attractions' },
                        collapsed: true,
                    },
                    {
                        label: 'Events',
                        autogenerate: { directory: 'disney/events' },
                        collapsed: true,
                    },

                    { label: 'Pins', link: '/disney/tokyo_disney_resort_pins' },
                ],
            },
        ],
        expressiveCode: {
            frames: false,
        },
    }), memoSiteGraphSitemap()],
    markdown: {
        remarkPlugins: [
            [remarkLinkResolver, { fileMap: fileNameToSlugMap }]
        ],
    },
});
