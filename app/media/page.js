import { getShellData, getTools, getGenerators } from '@/lib/data';
import MediaClient from './MediaClient';

export default async function MediaPage() {
  const [shell, tools, gens] = await Promise.all([getShellData(), getTools(), getGenerators()]);
  const items = [
    ...tools.map(t => ({ id: t.id, name: t.name, path: t.photo_path, slug: t.slug, table: 'tools' })),
    ...gens.map(g => ({ id: g.id, name: g.name, path: g.photo_path, slug: g.slug, table: 'generators' }))
  ];
  return <MediaClient shell={shell} items={items} />;
}
