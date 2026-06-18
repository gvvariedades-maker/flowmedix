import { notFound } from 'next/navigation';
import type { QuestaoCompleta } from '@/types/lesson';
import curativosQuestao from '@/examples/questao-premium-cpcon-curativos-lpp-prevencao-vf.json';
import { HeroMockupCapturePanels } from './HeroMockupCapturePanels';

/** Painéis fixos para captura Playwright → public/mockups/ (somente desenvolvimento). */
export default function HeroMockupCapturePage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <HeroMockupCapturePanels questao={curativosQuestao as QuestaoCompleta} />;
}
