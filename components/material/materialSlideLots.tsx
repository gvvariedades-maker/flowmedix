'use client';

import type { ComponentType } from 'react';
import { Loader2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Cada lote (~centenas de linhas de conteudo) e carregado sob demanda — apenas
// o lote aberto baixa o chunk, em vez dos 7 no bundle inicial de /material.
function lotLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status" aria-label="Carregando material">
      <Loader2 className="h-8 w-8 animate-spin text-cyan-400" aria-hidden />
    </div>
  );
}

const MaterialSlidesLote1Content = dynamic(
  () => import('@/data/material-apoio-lotes/gerado/lote-01-content').then((m) => m.MaterialSlidesLote1Content),
  { loading: lotLoading },
);
const MaterialSlidesLote2Content = dynamic(
  () => import('@/data/material-apoio-lotes/gerado/lote-02-content').then((m) => m.MaterialSlidesLote2Content),
  { loading: lotLoading },
);
const MaterialSlidesLote3Content = dynamic(
  () => import('@/data/material-apoio-lotes/gerado/lote-03-content').then((m) => m.MaterialSlidesLote3Content),
  { loading: lotLoading },
);
const MaterialSlidesLote4Content = dynamic(
  () => import('@/data/material-apoio-lotes/gerado/lote-04-content').then((m) => m.MaterialSlidesLote4Content),
  { loading: lotLoading },
);
const MaterialSlidesLote5Content = dynamic(
  () => import('@/data/material-apoio-lotes/gerado/lote-05-content').then((m) => m.MaterialSlidesLote5Content),
  { loading: lotLoading },
);
const MaterialSlidesLote6Content = dynamic(
  () => import('@/data/material-apoio-lotes/gerado/lote-06-content').then((m) => m.MaterialSlidesLote6Content),
  { loading: lotLoading },
);
const MaterialSlidesLote7Content = dynamic(
  () => import('@/data/material-apoio-lotes/gerado/lote-07-content').then((m) => m.MaterialSlidesLote7Content),
  { loading: lotLoading },
);

export type MaterialSlideLotId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type MaterialSlideLot = {
  id: MaterialSlideLotId;
  title: string;
  shortTitle: string;
  description: string;
  count: number;
  Component: ComponentType;
};

export const MATERIAL_SLIDE_LOTS: readonly MaterialSlideLot[] = [
  {
    id: 1,
    title: 'Fundamentos e procedimentos',
    shortTitle: 'Fundamentos',
    description: 'Sinais vitais, sondagens, curativos, higiene e higienização das mãos.',
    count: 8,
    Component: MaterialSlidesLote1Content,
  },
  {
    id: 2,
    title: 'Administração de medicamentos',
    shortTitle: 'Medicações',
    description: 'Cálculo, infusão, penicilinas, insulina, vias e segurança medicamentosa.',
    count: 8,
    Component: MaterialSlidesLote2Content,
  },
  {
    id: 3,
    title: 'Saúde pública e SUS',
    shortTitle: 'SUS',
    description: 'Leis 8.080 e 8.142, Decreto 7.508 e calendário de imunização.',
    count: 8,
    Component: MaterialSlidesLote3Content,
  },
  {
    id: 4,
    title: 'Ética e legislação',
    shortTitle: 'Ética',
    description: 'Código de ética, Lei 7.498/86, COREN, documentação e sigilo.',
    count: 8,
    Component: MaterialSlidesLote4Content,
  },
  {
    id: 5,
    title: 'Doenças crônicas e transmissíveis',
    shortTitle: 'Doenças',
    description: 'HAS, diabetes, tuberculose, hanseníase, HIV e infecções respiratórias.',
    count: 8,
    Component: MaterialSlidesLote5Content,
  },
  {
    id: 6,
    title: 'Urgência e emergência',
    shortTitle: 'Urgência',
    description: 'PCR, RCP, DEA, IAM, AVE e Escala de Glasgow.',
    count: 8,
    Component: MaterialSlidesLote6Content,
  },
  {
    id: 7,
    title: 'Biossegurança e saúde da família',
    shortTitle: 'Biossegurança',
    description: 'IRAS, desinfecção, EPIs, resíduos, pré-natal, puericultura e adolescência.',
    count: 4,
    Component: MaterialSlidesLote7Content,
  },
] as const;

export const TOTAL_MATERIAL_SLIDES = MATERIAL_SLIDE_LOTS.reduce((sum, lot) => sum + lot.count, 0);

export function getMaterialSlideLot(id: MaterialSlideLotId): MaterialSlideLot {
  return MATERIAL_SLIDE_LOTS.find((lot) => lot.id === id) ?? MATERIAL_SLIDE_LOTS[0];
}
