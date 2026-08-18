import type { MetadataRoute } from 'next';
import { getAbsoluteUrl, getSiteUrl } from '@/lib/siteUrl';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/analytics',
          '/cadernos',
          '/desempenho',
          '/estudar',
          '/redefinir-senha',
          '/esqueci-senha',
        ],
      },
    ],
    host: getSiteUrl().toString(),
    sitemap: getAbsoluteUrl('/sitemap.xml'),
  };
}
