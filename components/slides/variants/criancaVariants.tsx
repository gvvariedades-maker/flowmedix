'use client';

/**
 * Thin wrappers — moldes L3 Saúde da Criança (cyan / pediatria).
 * Lógica compartilhada em CriancaShared* + criancaSlideUtils.
 */
import type { ThemeColors } from '../core/themeGenerator';
import type { GoldenRuleRow } from './GoldenRule';
import type { DangerZoneItem } from './DangerZone';
import type { LogicFlowRevealMode } from './logicFlowReveal';
import {
  CriancaDeckConceptMap,
  CriancaHubConceptMap,
  CriancaRailConceptMap,
  CriancaSpectrumConceptMap,
  CriancaTimelineConceptMap,
  type CriancaConcept,
} from './CriancaSharedConceptMaps';
import { CriancaBoardGoldenRule } from './CriancaSharedGoldenBoard';
import { CriancaTapFlow } from './CriancaSharedTapFlow';
import { CriancaTrapArena } from './CriancaSharedTrapArena';

type ConceptProps = { concepts: CriancaConcept[]; theme: ThemeColors; footerRule?: string };
type BoardProps = { content?: string; rows: GoldenRuleRow[]; theme: ThemeColors; footerRule?: string };
type TapProps = { steps: string[] | Array<{ id?: string; text: string }>; theme: ThemeColors; footerRule?: string };
type TrapProps = {
  content: string;
  items: DangerZoneItem[];
  theme: ThemeColors;
  footerRule?: string;
  compareRevealMode?: LogicFlowRevealMode;
};

// —— Aleitamento / nutrição ——
export const CriancaFeedingTimelineConceptMap = (p: ConceptProps) => (
  <CriancaTimelineConceptMap {...p} domain="feeding" />
);
export const GoldenRuleCriancaFeedingBoard = (p: BoardProps) => (
  <CriancaBoardGoldenRule {...p} domain="feeding" />
);
export const LogicFlowCriancaFeedingTapFlow = (p: TapProps) => <CriancaTapFlow {...p} />;
export const DangerZoneCriancaFeedingTrapArena = (p: TrapProps) => (
  <CriancaTrapArena {...p} domain="feeding" />
);

// —— Triagem neonatal ——
export const CriancaScreeningTimelineConceptMap = (p: ConceptProps) => (
  <CriancaTimelineConceptMap {...p} domain="screening" />
);
export const GoldenRuleCriancaScreeningBoard = (p: BoardProps) => (
  <CriancaBoardGoldenRule {...p} domain="screening" />
);
export const LogicFlowCriancaScreeningTapFlow = (p: TapProps) => <CriancaTapFlow {...p} />;
export const DangerZoneCriancaScreeningTrapArena = (p: TrapProps) => (
  <CriancaTrapArena {...p} domain="screening" />
);

// —— Genérico pediátrico (hub) ——
export const CriancaPediatricHubConceptMap = (p: ConceptProps) => <CriancaHubConceptMap {...p} />;
export const GoldenRuleCriancaPediatricBoard = (p: BoardProps) => (
  <CriancaBoardGoldenRule {...p} domain="pediatric" />
);
export const LogicFlowCriancaPediatricTapFlow = (p: TapProps) => <CriancaTapFlow {...p} />;
export const DangerZoneCriancaPediatricTrapArena = (p: TrapProps) => (
  <CriancaTrapArena {...p} domain="pediatric" />
);

// —— Desidratação ——
export const CriancaDehydrationSpectrumConceptMap = (p: ConceptProps) => (
  <CriancaSpectrumConceptMap {...p} domain="dehydration" />
);
export const GoldenRuleCriancaDehydrationBoard = (p: BoardProps) => (
  <CriancaBoardGoldenRule {...p} domain="dehydration" />
);
export const LogicFlowCriancaDehydrationTapFlow = (p: TapProps) => <CriancaTapFlow {...p} />;
export const DangerZoneCriancaDehydrationTrapArena = (p: TrapProps) => (
  <CriancaTrapArena {...p} domain="dehydration" />
);

// —— APS / puericultura ——
export const CriancaPuericulturaTimelineConceptMap = (p: ConceptProps) => (
  <CriancaTimelineConceptMap {...p} domain="puericultura" />
);
export const GoldenRuleCriancaPuericulturaBoard = (p: BoardProps) => (
  <CriancaBoardGoldenRule {...p} domain="puericultura" />
);
export const LogicFlowCriancaPuericulturaTapFlow = (p: TapProps) => <CriancaTapFlow {...p} />;
export const DangerZoneCriancaPuericulturaTrapArena = (p: TrapProps) => (
  <CriancaTrapArena {...p} domain="puericultura" />
);

// —— Neonatologia ——
export const CriancaNeonatalDeckConceptMap = (p: ConceptProps) => (
  <CriancaDeckConceptMap {...p} domain="neonatal" />
);
export const GoldenRuleCriancaNeonatalBoard = (p: BoardProps) => (
  <CriancaBoardGoldenRule {...p} domain="neonatal" />
);
export const LogicFlowCriancaNeonatalTapFlow = (p: TapProps) => <CriancaTapFlow {...p} />;
export const DangerZoneCriancaNeonatalTrapArena = (p: TrapProps) => (
  <CriancaTrapArena {...p} domain="neonatal" />
);

// —— Desenvolvimento ——
export const CriancaDevMilestonesRailConceptMap = (p: ConceptProps) => (
  <CriancaRailConceptMap {...p} domain="development" />
);
export const GoldenRuleCriancaDevBoard = (p: BoardProps) => (
  <CriancaBoardGoldenRule {...p} domain="development" />
);
export const LogicFlowCriancaDevTapFlow = (p: TapProps) => <CriancaTapFlow {...p} />;
export const DangerZoneCriancaDevTrapArena = (p: TrapProps) => (
  <CriancaTrapArena {...p} domain="development" />
);
