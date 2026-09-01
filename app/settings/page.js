import { getShellData, getSettings } from '@/lib/data';
import SettingsClient from './SettingsClient';

export default async function SettingsPage() {
  const [shell, settings] = await Promise.all([getShellData(), getSettings()]);
  return <SettingsClient shell={shell} settings={settings} />;
}
