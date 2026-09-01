import { getShellData, getTools, getCategories } from '@/lib/data';
import ToolsClient from './ToolsClient';

export default async function ToolsPage() {
  const [shell, tools, cats] = await Promise.all([getShellData(), getTools(), getCategories()]);
  return <ToolsClient shell={shell} tools={tools} cats={cats} />;
}
