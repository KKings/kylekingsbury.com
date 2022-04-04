import fs from 'fs';
import { HOST } from './constants'

const generateCategoryItem = (category) => `
  <url>
    <loc>${`${HOST}/category/${category}`}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`

const generateTagItem = (tag) => `
  <url>
    <loc>${`${HOST}/tags/${tag}`}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>`

const generatePostItem = (post) => `
  <url>
    <loc>${`${HOST}/posts/${post.slug}`}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>`

const generateSitemapChannel = (posts) => {
    const categories = posts
        .flatMap(post => post.categories)
        .filter(category => category !== undefined);

    const tags = posts
        .flatMap(post => post.tags)
        .filter(tag => tag !== undefined);

    return `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url>
            <loc>${HOST}</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>weekly</changefreq>
            <priority>1.0</priority>
        </url>
        <url>
            <loc>${HOST}/about</loc>
            <lastmod>${new Date().toISOString()}</lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.5</priority>
        </url>
        ${posts.map(generatePostItem).join('')}
        ${[...new Set(categories)].map(category => generateCategoryItem(category.toLowerCase())).join('')}
        ${[...new Set(tags)].map(tag => generateTagItem(tag.toLowerCase())).join('')}
    </urlset>`;
}

const generateSitemap = (posts) => {
  const sitemap = generateSitemapChannel(posts)

  fs.writeFileSync('public/sitemap.xml', sitemap)
}

export default generateSitemap