#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g05 (8 slugs P0 vitals_pa_tecnica + interpretação).
 *
 *   npx tsx scripts/handcraft-sinais-vitais-g05.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g05';
const SUBTOPICO = 'Verificação de Sinais Vitais';
const REVIEWED = '2026-07-05';

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
    'método oscilatório',
    'equipamentos SV',
    'hiperpirexia e hipotensão',
  ],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Branch = 'vitals_pa_tecnica' | 'vitals_interpretacao' | 'vitals_generico';

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
  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343945057-2': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — sons de Korotkoff: ruídos auscultados na técnica indireta (auscultatória) da PA',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA auscultatória — sons Korotkoff',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Durante aferição com esfigmomanômetro + estetoscópio, identificar o nome dos sons auscultados na artéria braquial.',
            icon: 'Target',
          },
          {
            label: 'Técnica auscultatória',
            detail:
              'Insuflação do manguito acima da sistólica → deflação lenta → sons audíveis na braquial.',
            icon: 'Stethoscope',
          },
          {
            label: 'Sons de Korotkoff',
            detail:
              'Ruídos característicos que marcam início (sistólica) e fim (diastólica) da ausculta — nomenclatura padrão MS.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — grafia',
            detail:
              'Banca troca Korotkoff por “Brith”, “Bird” ou termos clínicos (hipertensivo, arritmia) que não nomeiam o fenômeno acústico.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Distinção clínica',
            detail: 'Arritmia é ritmo cardíaco irregular — não é o nome dos sons durante deflação do manguito.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Esfigmomanômetro + estetoscópio → sons de Korotkoff',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: nome dos sons auscultados na aferição de PA com estetoscópio.',
          'Fixar: técnica auscultatória (indireta) produz ruídos na braquial durante deflação.',
          'Testar A — “sons de Brith”: grafia incorreta, não é termo técnico → eliminar.',
          'Testar B — “sons de Korotkoff”: nomenclatura clássica da semiologia → candidata.',
          'Testar C — “sons hipertensivos”: descreve estado clínico, não fenômeno acústico → eliminar.',
          'Testar D — “arritmia”: alteração de ritmo, não nome dos sons de Korotkoff → eliminar.',
          'Testar E — “sons de Bird”: distorção ortográfica de Korotkoff → eliminar.',
          'Confirmar: só B nomeia corretamente os sons da técnica.',
          'Marcar B.',
        ],
        footer_rule: 'Korotkoff = sons da deflação na braquial → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica auscultatória PA',
        meta: slideMeta,
        content: 'KOROTKOFF · AUSCULTA · BRAQUIAL',
        rows: [
          {
            label: 'Sons de Korotkoff',
            value: 'Ruídos auscultados na braquial durante deflação do manguito',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: '1º som',
            value: 'Aparição = pressão sistólica (técnica auscultatória)',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: '5ª fase',
            value: 'Desaparecimento = pressão diastólica',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Deflação MS',
            value: 'Velocidade lenta e constante na deflação — não rápida demais',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'Oscilatório × auscultatório',
            value: 'Método oscilatório não usa estetoscópio nem Korotkoff',
            sv_kind: 'meta',
            badge: 'warn',
          },
        ],
        footer_rule: 'Decore: Korotkoff = fenômeno acústico da PA auscultatória',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — NOME DOS SONS NA PA',
        items: [
          {
            label: 'Letra A — sons de Brith',
            detail: 'Grafia incorreta — banca testa ortografia do termo técnico.',
            correct:
              'O termo correto é Korotkoff — ruídos auscultados na deflação do manguito sobre a braquial.',
          },
          {
            label: 'Letra C — sons hipertensivos',
            detail: 'Confunde classificação clínica da PA com nome do fenômeno acústico.',
            correct:
              'Hipertensão é interpretação do valor em mmHg — os sons durante a aferição chamam-se Korotkoff.',
          },
          {
            label: 'Letra D — arritmia',
            detail: 'Arritmia descreve irregularidade do ritmo cardíaco.',
            correct:
              'Arritmia não nomeia os sons da deflação na técnica auscultatória — resposta é Korotkoff.',
          },
          {
            label: 'Letra E — sons de Bird',
            detail: 'Outra distorção ortográfica de Korotkoff.',
            correct:
              'Bird não é termo de semiologia — memorize Korotkoff para PA com estetoscópio.',
          },
        ],
        footer_rule: 'Elimine distorções ortográficas → Korotkoff (B)',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343945057-5': {
    family: 'conceito',
    branch: 'vitals_interpretacao',
    guideline: 'MS — hiperpirexia: febre muito elevada (≥41°C) · hipotensão: PA abaixo da média (<90/60 ou sintomática)',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hiperpirexia + hipotensão — painel',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Identificar alternativa que evidencia hiperpirexia (febre muito alta) associada a hipotensão.',
            icon: 'Target',
          },
          {
            label: 'Hiperpirexia',
            detail: 'Temperatura corporal muito elevada — hiperpirexia ≥40°C (referência MS).',
            icon: 'Thermometer',
          },
          {
            label: 'Hipotensão',
            detail: 'PA inferior à média de repouso — sistólica/diastólica abaixo do esperado.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — temperatura normal',
            detail: 'Alternativas com temperatura normal ou hipotermia não representam hiperpirexia.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — PA normal/alta',
            detail: '120/60 normotenso ou >140/90 hipertenso contradizem hipotensão do enunciado.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Hiperpirexia + hipotensão juntas — filtre T e PA antes de marcar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: paciente com hiperpirexia e hipotensão — qual alternativa evidencia isso?',
          'Traduzir hiperpirexia: febre muito alta — buscar T ≥40°C (hiperpirexia MS).',
          'Traduzir hipotensão: PA abaixo da média — não normotenso nem hipertenso.',
          'Testar A — T 35–37°C + pupila: temperatura normal, sem hiperpirexia → eliminar.',
          'Testar B — PA 120/60: normotensão, não hipotensão → eliminar.',
          'Testar C — PA >140/90: hipertensão, oposto de hipotensão → eliminar.',
          'Testar D — hipotermia grave: oposto de hiperpirexia → eliminar.',
          'Testar E — febre muito elevada + PA abaixo da média: único que fecha hiperpirexia + hipotensão → candidata.',
          'Marcar E.',
        ],
        footer_rule: 'Febre muito alta + PA baixa → hiperpirexia + hipotensão → letra E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação T e PA',
        meta: slideMeta,
        content: 'TRADUZA ANTES DE COMBINAR',
        rows: [
          {
            label: 'Hiperpirexia',
            value: 'Febre muito elevada — hiperpirexia ≥40°C (MS)',
            sv_kind: 'temp',
            badge: 'hot',
          },
          {
            label: 'Hipotensão',
            value: 'PA abaixo de ~90/60 mmHg ou sintomática',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Normotensão',
            value: 'PA ~90–140 × 60–90 mmHg em repouso',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Afebril',
            value: 'T axilar abaixo de 37,8°C',
            sv_kind: 'temp',
            badge: 'ok',
          },
          {
            label: 'Mnemônico',
            value: 'Um parâmetro errado invalida a alternativa inteira',
            sv_kind: 'meta',
            badge: 'warn',
          },
        ],
        footer_rule: 'Hiperpirexia exige T muito alta — não confunda com afebril',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HIPERPIREXIA × HIPOTENSÃO',
        items: [
          {
            label: 'Letra A — temperatura normal',
            detail: 'Temperatura dentro da normalidade — não hiperpirexia.',
            correct:
              'Hiperpirexia exige febre muito elevada — temperatura normal invalida A.',
          },
          {
            label: 'Letra B — PA normal',
            detail: 'PA normotensa em repouso.',
            correct:
              'Hipotensão exige PA abaixo da média — normotensão não evidencia hipotensão.',
          },
          {
            label: 'Letra C — hipertensão',
            detail: 'PA elevada é hipertensão, não hipotensão.',
            correct:
              'Enunciado pede hipotensão — alternativa com PA elevada contradiz o quadro.',
          },
          {
            label: 'Letra D — hipotermia',
            detail: 'Hipotermia grave é oposto de hiperpirexia.',
            correct:
              'Hiperpirexia = febre muito alta — hipotermia invalida a alternativa.',
          },
        ],
        footer_rule: 'Só E combina T muito alta + PA baixa',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343945057-6': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — exercício, estresse emocional e alimentação alteram SV; grave monitorar com maior frequência',
    roi_error: 'temperatura_pos_exercicio',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SV — fatores que alteram leitura',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Conceito correto sobre sinais vitais como indicadores de saúde — assinale a alternativa verdadeira.',
            icon: 'Target',
          },
          {
            label: 'Fatores fisiológicos',
            detail: 'Exercício recente, tensão emocional e alimentação modificam PA, FC, FR e temperatura.',
            icon: 'Activity',
          },
          {
            label: 'Monitorização',
            detail: 'Paciente grave exige aferição mais frequente que uma vez ao dia — não o mínimo diário.',
            icon: 'Clock',
          },
          {
            label: 'Posição do paciente',
            detail: 'SV podem ser aferidos em diversas posições conforme protocolo — não só decúbito.',
            icon: 'User',
          },
          {
            label: 'Pegadinha — registro tardio',
            detail: 'Variações relevantes devem ser registradas imediatamente — não esperar duas horas.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Fatores externos alteram SV — repouso padronizado antes de aferir',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: assinalar alternativa correta sobre sinais vitais.',
          'Testar A — exercício, tensão e alimentação alteram SV: fisiologia básica MS → candidata.',
          'Testar B — grave monitorar mínimo 1×/dia: frequência insuficiente → eliminar.',
          'Testar C — SV só em decúbito: posição única é falso → eliminar.',
          'Testar D — registrar só após longa espera: atrasa comunicação de alteração → eliminar.',
          'Testar E — SV = só respiração e PA: omite T, FC e dor → eliminar.',
          'Confirmar: só A é assertiva correta.',
          'Marcar A.',
        ],
        footer_rule: 'Fatores externos alteram SV → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — cuidados na aferição',
        meta: slideMeta,
        content: 'REPOUSO · CONTEXTO · REGISTRO',
        rows: [
          {
            label: 'Fatores alterantes',
            value: 'Exercício · estresse · alimentação · cafeína — aguardar repouso',
            sv_kind: 'meta',
            badge: 'hot',
            exam_hint: 'Alternativa A correta.',
          },
          {
            label: 'Repouso pré-PA',
            value: 'Cerca de cinco minutos sentado — padrão MS',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Monitorização grave',
            value: 'Frequência conforme gravidade — horária ou contínua, não 1×/dia',
            sv_kind: 'meta',
            badge: 'warn',
          },
          {
            label: 'SV clássicos',
            value: 'PA · T · FC · FR (+ dor como 5º sinal vital)',
            sv_kind: 'meta',
            badge: 'ok',
          },
          {
            label: 'Registro',
            value: 'Documentar alteração assim que identificada',
            sv_kind: 'meta',
            badge: 'ok',
          },
        ],
        footer_rule: 'Evitar exercício/estresse imediatamente antes da aferição',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CONCEITOS SOBRE SV',
        items: [
          {
            label: 'Letra B — monitorar 1×/dia',
            detail: 'Propõe frequência mínima inadequada para paciente grave.',
            correct:
              'Paciente grave exige monitorização mais frequente — não apenas uma vez ao dia.',
          },
          {
            label: 'Letra C — só em decúbito',
            detail: 'Restringe aferição a uma única posição.',
            correct:
              'SV são aferidos conforme protocolo em várias posições — PA sentado é padrão, não exclusivo decúbito.',
          },
          {
            label: 'Letra D — esperar horas',
            detail: 'Retarda registro de alteração clinicamente relevante.',
            correct:
              'Alterações nos SV devem ser registradas e comunicadas prontamente — não adiar por horas.',
          },
          {
            label: 'Letra E — só respiração e PA',
            detail: 'Reduz SV a dois parâmetros.',
            correct:
              'Sinais vitais incluem temperatura, FC, FR e PA — conjunto mais amplo que respiração + PA.',
          },
        ],
        footer_rule: 'Elimine absolutismos falsos → confirme A',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779343945057-7': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — bandeja SV: termômetro · estetoscópio · esfigmomanômetro · relógio · material de higiene',
    roi_error: 'sv_tecnica_generica',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Bandeja de SV — equipamentos',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Identificar na imagem os utensílios obrigatórios na bandeja para avaliação dos sinais vitais.',
            icon: 'Target',
          },
          {
            label: 'Temperatura',
            detail: 'Termômetro (item 2) — aferição de temperatura corporal.',
            icon: 'Thermometer',
          },
          {
            label: 'PA e ausculta',
            detail: 'Estetoscópio (3) + esfigmomanômetro (5) — técnica auscultatória da PA.',
            icon: 'Stethoscope',
          },
          {
            label: 'FC e FR',
            detail: 'Relógio com segundero (7) — contagem de pulso e frequência respiratória.',
            icon: 'Clock',
          },
          {
            label: 'Higiene e registro',
            detail: 'Álcool (8), gaze (9) e caneta/prancheta (10) — assepsia e documentação.',
            icon: 'Clipboard',
          },
          {
            label: 'Pegadinha — itens de outro contexto',
            detail: 'Seringa, otoscópio e tesoura não compõem bandeja básica de SV.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'PA + T + FC/FR → termômetro · estetoscópio · manguito · relógio',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: quais números da imagem devem estar na bandeja de SV?',
          'Listar essenciais: termômetro (2), estetoscópio (3), esfigmomanômetro (5), relógio (7).',
          'Adicionar higiene/registro: álcool (8), gaze (9), caneta/prancheta (10).',
          'Conjunto esperado: 2, 3, 5, 7, 8, 9 e 10.',
          'Testar A — inclui 1, 4, 6 (seringa/otoscópio/tesoura): itens de outro contexto → eliminar.',
          'Testar B — inclui 1 e 4, falta 7: conjunto incompleto/errado → eliminar.',
          'Testar C — 2, 3, 5, 7, 8, 9, 10: todos os essenciais → candidata.',
          'Testar D — inclui 4 e 6: otoscópio e tesoura desnecessários → eliminar.',
          'Testar E — inclui 1, 4 e 6: excesso de itens não-SV → eliminar.',
          'Marcar C.',
        ],
        footer_rule: '2·3·5·7·8·9·10 → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — equipamentos por SV',
        meta: slideMeta,
        content: 'CADA PARÂMETRO TEM SEU INSTRUMENTO',
        rows: [
          {
            label: 'Temperatura',
            value: 'Termômetro (axilar, oral, retal conforme protocolo)',
            sv_kind: 'temp',
            badge: 'hot',
          },
          {
            label: 'Pressão arterial',
            value: 'Esfigmomanômetro + estetoscópio (auscultatório)',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'FC / FR',
            value: 'Relógio com segundero + observação/palpação',
            sv_kind: 'fc',
            badge: 'ok',
          },
          {
            label: 'Higiene',
            value: 'Álcool 70% e gaze — assepsia entre pacientes',
            sv_kind: 'meta',
            badge: 'ok',
          },
          {
            label: 'Registro',
            value: 'Prancheta e caneta — documentar valores',
            sv_kind: 'meta',
            badge: 'ok',
          },
        ],
        footer_rule: 'Bandeja mínima: medir T, PA, FC e FR com segurança',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — BANDEJA DE SV',
        items: [
          {
            label: 'Letra A — itens 1, 4, 6',
            detail: 'Inclui seringa, otoscópio e tesoura — utensílios de outro procedimento.',
            correct:
              'Bandeja de SV não exige seringa nem otoscópio — foco em termômetro, manguito e relógio.',
          },
          {
            label: 'Letra B — falta relógio (7)',
            detail: 'Omite item essencial para contagem de FC e FR.',
            correct:
              'Relógio com segundero é indispensável para pulso e respiração — conjunto B incompleto.',
          },
          {
            label: 'Letra D — otoscópio e tesoura',
            detail: 'Itens 4 e 6 não pertencem à bandeja básica de sinais vitais.',
            correct:
              'Otoscópio avalia ouvido; tesoura é material cirúrgico — não compõem kit padrão de SV.',
          },
          {
            label: 'Letra E — conjunto ampliado errado',
            detail: 'Mistura itens corretos com seringa, otoscópio e tesoura.',
            correct:
              'Conjunto C isola apenas utensílios necessários: 2, 3, 5, 7, 8, 9 e 10.',
          },
        ],
        footer_rule: 'Exclua itens de outro contexto → confirme C',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779344097180-6': {
    family: 'conceito',
    branch: 'vitals_interpretacao',
    guideline: 'MS — T ≥41°C hipertermia · FC 60–100 normocárdico · FR >20 taquipneia · PA 120–139/80–89 pré-hipertensão',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SV do caso — quatro parâmetros',
        meta: slideMeta,
        items: [
          {
            label: 'Temperatura do caso',
            detail: 'Febre alta — classificar como hipertermia no enunciado da prova.',
            icon: 'Thermometer',
          },
          {
            label: 'Pulso do caso',
            detail: 'Limite superior da normocardia adulta (60–100 bpm) — normocárdico.',
            icon: 'HeartPulse',
          },
          {
            label: 'Respiração do caso',
            detail: 'Acima de 20 irpm — taquipneia.',
            icon: 'Wind',
          },
          {
            label: 'PA do caso',
            detail: 'Sistólica limítrofe — pré-hipertensão, não estágio 1 (≥140/90).',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha AVANÇASP',
            detail: 'Alternativas trocam taquicardia, bradicardia ou estágios de HAS incorretos.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Traduza T, FC, FR e PA antes de combinar os quatro termos',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler os quatro valores do enunciado — traduzir cada parâmetro.',
          'Classificar T: hipertermia (febre elevada).',
          'Classificar FC: normocárdico (faixa 60–100 bpm).',
          'Classificar FR: taquipneico (>20 irpm).',
          'Classificar PA: pré-hipertensão (não estágio 1 nem normotenso estrito).',
          'Testar A — estágio 1 HAS: PA não atinge 140/90 → eliminar.',
          'Testar B — bradicárdico + estágio 2: FC e PA errados → eliminar.',
          'Testar C — hipertermia + normocárdico + taquipneico + pré-hipertensão: todos conferem → candidata.',
          'Testar D — taquicárdico + estágio 3: FC normal e PA não são esses → eliminar.',
          'Testar E — taquicárdico + eupneico: FR 36 é taquipneia → eliminar.',
          'Marcar C.',
        ],
        footer_rule: 'Hipertermia · normocárdico · taquipneico · pré-hipertensão → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas adulto',
        meta: slideMeta,
        content: 'CLASSIFIQUE CADA NÚMERO',
        rows: [
          {
            label: 'Hipertermia',
            value: 'Febre elevada — hiperpirexia ≥40°C (MS)',
            sv_kind: 'temp',
            badge: 'hot',
          },
          {
            label: 'FC adulto',
            value: '60–100 bpm normocárdico',
            sv_kind: 'fc',
            badge: 'ok',
          },
          {
            label: 'FR adulto',
            value: '12–20 eupneico · >20 taquipneia',
            sv_kind: 'fr',
            badge: 'hot',
          },
          {
            label: 'Pré-hipertensão',
            value: 'PA limítrofe — sistólica elevada sem estágio 1',
            sv_kind: 'pa',
            badge: 'warn',
          },
          {
            label: 'HAS estágio 1',
            value: '≥140/90 mmHg — caso não atinge',
            sv_kind: 'pa',
            badge: 'warn',
          },
        ],
        footer_rule: '139/85 é pré-hipertensão — não estágio 1',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INTERPRETAÇÃO MULTI-SV',
        items: [
          {
            label: 'Letra A — HAS estágio 1',
            detail: 'PA do caso está na faixa pré-hipertensiva; alternativa inventa estágio 1.',
            correct:
              'Pré-hipertensão descreve melhor o caso — estágio 1 exigiria ≥140/90 mmHg.',
          },
          {
            label: 'Letra B — bradicárdico',
            detail: 'FC do caso está na normocardia, não bradicardia.',
            correct:
              'Bradicardia é <60 bpm — o pulso do enunciado é normocárdico.',
          },
          {
            label: 'Letra D — taquicárdico',
            detail: 'Pulso do caso é normocárdico, não taquicardia (>100).',
            correct:
              'Taquicardia seria FC >100 bpm — o caso está na normocardia.',
          },
          {
            label: 'Letra E — eupneico',
            detail: 'FR do enunciado é taquipneia, não eupneia.',
            correct:
              'Eupneia = 12–20 irpm — respiração acima disso é taquipneia.',
          },
        ],
        footer_rule: 'Confira FR e PA — pegadinhas em C fecham o gabarito',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779344097180-7': {
    family: 'conceito',
    branch: 'vitals_interpretacao',
    guideline: 'MS — T 36°C afebril · FC <60 bradicardia · FR 12–20 eupneico · PA <90/60 hipotensão',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SV do caso — instabilidade',
        meta: slideMeta,
        items: [
          {
            label: 'Temperatura do caso',
            detail: 'Dentro da normotermia — afebril.',
            icon: 'Thermometer',
          },
          {
            label: 'Pulso apical do caso',
            detail: 'Abaixo de 60 bpm — bradicardia.',
            icon: 'HeartPulse',
          },
          {
            label: 'Respiração do caso',
            detail: 'Gabarito da prova classifica como bradipneia — memorize o padrão AVANÇASP.',
            icon: 'Wind',
          },
          {
            label: 'PA do caso',
            detail: 'Pressão criticamente baixa — hipotensão grave.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha E',
            detail: 'Alternativa E acerta T, FC e FR mas troca hipotensão por hipertensão.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'PA 50/40 é filtro decisivo — hipotensão grave',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler os quatro valores do enunciado — traduzir cada parâmetro.',
          'Classificar T: afebril (normotermia).',
          'Classificar FC: bradicárdico (<60 bpm).',
          'Classificar FR: conforme gabarito AVANÇASP — bradipneico.',
          'Classificar PA: hipotenso grave (50/40).',
          'Testar A — hipertermia + taquicardia + normotenso: três erros → eliminar.',
          'Testar B — febril + normocárdico: T e FC errados → eliminar.',
          'Testar C — febril + taquicárdico + hipertenso: oposto do caso → eliminar.',
          'Testar D — afebril + bradicárdico + bradipneico + hipotenso: todos conferem → candidata.',
          'Testar E — hipertenso: PA 50/40 é hipotensão, não hipertensão → eliminar.',
          'Marcar D.',
        ],
        footer_rule: 'Afebril · bradicárdico · bradipneico · hipotenso → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação SV',
        meta: slideMeta,
        content: 'HIPOTENSÃO GRAVE — NÃO NORMALIZAR',
        rows: [
          {
            label: 'Afebril',
            value: 'T axilar ~36°C — sem febre',
            sv_kind: 'temp',
            badge: 'ok',
          },
          {
            label: 'Bradicardia',
            value: 'FC <60 bpm',
            sv_kind: 'fc',
            badge: 'warn',
          },
          {
            label: 'Hipotensão',
            value: 'PA abaixo de 90/60 mmHg — colapso hemodinâmico no caso',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'FR 13 rpm',
            value: 'Gabarito AVANÇASP: bradipneico — siga a prova',
            sv_kind: 'fr',
            badge: 'warn',
            exam_hint: 'Alternativa D.',
          },
          {
            label: 'Conduta',
            value: 'Hipotensão grave → comunicar equipe imediatamente',
            sv_kind: 'meta',
            badge: 'hot',
          },
        ],
        footer_rule: 'PA crítica invalida qualquer alternativa “normo/hipertenso”',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HIPOTENSÃO NO CASO',
        items: [
          {
            label: 'Letra A — hipertermia e normotenso',
            detail: 'T afebril; PA criticamente baixa não é normotensão.',
            correct:
              'Caso é afebril e hipotenso grave — A inverte temperatura e pressão.',
          },
          {
            label: 'Letra B — febril e normocárdico',
            detail: 'Temperatura afebril; FC bradicárdica no caso.',
            correct:
              'Temperatura afebril e FC bradicárdica — B erra dois parâmetros.',
          },
          {
            label: 'Letra C — febril e hipertenso',
            detail: 'Três classificações opostas ao enunciado.',
            correct:
              'Caso é afebril, bradicárdico e hipotenso — C inventa febre e hipertensão.',
          },
          {
            label: 'Letra E — hipertenso',
            detail: 'Repete afebril e bradicárdico mas classifica PA crítica como hipertensão.',
            correct:
              'PA criticamente baixa do enunciado é hipotensão — pegadinha de “quase certo” com PA errada.',
          },
        ],
        footer_rule: 'Confira PA por último — E cai no hipertenso falso',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779344158323-6': {
    family: 'conceito',
    branch: 'vitals_generico',
    guideline: 'MS — eupneia: FR dentro da normalidade (12–20 irpm adulto) · taquipneia >20 · bradipneia <12',
    roi_error: 'contar_fr_com_fala',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Terminologia respiratória',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Definir o termo eupneia na verificação da frequência respiratória.',
            icon: 'Target',
          },
          {
            label: 'Eupneia',
            detail: 'Respiração espontânea com FR dentro dos limites de normalidade — sem esforço.',
            icon: 'Wind',
          },
          {
            label: 'Taquipneia',
            detail: 'FR acima do normal — adulto >20 irpm.',
            icon: 'TrendingUp',
          },
          {
            label: 'Bradipneia',
            detail: 'FR abaixo do normal — adulto <12 irpm.',
            icon: 'TrendingDown',
          },
          {
            label: 'Pegadinha — apneia/dispneia',
            detail: 'Apneia = ausência de respiração; dispneia = dificuldade — não são eupneia.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Eupneia = normalidade respiratória',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: eupneia significa, na verificação da FR:',
          'Testar A — valores acima do normal: define taquipneia → eliminar.',
          'Testar B — valores abaixo do normal: define bradipneia → eliminar.',
          'Testar C — ausência de respiração: define apneia → eliminar.',
          'Testar D — dificuldade respiratória: define dispneia → eliminar.',
          'Testar E — valores dentro da normalidade: define eupneia → candidata.',
          'Confirmar: eupneia = FR normal.',
          'Marcar E.',
        ],
        footer_rule: 'Eupneia = FR normal → letra E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — FR adulto',
        meta: slideMeta,
        content: 'EUPNEIA · TAQUIPNEIA · BRADIPNEIA',
        rows: [
          {
            label: 'Eupneia',
            value: 'FR 12–20 irpm — dentro da normalidade',
            sv_kind: 'fr',
            badge: 'hot',
            exam_hint: 'Gabarito E.',
          },
          {
            label: 'Taquipneia',
            value: 'FR >20 irpm',
            sv_kind: 'fr',
            badge: 'warn',
          },
          {
            label: 'Bradipneia',
            value: 'FR <12 irpm',
            sv_kind: 'fr',
            badge: 'warn',
          },
          {
            label: 'Apneia',
            value: 'Ausência de movimentos respiratórios',
            sv_kind: 'fr',
            badge: 'ok',
          },
          {
            label: 'Técnica FR',
            value: 'Contar 1 minuto sem o paciente saber — não conversar',
            sv_kind: 'meta',
            badge: 'ok',
          },
        ],
        footer_rule: 'Decore: eupneia = normal · taqui = alto · bradi = baixo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TERMINOLOGIA FR',
        items: [
          {
            label: 'Letra A — acima do normal',
            detail: 'Descreve taquipneia, não eupneia.',
            correct:
              'Valores acima de 20 irpm classificam taquipneia — eupneia é faixa normal.',
          },
          {
            label: 'Letra B — abaixo do normal',
            detail: 'Descreve bradipneia.',
            correct:
              'FR abaixo de 12 irpm é bradipneia — eupneia indica normalidade.',
          },
          {
            label: 'Letra C — ausência de respiração',
            detail: 'Define apneia — parada respiratória.',
            correct:
              'Apneia é ausência de incursões — diferente de eupneia (respiração normal).',
          },
          {
            label: 'Letra D — dificuldade respiratória',
            detail: 'Define dispneia — sensação de falta de ar.',
            correct:
              'Dispneia é esforço/subjetivo — eupneia é FR dentro do normal sem distress.',
          },
        ],
        footer_rule: 'Elimine taqui/bradi/apneia/dispneia → eupneia (E)',
      },
    ],
  },

  'avancasp-enfermagem-verificacao-de-sinais-vitais-1779344158323-7': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS — método oscilatório: sem estetoscópio · algoritmo de oscilação do manguito · não usa sons Korotkoff',
    roi_error: 'korotkoff_sequencia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA oscilatória × auscultatória',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Julgar três afirmativas sobre método oscilatório (oscilométrico) de PA — formato V/F.',
            icon: 'Target',
          },
          {
            label: 'Oscilatório — estetoscópio',
            detail: 'Método automático/semi-automático dispensa ausculta — item 1 verdadeiro.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha — deflação lenta manual',
            detail: 'Velocidade de deflação controlada é técnica auscultatória Korotkoff — não oscilatória.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha — primeiro som',
            detail: '“Primeiro som” é conceito auscultatório — oscilatório usa variações do manguito.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Distinção de métodos',
            detail: 'Banca mistura passos do auscultatório no enunciado do oscilatório.',
            icon: 'HeartPulse',
          },
        ],
        footer_rule: 'Oscilatório ≠ Korotkoff — não misture passos auscultatórios',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: três itens V/F sobre método oscilatório.',
          'Julgar I: estetoscópio dispensado no oscilométrico? → VERDADEIRO.',
          'Julgar II: deflação lenta constante no oscilométrico? → FALSO — parâmetro da técnica auscultatória manual.',
          'Julgar III: sistólica no primeiro som Korotkoff? → FALSO — oscilatório não usa sons.',
          'Sequência correta: V, F, F.',
          'Eliminar A (V,V,V), B (V,V,F), D (F,V,F), E (F,F,V).',
          'Marcar C.',
        ],
        footer_rule: 'V, F, F → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — métodos de PA',
        meta: slideMeta,
        content: 'AUSCULTATÓRIO × OSCILOMÉTRICO',
        rows: [
          {
            label: 'Oscilatório',
            value: 'Sem estetoscópio — sensor no manguito',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Item I = V.',
          },
          {
            label: 'Auscultatório',
            value: 'Estetoscópio + sons Korotkoff + deflação lenta manual',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Sistólica auscultatória',
            value: '1º som de Korotkoff — não aplica ao oscilatório',
            sv_kind: 'pa',
            badge: 'warn',
            exam_hint: 'Item III = F.',
          },
          {
            label: 'Deflação manual',
            value: 'Velocidade lenta e constante — técnica auscultatória',
            sv_kind: 'pa',
            badge: 'warn',
            exam_hint: 'Item II = F.',
          },
          {
            label: 'Repouso',
            value: 'Cerca de cinco minutos — ambos os métodos',
            sv_kind: 'meta',
            badge: 'ok',
          },
        ],
        footer_rule: 'Oscilatório usa algoritmo — não primeiro som',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MÉTODO OSCILATÓRIO V/F',
        items: [
          {
            label: 'Letra A — V, V, V',
            detail: 'Aceita deflação manual e primeiro som como verdadeiros no oscilatório.',
            correct:
              'Itens II e III descrevem técnica auscultatória Korotkoff — falsos no método oscilatório.',
          },
          {
            label: 'Letra B — V, V, F',
            detail: 'Mantém deflação manual como verdadeira no oscilatório.',
            correct:
              'Velocidade de deflação constante é passo do auscultatório manual — item II falso.',
          },
          {
            label: 'Letra D — F, V, F',
            detail: 'Nega item I (estetoscópio dispensado) — incorreto.',
            correct:
              'Método oscilatório realmente dispensa estetoscópio — item I é verdadeiro.',
          },
          {
            label: 'Letra E — F, F, V',
            detail: 'Nega estetoscópio dispensado e aceita primeiro som no oscilatório.',
            correct:
              'Oscilatório não usa sons Korotkoff — item III falso; item I verdadeiro.',
          },
        ],
        footer_rule: 'Só C fecha V,F,F sem negar item I',
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
    console.log(`[handcraft:sv-g05] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g05] total=${ok}`);
}

main();
