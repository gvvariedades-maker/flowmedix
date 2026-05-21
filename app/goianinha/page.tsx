import type { Metadata } from 'next';
import { LPConcurso, type LPConcursoConfig } from '@/app/_components/LPConcurso';
import { getAbsoluteUrl } from '@/lib/siteUrl';

export const metadata: Metadata = {
  title: 'Técnico de Enfermagem Goianinha/RN | AVANT',
  description:
    'Questões reais da IDIB para Técnico de Enfermagem em Goianinha/RN. Estudo Reverso com NeuroSlides.',
  alternates: { canonical: '/goianinha' },
  openGraph: {
    title: 'Questões reais da IDIB para Técnico de Enfermagem | AVANT',
    description:
      'Questões reais da IDIB para Técnico de Enfermagem em Goianinha/RN. Estudo Reverso com NeuroSlides.',
    url: getAbsoluteUrl('/goianinha'),
    type: 'website',
    locale: 'pt_BR',
  },
};

const config: LPConcursoConfig = {
  concurso: {
    cidade: 'Goianinha',
    cargo: 'Técnico em Enfermagem',
    banca: 'IDIB',
    nomeBanca: 'IDIB',
    vagas: 'A divulgar',
    vagasPCD: 'A divulgar',
    dataProva: '2026-12-31',
    dataProvaFormatada: 'A divulgar',
    statusInscricoes: 'Em breve',
    remuneracao: 'A divulgar',
    taxaInscricao: 'A divulgar',
    orgao: 'Prefeitura de Goianinha/RN',
  },
  copy: {
    headlinePrincipal:
      'Questões reais da IDIB para Técnico de Enfermagem em Goianinha/RN',
    subtitulo:
      'Prepare-se com o padrão exato que a banca cobra. Estudo Reverso com NeuroSlides após cada questão.',
    dores: [
      'Você estuda material genérico sem saber o padrão específico da IDIB',
      'Erra questões por detalhe técnico que só aparece em questões reais da banca',
      'Não tem plano de estudo direcionado para o que esse concurso cobra',
    ],
    perigosBanca: [
      'A IDIB foca em procedimentos técnicos com detalhes de execução',
      'Questões de farmacologia e cálculo de dose aparecem com frequência',
      'Saúde pública e SUS são cobrados com foco na atenção básica municipal',
    ],
    listaBeneficios: [
      'Questões reais de concursos IDIB para Técnico em Enfermagem',
      'NeuroSlides após cada questão: Mapa Mental, Regra de Ouro, Fluxo Lógico e Zona de Perigo',
      'Diagnóstico imediato do erro',
      'Revisão espaçada automática',
      'Plano diário adaptado ao seu desempenho',
      'Acesso a todos os módulos do AVANT Pro',
    ],
    disclaimer:
      'Este conteúdo cobre Conhecimentos Específicos de Enfermagem para o padrão IDIB.',
    disclaimerLegal:
      'O AVANT é uma plataforma de estudo independente. Não somos órgão público, banca examinadora nem afiliados à IDIB ou à Prefeitura de Goianinha.',
  },
  walkthrough: {
    imagens: [
      '/images/neuroslide-concept-map.jpg',
      '/images/neuroslide-golden-rule.jpg',
      '/images/neuroslide-logic-flow.jpg',
      '/images/neuroslide-danger-zone.jpg',
    ],
  },
};

export default function GoianinhaPage() {
  return <LPConcurso config={config} />;
}
