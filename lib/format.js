export const fmt = n =>
  n == null ? '—' : Number(n).toLocaleString('ru-RU').replace(/,/g, ' ') + ' ₸';

export const num = n =>
  Number(n).toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export function plural(n, forms) {
  const i = n % 100 > 4 && n % 100 < 20 ? 2 : [2, 0, 1, 1, 1, 2][Math.min(n % 10, 5)];
  return forms[i];
}

const BUCKET = '/storage/v1/object/public/tools/';
export const photoUrl = path =>
  path ? process.env.NEXT_PUBLIC_SUPABASE_URL + BUCKET + path : null;

export const POWERS = ['Ручной','Электрический','Аккумуляторный','Бензиновый','Дизельный','Пневматический'];

export const ICON_SET = ['drill','hammer','wrench','construction','pickaxe','axe','scissors','ruler','hard-hat','zap','plug','plug-zap','battery-charging','fuel','flame','fan','wind','droplets','paint-roller','paintbrush','brush','layers','layers-2','grid-3x3','grid-2x2','boxes','package','box','cylinder','truck','forklift','tractor','anchor','bolt','cog','settings-2','circle-dot','disc-3','shovel','weight','gauge','thermometer','lightbulb','lamp','sparkles','waves','mountain','trees','sprout','warehouse','building-2','move-vertical','arrow-down-to-line','arrow-up-from-line'];
