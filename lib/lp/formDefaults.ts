import type { LpPageConfigInput, LpPageSeoInput } from '@/lib/validations';
import { BRAND_NAME, BRAND_PRO_NAME, brandPageTitle } from '@/lib/brand/brandName';

export const EMPTY_LP_CONFIG: LpPageConfigInput = {
  concurso: {
    cidade: '',
    cargo: 'Técnico em Enfermagem',
    banca: '',
    nomeBanca: '',
    vagas: 'A divulgar',
    dataProva: '2026-12-31',
    dataProvaFormatada: 'A divulgar',
    statusInscricoes: 'Inscrições abertas',
    remuneracao: 'A divulgar',
    taxaInscricao: 'A divulgar',
    orgao: '',
  },
  oferta: { preco: '14,90' },
  copy: {
    headlinePrincipal: '',
    subtitulo: '',
    dores: ['', '', ''],
    perigosBanca: ['', '', ''],
    listaBeneficios: [
      'Questões reais de concursos para Técnico em Enfermagem',
      'NeuroSlides após cada questão',
      'Acesso completo com assinatura AVANT Enf Pro',
    ],
    disclaimer: 'Conteúdo focado em Conhecimentos Específicos de Enfermagem via assinatura AVANT Enf Pro.',
    disclaimerLegal:
      `O ${BRAND_NAME} é uma plataforma de estudo independente. Não somos órgão público nem banca examinadora.`,
  },
  walkthrough: {
    imagens: Array.from({ length: 8 }, () => ''),
  },
};

export function emptyLpSeo(internalName: string, path: string): LpPageSeoInput {
  const title = internalName.trim() || `${BRAND_PRO_NAME} — Concurso`;
  return {
    title: brandPageTitle(title),
    description: `Estudo Reverso com questões reais e NeuroSlides. Assinatura ${BRAND_PRO_NAME}.`,
    canonical: `/lp/${path.trim().toLowerCase() || 'sua-lp'}`,
  };
}
