import { getIntents } from '../lib/airtable';
import { intentToSlug } from '../lib/utils';

function generateSitemap(intents, siteUrl) {
  const today = new Date().toISOString().split('T')[0];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${siteUrl}/intents</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
${intents
  .map(
    (intent) => `  <url>
    <loc>${siteUrl}/intent/${intentToSlug(intent)}</loc>
    <lastmod>${intent.last_updated || today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;
}

export async function getServerSideProps({ res }) {
  try {
    const intents = await getIntents();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://aicommerce.com.br';
    const sitemap = generateSitemap(intents, siteUrl);

    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.error('Sitemap error:', error);
    res.statusCode = 500;
    res.end();
  }

  return { props: {} };
}

export default function Sitemap() {
  return null;
}
