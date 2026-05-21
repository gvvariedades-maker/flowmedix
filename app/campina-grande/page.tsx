import type { Metadata } from 'next';
import { LPConcurso, type LPConcursoConfig } from '@/app/_components/LPConcurso';
import { getAbsoluteUrl } from '@/lib/siteUrl';

export const metadata: Metadata = {
  title: 'Técnico de Enfermagem Campina Grande | AVANT',
  description:
    'Questões reais da IDECAN para Técnico de Enfermagem em Campina Grande. Estudo Reverso com NeuroSlides no AVANT Pro.',
  alternates: { canonical: '/campina-grande' },
  openGraph: {
    title: 'Questões reais da IDECAN para Técnico de Enfermagem | AVANT',
    description:
      'Domine a parte que mais pesa na prova de Campina Grande: Conhecimentos Específicos de Técnico de Enfermagem com AVANT Pro.',
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
  oferta: { preco: '14,90' },
  copy: {
    headlinePrincipal:
      'Questões reais da IDECAN para Técnico de Enfermagem em Campina Grande',
    subtitulo:
      'Treine o padrão exato que a banca cobra. Assinatura AVANT Pro com Estudo Reverso e NeuroSlides após cada questão.',
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
      'Acesso completo à plataforma com assinatura AVANT Pro',
    ],
    disclaimer:
      'Conteúdo focado em Conhecimentos Específicos de Enfermagem no padrão IDECAN, com acesso completo via assinatura AVANT Pro.',
    disclaimerLegal:
      'O AVANT é uma plataforma de estudo independente. Não somos órgão público, banca examinadora nem afiliados ao IDECAN ou à Prefeitura de Campina Grande.',
  },
  walkthrough: {
    imagens: [
      '/images/campina-grande/walk-01.jpg',
      '/images/campina-grande/walk-02.jpg',
      '/images/campina-grande/walk-03.jpg',
      '/images/campina-grande/walk-04.jpg',
      '/images/campina-grande/walk-05.jpg',
      '/images/campina-grande/walk-06.jpg',
      '/images/campina-grande/walk-07.jpg',
      '/images/campina-grande/walk-08.jpg',
    ],
  },
};

export default function CampinaGrandePage() {
  return <LPConcurso config={config} />;
}
