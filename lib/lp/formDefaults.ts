import type { LpPageConfigInput, LpPageSeoInput } from '@/lib/validations';

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
      'Acesso completo com assinatura AVANT Pro',
    ],
    disclaimer: 'Conteúdo focado em Conhecimentos Específicos de Enfermagem via assinatura AVANT Pro.',
    disclaimerLegal:
      'O AVANT é uma plataforma de estudo independente. Não somos órgão público nem banca examinadora.',
  },
  walkthrough: {
    imagens: Array.from({ length: 8 }, () => ''),
  },
};

export function emptyLpSeo(internalName: string, path: string): LpPageSeoInput {
  const title = internalName.trim() || 'AVANT Pro — Concurso';
  return {
    title: `${title} | AVANT`,
    description: 'Estudo Reverso com questões reais e NeuroSlides. Assinatura AVANT Pro.',
    canonical: `/lp/${path.trim().toLowerCase() || 'sua-lp'}`,
  };
}
