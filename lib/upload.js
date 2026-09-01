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

export async function removePhoto(path) {
  if (!path) return;
  await createClient().storage.from('tools').remove([path]).catch(() => {});
}
