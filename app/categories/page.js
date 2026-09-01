import { getShellData, getCategories, getFamilies, getTools } from '@/lib/data';
import CategoriesClient from './CategoriesClient';

export default async function CategoriesPage() {
  const [shell, cats, fams, tools] = await Promise.all([
    getShellData(), getCategories(), getFamilies(), getTools()
  ]);
  const counts = {};
  tools.forEach(t => { counts[t.category_id] = (counts[t.category_id] ?? 0) + 1 });
  return <CategoriesClient shell={shell} cats={cats} fams={fams} counts={counts} />;
}
