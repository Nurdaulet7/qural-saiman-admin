import { createClient } from '@supabase/supabase-js';
import { SITE_URL } from '@/lib/site';

/* Карта сайта из базы: новый инструмент попадает в поиск без ручной правки.
   Сайт ссылается на неё из robots.txt — Google принимает карту с другого хоста,
   если на неё указывает robots.txt самого сайта. */

export const revalidate = 3600;

const PAGES = [
  ['', '1.0', 'weekly'],
  ['catalog.html', '0.9', 'weekly'],
  ['dgu.html', '0.9', 'weekly'],
  ['contacts.html', '0.9', 'monthly'],
  ['info.html', '0.6', 'monthly'],
  ['discounts.html', '0.6', 'monthly'],
  ['delivery.html', '0.6', 'monthly'],
  ['payment.html', '0.6', 'monthly'],
  ['terms.html', '0.6', 'monthly'],
  ['return.html', '0.5', 'monthly'],
  ['responsibility.html', '0.5', 'monthly'],
  ['faq.html', '0.6', 'monthly'],
  ['privacy.html', '0.3', 'yearly']
];

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const day = d => (d ? new Date(d).toISOString().slice(0, 10) : null);

const entry = (loc, { lastmod, priority, freq }) =>
  '  <url>\n    <loc>' + esc(loc) + '</loc>\n' +
  (lastmod ? '    <lastmod>' + lastmod + '</lastmod>\n' : '') +
  '    <changefreq>' + freq + '</changefreq>\n    <priority>' + priority + '</priority>\n  </url>\n';

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  /* Только опубликованные позиции из опубликованных категорий —
     иначе в карту попадут страницы с экраном «не найдено» */
  const [cats, tools] = await Promise.all([
    supabase.from('categories').select('id').eq('is_published', true),
    supabase.from('tools').select('slug,category_id,updated_at').eq('is_published', true).order('category_id').order('sort')
  ]);

  if (cats.error || tools.error) {
    return new Response('sitemap error: ' + (cats.error || tools.error).message, { status: 500 });
  }

  const live = new Set((cats.data ?? []).map(c => c.id));
  const items = (tools.data ?? []).filter(t => t.slug && live.has(t.category_id));
  const latest = items.map(t => t.updated_at).filter(Boolean).sort().pop();
  const fresh = day(latest);

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
  for (const [path, priority, freq] of PAGES) {
    const isCatalog = path === '' || path === 'catalog.html' || path === 'dgu.html';
    xml += entry(SITE_URL + '/' + path, { priority, freq, lastmod: isCatalog ? fresh : null });
  }
  for (const t of items) {
    xml += entry(SITE_URL + '/product.html?id=' + encodeURIComponent(t.slug), {
      priority: '0.8', freq: 'weekly', lastmod: day(t.updated_at)
    });
  }
  xml += '</urlset>\n';

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  });
}
