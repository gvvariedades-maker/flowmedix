#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g01 (8 slugs P0 vitals_pa_tecnica + vitals_fc_faixas).
 *
 *   npx tsx scripts/handcraft-sinais-vitais-g01.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g01';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-04';

const SV_SOURCE = {
  id: 'sv-adulto-referencia',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde / COFEN',
  title: 'Faixas de sinais vitais — repouso (adulto)',
  year: 2024,
  url: 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-crianca/publicacoes/caderneta-de-saude-da-crianca',
  covers: [
    'FC adulto 60–100 bpm',
    'FR adulto 12–20 irpm',
    'PA normotenso',
    'temperatura axilar',
    'técnica de aferição PA',
    'fases de Korotkoff',
    'pulso central × periférico',
    'conduta ante SV alterados',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Branch = 'vitals_pa_tecnica' | 'vitals_fc_faixas';

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo';
  branch: Branch;
  guideline: string;
  roi_error?: string;
  slides: unknown[];
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
    pedagogical_branch: pack.branch,
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: 'none',
      catalog_slug: slug,
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: [SV_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'ameosc-enfermagem-verificacao-de-sinais-vitais-1778969752567-3': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — PA: braço ao nível do coração · manguito 80% circunferência · repouso pré-aferição',
    roi_error: 'sv_tecnica_generica',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Boas práticas de SV — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário clínico',
            detail:
              'Idoso com tontura ao levantar — aferição fidedigna exige técnica correta antes de interpretar o número.',
            icon: 'User',
          },
          {
            label: 'Pressão arterial',
            detail:
              'Braço apoiado ao nível do coração (4º EIC) + manguito proporcional ao diâmetro do braço — eixo central da questão.',
            icon: 'HeartPulse',
          },
          {
            label: 'Frequência respiratória',
            detail:
              'Contagem discreta por 1 minuto completo — paciente não deve conversar durante a observação.',
            icon: 'Wind',
          },
          {
            label: 'Pulso / FC',
            detail:
              'Palpação com dedos indicador e médio — polegar tem pulso próprio e distorce a contagem.',
            icon: 'Activity',
          },
          {
            label: 'Temperatura',
            detail:
              'Aferir em repouso — atividade física recente eleva temperatura e invalida a leitura.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha AMEOSC',
            detail:
              'Banca mistura erro de técnica plausível (polegar, FR com conversa, temp pós-exercício) com conduta correta de PA.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Técnica correta antes de classificar NORMAL × ALTERADO',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Contexto: idoso com tontura ortostática — comando pede boa prática de aferição.',
          'Testar A — temperatura após exercício intenso: invalida leitura → eliminar.',
          'Testar B — pulso com polegar: dedo tem pulso próprio → eliminar.',
          'Testar C — contar FR enquanto paciente conversa: altera padrão respiratório → eliminar.',
          'Testar D — PA com braço ao nível do coração + manguito adequado: técnica MS/COFEN → candidata.',
          'Confirmar: só D descreve conduta correta de mensuração.',
          'Marcar D.',
          'Fixação: em MCQ de boas práticas, elimine erros de técnica antes de escolher a alternativa certa.',
        ],
        footer_rule: 'PA: nível coração + manguito certo → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica de SV',
        meta: slideMeta,
        content: '80% · CORAÇÃO · 5 MIN REPOUSO',
        rows: [
          {
            label: 'Manguito PA',
            value: 'Comprimento ≈ 80% da circunferência do braço',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Manguito inadequado superestima ou subestima PA.',
          },
          {
            label: 'Posição do braço',
            value: 'Apoiado ao nível do coração (4º EIC)',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Braço pendente ou elevado distorce a leitura.',
          },
          {
            label: 'Repouso pré-PA',
            value: '≥5 min sentado, sem falar, pés apoiados',
            sv_kind: 'meta',
            badge: 'ok',
          },
          {
            label: 'Palpação do pulso',
            value: 'Indicador + médio — nunca polegar',
            sv_kind: 'fc',
            badge: 'warn',
            exam_hint: 'Polegar tem pulso próprio — distrator B.',
          },
          {
            label: 'Contagem de FR',
            value: '1 minuto completo, discretamente, sem conversa',
            sv_kind: 'fr',
            badge: 'warn',
            exam_hint: 'Conversar durante FR altera ritmo — distrator C.',
          },
          {
            label: 'Temperatura',
            value: 'Repouso — não aferir após exercício intenso',
            sv_kind: 'temp',
            badge: 'warn',
            exam_hint: 'Atividade física eleva temp — distrator A.',
          },
          {
            label: 'Conclusão',
            value: 'Letra D — braço ao nível do coração + manguito adequado',
            sv_kind: 'meta',
            badge: 'hot',
          },
        ],
        footer_rule: 'Decore checklist PA antes de julgar alternativas de técnica',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — BOAS PRÁTICAS DE SV',
        items: [
          {
            label: 'Letra A — temperatura pós-exercício',
            detail: 'Sugere aferir temperatura após atividade física intensa para “refletir a realidade”.',
            correct:
              'Exercício eleva temperatura corporal — aferição deve ser em repouso para valor fidedigno.',
          },
          {
            label: 'Letra B — pulso com polegar',
            detail: 'Indica medir pulso preferencialmente com o polegar por ser “mais sensível”.',
            correct:
              'Polegar possui pulso arterial próprio — palpação correta usa indicador e médio sobre a artéria.',
          },
          {
            label: 'Letra C — FR com paciente conversando',
            detail: 'Propõe contar respirações enquanto o paciente conversa para evitar ansiedade.',
            correct:
              'Conversar altera frequência e profundidade respiratória — FR exige observação discreta por 1 minuto.',
          },
          {
            label: 'Confundir técnica com interpretação',
            detail: 'Aluno tenta classificar PA hipertensa/hipotensa quando a banca cobra procedimento.',
            correct:
              'Enunciado pede boa prática de aferição — foco em posicionamento e manguito, não em valores.',
          },
        ],
        footer_rule: 'Elimine erros de técnica (A, B, C) antes de confirmar D',
      },
    ],
  },

  'amauc-enfermagem-verificacao-de-sinais-vitais-1779344189558-7': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS — técnica PA: braço nível coração · pés apoiados · bexiga vazia · manguito calibrado',
    roi_error: 'pa_nivel_figado_pernas_cruzadas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica PA — mapa I–V',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Cinco afirmativas sobre fidedignidade da PA — julgue I–V antes de combinar letras.',
            icon: 'Target',
          },
          {
            label: 'Posição do paciente (I)',
            detail: 'Deitado ou sentado com apoio — posição válida desde que braço esteja correto.',
            icon: 'User',
          },
          {
            label: 'Nível do braço (II)',
            detail:
              'Pegadinha espacial: “nível do fígado” substitui “nível do coração” — item falso.',
            icon: 'GitCompare',
          },
          {
            label: 'Braço exposto (III)',
            detail: 'Membro nu, sem mangas apertadas — evita compressão extrínseca no manguito.',
            icon: 'CheckCircle',
          },
          {
            label: 'Postura das pernas (IV)',
            detail: 'Pernas cruzadas aumentam pressão e distorcem PA — item falso.',
            icon: 'XCircle',
          },
          {
            label: 'Bexiga cheia (V)',
            detail: 'Bexiga distendida eleva PA — paciente não deve estar com bexiga cheia.',
            icon: 'Droplets',
          },
        ],
        footer_rule: 'II e IV são os itens espaciais/posturais que mais caem em AMAUC',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: cinco itens I–V + combinações — tabela V/F primeiro.',
          'Julgar I: paciente deitado ou sentado? → VERDADEIRO — posição permitida.',
          'Julgar II: braço ao nível do fígado? → FALSO — referência é nível do coração (4º EIC).',
          'Julgar III: braço completamente nu? → VERDADEIRO — sem mangas interferindo.',
          'Julgar IV: relaxado com pernas cruzadas? → FALSO — pés apoiados, pernas descruzadas.',
          'Julgar V: não estar com bexiga cheia? → VERDADEIRO — distensão vesical altera PA.',
          'Conjunto correto: I, III e V.',
          'Eliminar A (inclui II), B (II e IV), C (IV), E (IV).',
          'Marcar D.',
          'Fixação: II (fígado×coração) e IV (pernas cruzadas) são filtros decisivos.',
        ],
        footer_rule: 'I=V · II=F · III=V · IV=F · V=V → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — checklist PA MS',
        meta: slideMeta,
        content: 'PA FIDEDIGNA — CHECKLIST DE PROVA',
        rows: [
          {
            label: 'Posição',
            value: 'Sentado ou deitado — braço apoiado',
            sv_kind: 'pa',
            badge: 'ok',
            exam_hint: 'Item I verdadeiro.',
          },
          {
            label: 'Nível do braço',
            value: 'Ao nível do CORAÇÃO — não do fígado',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Item II falso — pegadinha espacial.',
          },
          {
            label: 'Membro superior',
            value: 'Braço nu, sem mangas apertadas',
            sv_kind: 'pa',
            badge: 'ok',
            exam_hint: 'Item III verdadeiro.',
          },
          {
            label: 'Pernas',
            value: 'Pés apoiados, pernas NÃO cruzadas',
            sv_kind: 'meta',
            badge: 'warn',
            exam_hint: 'Item IV falso — pernas cruzadas elevam PA.',
          },
          {
            label: 'Bexiga',
            value: 'Evitar bexiga cheia antes da aferição',
            sv_kind: 'meta',
            badge: 'ok',
            exam_hint: 'Item V verdadeiro.',
          },
          {
            label: 'Manguito',
            value: 'Calibrado · 80% circunferência do braço',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Conclusão',
            value: 'I, III e V — letra D',
            sv_kind: 'meta',
            badge: 'hot',
          },
        ],
        footer_rule: 'Fígado ≠ coração · pernas cruzadas ≠ repouso adequado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA PA (I–V)',
        items: [
          {
            label: 'Letra A — I, II e III',
            detail: 'Mantém item II falso (nível do fígado) como verdadeiro.',
            correct:
              'Braço deve estar ao nível do coração — “fígado” é distrator anatômico clássico.',
          },
          {
            label: 'Letra B — II, III e IV',
            detail: 'Reúne II falso com IV falso (pernas cruzadas).',
            correct:
              'III é verdadeiro isoladamente, mas II e IV são falsos — combinação inválida.',
          },
          {
            label: 'Letra C — III, IV e V',
            detail: 'Aceita IV falso (pernas cruzadas) como conduta correta.',
            correct:
              'Pernas cruzadas aumentam pressão arterial — paciente deve estar com pés apoiados.',
          },
          {
            label: 'Letra E — I, III e IV',
            detail: 'Acerta I e III, mas inclui IV falso.',
            correct:
              'Relaxamento exige pernas descruzadas — IV invalida a combinação.',
          },
          {
            label: 'Confundir fígado com coração',
            detail: 'Aluno decora “nível do tronco” e aceita qualquer referência abdominal.',
            correct:
              'Referência anatômica da PA é o 4º EIC / nível do coração, não o fígado.',
          },
        ],
        footer_rule: 'Feche II e IV antes de montar I + III + V',
      },
    ],
  },

  'amauc-enfermagem-verificacao-de-sinais-vitais-1779344196733-2': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS — protocolo PA: após fase V Korotkoff, auscultar 20–30 mmHg abaixo para confirmar desaparecimento',
    roi_error: 'korotkoff_sequencia_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Protocolo MS — mensuração PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Pergunta o passo APÓS determinar diastólica na fase V de Korotkoff — sequência MS, não valor de HAS.',
            icon: 'Target',
          },
          {
            label: 'Contexto HAS',
            detail:
              'Texto introdutório sobre hipertensão é cenário — gabarito cobra técnica de aferição, não tratamento.',
            icon: 'BookOpen',
          },
          {
            label: 'Fases de Korotkoff',
            detail:
              'Fase I = início sistólica · fase V = desaparecimento dos sons (diastólica) — ordem importa.',
            icon: 'HeartPulse',
          },
          {
            label: 'Passo pós-fase V',
            detail:
              'Confirmar desaparecimento auscultando 20–30 mmHg abaixo do último som — eixo da questão.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha de ordem',
            detail:
              'Alternativas A–D descrevem passos ANTERIORES (sistólica, insuflação, deflação lenta, posicionamento).',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Leia “após o passo 8” — não confunda início × fim do protocolo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar recorte: APÓS determinar diastólica na fase V — passo seguinte, não passo 1–7.',
          'Testar A — determinar sistólica fase I + acelerar deflação: passo INICIAL → eliminar.',
          'Testar B — inflar 20–30 mmHg acima da sistólica palpada: passo de INSUFLAGEM → eliminar.',
          'Testar C — deflação lenta (protocolo MS): passo DURANTE a ausculta → eliminar.',
          'Testar D — palpar braquial + posicionar estetoscópio: passo de PREPARO → eliminar.',
          'Testar E — auscultar 20–30 mmHg abaixo do último som + deflação rápida final → candidata.',
          'Confirmar: só E descreve confirmação pós-fase V.',
          'Marcar E.',
          'Fixação: decore sequência MS antes de misturar passos de insuflação com confirmação diastólica.',
        ],
        footer_rule: 'Pós-fase V → auscultar 20–30 mmHg abaixo → letra E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — protocolo PA MS',
        meta: slideMeta,
        content: 'KOROTKOFF — SEQUÊNCIA MS',
        rows: [
          {
            label: 'Insuflação',
            value: '20–30 mmHg acima da sistólica estimada (palpação)',
            sv_kind: 'meta',
            badge: 'info',
            exam_hint: 'Alternativa B — passo anterior.',
          },
          {
            label: 'Posicionamento',
            value: 'Palpar braquial · estetoscópio sem compressão excessiva',
            sv_kind: 'meta',
            badge: 'info',
            exam_hint: 'Alternativa D — preparo inicial.',
          },
          {
            label: 'Deflação durante ausculta',
            value: 'Velocidade lenta e constante (protocolo MS)',
            sv_kind: 'meta',
            badge: 'ok',
            exam_hint: 'Alternativa C — durante, não após fase V.',
          },
          {
            label: 'Fase I Korotkoff',
            value: 'Primeiro som = pressão sistólica',
            sv_kind: 'pa',
            badge: 'ok',
            exam_hint: 'Alternativa A — início, não pós-fase V.',
          },
          {
            label: 'Fase V Korotkoff',
            value: 'Desaparecimento dos sons = diastólica',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Confirmação pós-fase V',
            value: 'Auscultar 20–30 mmHg abaixo do último som → deflação rápida completa',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Único passo após passo 8.',
          },
          {
            label: 'Conclusão',
            value: 'Letra E — confirmar desaparecimento dos sons Korotkoff',
            sv_kind: 'meta',
            badge: 'hot',
          },
        ],
        footer_rule: 'Ordem do protocolo > texto sobre HAS no enunciado',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PROTOCOLO KOROTKOFF',
        items: [
          {
            label: 'Letra A — fase I sistólica',
            detail: 'Descreve determinação da sistólica e aceleração da deflação — passo inicial.',
            correct:
              'Sistólica (fase I) é aferida antes da diastólica — enunciado pede passo APÓS fase V.',
          },
          {
            label: 'Letra B — insuflação rápida',
            detail: 'Cita inflar 20–30 mmHg acima da sistólica palpada.',
            correct:
              'Insuflação precede a ausculta — não é o passo posterior à determinação diastólica.',
          },
          {
            label: 'Letra C — deflação lenta',
            detail: 'Indica deflação lenta durante toda a mensuração (velocidade do protocolo MS).',
            correct:
              'Deflação lenta ocorre durante a ausculta; após fase V vem confirmação e deflação rápida final.',
          },
          {
            label: 'Letra D — palpação braquial',
            detail: 'Passo de posicionamento do estetoscópio na fossa cubital.',
            correct:
              'Preparo do manguito e estetoscópio é passo precoce — não responde “após passo 8”.',
          },
          {
            label: 'Foco no texto de HAS',
            detail: 'Aluno estuda tratamento antihipertensivo e ignora sequência técnica.',
            correct:
              'Introdução clínica é cenário — gabarito é técnica MS de mensuração.',
          },
        ],
        footer_rule: '“Após passo 8” = confirmação diastólica → E',
      },
    ],
  },

  'adm-tec-enfermagem-verificacao-de-sinais-vitais-1779343833455-6': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline: 'MS — adulto repouso: FC 60–100 bpm · FR 12–20 irpm · PA normotensa ~120×80 mmHg',
    roi_error: 'sv_faixas_invertidas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SV normais — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Identificar conjunto normocárdico + eupneico + normotenso — traduza cada sigla antes de comparar números.',
            icon: 'Target',
          },
          {
            label: 'Normocárdico',
            detail: 'FC adulto em repouso: 60 a 100 bpm — taquicardia >100 · bradicardia <60.',
            icon: 'HeartPulse',
          },
          {
            label: 'Eupneico',
            detail: 'FR adulto em repouso: 12 a 20 irpm — taquipneia >20.',
            icon: 'Wind',
          },
          {
            label: 'Normotenso',
            detail: 'PA compatível com repouso — ~120×80 mmHg é referência clássica de prova.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha numérica',
            detail:
              'Alternativas A e D trazem taquicardia + taquipneia + hipertensão; B traz bradicardia + hipotensão.',
            icon: 'Calculator',
          },
        ],
        footer_rule: 'Normocárdico + eupneico + normotenso = faixas centrais MS',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Decodificar comando: normocárdico (FC normal) + eupneico (FR normal) + normotenso (PA normal).',
          'Testar A — FC 130, FR 28, PA 160×100: taquicardia + taquipneia + hipertensão → eliminar.',
          'Testar B — FC 40, FR 10, PA 60×50: bradicardia + bradipneia + hipotensão → eliminar.',
          'Testar C — FC 90, FR 18, PA 120×80: todos dentro das faixas → candidata.',
          'Testar D — FC 130, FR 10, PA 200×100: taquicardia + bradipneia + hipertensão grave → eliminar.',
          'Confirmar: só C expressa adulto estável em repouso.',
          'Marcar C.',
          'Fixação: julgue FC, FR e PA separadamente antes de fechar a alternativa.',
        ],
        footer_rule: 'FC 90 · FR 18 · PA 120×80 → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas adulto repouso',
        meta: slideMeta,
        content: 'SV ADULTO — FAIXAS MS',
        rows: [
          {
            label: 'FC adulto',
            value: '60 a 100 bpm (normocárdico)',
            sv_kind: 'fc',
            badge: 'hot',
            exam_hint: 'C: 90 bpm ✓ · A/D: 130 ✗ · B: 40 ✗',
          },
          {
            label: 'FR adulto',
            value: '12 a 20 irpm (eupneico)',
            sv_kind: 'fr',
            badge: 'hot',
            exam_hint: 'C: 18 irpm ✓ · A: 28 ✗ · B: 10 ✗',
          },
          {
            label: 'PA adulto',
            value: 'Normotenso ~90–140 × 60–90 mmHg',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'C: 120×80 ✓ · A: 160×100 ✗ · B: 60×50 ✗',
          },
          {
            label: 'Taquicardia',
            value: 'FC > 100 bpm',
            sv_kind: 'fc',
            badge: 'warn',
          },
          {
            label: 'Taquipneia',
            value: 'FR > 20 irpm',
            sv_kind: 'fr',
            badge: 'warn',
          },
          {
            label: 'Mnemônico',
            value: '60–100 · 12–20 · ~120×80 = trio de repouso',
            sv_kind: 'meta',
          },
          {
            label: 'Conclusão',
            value: 'Letra C — FC 90 · FR 18 · PA 120×80 (normocárdico, eupneico, normotenso)',
            sv_kind: 'meta',
            badge: 'hot',
          },
        ],
        footer_rule: 'Decore trio FC–FR–PA antes de questões de classificação',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — FAIXAS NORMAIS',
        items: [
          {
            label: 'Letra A — FC 130 FR 28 PA 160×100',
            detail: 'Conjunto inteiro alterado: taquicardia, taquipneia e hipertensão.',
            correct:
              'Nenhum parâmetro está na faixa de repouso — paciente não é normocárdico/eupneico/normotenso.',
          },
          {
            label: 'Letra B — FC 40 FR 10 PA 60×50',
            detail: 'Bradicardia, bradipneia e hipotensão — perfil de instabilidade.',
            correct:
              'FC <60 e FR <12 indicam depressão cardiovascular/respiratória, não normalidade.',
          },
          {
            label: 'Letra D — FC 130 FR 10 PA 200×100',
            detail: 'Mistura taquicardia com bradipneia e crise hipertensiva.',
            correct:
              'Combinação incoerente com adulto estável — PA 200×100 é emergência, não repouso.',
          },
          {
            label: 'Julgar só um parâmetro',
            detail: 'Aluno vê FC 90 e marca C sem checar FR e PA.',
            correct:
              'Comando exige os três critérios simultâneos — valide FC, FR e PA antes de marcar.',
          },
        ],
        footer_rule: 'Três parâmetros normais juntos → só C',
      },
    ],
  },

  'ameosc-enfermagem-verificacao-de-sinais-vitais-1778969752567-7': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline: 'COFEN/MS — SV alterados: técnico comunica enfermeiro antes de intervir ou medicar',
    roi_error: 'sv_conduta_silenciosa',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SV alterados — mapa do caso',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário clínico',
            detail:
              'Unidade movimentada — múltiplos SV alterados simultaneamente exigem escalação, não rotina.',
            icon: 'User',
          },
          {
            label: 'Temperatura 38,5°C axilar',
            detail: 'Acima de 37,8°C axilar = febre — sinal de processo inflamatório/infeccioso.',
            icon: 'Thermometer',
          },
          {
            label: 'FC 110 bpm',
            detail: 'Acima de 100 bpm = taquicardia — pode acompanhar febre e desidratação.',
            icon: 'HeartPulse',
          },
          {
            label: 'FR 24 irpm',
            detail: 'Acima de 20 irpm = taquipneia — resposta respiratória a estresse/febre.',
            icon: 'Wind',
          },
          {
            label: 'PA elevada',
            detail: 'Pressão arterial acima da faixa normotensa — hipertensão no caso clínico.',
            icon: 'Activity',
          },
          {
            label: 'Papel do técnico',
            detail:
              'Registrar, reavaliar se indicado e comunicar alterações ao enfermeiro — não prescrever nem medicar autonomamente.',
            icon: 'Shield',
          },
        ],
        footer_rule: 'Quatro SV alterados → escalação imediata ao enfermeiro',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler valores do enunciado: febre + taquicardia + taquipneia + PA elevada — todos alterados.',
          'Classificar temperatura: 38,5°C axilar = febril.',
          'Classificar FC: 110 bpm = taquicárdico.',
          'Classificar FR: 24 irpm = taquipneico.',
          'Classificar PA: valores do caso = hipertensão.',
          'Testar A — registrar e manter rotina: omite escalação → eliminar.',
          'Testar B — repetir após 15 min sem comunicar: atrasa intervenção → eliminar.',
          'Testar C — comunicar enfermeiro responsável: conduta imediata adequada → candidata.',
          'Testar D — administrar antitérmico/anti-hipertensivo: exige prescrição → eliminar.',
          'Marcar C.',
          'Fixação: técnico identifica, registra e comunica — enfermeiro/médico decidem intervenção.',
        ],
        footer_rule: 'SV alterados múltiplos → comunicar enfermeiro → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação + conduta',
        meta: slideMeta,
        content: 'ALTERADO → COMUNICAR ENFERMEIRO',
        rows: [
          {
            label: 'Temp axilar ≥37,8°C',
            value: 'Febril — caso: 38,5°C',
            sv_kind: 'temp',
            badge: 'warn',
          },
          {
            label: 'FC > 100 bpm',
            value: 'Taquicardia — caso: 110 bpm',
            sv_kind: 'fc',
            badge: 'warn',
          },
          {
            label: 'FR > 20 irpm',
            value: 'Taquipneia — caso: 24 irpm',
            sv_kind: 'fr',
            badge: 'warn',
          },
          {
            label: 'PA elevada',
            value: 'Hipertensão — valores do caso acima da faixa normotensa',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'Conduta técnico',
            value: 'Registrar + comunicar enfermeiro responsável',
            sv_kind: 'meta',
            badge: 'hot',
            exam_hint: 'Gabarito C — escalação imediata.',
          },
          {
            label: 'Fora do escopo técnico',
            value: 'Prescrever ou administrar sem ordem médica',
            sv_kind: 'meta',
            badge: 'warn',
            exam_hint: 'Distrator D — viola segurança.',
          },
          {
            label: 'Conclusão',
            value: 'Letra C — comunicar alterações ao enfermeiro responsável',
            sv_kind: 'meta',
            badge: 'hot',
          },
        ],
        footer_rule: 'Classifique cada SV → escale alterações combinadas',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CONDUTA ANTE SV ALTERADOS',
        items: [
          {
            label: 'Letra A — registrar e manter rotina',
            detail: 'Propõe apenas anotar no prontuário e continuar cuidados habituais.',
            correct:
              'Quatro SV alterados simultaneamente exigem comunicação imediata — rotina não substitui escalação.',
          },
          {
            label: 'Letra B — repetir após 15 minutos',
            detail: 'Sugere reaferir sem comunicar alterações encontradas.',
            correct:
              'Reavaliação isolada atrasa intervenção — técnico deve comunicar enfermeiro ante achados alterados.',
          },
          {
            label: 'Letra D — administrar medicamentos',
            detail: 'Indica antitérmico e anti-hipertensivo conforme prescrição.',
            correct:
              'Administração depende de prescrição específica — conduta imediata do técnico é comunicar, não medicar.',
          },
          {
            label: 'Classificar um sinal só',
            detail: 'Marcar pela PA ou febre isolada e ignorar taquicardia/taquipneia.',
            correct:
              'Enunciado lista quatro parâmetros alterados — conduta deve considerar o conjunto.',
          },
        ],
        footer_rule: 'Alteração múltipla → comunicar enfermeiro (C)',
      },
    ],
  },

  'ameosc-enfermagem-verificacao-de-sinais-vitais-1778969760552-0': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS — PA: comparar braços · FR: contagem discreta · Temp: método influencia leitura',
    roi_error: 'pa_mesmo_braco_sem_relevancia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — PA · FR · temperatura',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Três afirmativas I–III sobre monitoramento — julgue antes de combinar letras.',
            icon: 'Target',
          },
          {
            label: 'Comparação entre braços (I)',
            detail:
              'Diferença >10–20 mmHg entre membros pode ser clínica — item falso ao negar relevância.',
            icon: 'GitCompare',
          },
          {
            label: 'FR discreta (II)',
            detail:
              'Observar respiração sem alertar paciente evita alteração involuntária — item verdadeiro.',
            icon: 'Wind',
          },
          {
            label: 'Métodos de temperatura (III)',
            detail:
              'Axilar, oral, retal e timpânica têm faixas e tempos distintos — item verdadeiro.',
            icon: 'Thermometer',
          },
          {
            label: 'Pegadinha item I',
            detail:
              '“Sempre mesmo braço sem relevância clínica” nega diferença significativa entre membros.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'I é falso · II e III verdadeiros → combinação A',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: três itens I–III + combinações — tabela V/F.',
          'Julgar I: PA sempre no mesmo braço sem relevância da diferença? → FALSO — diferença pode ser clínica.',
          'Julgar II: FR medida discretamente? → VERDADEIRO — evita alteração involuntária.',
          'Julgar III: método de temperatura influencia precisão? → VERDADEIRO — cada sítio tem particularidade.',
          'Conjunto correto: II e III apenas.',
          'Eliminar B (inclui I falso), C (I falso), D (só II).',
          'Marcar A.',
          'Fixação: item I nega diferença intermembro — filtro clássico AMEOSC.',
        ],
        footer_rule: 'I=F · II=V · III=V → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — PA · FR · temp',
        meta: slideMeta,
        content: 'MONITORAMENTO — REGRAS DE PROVA',
        rows: [
          {
            label: 'PA — braços',
            value: 'Comparar membros · diferença significativa = investigar',
            sv_kind: 'pa',
            badge: 'warn',
            exam_hint: 'Item I falso — diferença tem relevância.',
          },
          {
            label: 'PA — rotina',
            value: 'Usar mesmo braço na série — mas comparar se dúvida',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'FR — técnica',
            value: 'Contagem discreta por 1 minuto — paciente não percebe',
            sv_kind: 'fr',
            badge: 'hot',
            exam_hint: 'Item II verdadeiro.',
          },
          {
            label: 'Temperatura — métodos',
            value: 'Axilar · oral · retal · timpânica — faixas distintas',
            sv_kind: 'temp',
            badge: 'hot',
            exam_hint: 'Item III verdadeiro.',
          },
          {
            label: 'Febre axilar',
            value: '≥37,8°C — referência comum de prova',
            sv_kind: 'temp',
            badge: 'ok',
          },
          {
            label: 'Conclusão',
            value: 'II e III — letra A',
            sv_kind: 'meta',
            badge: 'hot',
          },
        ],
        footer_rule: 'Diferença entre braços importa — não generalize item I',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — I–III SV',
        items: [
          {
            label: 'Letra B — I, II e III',
            detail: 'Aceita item I falso como verdadeiro junto com II e III.',
            correct:
              'Diferença de PA entre braços pode ser clinicamente relevante — item I é falso.',
          },
          {
            label: 'Letra C — I e II',
            detail: 'Mantém I falso e exclui III verdadeiro sobre métodos de temperatura.',
            correct:
              'Sítio de aferição altera valor e tempo de leitura — III é verdadeiro.',
          },
          {
            label: 'Letra D — II apenas',
            detail: 'Acerta II, mas omite III verdadeiro.',
            correct:
              'Axilar ≠ oral ≠ retal — método influencia precisão (III verdadeiro).',
          },
          {
            label: 'Aceitar I por praticidade',
            detail: '“Sempre mesmo braço” parece conduta operacional correta.',
            correct:
              'Usar mesmo braço na série é rotina, mas negar relevância da diferença intermembro é erro conceitual.',
          },
        ],
        footer_rule: 'I falso elimina B e C — confirme III antes de marcar A',
      },
    ],
  },

  'ameosc-enfermagem-verificacao-de-sinais-vitais-1778969760552-1': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS — PA: repouso e postura · FC: palpação + oximetria complementar · FR: expansão torácica',
    roi_error: 'oximetro_substitui_palpacao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — monitoramento contínuo',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Três afirmativas sobre monitoramento — julgue I–III antes das combinações.',
            icon: 'Target',
          },
          {
            label: 'PA e interferências (I)',
            detail:
              'Estresse e postura alteram PA — repouso e posição adequada são pré-requisitos — item verdadeiro.',
            icon: 'HeartPulse',
          },
          {
            label: 'Oxímetro × palpação (II)',
            detail:
              'Oximetria mede SpO₂ e estima FC — NÃO substitui palpação radial/carotídea — item falso.',
            icon: 'GitCompare',
          },
          {
            label: 'FR e expansão torácica (III)',
            detail:
              'Observar expansão torácica + contar incursões/minuto garante aferição precisa — item verdadeiro.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha tecnológica',
            detail: 'Item II absolutiza oxímetro como substituto total da palpação — erro clássico.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'II falso (oxímetro ≠ palpação) · I e III verdadeiros',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: I–III + combinações — julgar cada item.',
          'Julgar I: PA com paciente em repouso e posição adequada? → VERDADEIRO — estresse/postura interferem.',
          'Julgar II: oxímetro substitui totalmente palpação radial/carotídea? → FALSO — complementar, não substituto.',
          'Julgar III: FR por expansão torácica + incursões/min? → VERDADEIRO — técnica padrão.',
          'Conjunto correto: I e III.',
          'Eliminar A (inclui II falso), C (só II falso), D (II falso).',
          'Marcar B.',
          'Fixação: oxímetro complementa FC/SpO₂ — palpação permanece essencial.',
        ],
        footer_rule: 'I=V · II=F · III=V → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — monitoramento SV',
        meta: slideMeta,
        content: 'EQUIPAMENTO COMPLEMENTA — NÃO SUBSTITUI',
        rows: [
          {
            label: 'PA — repouso',
            value: '≥5 min sentado · sem estresse · postura adequada',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Item I verdadeiro.',
          },
          {
            label: 'PA — interferências',
            value: 'Estresse · postura · pernas cruzadas · bexiga cheia',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'FC — palpação',
            value: 'Radial ou carotídea · indicador + médio · 60 segundos',
            sv_kind: 'fc',
            badge: 'hot',
            exam_hint: 'Palpação não é substituída por oxímetro.',
          },
          {
            label: 'Oxímetro de pulso',
            value: 'SpO₂ + estimativa FC — complementar à palpação',
            sv_kind: 'spo2',
            badge: 'warn',
            exam_hint: 'Item II falso — “substitui totalmente”.',
          },
          {
            label: 'FR — técnica',
            value: 'Expansão torácica + incursões por minuto',
            sv_kind: 'fr',
            badge: 'hot',
            exam_hint: 'Item III verdadeiro.',
          },
          {
            label: 'Conclusão',
            value: 'I e III — letra B',
            sv_kind: 'meta',
            badge: 'hot',
          },
        ],
        footer_rule: 'Oxímetro + palpação = dupla verificação, não substituição',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MONITORAMENTO (I–III)',
        items: [
          {
            label: 'Letra A — I, II e III',
            detail: 'Aceita II falso — oxímetro substituindo totalmente a palpação.',
            correct:
              'Oximetria estima FC e mede SpO₂, mas palpação radial/carotídea permanece método essencial de confirmação.',
          },
          {
            label: 'Letra C — II apenas',
            detail: 'Marca só o item falso como conjunto correto.',
            correct:
              'II é falso, mas I e III são verdadeiros — gabarito exige I + III (letra B).',
          },
          {
            label: 'Letra D — I e II',
            detail: 'Acerta I, mas inclui II falso e exclui III verdadeiro.',
            correct:
              'FR exige observação de expansão torácica (III verdadeiro) — II invalida a combinação.',
          },
          {
            label: 'Confiar só no oxímetro',
            detail: 'Equipamento digital parece mais preciso que palpação manual.',
            correct:
              'Oxímetro falha com perfusão baixa, movimento e unhas — palpação confirma FC em contexto clínico.',
          },
        ],
        footer_rule: 'II falso elimina A e D — confirme III → letra B',
      },
    ],
  },

  'ameosc-enfermagem-verificacao-de-sinais-vitais-1778969760552-7': {
    family: 'conceito',
    branch: 'vitals_fc_faixas',
    guideline: 'MS/Potter — pulso central: carótida · femoral · aorta; periférico: radial · ulnar · poplítea',
    roi_error: 'pulso_central_periferico',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pulso central × periférico',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Identificar artéria de pulso CENTRAL — distingue de membros periféricos na prova.',
            icon: 'Target',
          },
          {
            label: 'Pulso central',
            detail:
              'Artérias próximas ao coração — carótida, femoral, aorta — refletem débito cardíaco direto.',
            icon: 'Heart',
          },
          {
            label: 'Pulso periférico',
            detail:
              'Artérias distais — radial, ulnar, poplítea, pediosa — avaliam perfusão periférica.',
            icon: 'Activity',
          },
          {
            label: 'Artéria femoral',
            detail:
              'Grande vaso central na virilha — palpação clássica de emergência e RCP avançada.',
            icon: 'HeartPulse',
          },
          {
            label: 'Distratores da banca',
            detail: 'Radial, ulnar e poplítea são periféricos — pegadinha anatômica frequente.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Central = grande vaso · periférico = extremidade',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: assinalar artéria de pulso CENTRAL.',
          'Testar A — artéria radial: pulso de punho, periférico → eliminar.',
          'Testar B — artéria ulnar: antebraço, periférico → eliminar.',
          'Testar C — artéria femoral: virilha, vaso central → candidata.',
          'Testar D — artéria poplítea: fossa poplítea, periférico → eliminar.',
          'Confirmar: só femoral é pulso central entre as alternativas.',
          'Marcar C.',
          'Fixação: femoral e carótida = centrais · radial = rotina periférica.',
        ],
        footer_rule: 'Femoral = central → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — locais de pulso',
        meta: slideMeta,
        content: 'CENTRAL × PERIFÉRICO',
        rows: [
          {
            label: 'Pulso central',
            value: 'Carótida · femoral · aorta',
            sv_kind: 'fc',
            badge: 'hot',
            exam_hint: 'Femoral = gabarito C.',
          },
          {
            label: 'Artéria femoral',
            value: 'Virilha — palpação de emergência',
            sv_kind: 'fc',
            badge: 'hot',
          },
          {
            label: 'Pulso periférico',
            value: 'Radial · ulnar · poplítea · pediosa',
            sv_kind: 'fc',
            badge: 'ok',
          },
          {
            label: 'Artéria radial',
            value: 'Punho — aferição de rotina FC',
            sv_kind: 'fc',
            badge: 'warn',
            exam_hint: 'Alternativa A — periférico.',
          },
          {
            label: 'FC adulto repouso',
            value: '60 a 100 bpm',
            sv_kind: 'fc',
            badge: 'ok',
          },
          {
            label: 'Mnemônico',
            value: 'Central = “grande vaso” · periférico = extremidade',
            sv_kind: 'meta',
          },
          {
            label: 'Conclusão',
            value: 'Letra C — artéria femoral (pulso central)',
            sv_kind: 'meta',
            badge: 'hot',
          },
        ],
        footer_rule: 'Decore femoral/carótida como centrais antes da prova',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PULSO CENTRAL',
        items: [
          {
            label: 'Letra A — artéria radial',
            detail: 'Pulso mais usado na rotina de enfermagem — seduz pelo hábito clínico.',
            correct:
              'Radial é pulso periférico do punho — não é artéria central.',
          },
          {
            label: 'Letra B — artéria ulnar',
            detail: 'Par do radial no antebraço — também periférico.',
            correct:
              'Ulnar palpa-se na face medial do punho — classificação periférica.',
          },
          {
            label: 'Letra D — artéria poplítea',
            detail: 'Localizada na fossa poplítea posterior — parece “grande”, mas é distal.',
            correct:
              'Poplítea é pulso periférico de membro inferior — não central como femoral.',
          },
          {
            label: 'Confundir rotina com central',
            detail: 'Aluno marca radial porque é o pulso que mais aferiu na prática.',
            correct:
              'Questão pede especificamente pulso central — femoral ou carótida, não punho.',
          },
        ],
        footer_rule: 'Radial/ulnar/poplítea = periféricos · femoral = central (C)',
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
    const out = {
      meta: metaBase(raw, pack, slug),
      question_data: raw.question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:sv-g01] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g01] total=${ok}`);
}

main();
