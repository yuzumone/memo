// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSiteGraph from 'starlight-site-graph'
import path from 'node:path';
import fg from 'fast-glob';
import remarkLinkResolver from './tools/remark-link-resolver.js';
import { stripNumericPrefix } from './src/utils.ts';

const contentDir = 'src/content/docs';
const allContentFiles = fg.sync(`${contentDir}/**/*.{md,mdx}`);
// Create a map of { 'filename.md': '/slug/for/that/file' }
const fileNameToSlugMap = new Map();
for (const file of allContentFiles) {
    const fileInfo = path.parse(file);
    // The slug is the path relative to the contentDir, without the .md/.mdx extension
    const withoutExt = '/' + path.relative(contentDir, file).replace(/\.(md|mdx)$/, '');
    const slug = withoutExt.split('/').map(stripNumericPrefix).join('/');
    // Add keys for the filename both with and without the extension
    fileNameToSlugMap.set(fileInfo.base, slug); // e.g., "my-file.md" -> "/slug/my-file"
    fileNameToSlugMap.set(fileInfo.name, slug); // e.g., "my-file" -> "/slug/my-file"
}

export default defineConfig({
    devToolbar: { enabled: false },
    site: 'https://memo.yuzumone.net',
    integrations: [starlight({
        title: 'memos',
        logo: {
            src: './src/assets/logo.webp',
        },
        plugins: [starlightSiteGraph()],
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
                autogenerate: { directory: 'articles' },
                collapsed: true,
            },
        ],
        expressiveCode: {
            frames: false,
        },
    })],
    markdown: {
        remarkPlugins: [
            [remarkLinkResolver, { fileMap: fileNameToSlugMap }]
        ],
    },
});
