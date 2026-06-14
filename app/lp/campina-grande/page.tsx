import type { Metadata } from 'next';
import { LPCampinaV2 } from '@/components/lp/campina/LPCampinaV2';
import { getAbsoluteUrl } from '@/lib/siteUrl';

export const metadata: Metadata = {
  title: 'Campina Grande 2026 — Técnico Enfermagem IDECAN | AVANT Pro',
  description:
    '50 vagas IDECAN em Campina Grande. Simulado grátis com 10 questões reais, estudo reverso e NeuroSlides. Assine o AVANT Pro e prepare-se para a prova.',
  alternates: { canonical: '/lp/campina-grande' },
  openGraph: {
    title: 'Campina Grande 2026 — Você sabe o que a IDECAN cobra?',
    description:
      'Diagnóstico grátis com 10 questões IDECAN + estudo reverso. AVANT Pro a partir de R$ 14,90/mês.',
    url: getAbsoluteUrl('/lp/campina-grande'),
    type: 'website',
    locale: 'pt_BR',
    images: [
      {
        url: '/og-avant-campina-grande.jpg',
        width: 1200,
        height: 630,
        alt: 'AVANT — Concurso Campina Grande 2026 Técnico de Enfermagem IDECAN',
      },
    ],
  },
};

/** LP Campina — rota estática substitui instância CMS em `lp_pages`. */
export default function CampinaGrandeLpPage() {
  return <LPCampinaV2 />;
}
