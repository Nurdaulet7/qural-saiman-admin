import { createClient } from '@/lib/supabase/server';

export async function getShellData() {
  const supabase = await createClient();
  const [{ data: { user } }, tools, cats, dgu] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from('tools').select('id', { count: 'exact', head: true }),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
    supabase.from('generators').select('id', { count: 'exact', head: true })
  ]);
  return {
    email: user?.email ?? '',
    counts: { tools: tools.count ?? 0, cats: cats.count ?? 0, dgu: dgu.count ?? 0 }
  };
}

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from('categories').select('*').order('sort');
  return data ?? [];
}

export async function getFamilies() {
  const supabase = await createClient();
  const { data } = await supabase.from('families').select('*').order('sort');
  return data ?? [];
}

export async function getTools() {
  const supabase = await createClient();
  const { data } = await supabase.from('tools').select('*').order('category_id').order('sort');
  return data ?? [];
}

export async function getGenerators() {
  const supabase = await createClient();
  const { data } = await supabase.from('generators').select('*').order('kw', { ascending: false });
  return data ?? [];
}

export async function getPromo() {
  const supabase = await createClient();
  const { data } = await supabase.from('promos').select('*').eq('id', '5plus1').maybeSingle();
  return data;
}

export async function getSettings() {
  const supabase = await createClient();
  const { data } = await supabase.from('settings').select('*').eq('id', 1).maybeSingle();
  return data ?? {};
}
