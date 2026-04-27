'use client';

import type { ComponentType } from 'react';
import { MaterialSlidesLote1Content } from '@/data/material-apoio-lotes/gerado/lote-01-content';
import { MaterialSlidesLote2Content } from '@/data/material-apoio-lotes/gerado/lote-02-content';
import { MaterialSlidesLote3Content } from '@/data/material-apoio-lotes/gerado/lote-03-content';
import { MaterialSlidesLote4Content } from '@/data/material-apoio-lotes/gerado/lote-04-content';
import { MaterialSlidesLote5Content } from '@/data/material-apoio-lotes/gerado/lote-05-content';
import { MaterialSlidesLote6Content } from '@/data/material-apoio-lotes/gerado/lote-06-content';
import { MaterialSlidesLote7Content } from '@/data/material-apoio-lotes/gerado/lote-07-content';

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
