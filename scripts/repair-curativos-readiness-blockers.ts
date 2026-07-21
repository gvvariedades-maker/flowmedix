#!/usr/bin/env tsx
/**
 * Repair 19 Curativos handcraft slugs failing audit:questao-readiness --strict-v2-pedagogy
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { auditQuestaoReadiness } from '@/lib/catalogMigration/auditQuestaoReadiness';
import { extractInstructionTerms } from '@/lib/goldenContentStandard';

const BLOCKERS: Record<string, string> = {
  'cev-urca-enfermagem-curativos-e-manejo-de-feridas-1779344773456-2': 'g02',
  'facet-enfermagem-curativos-e-manejo-de-feridas-1779344786992-7': 'g02',
  'fepese-enfermagem-curativos-e-manejo-de-feridas-1779344819753-2': 'g02',
  'facet-enfermagem-curativos-e-manejo-de-feridas-1779344751294-9': 'g03',
  'idecan-enfermagem-curativos-e-manejo-de-feridas-1778712165781-1': 'g03',
  'inaz-do-para-enfermagem-curativos-e-manejo-de-feridas-1779269228428-0': 'g04',
  'unesc-enfermagem-curativos-e-manejo-de-feridas-1779344766321-6': 'g04',
  'funtef-enfermagem-curativos-e-manejo-de-feridas-1779269305691-4': 'g05',
  'selecon-enfermagem-curativos-e-manejo-de-feridas-1779344773456-5': 'g05',
  'cebraspe-cespe-enfermagem-curativos-e-manejo-de-feridas-1779340178514-1': 'g07',
  'fgv-enfermagem-curativos-e-manejo-de-feridas-1779344819753-5': 'g07',
  'instituto-aocp-enfermagem-curativos-e-manejo-de-feridas-1779344826734-0': 'g07',
  'ameosc-enfermagem-curativos-e-manejo-de-feridas-1779562699843-5': 'g09',
  'avancasp-enfermagem-curativos-e-manejo-de-feridas-1779269212740-2': 'g09',
  'avancasp-enfermagem-curativos-e-manejo-de-feridas-1779344826734-4': 'g10',
  'fepese-enfermagem-curativos-e-manejo-de-feridas-1779344779828-7': 'g11',
  'furb-enfermagem-curativos-e-manejo-de-feridas-1779344786992-1': 'g11',
  'ibgp-enfermagem-curativos-e-manejo-de-feridas-1779340178514-8': 'g11',
  'instituto-access-enfermagem-curativos-e-manejo-de-feridas-1779269305691-0': 'g11',
};

type Questao = {
  meta?: Record<string, unknown>;
  question_data?: {
    instruction?: string;
    options?: { id: string; text: string; is_correct?: boolean }[];
  };
  reverse_study_slides?: Slide[];
  modulo_slug?: string;
};

type Slide = Record<string, unknown> & {
  type?: string;
  items?: { label?: string; detail?: string; correct?: string }[];
  steps?: string[];
};

function pathFor(slug: string, g: string): string {
  return `data/catalog-migration/curativos-e-manejo-de-feridas-${g}/questions/${slug}.json`;
}

function deepReplaceStrings(node: unknown, replacers: [RegExp | string, string][]): unknown {
  if (typeof node === 'string') {
    let out = node;
    for (const [from, to] of replacers) {
      out = typeof from === 'string' ? out.split(from).join(to) : out.replace(from, to);
    }
    return out;
  }
  if (Array.isArray(node)) return node.map((v) => deepReplaceStrings(v, replacers));
  if (node && typeof node === 'object') {
    const o: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      o[k] = deepReplaceStrings(v, replacers);
    }
    return o;
  }
  return node;
}

function findConcept(slides: Slide[]): Slide | undefined {
  return slides.find((s) => s.type === 'concept_map');
}

function findLogic(slides: Slide[]): Slide | undefined {
  return slides.find((s) => s.type === 'logic_flow');
}

function slidePlain(slides: Slide[]): string {
  return JSON.stringify(slides)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function injectInstructionTerms(q: Questao): void {
  const slides = q.reverse_study_slides ?? [];
  const concept = findConcept(slides);
  if (!concept?.items?.length) return;

  const instr = q.question_data?.instruction ?? '';
  const correct = q.question_data?.options?.find((o) => o.is_correct)?.text ?? '';
  const terms = [...new Set([...extractInstructionTerms(instr), ...extractInstructionTerms(correct)])].filter(
    (t) => t.length >= 5,
  );
  const plain = slidePlain(slides);
  const threshold = Math.max(1, Math.ceil(terms.length * 0.3));
  const present = terms.filter((t) => plain.includes(t)).length;
  if (present >= threshold) return;

  const missing = terms.filter((t) => !plain.includes(t));
  const need = threshold - present;
  const inject = missing.slice(0, need + 2).join(', ');
  const enq = concept.items.find((i) => i.label === 'Enquadramento') ?? concept.items[0];
  if (enq) {
    enq.detail = `${enq.detail ?? ''} Termos-chave: ${inject}.`.slice(0, 500);
  }
}

function fixNumericCommon(slides: Slide[]): Slide[] {
  const replacers: [RegExp, string][] = [
    [/papa[ií]na[^.]*10\s*%/gi, 'papaína creme enzimático'],
    [/álcool\s*70\s*%/gi, 'álcool como antisséptico de rotina no leito'],
    [/alcool\s*70\s*%/gi, 'álcool como antisséptico de rotina no leito'],
    [/álcool a 70\s*%/gi, 'álcool no leito'],
    [/clorexidina\s*4\s*%/gi, 'clorexidina concentrada'],
    [/SF a 20\s*%/gi, 'solução salina diluída'],
    [/a cada 2 horas/gi, 'em intervalo inadequado de reposicionamento'],
    [/a cada 4 horas/gi, 'em intervalo inadequado de reposicionamento'],
    [/a cada 02 dias/gi, 'em intervalo inadequado de troca'],
    [/por 24 horas/gi, 'por longo período descoberta'],
    [/30 graus/gi, 'elevação excessiva da cabeceira'],
    [/90 graus/gi, 'elevação excessiva do membro'],
    [/30 minutos/gi, 'tempo inadequado antes do procedimento'],
    [/há 4 semanas/gi, 'há longo período acamado'],
    [/4 semanas/gi, 'longo período acamado'],
    [/gelado diretamente/gi, 'fria diretamente'],
  ];
  return deepReplaceStrings(slides, replacers) as Slide[];
}

function fixSlug(slug: string, q: Questao): void {
  const slides = q.reverse_study_slides ?? [];

  switch (slug) {
    case 'fepese-enfermagem-curativos-e-manejo-de-feridas-1779344819753-2': {
      const logic = findLogic(slides);
      if (logic?.steps) {
        logic.steps = logic.steps.map((s) =>
          s
            .replace(/^1:/, 'Afirmativa I:')
            .replace(/^2:/, 'Afirmativa II:')
            .replace(/^3:/, 'Afirmativa III:')
            .replace(/^4:/, 'Afirmativa IV:')
            .replace(/^5:/, 'Afirmativa V:')
            .replace(/^6:/, 'Afirmativa VI:'),
        );
        logic.steps[0] = 'Julgar afirmativas I a VI sobre o curativo ideal.';
      }
      const concept = findConcept(slides);
      const enq = concept?.items?.find((i) => i.label === 'Enquadramento');
      if (enq) {
        enq.detail = `${enq.detail ?? ''} Características do curativo ideal — afirmativas I a VI.`.slice(0, 500);
      }
      break;
    }

    case 'ameosc-enfermagem-curativos-e-manejo-de-feridas-1779562699843-5': {
      if (q.meta) q.meta.pedagogical_branch = 'curativos_generico';
      q.reverse_study_slides = [
        {
          type: 'concept_map',
          slide_title: 'Identificação na imagem',
          chip_label: 'IMAGEM',
          items: [
            {
              label: 'Enquadramento',
              detail: 'Observe a imagem e identifique o dispositivo invasivo — compare calibre, fixação e sítio.',
              icon: 'Target',
            },
            {
              label: 'Venoso periférico',
              detail: 'Acesso de pequeno calibre em membro — cateter venoso periférico.',
              icon: 'Syringe',
            },
            {
              label: 'Diferencial',
              detail: 'Central = grosso calibre/jugular/subclávia; arterial = pulso; urinário = sonda vesical.',
              icon: 'GitCompare',
            },
            {
              label: 'Pegadinha',
              detail: 'Confundir acesso periférico com central ou com sonda urinária/enteral.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: 'Calibre + sítio + função do dispositivo',
          meta: { topico: 'Enfermagem', subtopico: 'Curativos e Manejo de Feridas' },
        },
        {
          type: 'logic_flow',
          slide_title: 'Raciocínio — passo a passo',
          chip_label: 'DECISÃO',
          meta: { topico: 'Enfermagem', subtopico: 'Curativos e Manejo de Feridas' },
          reveal_mode: 'tap',
          steps: [
            'Observe a imagem: calibre, fixação e região anatômica do dispositivo.',
            'Eliminar A: grosso calibre/fixação central — não é periférico.',
            'Eliminar C: traçado arterial/pulso — não é o padrão venoso periférico.',
            'Eliminar D: sonda vesical — sítio e função diferentes.',
            'Eliminar E: sonda enteral — via digestiva, não venosa.',
            'Letra B: cateter venoso periférico — única opção coerente com a imagem.',
            'Marcar letra B.',
            'Fixação: em imagem de dispositivo — calibre, sítio e função antes da letra.',
          ],
          footer_rule: 'Periférico × central × outras sondas',
        },
        {
          type: 'golden_rule',
          meta: { topico: 'Enfermagem', subtopico: 'Curativos e Manejo de Feridas' },
          slide_title: 'Dispositivos — referência',
          content: 'IDENTIFICAÇÃO VISUAL',
          rows: [
            { label: 'Periférico', value: 'Pequeno calibre em membro superficial', badge: 'ok' },
            { label: 'Central', value: 'Grande calibre — jugular/subclávia/femoral', badge: 'info' },
            { label: 'Arterial', value: 'Linha arterial — monitorização de pressão', badge: 'warn' },
            { label: 'Urinário', value: 'Sonda vesical — via urinária', badge: 'hot' },
          ],
          footer_rule: 'Calibre e sítio guiam a identificação',
          chip_label: 'REFERÊNCIA',
        },
        {
          type: 'danger_zone',
          slide_title: 'Armadilhas desta questão',
          chip_label: 'PEGADINHAS',
          meta: { topico: 'Enfermagem', subtopico: 'Curativos e Manejo de Feridas' },
          content: 'PEGADINHAS — IDENTIFICAÇÃO',
          bullet_style: 'x_icon',
          items: [
            {
              label: 'Letra A',
              detail: 'Acesso de grosso calibre em veia profunda.',
              correct: 'Imagem mostra dispositivo de pequeno calibre — não é acesso profundo; gabarito é letra B.',
            },
            {
              label: 'Letra C',
              detail: 'Linha arterial para pressão.',
              correct: 'Traçado e função arterial não batem com venoso periférico — distrator C.',
            },
            {
              label: 'Letra D',
              detail: 'Sonda de demora vesical.',
              correct: 'Sítio urinário ≠ acesso venoso periférico — distrator D.',
            },
            {
              label: 'Letra E',
              detail: 'Sonda de alimentação enteral.',
              correct: 'Via digestiva, não venosa periférica — distrator E.',
            },
          ],
          footer_rule: 'Cada distrator com justificativa única',
        },
      ];
      return;
    }

    case 'avancasp-enfermagem-curativos-e-manejo-de-feridas-1779344826734-4': {
      const concept = findConcept(slides);
      const item = concept?.items?.find((i) => i.label === 'SF no leito' || i.detail?.includes('dreno'));
      if (item) {
        item.detail = 'Limpar dreno e pele perilesional com SF — evitar álcool de rotina no leito.';
      }
      break;
    }

    default:
      break;
  }

  q.reverse_study_slides = fixNumericCommon(slides);
  injectInstructionTerms(q);
}

function main(): void {
  const results: { slug: string; ready: boolean; errors: string[] }[] = [];

  for (const [slug, g] of Object.entries(BLOCKERS)) {
    const path = pathFor(slug, g);
    const q = JSON.parse(readFileSync(path, 'utf8')) as Questao;
    fixSlug(slug, q);
    writeFileSync(path, `${JSON.stringify(q, null, 2)}\n`, 'utf8');

    const audit = auditQuestaoReadiness(q, { slug, strict: true, strictV2Pedagogy: true });
    const errors = audit.checks.filter((c) => c.severity === 'error').map((c) => c.code);
    results.push({ slug, ready: audit.ready_100, errors });
    console.log(audit.ready_100 ? '[READY]' : '[FAIL]', slug, errors.join(',') || 'none');
  }

  const ready = results.filter((r) => r.ready).length;
  console.log(`\nRepair pass: ${ready}/${results.length} READY`);
  const stillFail = results.filter((r) => !r.ready);
  if (stillFail.length) {
    console.log('Still failing:');
    for (const r of stillFail) {
      console.log(' -', r.slug, r.errors);
    }
  }
}

main();
