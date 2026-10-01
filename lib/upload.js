import { createClient } from '@/lib/supabase/client';

export async function uploadPhoto({ table, slug, file, prevPath }) {
  if (!file) throw new Error('Файл не выбран');
  if (!slug) throw new Error('Сначала задайте артикул — по нему называется файл');
  if (!file.type.startsWith('image/')) throw new Error('Нужен файл изображения (PNG или JPG)');
  if (file.size > 8 * 1024 * 1024) throw new Error('Файл больше 8 МБ — сожмите его');

  const folder = table === 'tools' ? 'tools' : 'generators';
  const ext = (file.name.split('.').pop() || 'png').toLowerCase().replace(/[^a-z0-9]/g, '');
  const key = folder + '/' + slug + '-' + Date.now().toString(36) + '.' + (ext || 'png');

  const supabase = createClient();
  const { error } = await supabase.storage.from('tools').upload(key, file, {
    cacheControl: '31536000',
    contentType: file.type
  });
  if (error) throw error;

  if (prevPath && prevPath !== key) {
    await supabase.storage.from('tools').remove([prevPath]).catch(() => {});
  }
  return key;
}

/* Иконка категории: только SVG — она красится маской в цвет темы,
   поэтому растр здесь не годится. */
export async function uploadIcon({ catId, file, prevUrl }) {
  if (!file) throw new Error('Файл не выбран');
  if (!catId) throw new Error('Сначала задайте ID категории — по нему называется файл');
  const isSvg = file.type === 'image/svg+xml' || /\.svg$/i.test(file.name);
  if (!isSvg) throw new Error('Нужен SVG — растровые иконки не перекрашиваются под тему');
  if (file.size > 512 * 1024) throw new Error('SVG больше 512 КБ — упростите контуры');

  const key = 'icons/' + catId + '-' + Date.now().toString(36) + '.svg';
  const supabase = createClient();
  const { error } = await supabase.storage.from('tools').upload(key, file, {
    cacheControl: '31536000',
    contentType: 'image/svg+xml'
  });
  if (error) throw error;

  const prev = iconKey(prevUrl);
  if (prev && prev !== key) {
    await supabase.storage.from('tools').remove([prev]).catch(() => {});
  }
  const { data } = supabase.storage.from('tools').getPublicUrl(key);
  return data.publicUrl;
}

/* Из публичного URL обратно в ключ бакета — чтобы удалить старый файл */
const iconKey = url => {
  const i = String(url || '').indexOf('/object/public/tools/');
  return i < 0 ? null : url.slice(i + '/object/public/tools/'.length);
};

export async function removeIcon(url) {
  const key = iconKey(url);
  if (!key) return;
  await createClient().storage.from('tools').remove([key]).catch(() => {});
}

export async function removePhoto(path) {
  if (!path) return;
  await createClient().storage.from('tools').remove([path]).catch(() => {});
}
