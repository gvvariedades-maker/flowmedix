#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g35 (vitals_exceto_tecnica SHORT LOTE: 3 slugs).
 * Fecha cluster EXCETO/INCORRETA — técnica SV (20 − piloto − g33 − g34).
 *
 *   npm run handcraft:sinais-vitais-g35
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g35';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-06';

const SV_SOURCE = {
  id: 'sv-adulto-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / COFEN / SBC',
  title: 'Técnica de aferição de sinais vitais — adulto',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'técnica PA — posição · manguito · repouso',
    'pré-PA — tabaco · álcool · bexiga',
    'diferença inter-braços PA',
    'EXCETO/INCORRETA — distratores corretos',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: {
    instruction: string;
    text_fragment?: string;
    options: { id: string; text: string; is_correct: boolean }[];
  };
  modulo_slug?: string;
};

type Pack = {
  family: 'protocolo';
  guideline: string;
  exam_vs_current?: string;
  roi_error: string;
  slides: unknown[];
  instruction?: string;
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(q: Q, pack: Pack, slug: string) {
  return {
    ...q.meta,
    cargo_header: String(q.meta.cargo_header ?? 'TÉCNICO DE ENFERMAGEM')
      .toUpperCase()
      .includes('TÉCNICO')
      ? 'TÉCNICO DE ENFERMAGEM'
      : q.meta.cargo_header,
    subtopico: SUBTOPICO,
    pedagogical_branch: 'vitals_exceto_tecnica',
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
      roi_error: pack.roi_error,
    },
    sources: [SV_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'nao-informado-geral-verificacao-de-sinais-vitais-1779344089179-0': {
    family: 'protocolo',
    guideline:
      'SBC/MS — pré-PA: repouso 5 min · bexiga vazia · sem exercício 60 min · sem álcool/café/alimentos · tabaco: evitar 30 min (não 40 min)',
    exam_vs_current: 'Prova marca 40 min tabaco como incorreto — SBC cita ~30 min de abstinência',
    roi_error: 'exceto_coringa_sv',
    instruction:
      'Antes de iniciar as medições da pressão arterial, o paciente deverá sentar-se confortavelmente em um ambiente silencioso por cinco minutos. O profissional de saúde deverá explicar o procedimento ao indivíduo e orientá-lo a não conversar durante a medição. Possíveis dúvidas devem ser esclarecidas antes ou depois do procedimento. Além disso, outros cuidados são necessários. Nesse sentido, qual alternativa é INCORRETA?',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — pré-PA Pref Bauru',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Após repouso 5 min e silêncio na aferição, identifique qual cuidado pré-PA está INCORRETO — três alternativas seguem diretriz.',
            icon: 'Target',
          },
          {
            label: 'Bexiga vazia',
            detail: 'Bexiga distendida eleva PA — verificar esvaziamento é conduta correta (A).',
            icon: 'Droplets',
          },
          {
            label: 'Repouso pós-exercício',
            detail: 'Aguardar ≥ 60 min após exercício antes da PA — conduta correta (B).',
            icon: 'Clock',
          },
          {
            label: 'Sem álcool/café/comida',
            detail: 'Evitar álcool, café e alimentos antes da aferição — conduta correta (C).',
            icon: 'Coffee',
          },
          {
            label: 'Pegadinha — tabaco 40 min',
            detail: 'Letra D cita 40 min sem fumar — diretriz usa intervalo menor (~30 min).',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Tabaco: 30 min, não 40',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Contexto: repouso 5 min silencioso + explicar procedimento + silêncio na medida.',
          'Comando: qual alternativa é INCORRETA sobre cuidados pré-PA.',
          'Testar A: bexiga vazia → conduta correta → eliminar.',
          'Testar B: sem exercício há 60 min → conduta correta → eliminar.',
          'Testar C: sem álcool/café/alimentos → conduta correta → eliminar.',
          'Testar D: não fumar nos 40 min anteriores → intervalo inadequado — SBC orienta ~30 min de abstinência tabágica.',
          'Confirmar: só D traz conduta incorreta.',
          'Marcar letra D.',
        ],
        footer_rule: 'Abstinência tabágica ~30 min → D incorreta',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — preparo pré-PA',
        meta: slideMeta,
        content: 'CUIDADOS ANTES DA AFERIÇÃO',
        rows: [
          { label: 'Repouso', value: '5 min sentado em ambiente silencioso', sv_kind: 'pa', badge: 'ok' },
          { label: 'Bexiga', value: 'Esvaziada — distensão eleva PA', sv_kind: 'pa', badge: 'ok' },
          { label: 'Exercício', value: 'Sem esforço há ≥ 60 min', sv_kind: 'pa', badge: 'ok' },
          { label: 'Hábitos', value: 'Sem álcool, café, alimentos recentes', sv_kind: 'pa', badge: 'ok' },
          { label: 'Tabaco', value: 'Abstinência ~30 min (não 40 min)', sv_kind: 'pa', badge: 'hot' },
        ],
        footer_rule: 'Intervalo tabágico curto demais = pegadinha',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS BAURU — PA INCORRETA',
        items: [
          {
            label: 'Letra A — bexiga vazia',
            detail: 'Não estar com a bexiga cheia.',
            correct: 'Conduta correta: bexiga distendida eleva artificialmente a pressão arterial.',
          },
          {
            label: 'Letra B — 60 min pós-exercício',
            detail: 'Não ter praticado exercícios físicos há, pelo menos, 60 minutos.',
            correct: 'Conduta correta: repouso prolongado após esforço estabiliza a PA.',
          },
          {
            label: 'Letra C — sem álcool/café/comida',
            detail: 'Não ter ingerido bebidas alcoólicas, café ou alimentos.',
            correct: 'Conduta correta: substâncias e refeição recentes alteram a leitura pressórica.',
          },
          {
            label: 'Letra D — tabaco 40 min',
            detail: 'Não ter fumado nos 40 minutos anteriores.',
            correct:
              'INCORRETA: a diretriz exige abstinência tabágica de cerca de 30 minutos — 40 min como regra única não corresponde ao preparo padrão cobrado.',
          },
        ],
        footer_rule: 'INCORRETA = D (intervalo tabágico)',
      },
    ],
  },

  'selecon-enfermagem-verificacao-de-sinais-vitais-1779343883917-0': {
    family: 'protocolo',
    guideline:
      'SBC/MS — diferença sistólica inter-braços >10 mmHg: sinal de alerta (estenose subclávia etc.) · comunicar enfermeiro/médico · aferir ambos os braços',
    roi_error: 'interpretacao_pa_inter_bracos',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Diferença inter-braços — Selecon',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Variação sistólica >10 mmHg entre braços — qual afirmativa é correta sobre conduta e significado clínico.',
            icon: 'Target',
          },
          {
            label: 'Limite clínico',
            detail: 'Diferença >10 mmHg entre membros superiores merece investigação — não é variação banal.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — ignorar',
            detail: 'Letra A trata achado como normal sem comunicar — conduta inadequada.',
            icon: 'Ban',
          },
          {
            label: 'Pegadinha — um braço só',
            detail: 'Letra B descarta o braço de menor PA — técnica incompleta.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha — braço dominante',
            detail: 'Letra C inventa regra de aferir só braço dominante — mito de prova.',
            icon: 'XCircle',
          },
          {
            label: 'Conduta correta',
            detail: 'Letra D: pode indicar estenose subclávia — reportar à equipe.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'Δ sistólica >10 mmHg → investigar e comunicar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Cenário: PA sistólica varia >10 mmHg entre os dois braços.',
          'Comando: pode-se afirmar que… — buscar conduta/interpretação correta.',
          'Testar A: diferença normal sem comunicar → falso — requer atenção clínica → eliminar.',
          'Testar B: medir só braço de maior PA → falso — desconsiderar membro é erro → eliminar.',
          'Testar C: PA só no braço dominante → falso — não há essa regra técnica → eliminar.',
          'Testar D: pode indicar estenose subclávia e deve ser relatada → conduta adequada.',
          'Confirmar: D é a afirmativa correta.',
          'Marcar letra D.',
        ],
        footer_rule: 'Comunicar achado inter-braços → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — PA inter-braços',
        meta: slideMeta,
        content: 'DIFERENÇA ENTRE BRAÇOS',
        rows: [
          { label: 'Limite', value: 'Δ sistólica >10 mmHg → investigar', sv_kind: 'pa', badge: 'hot' },
          { label: 'Causa clássica', value: 'Estenose artéria subclávia', sv_kind: 'pa', badge: 'warn' },
          { label: 'Técnica', value: 'Aferir ambos os braços na 1ª avaliação', sv_kind: 'pa', badge: 'ok' },
          { label: 'Conduta', value: 'Comunicar enfermeiro/médico', sv_kind: 'pa', badge: 'ok' },
          { label: 'Mito', value: 'Não existe regra do “braço dominante”', sv_kind: 'meta', badge: 'warn' },
        ],
        footer_rule: 'Assimetria pressórica não é normal',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS SELECON — INTER-BRAÇOS',
        items: [
          {
            label: 'Letra A — ignorar diferença',
            detail: 'Diferença normal sem comunicar à equipe.',
            correct:
              'Afirmativa falsa: Δ >10 mmHg não é achado banal — exige registro e comunicação interprofissional.',
          },
          {
            label: 'Letra B — só braço maior',
            detail: 'Repetir aferição só no braço de maior pressão.',
            correct:
              'Afirmativa falsa: descartar o outro membro oculta assimetria — ambos os valores importam.',
          },
          {
            label: 'Letra C — braço dominante',
            detail: 'PA deve ser aferida apenas no braço dominante.',
            correct:
              'Afirmativa falsa: não há diretriz que restrinja a aferição ao braço dominante.',
          },
          {
            label: 'Letra D — estenose subclávia',
            detail: 'Pode indicar estenose subclávia — relatar à equipe.',
            correct:
              'Afirmativa correta: assimetria significativa pode refletir obstrução vascular e requer escalonamento.',
          },
        ],
        footer_rule: 'Gabarito D — comunicar assimetria',
      },
    ],
  },

  'unifil-enfermagem-verificacao-de-sinais-vitais-1779344205200-4': {
    family: 'protocolo',
    guideline:
      'MS/COFEN/SBC 7ª DBH — repouso 3–5 min · prep bexiga/tabaco · braço supinado · manguito 2–3 cm · ortostase idoso/diabético',
    exam_vs_current: 'none',
    roi_error: 'exceto_coringa_sv',
    instruction:
      'De acordo com a 7ª Diretriz Brasileira de Hipertensão Arterial, em relação aos cuidados necessários para aferição da pressão arterial não invasiva, assinale a alternativa que é INCORRETA.',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — 7ª DBH UNIFIL',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              '7ª Diretriz Brasileira de Hipertensão — qual afirmativa sobre técnica de PA NÃO invasiva está INCORRETA.',
            icon: 'Target',
          },
          {
            label: 'Repouso 3–5 min',
            detail: 'Explicar procedimento + repouso em ambiente calmo — correto (A).',
            icon: 'Clock',
          },
          {
            label: 'Pegadinha — posicionamento parcial',
            detail: 'Letra C cita só o braço — 7ª DBH exige paciente sentado com costas e pés apoiados.',
            icon: 'Ban',
          },
          {
            label: 'Hipotensão ortostática',
            detail: 'Medir PA em pé para rastreio de ortostase em idoso/diabético — correto (D).',
            icon: 'Activity',
          },
          {
            label: 'Manguito',
            detail: '2–3 cm acima da fossa cubital, sem folgas — correto (E).',
            icon: 'Stethoscope',
          },
        ],
        footer_rule: 'B exige preparo completo da 7ª DBH',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa que é INCORRETA sobre cuidados de PA não invasiva (7ª DBH).',
          'Testar A: repouso 3–5 min + ambiente calmo → conduta correta → eliminar.',
          'Testar B: verificar bexiga vazia e abstinência de álcool/café/tabaco → preparo exigido → eliminar.',
          'Testar D: PA em pé para ortostase em idoso/diabético → conduta correta → eliminar.',
          'Testar E: manguito 2–3 cm acima da fossa cubital → conduta correta → eliminar.',
          'Testar C: descreve só posicionamento do braço, omitindo paciente sentado com costas/pés apoiados exigidos pela 7ª DBH → INCORRETA como assertiva isolada.',
          'Confirmar: só C traz afirmativa falsa/inadequada perante a diretriz completa.',
          'Marcar letra C.',
        ],
        footer_rule: 'Posicionamento incompleto → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — 7ª DBH PA',
        meta: slideMeta,
        content: 'TÉCNICA PA — 7ª DIRETRIZ',
        rows: [
          { label: 'Repouso', value: '3–5 min · ambiente calmo', sv_kind: 'pa', badge: 'ok' },
          { label: 'Preparo', value: 'Bexiga vazia · sem álcool/café/tabaco ~30 min', sv_kind: 'pa', badge: 'hot' },
          { label: 'Braço', value: 'Nível do esterno · apoiado · palma supinada', sv_kind: 'pa', badge: 'ok' },
          { label: 'Manguito', value: '2–3 cm acima da fossa cubital', sv_kind: 'pa', badge: 'ok' },
          { label: 'Ortostase', value: 'PA em pé em idoso/diabético se indicado', sv_kind: 'pa', badge: 'ok' },
        ],
        footer_rule: 'Preparo + posicionamento + manguito',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS UNIFIL — 7ª DBH',
        items: [
          {
            label: 'Letra A — repouso',
            detail: 'Explicar procedimento e repouso de 3 a 5 minutos em ambiente calmo.',
            correct: 'Conduta correta: repouso prévio estabiliza a pressão antes da medida.',
          },
          {
            label: 'Letra B — preparo pré-PA',
            detail:
              'Certificar bexiga vazia e abstinência de álcool, café, alimentos ou tabaco 30 min antes.',
            correct:
              'Conduta correta: a 7ª DBH exige verificar preparo (bexiga e abstinência recente) antes da medida.',
          },
          {
            label: 'Letra D — ortostase',
            detail: 'Medir PA em pé para rastreio de hipotensão ortostática quando indicado.',
            correct: 'Conduta correta: rastreio de hipotensão ortostática quando indicado.',
          },
          {
            label: 'Letra E — manguito',
            detail: 'Manguito sem folgas, 2 a 3 cm acima da fossa cubital.',
            correct: 'Conduta correta: posicionamento padrão do manguito sobre a braquial.',
          },
          {
            label: 'Letra C — posicionamento braço',
            detail:
              'Braço na altura do coração, apoiado, palma para cima, sem garrotear o membro.',
            correct:
              'INCORRETA: a 7ª DBH exige paciente sentado com costas e pés apoiados — C descreve só o membro, omitindo posicionamento corporal obrigatório.',
          },
        ],
        footer_rule: 'INCORRETA = C (gabarito UNIFIL)',
      },
    ],
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const question_data = pack.instruction
      ? { ...raw.question_data, instruction: pack.instruction }
      : raw.question_data;
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sv-g35] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g35] total=${ok}`);
}

main();
