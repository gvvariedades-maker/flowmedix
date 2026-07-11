import { readFileSync, writeFileSync } from 'node:fs';

const files = [
  'components/slides/variants/AdmeJourneyRailConceptMap.tsx',
  'components/slides/variants/BurnDepthLayerDeckConceptMap.tsx',
  'components/slides/variants/DangerZoneVitalsClassifyArena.tsx',
  'components/slides/variants/GoldenRulePniCalendarBoard.tsx',
  'components/slides/variants/GoldenRulePniIntervalMatrix.tsx',
  'components/slides/variants/GoldenRulePniTemperatureRail.tsx',
  'components/slides/variants/GoldenRuleVitalsReferenceBoard.tsx',
  'components/slides/variants/IvCareOrbitConceptMap.tsx',
  'components/slides/variants/LogicFlowPniVfJuggleTap.tsx',
  'components/slides/variants/Nr32AnnexDeckConceptMap.tsx',
  'components/slides/variants/OxygenProtocolDeckConceptMap.tsx',
  'components/slides/variants/SaeResponsibilityMatrix.tsx',
  'components/slides/variants/SusLegalPillarsConceptMap.tsx',
  'components/slides/variants/WoundStageTissueDeckConceptMap.tsx',
];

for (const file of files) {
  let source = readFileSync(file, 'utf8');
  if (!source.includes('SlideLucideIcon')) continue;
  if (source.includes("from '../core/SlideLucideIcon'")) {
    source = source.replace(
      /import \{ resolveLucideIcon \} from '\.\.\/core\/lucideIcon';\n/g,
      '',
    );
  } else {
    source = source.replace(
      /import \{ resolveLucideIcon \} from '\.\.\/core\/lucideIcon';\n/,
      "import { SlideLucideIcon } from '../core/SlideLucideIcon';\n",
    );
  }
  writeFileSync(file, source);
  console.log('import fixed', file);
}
