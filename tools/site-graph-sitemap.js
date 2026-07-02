import fs from 'node:fs';
import path from 'node:path';
import fg from 'fast-glob';
import { stripNumericPrefix } from '../src/utils.ts';

const contentDir = 'src/content/docs';
const allContentFiles = fg.sync(`${contentDir}/**/*.{md,mdx}`);
const graphContentFiles = allContentFiles.filter((file) => !isDraft(fs.readFileSync(file, 'utf8')));

const HUGO_RELREF_LINK = /\[([^\]]+?)\]\(\s*\{\{\s*(?:<|%|&lt;)\s*relref\s+["'“”]([^"'“”]+?)["'“”]\s*(?:>|%|&gt;)\s*\}\}\s*\)/g;
const MARKDOWN_LINK = /\[([^\]]+?)\]\(([^)]+?)\)/g;

export const fileNameToSlugMap = new Map();
const slugToTitleMap = new Map();

function stripMarkdownExtension(filePath) {
  return filePath.replace(/\.(md|mdx)$/, '');
}

function contentSlug(file) {
  const withoutExt = '/' + stripMarkdownExtension(path.relative(contentDir, file));
  const slug = withoutExt.split('/').map(stripNumericPrefix).join('/');
  return slug.endsWith('/index') ? slug.slice(0, -'/index'.length) || '/' : slug;
}

function normalizeGraphSlug(slug) {
  const normalized = slug
    .split('#')[0]
    .replace(/\\/g, '/')
    .replace(/^\/+/, '')
    .split('/')
    .map(stripNumericPrefix)
    .join('/');

  if (!normalized || normalized === '.') return '/';
  return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

function readFrontmatterTitle(content, fallback) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  const titleLine = match?.[1]
    .split('\n')
    .find((line) => line.trimStart().startsWith('title:'));
  const rawTitle = titleLine?.replace(/^title:\s*/, '').trim();
  if (!rawTitle) return fallback;

  return rawTitle
    .replace(/^["']/, '')
    .replace(/["']$/, '');
}

function isDraft(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  const draftLine = match?.[1]
    .split('\n')
    .find((line) => line.trimStart().startsWith('draft:'));
  return draftLine?.replace(/^draft:\s*/, '').trim() === 'true';
}

for (const file of allContentFiles) {
  const fileInfo = path.parse(file);
  const slug = contentSlug(file);
  const content = fs.readFileSync(file, 'utf8');
  if (!isDraft(content)) {
    slugToTitleMap.set(normalizeGraphSlug(slug), readFrontmatterTitle(content, fileInfo.name));
  }

  fileNameToSlugMap.set(fileInfo.base, slug);
  fileNameToSlugMap.set(fileInfo.name, slug);
}

function resolveGraphLink(currentSlug, rawUrl) {
  let url = rawUrl.trim();
  if (!url || url.startsWith('#') || url.startsWith('mailto:') || url.startsWith('http')) {
    return undefined;
  }

  url = url.split('#')[0];
  if (!url) return undefined;

  if (url.startsWith('/')) {
    return normalizeGraphSlug(url);
  }

  const currentDir = path.posix.dirname(normalizeGraphSlug(currentSlug));
  const resolved = path.posix.normalize(path.posix.join(currentDir, stripMarkdownExtension(url)));
  return normalizeGraphSlug(resolved);
}

function buildSiteGraphSitemap() {
  const sitemap = {};

  for (const file of graphContentFiles) {
    const slug = normalizeGraphSlug(contentSlug(file));
    const content = fs.readFileSync(file, 'utf8');
    const links = new Set();
    const markdown = content.replace(HUGO_RELREF_LINK, (_match, text, fileName) => {
      const resolvedSlug = fileNameToSlugMap.get(fileName);
      return resolvedSlug ? `[${text}](${resolvedSlug})` : text;
    });

    for (const match of markdown.matchAll(MARKDOWN_LINK)) {
      const link = resolveGraphLink(slug, match[2]);
      if (link && link !== slug && slugToTitleMap.has(link)) {
        links.add(link);
      }
    }

    sitemap[slug] = {
      external: false,
      exists: true,
      title: slugToTitleMap.get(slug) ?? path.posix.basename(slug),
      ...(links.size ? { links: [...links] } : {}),
      backlinks: [],
    };
  }

  for (const [sourceSlug, entry] of Object.entries(sitemap)) {
    for (const link of entry.links ?? []) {
      sitemap[link]?.backlinks.push(sourceSlug);
    }
  }

  return sitemap;
}

export function memoSiteGraphSitemap() {
  return {
    name: 'memo-site-graph-sitemap',
    hooks: {
      'astro:build:done': async ({ logger }) => {
        const sitemapPath = path.join('dist', 'sitegraph', 'sitemap.json');
        await fs.promises.mkdir(path.dirname(sitemapPath), { recursive: true });
        await fs.promises.writeFile(sitemapPath, JSON.stringify(buildSiteGraphSitemap()));
        logger.info(`Wrote ${sitemapPath}`);
      },
    },
  };
}
