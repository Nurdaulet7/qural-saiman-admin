import { createClient } from '@supabase/supabase-js';

/* Публичный каталог для сайта. Читает опубликованные позиции,
   отдаёт JSON в формате, который ждёт tools-data.js.
   Кэш на 60 секунд — правка в админке появляется на сайте почти сразу. */

export const revalidate = 60;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=600'
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabase = createClient(url, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const base = url + '/storage/v1/object/public/tools/';

  const [fams, cats, tools, gens, promo, settings] = await Promise.all([
    supabase.from('families').select('id,name,name_kz').order('sort'),
    supabase.from('categories').select('*').eq('is_published', true).order('sort'),
    supabase.from('tools').select('*').eq('is_published', true).order('category_id').order('sort'),
    supabase.from('generators').select('*').eq('is_published', true).order('kw', { ascending: false }),
    supabase.from('promos').select('*').eq('id', '5plus1').maybeSingle(),
    supabase.from('settings').select('*').eq('id', 1).maybeSingle()
  ]);

  const failed = [fams, cats, tools, gens].find(r => r.error);
  if (failed) {
    return Response.json({ error: failed.error.message }, { status: 500, headers: CORS });
  }

  const photo = p => (p ? base + p : '');
  const kw = n => {
    const v = Number(n);
    return (Number.isInteger(v) ? v : v.toFixed(1).replace('.', ',')) + ' кВт';
  };

  return Response.json({
    version: new Date().toISOString(),
    families: (fams.data ?? []).map(f => ({ id: f.id, name: f.name, nameKz: f.name_kz || '' })),
    categories: (cats.data ?? []).map(c => ({
      id: c.id, name: c.name, short: c.short, family: c.family_id, icon: c.icon,
      nameKz: c.name_kz || ''
    })),
    tools: (tools.data ?? []).map(t => ({
      id: t.slug, name: t.name, cat: t.category_id, brand: t.brand || '',
      power: t.power || '', price: t.price, spec: t.spec || '',
      photo: photo(t.photo_path), priceNote: t.price_note || '',
      badge: t.badge || '', top: !!t.is_top,
      deposit: t.deposit ?? null, promo: t.promo_5plus1 !== false,
      calc: t.calc_rule || null, nameKz: t.name_kz || '', specKz: t.spec_kz || ''
    })),
    dgu: (gens.data ?? []).map(g => ({
      id: g.slug, name: g.name, power: kw(g.kw), brand: g.brand || '',
      price: g.price ?? null, note: g.spec || '', photo: photo(g.photo_path),
      nameKz: g.name_kz || ''
    })),
    promo: promo?.data
      ? { paidDays: promo.data.paid_days, freeDays: promo.data.free_days,
          title: promo.data.title, active: promo.data.is_active }
      : null,
    settings: settings?.data
      ? {
          phone: settings.data.phone, whatsapp: settings.data.whatsapp,
          address: settings.data.address,
          hoursWeek: settings.data.hours_week, hoursWeekend: settings.data.hours_weekend,
          delivery: settings.data.delivery_note,
          tiktok: settings.data.tiktok, instagram: settings.data.instagram, gis: settings.data.gis
        }
      : null
  }, { headers: CORS });
}
