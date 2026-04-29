const DEFAULT_PRODUCTION_URL = 'https://www.avant.enf.br';

export function getSiteUrl(): URL {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return new URL(process.env.NEXT_PUBLIC_BASE_URL);
  }

  if (process.env.NODE_ENV === 'development') {
    return new URL('http://localhost:3000');
  }

  return new URL(DEFAULT_PRODUCTION_URL);
}

export function getAbsoluteUrl(pathname = '/'): string {
  return new URL(pathname, getSiteUrl()).toString();
}
