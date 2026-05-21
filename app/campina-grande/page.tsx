import type { Metadata } from 'next';
import { LPConcurso, type LPConcursoConfig } from '@/app/_components/LPConcurso';
import { getAbsoluteUrl } from '@/lib/siteUrl';

export const metadata: Metadata = {
  title: 'Técnico de Enfermagem Campina Grande | AVANT',
  description:
    'Questões reais da IDECAN para Técnico de Enfermagem em Campina Grande. Treine os Conhecimentos Específicos por R$ 37.',
  alternates: { canonical: '/campina-grande' },
  openGraph: {
    title: 'Questões reais da IDECAN para Técnico de Enfermagem | AVANT',
    description:
      'Domine a parte que mais pesa na prova de Campina Grande: Conhecimentos Específicos de Técnico de Enfermagem.',
    url: getAbsoluteUrl('/campina-grande'),
    type: 'website',
    locale: 'pt_BR',
  },
};

const config: LPConcursoConfig = {
  concurso: {
    cidade: 'Campina Grande',
    cargo: 'Técnico em Enfermagem',
    banca: 'IDECAN',
    nomeBanca: 'IDECAN',
    vagas: '50',
    vagasPCD: '5',
    dataProva: '2026-08-30',
    dataProvaFormatada: '30/08/2026',
    statusInscricoes: 'Inscrições até 15/06',
    remuneracao: 'A divulgar',
    taxaInscricao: 'R$ 110,00',
    orgao: 'Prefeitura de Campina Grande',
  },
  copy: {
    headlinePrincipal:
      'Questões reais da IDECAN para Técnico de Enfermagem em Campina Grande',
    subtitulo:
      'Treine o padrão exato que a banca cobra. Estudo Reverso com NeuroSlides após cada questão.',
    dores: [
      'Você estuda teoria de enfermeiro mas a banca cobra raciocínio de técnico',
      'Erra questões por detalhe e não sabe como evitar o mesmo erro',
      'Não tem clareza do que ainda está derrubando sua nota',
    ],
    perigosBanca: [
      'A IDECAN cobra sequência de procedimentos — não só o conceito isolado',
      'Questões com duas alternativas quase certas — detalhes técnicos decidem',
      'Biossegurança e EPIs aparecem em todo concurso IDECAN para enfermagem',
    ],
    listaBeneficios: [
      'Questões reais de concursos IDECAN para Técnico em Enfermagem',
      'NeuroSlides após cada questão: Mapa Mental, Regra de Ouro, Fluxo Lógico e Zona de Perigo',
      'Diagnóstico imediato: erro de conceito, detalhe ou pegadinha de banca',
      'Revisão espaçada automática — sem planilha',
      'Plano diário adaptado ao seu desempenho',
      'Acesso a todos os módulos do AVANT Pro',
    ],
    disclaimer:
      'Este pacote cobre Conhecimentos Específicos de Enfermagem. Para Português, Raciocínio Lógico e História de Campina Grande, recomendamos complementar com outras fontes.',
    disclaimerLegal:
      'O AVANT é uma plataforma de estudo independente. Não somos órgão público, banca examinadora nem afiliados ao IDECAN ou à Prefeitura de Campina Grande.',
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

export default function CampinaGrandePage() {
  return <LPConcurso config={config} />;
}
