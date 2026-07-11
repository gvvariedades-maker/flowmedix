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
  'components/slides/variants/ProcedureProtocolConceptMap.tsx',
  'components/slides/variants/SaeDocumentationConceptMap.tsx',
  'components/slides/variants/SaeResponsibilityMatrix.tsx',
  'components/slides/variants/SusLegalPillarsConceptMap.tsx',
  'components/slides/variants/WoundStageTissueDeckConceptMap.tsx',
];

const iconVarNames = new Set(['Icon', 'ActiveIcon', 'HeroIcon', 'BadgeIcon']);

for (const file of files) {
  let source = readFileSync(file, 'utf8');
  if (!source.includes('resolveLucideIcon')) continue;

  const replacements: Array<{ varName: string; expr: string }> = [];
  const constRe = /const ([A-Za-z][A-Za-z0-9_]*) = resolveLucideIcon\(([^;]+)\);\s*\n/g;
  let match: RegExpExecArray | null;
  while ((match = constRe.exec(source)) !== null) {
    replacements.push({ varName: match[1], expr: match[2].trim() });
  }

  source = source.replace(
    /import \{ resolveLucideIcon \} from '\.\.\/core\/lucideIcon';\n/,
    "import { SlideLucideIcon } from '../core/SlideLucideIcon';\n",
  );
  source = source.replace(constRe, '');

  for (const { varName, expr } of replacements) {
    if (!iconVarNames.has(varName)) continue;
    const openTag = new RegExp(`<${varName}([^>]*)\\/>`, 'g');
    source = source.replace(openTag, (_full, attrs: string) => {
      const size = attrs.match(/size=\{([^}]+)\}/)?.[1];
      const className = attrs.match(/className="([^"]*)"/)?.[1];
      const parts = [`name={${expr}}`];
      if (size) parts.push(`size={${size}}`);
      if (className) parts.push(`className="${className}"`);
      return `<SlideLucideIcon ${parts.join(' ')} />`;
    });
    const pairTag = new RegExp(`<${varName}([^>]*)><\/${varName}>`, 'g');
    source = source.replace(pairTag, (_full, attrs: string) => {
      const size = attrs.match(/size=\{([^}]+)\}/)?.[1];
      const className = attrs.match(/className="([^"]*)"/)?.[1];
      const parts = [`name={${expr}}`];
      if (size) parts.push(`size={${size}}`);
      if (className) parts.push(`className="${className}"`);
      return `<SlideLucideIcon ${parts.join(' ')} />`;
    });
  }

  writeFileSync(file, source);
  console.log('updated', file);
}
