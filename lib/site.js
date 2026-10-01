/* Адрес публичного сайта. Когда купите домен — поменять NEXT_PUBLIC_SITE_URL
   в Vercel, код трогать не нужно. Без слэша на конце. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://qural-saiman.pages.dev').replace(/\/+$/, '');
