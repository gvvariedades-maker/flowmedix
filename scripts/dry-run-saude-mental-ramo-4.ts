#!/usr/bin/env tsx
/**
 * Dry-run SM-4 — Crise / agitação / contenção / CAPS (6 slugs piloto).
 * Sem escrita em Supabase — gera artifacts/saude-mental-ramo-4-crise/dry-run-manifest.json
 *
 * Uso: npx tsx scripts/dry-run-saude-mental-ramo-4.ts
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import agitacaoGolden from '@/examples/questao-premium-fundatec-saude-mental-agitacao-exceto.json';
import capsGolden from '@/examples/questao-premium-ibade-saude-mental-caps-acolhimento.json';
import { classifyFamily } from '@/lib/catalogMigration/classifyFamily';
import {
  detectDangerGabaritoMismatch,
  detectDuplicateDangerJustifications,
  detectSlideTopicDrift,
} from '@/lib/catalogMigration/slideContract';
import {
  buildSaudeMentalPremiumSlidesForFamily,
  canBuildSaudeMentalPremiumSlides,
  inferSaudeMentalCriseTopic,
  SAUDE_MENTAL_AGITACAO_EXCETO_GOLDEN_FILE,
  SAUDE_MENTAL_CAPS_GOLDEN_FILE,
  saudeMentalGoldenReferenceForInput,
} from '@/lib/catalogMigration/upgradePremiumSaudeMental';
import { QuestaoCompletaSchema } from '@/lib/validations';

const SUBTOPICO = 'Saúde Mental';
const TOPICO = 'Enfermagem';
const OUT_DIR = resolve(process.cwd(), 'artifacts/saude-mental-ramo-4-crise');

type PilotEntry = {
  modulo_slug: string;
  banca: string;
  pedagogical_cluster: string;
  instruction: string;
  options: { id: string; text: string; is_correct: boolean }[];
};

const PILOT_SLUGS: PilotEntry[] = [
  {
    modulo_slug: 'fundatec-enfermagem-dependencia-quimica-1778967935713-7',
    banca: 'FUNDATEC',
    pedagogical_cluster: 'Agitação / crise / contenção (EXCETO)',
    instruction: agitacaoGolden.question_data.instruction,
    options: agitacaoGolden.question_data.options,
  },
  {
    modulo_slug: 'ameosc-enfermagem-processo-de-enfermagem-1776056181857-3',
    banca: 'AMEOSC',
    pedagogical_cluster: 'Crise / agitação / de-escalada',
    instruction:
      'Em uma unidade de pronto atendimento (UPA) da rede pública, um paciente chega agitado, com comportamento agressivo verbal, histórico de transtorno mental, uso irregular de medicação e relato da família de risco de autoagressão. A equipe encontra a sala cheia, outros pacientes observando a situação e um segurança querendo imobilizar o paciente de imediato. O técnico de enfermagem está ao lado, sendo o primeiro profissional disponível para abordagem. Considerando os princípios de humanização, saúde mental, ética profissional e segurança do paciente no SUS, qual conduta está adequada à atuação do técnico de enfermagem nessa situação?',
    options: [
      {
        id: 'A',
        text: 'Ignorar o paciente agitado alegando que quem resolve saúde mental é só o médico ou o psicólogo, abstendo-se de qualquer tentativa de acolhimento.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Apoiar o uso imediato de contenção física e mecânica pelo segurança, sem avaliação da equipe de enfermagem ou médica.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'Elevar o tom de voz, confrontar o paciente na frente dos demais para mostrar autoridade e ameaçar chamar a polícia.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Tentar estabelecer comunicação calma e respeitosa com o paciente, manter postura não confrontativa, solicitar apoio imediato do enfermeiro e do médico, ajudar a garantir ambiente mais reservado e seguro.',
        is_correct: true,
      },
      {
        id: 'E',
        text: 'Registrar apenas o ocorrido no prontuário após a contenção física, sem participar da abordagem inicial.',
        is_correct: false,
      },
    ],
  },
  {
    modulo_slug: 'ibade-enfermagem-processo-de-enfermagem-1780005128081-8',
    banca: 'IBADE',
    pedagogical_cluster: 'CAPS / acolhimento em crise',
    instruction: capsGolden.question_data.instruction,
    options: capsGolden.question_data.options,
  },
  {
    modulo_slug: 'instituto-ibed-enfermagem-processo-de-enfermagem-1780004926596-1',
    banca: 'INSTITUTO IBED',
    pedagogical_cluster: 'Certo ou errado',
    instruction:
      'Situação hipotética: Ao cuidar de um paciente em surto psicótico, o técnico de enfermagem, sob supervisão, adota uma abordagem calma e tenta a comunicação verbal como primeira estratégia para de-escalada da crise. Assertiva: Essa conduta está alinhada com as boas práticas de cuidado em saúde mental.',
    options: [
      { id: 'A', text: 'Certo', is_correct: true },
      { id: 'B', text: 'Errado', is_correct: false },
    ],
  },
  {
    modulo_slug: 'idecan-enfermagem-enfermagem-em-uti-1778712381105-8',
    banca: 'IDECAN',
    pedagogical_cluster: 'Crise / agitação / de-escalada',
    instruction:
      'Considerando a atuação do Técnico de Enfermagem no cuidado ao paciente crítico sob sedação contínua e risco de delirium, identifique a estratégia que atende aos protocolos assistenciais atuais e marque a opção correta.',
    options: [
      {
        id: 'A',
        text: 'Manter o registro de sedação somente em intervalos de 12 horas, sem escalas validadas, priorizando prescrição prédefinida.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'Auxiliar na pausa diária da sedação e aplicar escalas confiáveis (p. ex. RASS), comunicando alterações à equipe multiprofissional.',
        is_correct: true,
      },
      {
        id: 'C',
        text: 'Manter sedativos ininterruptos, atribuindo exclusivamente ao enfermeiro a verificação de possíveis delirium.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'Restringir mobilização precoce aos pacientes em ventilação espontânea, adotando sedação profunda para todos.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'Desconsiderar achados como agitação e alterações do padrão respiratório, revisando a dosagem de sedativos apenas via parâmetros vitais invasivos.',
        is_correct: false,
      },
    ],
  },
  {
    modulo_slug: 'cev-urca-enfermagem-processo-de-enfermagem-1780006494066-8',
    banca: 'CEV URCA',
    pedagogical_cluster: 'CAPS / acolhimento em crise',
    instruction:
      'Considerando a assistência de enfermagem em saúde mental na Atenção Primária, assinale a alternativa CORRETA.',
    options: [
      {
        id: 'A',
        text: 'A abordagem em saúde mental na APS deve restringir-se à identificação de transtornos psicóticos graves, encaminhando todos os demais casos diretamente para o CAPS.',
        is_correct: false,
      },
      {
        id: 'B',
        text: 'O uso de psicofármacos é sempre a primeira linha de cuidado na APS para qualquer queixa de sofrimento emocional.',
        is_correct: false,
      },
      {
        id: 'C',
        text: 'A escuta de usuários com sofrimento psíquico só deve ocorrer em consultas previamente agendadas com médico psiquiatra.',
        is_correct: false,
      },
      {
        id: 'D',
        text: 'As visitas domiciliares não têm papel na atenção em saúde mental.',
        is_correct: false,
      },
      {
        id: 'E',
        text: 'O atendimento da enfermagem na APS pode realizar acolhimento, escuta qualificada, intervenções breves, articulação com a Rede de Atenção Psicossocial e acompanhamento compartilhado de casos.',
        is_correct: true,
      },
    ],
  },
];

type ManifestRow = {
  modulo_slug: string;
  banca: string;
  pedagogical_cluster: string;
  family: string;
  builder_topic: string | null;
  golden_reference: string;
  can_build: boolean;
  slide_types: string[];
  contract: {
    zod_valid: boolean;
    danger_duplicate: boolean;
    danger_gabarito_mismatch: boolean;
    topic_drift: boolean;
  };
  slide_preview: {
    concept_map_items: number;
    golden_rule_rows: number;
    logic_flow_steps: number;
    danger_zone_items: number;
  };
  status: 'ready' | 'blocked';
  blockers: string[];
};

const rows: ManifestRow[] = [];

for (const entry of PILOT_SLUGS) {
  const family = classifyFamily(entry.instruction, SUBTOPICO, entry.options, '');
  const canBuild = canBuildSaudeMentalPremiumSlides(entry.instruction, entry.options, family);
  const builderTopic = inferSaudeMentalCriseTopic(entry.instruction, entry.options, family);
  const goldenReference = saudeMentalGoldenReferenceForInput(entry.instruction, entry.options, family);
  const blockers: string[] = [];

  if (!canBuild) blockers.push('can_build_false');

  let slides: Record<string, unknown>[] = [];
  if (canBuild) {
    try {
      slides = buildSaudeMentalPremiumSlidesForFamily(
        {
          instruction: entry.instruction,
          options: entry.options,
          topico: TOPICO,
          subtopico: SUBTOPICO,
        },
        family,
      );
    } catch (err) {
      blockers.push(`build_error: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const dup = detectDuplicateDangerJustifications(slides);
  const gab = detectDangerGabaritoMismatch(entry.options, slides);
  const drift = detectSlideTopicDrift(entry.instruction, slides);
  const zod = QuestaoCompletaSchema.safeParse({
    meta: { banca: entry.banca, topico: TOPICO, subtopico: SUBTOPICO },
    question_data: { instruction: entry.instruction, options: entry.options },
    reverse_study_slides: slides,
  });

  if (dup.duplicate) blockers.push('danger_duplicate_justifications');
  if (gab.mismatch) blockers.push('danger_gabarito_mismatch');
  if (drift) blockers.push('slide_topic_drift');
  if (!zod.success) blockers.push('zod_invalid');

  const cm = slides.find((s) => s.type === 'concept_map') as { items?: unknown[] } | undefined;
  const gr = slides.find((s) => s.type === 'golden_rule') as { rows?: unknown[] } | undefined;
  const lf = slides.find((s) => s.type === 'logic_flow') as { steps?: unknown[] } | undefined;
  const dz = slides.find((s) => s.type === 'danger_zone') as { items?: unknown[] } | undefined;

  rows.push({
    modulo_slug: entry.modulo_slug,
    banca: entry.banca,
    pedagogical_cluster: entry.pedagogical_cluster,
    family,
    builder_topic: builderTopic,
    golden_reference: goldenReference,
    can_build: canBuild,
    slide_types: slides.map((s) => String(s.type)),
    contract: {
      zod_valid: zod.success,
      danger_duplicate: dup.duplicate,
      danger_gabarito_mismatch: gab.mismatch,
      topic_drift: drift,
    },
    slide_preview: {
      concept_map_items: cm?.items?.length ?? 0,
      golden_rule_rows: gr?.rows?.length ?? 0,
      logic_flow_steps: lf?.steps?.length ?? 0,
      danger_zone_items: dz?.items?.length ?? 0,
    },
    status: blockers.length === 0 ? 'ready' : 'blocked',
    blockers,
  });
}

const manifest = {
  generated_at: new Date().toISOString(),
  ramo: 'SM-4',
  label: 'Crise / agitação / contenção / CAPS',
  subtopico: SUBTOPICO,
  pilot_slug_count: PILOT_SLUGS.length,
  ready_count: rows.filter((r) => r.status === 'ready').length,
  blocked_count: rows.filter((r) => r.status === 'blocked').length,
  golden_anchors: [
    SAUDE_MENTAL_AGITACAO_EXCETO_GOLDEN_FILE,
    SAUDE_MENTAL_CAPS_GOLDEN_FILE,
  ],
  entries: rows,
};

mkdirSync(OUT_DIR, { recursive: true });
const outPath = resolve(OUT_DIR, 'dry-run-manifest.json');
writeFileSync(outPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

console.log(`[dry-run] SM-4 manifest → ${outPath}`);
console.log(`[dry-run] ready=${manifest.ready_count} blocked=${manifest.blocked_count}`);
for (const row of rows) {
  console.log(`  ${row.status === 'ready' ? '✓' : '✗'} ${row.modulo_slug} (${row.builder_topic ?? '—'})`);
  if (row.blockers.length) console.log(`      blockers: ${row.blockers.join(', ')}`);
}
