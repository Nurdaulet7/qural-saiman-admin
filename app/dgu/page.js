import { getShellData, getGenerators } from '@/lib/data';
import DguClient from './DguClient';

export default async function DguPage() {
  const [shell, list] = await Promise.all([getShellData(), getGenerators()]);
  return <DguClient shell={shell} list={list} />;
}
