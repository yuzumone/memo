// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSiteGraph from 'starlight-site-graph'
import starlightImageZoome from 'starlight-image-zoom'
import starlightObsidian, { obsidianSidebarEntries } from 'starlight-obsidian'

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
            starlightObsidian({
                vault: './Vault/',
                copyFrontmatter: 'all',
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
                collapsed: true,
                items: [{ autogenerate: { directory: 'notes/articles' } }],
            },
        ],
        expressiveCode: {
            frames: false,
        },
    })],
});
