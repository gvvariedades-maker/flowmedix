#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — vias-de-administracao-g15 (8 slugs P1 via_tecnica_admin).
 *
 *   npx tsx scripts/handcraft-vias-de-administracao-g15.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'vias-de-administracao-g15';
const SUBTOPICO = 'Vias de Administração';
const BRANCH = 'via_tecnica_admin';
const REVIEWED = '2026-07-03';

const COFEN_SOURCE = {
  id: 'vias-administracao-cofen',
  tier: 'A' as const,
  issuer: 'COFEN',
  title: 'Vias de administração de medicamentos',
  year: 2017,
  url: 'https://www.cofen.gov.br/',
  covers: [
    'técnica insulina SC',
    'sítios IM pediátricos',
    'ângulos de punção IM/SC',
    'volumes por sítio IM',
    'ventroglútea',
    'dorsoglútea',
    'deltoide',
    'vasto lateral',
    'benzilpenicilina benzatina IM',
  ],
};

const POTTER_SOURCE = {
  id: 'potter-perry-farmacologia',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Técnica de punção',
  year: 2020,
  covers: ['sítios IM', 'volumes máximos', 'técnica insulina', 'pediatria IM'],
};

const MS_INSULINA_SOURCE = {
  id: 'ms-insulina-sc',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cuidados na administração de insulina — via subcutânea',
  year: 2020,
  covers: ['êmbolo pressionado', 'lipohipertrofia', 'agulhas curtas', 'rodízio de sítios'],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Pack = {
  family: 'vf' | 'conceito' | 'calc' | 'protocolo';
  guideline: string;
  roi_error?: string;
  sources?: typeof COFEN_SOURCE[];
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
    pedagogical_branch: BRANCH,
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
    sources: pack.sources ?? [COFEN_SOURCE, POTTER_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'cpcon-uepb-enfermagem-vias-de-administracao-1776056427936-2': {
    family: 'conceito',
    guideline:
      'MS/COFEN — insulina SC: evitar lipohipertrofia · agulhas curtas · manter êmbolo pressionado após injeção · rodízio de sítios',
    roi_error: 'vias_concept_generic_farmacologia',
    sources: [MS_INSULINA_SOURCE, COFEN_SOURCE, POTTER_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica insulina SC — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Recomendações corretas na aplicação de insulina SC — técnica que garante dose plena e perfil glicêmico estável.',
            icon: 'Target',
          },
          {
            label: 'Rodízio de sítios',
            detail: 'Alternar locais evita lipohipertrofia — variação glicêmica ao mudar sítio exige atenção do paciente.',
            icon: 'RotateCcw',
          },
          {
            label: 'Erro ROI — lipohipertrofia',
            detail: 'Nunca aplicar em área com lipohipertrofia — tecido fibroso absorve de forma irregular.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Velocidade de injeção',
            detail: 'Injeção lenta e contínua — não “rápida” após introdução da agulha.',
            icon: 'Gauge',
          },
          {
            label: 'Agulhas SC',
            detail: 'Agulhas curtas (4–6 mm) — agulhas longas aumentam risco de IM inadvertida.',
            icon: 'Syringe',
          },
          {
            label: 'Pós-injeção (núcleo)',
            detail: 'Manter êmbolo pressionado e agulha no tecido por alguns segundos — garante dose completa.',
            icon: 'CheckCircle',
          },
        ],
        footer_rule: 'Insulina SC: rodízio · sem lipohipertrofia · êmbolo pressionado ao retirar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: recomendação correta na aplicação de insulina SC.',
          'Eliminar A: ignorar variação glicêmica ao mudar sítio — rodízio exige monitorização.',
          'Eliminar B: aplicar em lipohipertrofia — contraindicado; palpar e evitar áreas endurecidas.',
          'Eliminar C: injeção rápida após prega — técnica correta é lenta e contínua.',
          'Eliminar D: agulhas longas na SC — preferir curtas para evitar IM inadvertida.',
          'Confirmar E: manter êmbolo pressionado e agulha no tecido por segundos após a dose.',
          'Marcar E.',
          'Fixação: lipohipertrofia + agulha longa + injeção rápida = três pegadinhas clássicas.',
        ],
        footer_rule: 'Êmbolo pressionado até retirar agulha → E',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica insulina SC',
        meta: slideMeta,
        content: 'INSULINA SC — TÉCNICA SEGURA',
        rows: [
          { label: 'Pós-injeção', value: 'Manter êmbolo pressionado + agulha no tecido por segundos', badge: 'hot' },
          { label: 'Sítio', value: 'Palpar e evitar lipohipertrofia — rodízio de quadrantes', badge: 'ok' },
          { label: 'Agulha', value: 'Curtas (4–6 mm) — reduz risco de IM inadvertida', badge: 'ok' },
          { label: 'Injeção', value: 'Lenta e contínua — não rápida', badge: 'warn' },
          { label: 'Rodízio', value: 'Mudança de sítio pode alterar absorção — orientar paciente', badge: 'info' },
        ],
        footer_rule: 'MS: botão/êmbolo até sair agulha · sem lipohipertrofia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA INSULINA SC',
        items: [
          {
            label: 'Letra A — ignorar variação glicêmica',
            detail: 'Dispensa monitorização ao trocar sítio de aplicação.',
            correct: 'Rodízio altera absorção — paciente deve observar glicemia ao mudar local.',
          },
          {
            label: 'Letra B — aplicar em lipohipertrofia',
            detail: 'Palpar e ainda assim injetar em área endurecida/fibrosa.',
            correct: 'Lipohipertrofia absorve irregularmente — escolher outro quadrante saudável.',
          },
          {
            label: 'Letra C — injeção rápida',
            detail: 'Prega subcutânea + introdução lenta + injeção rápida.',
            correct: 'Técnica correta exige injeção lenta e contínua, não rápida.',
          },
          {
            label: 'Letra D — agulhas longas',
            detail: 'Agulhas longas no tecido subcutâneo.',
            correct: 'Agulhas curtas (4–6 mm) reduzem risco de atingir músculo inadvertidamente.',
          },
        ],
        footer_rule: 'Cada distrator erra um passo da técnica MS/COFEN',
      },
    ],
  },

  'facet-enfermagem-vias-de-administracao-1777178733298-0': {
    family: 'conceito',
    guideline: 'PNI/COFEN — vacina IM em lactente/criança pequena: vasto lateral da coxa; evitar glúteo em <2 anos',
    roi_error: 'nervo_ciatico_gluteo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vacina IM pediátrica — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Criança de 2 anos — vacina IM: sítio seguro, volume adequado e acesso muscular.',
            icon: 'Target',
          },
          {
            label: 'Vasto lateral (coxa)',
            detail: 'Sítio preferencial em lactentes e crianças pequenas — músculo vasto acessível e seguro.',
            icon: 'Baby',
          },
          {
            label: 'Glúteo em pediatria',
            detail: 'Evitar glúteo em <2 anos — risco de lesão do nervo ciático e músculo pouco desenvolvido.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Deltoide',
            detail: 'Opção após ~2 anos com volume limitado — não é primeira escolha aos 2 anos.',
            icon: 'Syringe',
          },
          {
            label: 'Erro ROI — “qualquer músculo”',
            detail: 'Banca testa se o aluno escolhe sítio anatômico específico, não área muscular genérica.',
            icon: 'GitCompare',
          },
          {
            label: 'Bíceps/antebraço',
            detail: 'Não são sítios IM clássicos para vacinação — eliminar de imediato.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Criança pequena → vasto lateral; glúteo só com critério etário',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: criança 2 anos — local mais recomendado para vacina IM.',
          'Eliminar A: “qualquer área muscular” — prova exige sítio anatômico definido.',
          'Eliminar C: glúteo máximo — contraindicado em crianças pequenas (nervo ciático).',
          'Eliminar D: bíceps — não é sítio IM padrão para vacina.',
          'Eliminar E: antebraço extensor — rota inadequada para IM.',
          'Confirmar B: coxa (vasto lateral) — referência PNI para lactentes/crianças.',
          'Marcar B.',
          'Fixação: <2 anos → vasto lateral; glúteo só quando protocolo permitir.',
        ],
        footer_rule: '2 anos → vasto lateral da coxa → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sítios IM pediátricos',
        meta: slideMeta,
        content: 'IM PEDIÁTRICA — SÍTIOS',
        rows: [
          { label: 'Vasto lateral', value: 'Coxa — preferencial lactentes e crianças pequenas', badge: 'hot' },
          { label: 'Deltoide', value: 'Após ~2 anos — volume limitado (até 2 mL)', badge: 'ok' },
          { label: 'Glúteo', value: 'Evitar <2 anos — risco nervo ciático', badge: 'warn' },
          { label: 'Ventroglútea', value: 'Adultos/crianças maiores — marcos ósseos', badge: 'info' },
          { label: 'Técnica', value: '90° · assepsia · profundidade adequada à agulha', badge: 'ok' },
        ],
        footer_rule: 'PNI: coxa em bebê/criança pequena',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SÍTIO IM PEDIÁTRICO',
        items: [
          {
            label: 'Letra A — qualquer músculo',
            detail: 'Generaliza área sem especificar sítio anatômico.',
            correct: 'Vacina IM exige sítio definido — vasto lateral é o padrão aos 2 anos.',
          },
          {
            label: 'Letra C — glúteo máximo',
            detail: 'Nádegas como primeira escolha em criança pequena.',
            correct: 'Glúteo contraindicado em <2 anos pelo risco de lesão do nervo ciático.',
          },
          {
            label: 'Letra D — bíceps',
            detail: 'Músculo superficial do braço como sítio IM.',
            correct: 'IM no braço usa deltoide, não bíceps braquial.',
          },
          {
            label: 'Letra E — antebraço',
            detail: 'Extensor do antebraço como rota de vacina.',
            correct: 'Antebraço não é sítio IM — eliminar por anatomia básica.',
          },
        ],
        footer_rule: 'Idade + sítio anatômico fecham B',
      },
    ],
  },

  'fau-unicentro-enfermagem-vias-de-administracao-1778968968468-8': {
    family: 'vf',
    guideline: 'COFEN — IM: 90° · rodízio de músculos · dorsoglútea quadrante superior externo · não repetir mesmo músculo',
    roi_error: 'angulo_im_errado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F técnica IM — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Três assertivas sobre técnica IM — julgar I, II e III antes das combinações.',
            icon: 'Target',
          },
          {
            label: 'I — rodízio muscular',
            detail: 'Não repetir punções no mesmo músculo — previne fibrose e dor.',
            icon: 'RotateCcw',
          },
          {
            label: 'II — dorsoglútea (pegadinha)',
            detail: 'Quadrante superior EXTERNO — não inferior direito como afirma o item.',
            icon: 'Bone',
          },
          {
            label: 'III — ângulo IM (erro ROI)',
            detail: 'IM = 90° no músculo — 30° é perfil de SC, não de IM.',
            icon: 'Gauge',
          },
          {
            label: 'Marcos ósseos',
            detail: 'Palpar ilíaco e trocanter antes de punção glútea — segurança neurológica.',
            icon: 'Shield',
          },
        ],
        footer_rule: 'IM = 90° · dorsoglútea = quadrante superior externo',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: três assertivas V/F + combinações A–E.',
          'Julgar I: não repetir mesmo músculo em IM? → VERDADEIRO (rodízio obrigatório).',
          'Julgar II: dorsoglútea no quadrante inferior direito? → FALSO — é quadrante superior externo.',
          'Julgar III: ângulo IM de 30°? → FALSO — IM usa 90°; 30° confunde com SC.',
          'Conjunto: somente I verdadeira.',
          'Eliminar B (só II), C (só III), D (I+II), E (II+III).',
          'Confirmar A — somente assertiva I.',
          'Marcar A.',
          'Fixação: ângulo 30° na IM = pegadinha clássica de troca IM×SC.',
        ],
        footer_rule: 'I=V · II=F · III=F → A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica IM',
        meta: slideMeta,
        content: 'PUNÇÃO IM — TÉCNICA',
        rows: [
          { label: 'Ângulo', value: '90° no músculo — perpendicular à pele', badge: 'hot' },
          { label: 'Rodízio', value: 'Alternar músculos — não repetir mesmo sítio', badge: 'ok' },
          { label: 'Dorsoglútea', value: 'Quadrante superior externo — marcos crista ilíaca/trocanter', badge: 'ok' },
          { label: 'SC (contraste)', value: '45° na hipoderme — não confundir com IM', badge: 'warn' },
          { label: 'Ventroglútea', value: 'Glúteo médio — afasta nervo ciático', badge: 'info' },
        ],
        footer_rule: '90° na IM · 45° na SC',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F IM',
        items: [
          {
            label: 'Letra B — só assertiva II',
            detail: 'Aceita quadrante inferior direito na dorsoglútea.',
            correct: 'Dorsoglútea correta = quadrante superior externo, não inferior.',
          },
          {
            label: 'Letra C — só assertiva III',
            detail: 'Valida ângulo de 30° para IM.',
            correct: 'IM exige 90° — 30° é técnica de SC, não de músculo.',
          },
          {
            label: 'Letra D — I e II verdadeiras',
            detail: 'Mantém erro do quadrante dorsoglúteo.',
            correct: 'Item II inverte o quadrante seguro da nádega.',
          },
          {
            label: 'Letra E — II e III verdadeiras',
            detail: 'Junta quadrante errado + ângulo errado.',
            correct: 'Ambas II e III são falsas — só I fecha o gabarito.',
          },
        ],
        footer_rule: 'Trocar ângulo IM×SC é erro ROI desta prova',
      },
    ],
  },

  'fcc-enfermagem-vias-de-administracao-1776056418941-0': {
    family: 'conceito',
    guideline: 'COFEN/Potter — volumes máximos IM: adulto até 5 mL · deltoide ~2 mL · vasto lateral variável por idade',
    roi_error: 'vias_concept_generic_farmacologia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Volumes IM por faixa etária — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Volume máximo IM conforme região e faixa etária — números de prova FCC.',
            icon: 'Target',
          },
          {
            label: 'Adulto (núcleo)',
            detail: 'Volume máximo recomendado por aplicação IM em adulto: até 5 mL.',
            icon: 'CheckCircle',
          },
          {
            label: 'Deltoide',
            detail: 'Volume pequeno (~2 mL) — braço não comporta doses grandes.',
            icon: 'Syringe',
          },
          {
            label: 'Vasto lateral pediátrico',
            detail: 'Criança 3–6 anos: volumes menores que adulto — FCC marca par incorreto na letra A.',
            icon: 'Baby',
          },
          {
            label: 'Neonato/prematuro',
            detail: 'Faixas etárias extremas — volumes mínimos; banca testa par região/volume específico.',
            icon: 'Heart',
          },
        ],
        footer_rule: 'Adulto = até 5 mL por sítio IM',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: volume máximo IM correto por região e faixa etária.',
          'Testar A: criança 3–6 anos no vasto lateral — par volume/região incorreto na FCC.',
          'Testar B: neonato ventroglúteo — combinação etária/sítio não fecha nesta prova.',
          'Testar C: prematuro dorsoglúteo — par não validado pelo gabarito FCC.',
          'Testar E: lactente deltoide — volume/sítio incompatível com tabela da banca.',
          'Confirmar D: adulto — volume máximo 5 mL.',
          'Marcar D.',
          'Fixação: em questão de volume, feche a faixa etária antes do número.',
        ],
        footer_rule: 'Adulto 5 mL → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — volumes IM',
        meta: slideMeta,
        content: 'VOLUMES MÁXIMOS IM',
        rows: [
          { label: 'Adulto', value: 'Até 5 mL por sítio (ventroglútea/dorsoglútea)', badge: 'hot' },
          { label: 'Deltoide', value: 'Até ~2 mL — volume limitado', badge: 'warn' },
          { label: 'Vasto lateral', value: 'Crianças — volumes menores que adulto', badge: 'ok' },
          { label: 'Neonato/lactente', value: 'Doses fracionadas — volumes mínimos', badge: 'info' },
          { label: 'Regra prática', value: 'Músculo maior = mais volume; deltoide = menos', badge: 'ok' },
        ],
        footer_rule: '5 mL adulto · 2 mL deltoide — decore os extremos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VOLUME IM',
        items: [
          {
            label: 'Letra A — vasto lateral (3–6 anos)',
            detail: 'Volume elevado para faixa etária na prova FCC.',
            correct: 'FCC considera este par região/volume incorreto para criança 3–6 anos.',
          },
          {
            label: 'Letra B — neonato ventroglútea',
            detail: 'Par neonato + ventroglútea com volume da banca.',
            correct: 'Combinação etária/sítio/volume não fecha na tabela FCC desta questão.',
          },
          {
            label: 'Letra C — prematuro dorsoglúteo',
            detail: 'Prematuro com dorsoglútea em volume mínimo.',
            correct: 'Par região/volume não corresponde ao gabarito FCC (adulto 5 mL).',
          },
          {
            label: 'Letra E — lactente deltoide',
            detail: 'Volume mínimo no deltoide de lactente.',
            correct: 'Par lactente/deltoide não corresponde ao volume máximo adulto de 5 mL.',
          },
        ],
        footer_rule: 'Conferir faixa etária + sítio + mL juntos',
      },
    ],
  },

  'fepese-enfermagem-vias-de-administracao-1776056418941-4': {
    family: 'conceito',
    guideline:
      'COFEN — sítios IM: dorsoglútea (nervos) · deltoide (2 mL, nervo radial) · ventroglútea (5 mL) · vasto lateral (pediatria)',
    roi_error: 'nervo_ciatico_gluteo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Correlação sítios IM — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Relacionar região IM (coluna 1) com descrição técnica (coluna 2) — quatro pares.',
            icon: 'Target',
          },
          {
            label: 'Dorsoglútea (2)',
            detail: 'Proximidade com nervos/artérias — maior contraindicação anatômica.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Deltoide (1)',
            detail: 'Acessível, perto do nervo radial — volume máximo ~2 mL.',
            icon: 'Syringe',
          },
          {
            label: 'Ventroglútea (4)',
            detail: 'Afastada de nervos principais — grandes volumes até 5 mL.',
            icon: 'Shield',
          },
          {
            label: 'Vasto lateral (3)',
            detail: 'Todas as faixas etárias — especialmente crianças <2 anos.',
            icon: 'Baby',
          },
        ],
        footer_rule: 'Dorsoglútea = risco neural · ventroglútea = volume',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: correlacionar 4 descrições com 4 regiões IM.',
          'Descrição 1 (nervos/artérias): dorsoglútea → item 2.',
          'Descrição 2 (nervo radial, 2 mL): deltoide → item 1.',
          'Descrição 3 (grandes volumes até 5 mL): ventroglútea → item 4.',
          'Descrição 4 (<2 anos): vasto lateral da coxa → item 3.',
          'Sequência de cima para baixo: 2 · 1 · 4 · 3.',
          'Localizar alternativa C = 2 • 1 • 4 • 3.',
          'Marcar C.',
          'Fixação: dorsoglútea = perigo neural; ventroglútea = volume seguro.',
        ],
        footer_rule: '2-1-4-3 → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — perfil dos sítios IM',
        meta: slideMeta,
        content: 'SÍTIOS IM — PERFIL',
        rows: [
          { label: 'Dorsoglútea', value: 'Risco neural/vascular — quadrante superior externo', badge: 'warn' },
          { label: 'Deltoide', value: 'Até 2 mL — proximidade nervo radial', badge: 'ok' },
          { label: 'Ventroglútea', value: 'Até 5 mL — glúteo médio, mais segura', badge: 'hot' },
          { label: 'Vasto lateral', value: 'Pediatria — coxa anterolateral', badge: 'ok' },
          { label: 'Prioridade', value: 'Ventroglútea > coxa > dorsoglútea > deltoide', badge: 'info' },
        ],
        footer_rule: 'Volume + segurança neurológica definem o sítio',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CORRELAÇÃO IM',
        items: [
          {
            label: 'Letra A — 1·3·2·4',
            detail: 'Troca ventroglútea com vasto lateral na sequência.',
            correct: 'Grandes volumes (5 mL) pertencem à ventroglútea (4), não ao vasto (3).',
          },
          {
            label: 'Letra B — 1·3·4·2',
            detail: 'Inverte deltoide com dorsoglútea na primeira posição.',
            correct: 'Descrição de nervos/artérias casa com dorsoglútea (2), não deltoide.',
          },
          {
            label: 'Letra D — 2·1·3·4',
            detail: 'Coloca vasto lateral na posição de grandes volumes.',
            correct: 'Vasto lateral é sítio pediátrico — ventroglútea comporta até 5 mL.',
          },
          {
            label: 'Letra E — 3·1·4·2',
            detail: 'Inicia com vasto na descrição de nervos.',
            correct: 'Primeira descrição (nervos) = dorsoglútea, não coxa.',
          },
        ],
        footer_rule: 'Fechar par a par antes da sequência final',
      },
    ],
  },

  'fepese-enfermagem-vias-de-administracao-1778968997293-1': {
    family: 'conceito',
    guideline: 'COFEN — prioridade sítios IM: ventroglútea → vasto lateral → dorsoglútea → deltoide',
    roi_error: 'ventrogluteo_inseguro',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Prioridade sítios IM — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Ordem de prioridade na punção IM — do sítio mais seguro ao menos indicado (técnica de administração).',
            icon: 'Target',
          },
          {
            label: '1º — ventroglútea',
            detail: 'Glúteo médio — punção com marcos ósseos, maior segurança neurológica e volume.',
            icon: 'Shield',
          },
          {
            label: '2º — vasto lateral',
            detail: 'Coxa anterolateral — especialmente pediatria.',
            icon: 'Baby',
          },
          {
            label: '3º — dorsoglútea',
            detail: 'Alto volume possível, mas risco de nervo ciático.',
            icon: 'AlertTriangle',
          },
          {
            label: '4º — deltoide',
            detail: 'Volume limitado (~2 mL) — última na escala de prioridade.',
            icon: 'Syringe',
          },
          {
            label: 'Erro ROI',
            detail: 'Banca inverte ventroglútea como “insegura” ou coloca deltoide em 1º lugar.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Técnica IM: ventroglútea lidera · deltoide fecha a lista',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: ordem de prioridade dos sítios IM (mais → menos indicado).',
          'Eliminar A: inicia com deltoide — volume pequeno, não é 1ª escolha.',
          'Eliminar C: ventroglútea seguida de dorsoglútea antes da coxa — inverte 2º e 3º.',
          'Eliminar D: começa pela coxa — vasto é 2º, não 1º na escala FEPESE.',
          'Eliminar E: deltoide em 1º — erro clássico de prioridade.',
          'Confirmar B: ventroglútea → anterolateral coxa → dorsoglútea → deltoide.',
          'Marcar B.',
          'Fixação: ventroglútea sempre na frente quando a prova pede prioridade.',
        ],
        footer_rule: 'Ventroglútea → coxa → dorsoglútea → deltoide → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — prioridade IM',
        meta: slideMeta,
        content: 'PRIORIDADE SÍTIOS IM',
        rows: [
          { label: '1º Ventroglútea', value: 'Mais segura — glúteo médio, até 5 mL', badge: 'hot' },
          { label: '2º Vasto lateral', value: 'Coxa — pediatria e adultos', badge: 'ok' },
          { label: '3º Dorsoglútea', value: 'Volume alto, risco neural se técnica falha', badge: 'warn' },
          { label: '4º Deltoide', value: 'Até 2 mL — braço', badge: 'info' },
          { label: 'Critério', value: 'Segurança anatômica + volume + técnica de punção', badge: 'ok' },
        ],
        footer_rule: 'Decore: ventroglútea → coxa → dorsoglútea → deltoide',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PRIORIDADE IM',
        items: [
          {
            label: 'Letra A — deltoide em 1º',
            detail: 'Coloca braço antes de glúteo médio e coxa.',
            correct: 'Deltoide tem volume limitado — não lidera a prioridade IM.',
          },
          {
            label: 'Letra C — dorsoglútea antes da coxa',
            detail: 'Inverte 2º e 3º lugares na escala.',
            correct: 'Vasto lateral (coxa) precede dorsoglútea na ordem FEPESE.',
          },
          {
            label: 'Letra D — coxa em 1º',
            detail: 'Vasto lateral como primeira escolha universal.',
            correct: 'Ventroglútea é 1ª em adultos; coxa é 2ª na sequência desta banca.',
          },
          {
            label: 'Letra E — deltoide + dorsoglútea invertidos',
            detail: 'Mistura ordem colocando ventroglútea no meio.',
            correct: 'Ventroglútea deve abrir a lista, não aparecer em 3º lugar.',
          },
        ],
        footer_rule: 'Deltoide nunca abre a prioridade',
      },
    ],
  },

  'funatec-enfermagem-vias-de-administracao-1778968609115-1': {
    family: 'calc',
    guideline: 'COFEN — volumes IM: deltoide ~2 mL · glútea/ventroglútea até 5 mL · vasto lateral conforme idade',
    roi_error: 'vias_concept_generic_farmacologia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Volume máximo IM — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Assertiva correta sobre região IM e volume máximo — par único verdadeiro.',
            icon: 'Target',
          },
          {
            label: 'Deltoide (pegadinha)',
            detail: 'Máximo até 2 mL — letra A superestima volume no braço.',
            icon: 'Syringe',
          },
          {
            label: 'Glútea (núcleo)',
            detail: 'Região glútea comporta até 5 mL — par correto da questão.',
            icon: 'CheckCircle',
          },
          {
            label: 'Ventroglútea',
            detail: 'Também aceita até 5 mL — 2 mL subestima o sítio.',
            icon: 'Shield',
          },
          {
            label: 'Vasto lateral',
            detail: 'Volume varia por idade — par vasto/adulto não fecha nesta questão.',
            icon: 'Baby',
          },
        ],
        footer_rule: 'Deltoide = 2 mL · glútea = 5 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: par correto região + volume máximo IM.',
          'Eliminar A: deltoide com volume alto — excede limite de até 2 mL no braço.',
          'Eliminar C: ventroglútea 2 mL — subestima capacidade (até 5 mL).',
          'Eliminar D: vasto lateral em adultos — par região/volume não validado pela banca.',
          'Confirmar B: glútea 5 mL.',
          'Marcar B.',
          'Fixação: deltoide nunca comporta volume alto — elimine A de imediato.',
        ],
        footer_rule: 'Glútea 5 mL → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — volume por sítio',
        meta: slideMeta,
        content: 'VOLUME MÁXIMO IM',
        rows: [
          { label: 'Deltoide', value: 'Até ~2 mL', badge: 'warn' },
          { label: 'Glútea/ventroglútea', value: 'Até 5 mL por aplicação', badge: 'hot' },
          { label: 'Vasto lateral', value: 'Variável — pediatria volumes menores', badge: 'ok' },
          { label: 'Regra', value: 'Músculo maior = mais mL; deltoide = menos', badge: 'ok' },
        ],
        footer_rule: '2 mL deltoide · 5 mL glútea',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VOLUME IM',
        items: [
          {
            label: 'Letra A — deltoide volume alto',
            detail: 'Superestima capacidade do músculo deltoide.',
            correct: 'Deltoide comporta no máximo até 2 mL — não é sítio para doses grandes.',
          },
          {
            label: 'Letra C — ventroglútea 2 mL',
            detail: 'Subestima capacidade do glúteo médio.',
            correct: 'Ventroglútea aceita até 5 mL — 2 mL é valor de deltoide.',
          },
          {
            label: 'Letra D — vasto lateral adulto',
            detail: 'Par região/volume não validado pela banca.',
            correct: 'Único par correto: região glútea com volume máximo de 5 mL.',
          },
          {
            label: 'Confundir deltoide com glútea',
            detail: 'Escolher braço quando o enunciado pede maior volume.',
            correct: 'Grandes volumes (5 mL) vão para glútea/ventroglútea, não deltoide.',
          },
        ],
        footer_rule: 'Volume alto → glútea, não deltoide',
      },
    ],
  },

  'fundatec-enfermagem-vias-de-administracao-1776056383154-3': {
    family: 'protocolo',
    guideline:
      'MS — benzilpenicilina benzatina: IM profunda · quadrante superior externo · rotação de sítios · não SC/ID',
    roi_error: 'nervo_ciatico_gluteo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Benzatina IM — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Sífilis latente — penicilina benzatina 2,4 MI UI IM semanal — cinco assertivas V/F.',
            icon: 'Target',
          },
          {
            label: 'Item 1 — quadrante superior externo',
            detail: 'Local recomendado na nádega — VERDADEIRO.',
            icon: 'CheckCircle',
          },
          {
            label: 'Item 2 — SC/ID (pegadinha)',
            detail: 'Benzatina é suspensão oleosa IM profunda — SC/ID não substituem.',
            icon: 'Ban',
          },
          {
            label: 'Item 3 — quadrante superior interno',
            detail: 'Quadrante interno NÃO é seguro — proximidade de estruturas nobres.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Item 4 — IM profunda + rotação',
            detail: 'Esquema seriado exige IM profunda e alternância de glúteos — VERDADEIRO.',
            icon: 'Syringe',
          },
          {
            label: 'Item 5 — coxa em lactentes',
            detail: 'Face lateral da coxa segura em crianças pequenas — VERDADEIRO no contexto pediátrico.',
            icon: 'Baby',
          },
        ],
        footer_rule: 'Benzatina = IM profunda · nunca SC/ID',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: cinco itens V/F + sequência A–E.',
          'Julgar item 1: quadrante superior externo da nádega? → VERDADEIRO.',
          'Julgar item 2: SC ou ID adequadas? → FALSO — benzatina exige IM profunda.',
          'Julgar item 3: quadrante superior interno seguro? → FALSO — interno não é recomendado.',
          'Julgar item 4: IM profunda com rotação em esquemas seriados? → VERDADEIRO.',
          'Julgar item 5: face lateral da coxa em lactentes/crianças? → VERDADEIRO.',
          'Montar sequência: V, F, F, V, V.',
          'Localizar alternativa A.',
          'Marcar A.',
          'Fixação: benzatina oleosa nunca vai SC — item 2 é falso sempre.',
        ],
        footer_rule: 'V-F-F-V-V → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — benzatina IM',
        meta: slideMeta,
        content: 'PENICILINA BENZATINA — TÉCNICA',
        rows: [
          { label: 'Via', value: 'IM profunda exclusiva — suspensão oleosa', badge: 'hot' },
          { label: 'Sítio adulto', value: 'Quadrante superior externo da nádega', badge: 'ok' },
          { label: 'Esquema', value: 'Rotação de glúteos em doses seriadas', badge: 'ok' },
          { label: 'Pediatria', value: 'Vasto lateral da coxa — alternativa segura', badge: 'info' },
          { label: 'Contraindicado', value: 'SC · ID · quadrante interno da nádega', badge: 'warn' },
        ],
        footer_rule: 'Oleosa = IM profunda · nunca SC',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — BENZATINA V/F',
        items: [
          {
            label: 'Letra B — F-F-V-V-F',
            detail: 'Valida quadrante interno e nega coxa pediátrica.',
            correct: 'Quadrante interno é inseguro; coxa é opção em crianças.',
          },
          {
            label: 'Letra C — V-V-F-F-V',
            detail: 'Aceita SC/ID como adequadas (item 2 = V).',
            correct: 'Benzatina não pode SC/ID — suspensão oleosa exige IM profunda.',
          },
          {
            label: 'Letra D — F-V-V-F-V',
            detail: 'Nega quadrante externo e aceita interno.',
            correct: 'Quadrante superior externo é o recomendado, não o interno.',
          },
          {
            label: 'Letra E — V-F-V-F-F',
            detail: 'Valida quadrante interno (item 3 = V).',
            correct: 'Quadrante superior interno não é sítio seguro para IM.',
          },
        ],
        footer_rule: 'Item 2 (SC/ID) e item 3 (interno) são falsos',
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
    console.log(`[handcraft:vias-g15] OK ${slug}`);
  }
  console.log(`[handcraft:vias-g15] total=${ok}`);
}

main();
