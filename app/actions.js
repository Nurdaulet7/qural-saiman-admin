'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

async function db() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Нужно войти заново');
  return supabase;
}

const int = v => (v === '' || v == null ? null : parseInt(String(v).replace(/\s/g, ''), 10));
const str = v => (v === '' || v == null ? null : String(v).trim());

/* ---------- инструменты ---------- */

export async function saveTool(id, form) {
  const supabase = await db();
  const row = {
    slug: str(form.slug),
    category_id: str(form.category_id),
    name: str(form.name),
    name_kz: str(form.name_kz),
    spec: str(form.spec),
    spec_kz: str(form.spec_kz),
    brand: str(form.brand),
    power: str(form.power),
    price: int(form.price) ?? 0,
    deposit: int(form.deposit),
    price_note: str(form.price_note),
    promo_5plus1: !!form.promo_5plus1,
    is_top: !!form.is_top,
    is_published: !!form.is_published,
    photo_path: str(form.photo_path)
  };
  if (!row.name || !row.slug || !row.category_id) throw new Error('Заполните название, артикул и категорию');

  const q = id
    ? supabase.from('tools').update(row).eq('id', id)
    : supabase.from('tools').insert(row);
  const { error } = await q;
  if (error) throw new Error(error.code === '23505' ? 'Такой артикул уже существует' : error.message);
  revalidatePath('/tools');
}

export async function toggleTool(id, published) {
  const supabase = await db();
  const { error } = await supabase.from('tools').update({ is_published: published }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/tools');
}

export async function duplicateTool(id) {
  const supabase = await db();
  const { data, error } = await supabase.from('tools').select('*').eq('id', id).single();
  if (error) throw new Error(error.message);
  const { id: _drop, created_at, updated_at, ...rest } = data;
  const { error: e2 } = await supabase.from('tools').insert({
    ...rest,
    slug: rest.slug + '-copy',
    name: rest.name + ' (копия)',
    is_published: false,
    is_top: false
  });
  if (e2) throw new Error(e2.code === '23505' ? 'Копия уже создана' : e2.message);
  revalidatePath('/tools');
}

export async function deleteTool(id) {
  const supabase = await db();
  const { error } = await supabase.from('tools').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/tools');
}

export async function reorderTools(ids) {
  const supabase = await db();
  await Promise.all(ids.map((id, i) => supabase.from('tools').update({ sort: i }).eq('id', id)));
  revalidatePath('/tools');
}

export async function saveCalcRule(id, rule, price) {
  const supabase = await db();
  const { error } = await supabase.from('tools').update({ calc_rule: rule, price: int(price) ?? 0 }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/pricing');
  revalidatePath('/tools');
}

/* ---------- категории ---------- */

export async function saveCategory(id, form) {
  const supabase = await db();
  const row = {
    id: str(form.id),
    family_id: str(form.family_id),
    name: str(form.name),
    name_kz: str(form.name_kz),
    short: str(form.short) || str(form.name),
    icon: str(form.icon) || 'box',
    icon_url: str(form.icon_url) || null
  };
  if (!row.id || !row.name || !row.family_id) throw new Error('Заполните ID, название и семейство');

  const q = id ? supabase.from('categories').update(row).eq('id', id) : supabase.from('categories').insert(row);
  const { error } = await q;
  if (error) throw new Error(error.code === '23505' ? 'Категория с таким ID уже есть' : error.message);
  revalidatePath('/categories');
}

export async function deleteCategory(id) {
  const supabase = await db();
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw new Error(error.code === '23503'
    ? 'Сначала перенесите инструменты из этой категории'
    : error.message);
  revalidatePath('/categories');
}

export async function reorderCategories(ids) {
  const supabase = await db();
  await Promise.all(ids.map((id, i) => supabase.from('categories').update({ sort: i }).eq('id', id)));
  revalidatePath('/categories');
}

export async function saveFamily(id, form) {
  const supabase = await db();
  const row = { id: str(form.id), name: str(form.name), name_kz: str(form.name_kz) };
  if (!row.id || !row.name) throw new Error('Заполните ID и название');
  const q = id ? supabase.from('families').update(row).eq('id', id) : supabase.from('families').insert(row);
  const { error } = await q;
  if (error) throw new Error(error.message);
  revalidatePath('/categories');
}

/* ---------- ДГУ ---------- */

export async function saveGenerator(id, form) {
  const supabase = await db();
  const row = {
    slug: str(form.slug),
    name: str(form.name),
    name_kz: str(form.name_kz),
    kw: parseFloat(String(form.kw).replace(',', '.')) || 0,
    spec: str(form.spec),
    brand: str(form.brand),
    price: int(form.price),
    is_published: !!form.is_published,
    photo_path: str(form.photo_path)
  };
  if (!row.name || !row.slug) throw new Error('Заполните название и артикул');
  const q = id ? supabase.from('generators').update(row).eq('id', id) : supabase.from('generators').insert(row);
  const { error } = await q;
  if (error) throw new Error(error.code === '23505' ? 'Такой артикул уже существует' : error.message);
  revalidatePath('/dgu');
}

export async function toggleGenerator(id, published) {
  const supabase = await db();
  const { error } = await supabase.from('generators').update({ is_published: published }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dgu');
}

export async function deleteGenerator(id) {
  const supabase = await db();
  const { error } = await supabase.from('generators').delete().eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/dgu');
}

/* ---------- акция и настройки ---------- */

export async function savePromo(form) {
  const supabase = await db();
  const { error } = await supabase.from('promos').update({
    title: str(form.title),
    paid_days: int(form.paid_days) ?? 5,
    free_days: int(form.free_days) ?? 1,
    is_active: !!form.is_active
  }).eq('id', '5plus1');
  if (error) throw new Error(error.message);
  revalidatePath('/pricing');
}

export async function saveSettings(form) {
  const supabase = await db();
  const keys = ['phone','whatsapp','address','hours_week','hours_weekend','delivery_note','tiktok','instagram','gis','domain','seo_title','seo_description'];
  const row = {};
  keys.forEach(k => { row[k] = str(form[k]) });
  const { error } = await supabase.from('settings').update(row).eq('id', 1);
  if (error) throw new Error(error.message);
  revalidatePath('/settings');
}

/* ---------- фото ---------- */

export async function setPhotoPath(table, id, path) {
  const supabase = await db();
  const { error } = await supabase.from(table).update({ photo_path: path }).eq('id', id);
  if (error) throw new Error(error.message);
  revalidatePath('/media');
  revalidatePath(table === 'tools' ? '/tools' : '/dgu');
}
