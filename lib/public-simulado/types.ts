import type { LessonData } from '@/types/lesson';

export type PublicSimuladoManifest = {
  id: string;
  titulo: string;
  subtitulo: string;
  descricao: string;
  cidade: string;
  uf: string;
  banca: string;
  dataProva: string;
  dataProvaFormatada: string;
  quantidade: number;
  ctaLpPath: string;
  utmCampaign: string;
  questoes: string[];
};

export type PublicSimuladoAnswerRecord = {
  slug: string;
  opcaoId: string;
  acertou: boolean;
  opcaoCorretaId: string;
  eixo: string;
  ordem: number;
};

export type PublicSimuladoQuestionBundle = {
  slug: string;
  dados: LessonData;
};

export type PublicSimuladoBundle = {
  manifest: PublicSimuladoManifest;
  questoes: PublicSimuladoQuestionBundle[];
};

export type PublicSimuladoPhase =
  | 'intro'
  | 'question'
  | 'result'
  | 'review'
  | 'estudo';
