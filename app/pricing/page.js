import { getShellData, getPromo, getTools } from '@/lib/data';
import PricingClient from './PricingClient';

export default async function PricingPage() {
  const [shell, promo, tools] = await Promise.all([getShellData(), getPromo(), getTools()]);
  return <PricingClient shell={shell} promo={promo} calcTools={tools.filter(t => t.calc_rule)} />;
}
