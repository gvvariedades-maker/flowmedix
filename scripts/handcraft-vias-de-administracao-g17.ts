#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — vias-de-administracao-g17 (8 slugs P1 via_tecnica_admin).
 *
 *   npx tsx scripts/handcraft-vias-de-administracao-g17.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'vias-de-administracao-g17';
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
    'ângulos de punção IM/SC/ID',
    'volumes por sítio IM',
    'ventroglútea',
    'dorsoglútea',
    'deltoide',
    'vasto lateral',
    'hipodermóclise',
    'técnica Z',
  ],
};

const POTTER_SOURCE = {
  id: 'potter-perry-farmacologia',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Técnica de punção',
  year: 2020,
  covers: ['sítios IM', 'volumes máximos', 'técnica insulina', 'pediatria IM', 'hipodermóclise SC'],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Pack = {
  family: 'vf' | 'conceito' | 'calc' | 'protocolo';
  branch?: typeof BRANCH | 'via_vf_absorcao';
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
    pedagogical_branch: pack.branch ?? BRANCH,
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
  'fundatec-enfermagem-vias-de-administracao-1776056391403-0': {
    family: 'conceito',
    branch: 'via_vf_absorcao' as const,
    guideline:
      'COFEN/Potter — hipodermóclise: infusão lenta de fluidos/medicamentos via SC em cuidados paliativos; não é VO, IM nem IV',
    roi_error: 'vias_concept_generic_farmacologia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hipodermóclise — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Técnica histórica (século XIX, cólera) ressurgida em cuidados paliativos — identificar a via anatômica utilizada.',
            icon: 'Target',
          },
          {
            label: 'Hipodermóclise (núcleo)',
            detail: 'Infusão de fluidos e medicamentos no tecido subcutâneo — absorção lenta e contínua.',
            icon: 'Droplets',
          },
          {
            label: 'Contexto paliativo',
            detail: 'Alternativa quando IV não é viável — conforto e hidratação em fim de vida.',
            icon: 'Heart',
          },
          {
            label: 'Erro ROI — confundir com IV',
            detail: 'Banca oferece IV como distrator — hipodermóclise não acessa veia.',
            icon: 'AlertTriangle',
          },
          {
            label: 'IM e VO',
            detail: 'IM = bolus muscular; VO = trato digestivo — não descrevem infusão SC lenta.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Hipodermóclise = via subcutânea para infusão lenta',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: qual via é utilizada na hipodermóclise?',
          'Fixar: técnica de infusão lenta no tecido subcutâneo (paliativos).',
          'Eliminar A: oral — medicação/fluido não passa pelo trato digestivo nesta técnica.',
          'Eliminar C: intramuscular — não é bolus em músculo, é infusão em hipoderme.',
          'Eliminar D: intravenosa — não requer acesso venoso direto.',
          'Eliminar E: otológica — rota topológica sem relação com infusão SC.',
          'Confirmar B: subcutânea — agulha/cateter no tecido subcutâneo.',
          'Marcar B.',
          'Fixação: “hipo” + “derme” = sob a pele = SC.',
        ],
        footer_rule: 'Hipodermóclise → subcutânea → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — hipodermóclise',
        meta: slideMeta,
        content: 'HIPODERMÓCLISE — VIA SC',
        rows: [
          { label: 'Via', value: 'Subcutânea — tecido hipodérmico', badge: 'hot' },
          { label: 'Indicação', value: 'Paliativos — hidratação e medicamentos quando IV inviável', badge: 'ok' },
          { label: 'Velocidade', value: 'Infusão lenta e contínua — não bolus', badge: 'info' },
          { label: 'Não é', value: 'IV · IM · VO · otológica', badge: 'warn' },
        ],
        footer_rule: 'Palavra-chave: infusão SC lenta em paliativos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HIPODERMÓCLISE',
        items: [
          {
            label: 'Letra A — oral',
            detail: 'Administração pelo trato digestivo.',
            correct: 'Hipodermóclise perfura pele e infunde no tecido SC — não é via oral.',
          },
          {
            label: 'Letra C — intramuscular',
            detail: 'Injeção no músculo estriado.',
            correct: 'Técnica é infusão subcutânea lenta, não punção IM.',
          },
          {
            label: 'Letra D — intravenosa',
            detail: 'Acesso direto à circulação venosa.',
            correct: 'Hipodermóclise evita veia — fluido absorve lentamente pela hipoderme.',
          },
          {
            label: 'Letra E — otológica',
            detail: 'Instilação no conduto auditivo.',
            correct: 'Rota topológica sem relação com infusão subcutânea sistêmica.',
          },
        ],
        footer_rule: 'Não confundir infusão SC com IV de emergência',
      },
    ],
  },

  'fundatec-enfermagem-vias-de-administracao-1778968862077-7': {
    family: 'conceito',
    guideline:
      'COFEN — IM adulto: ventroglútea 1ª escolha · volume até 5 mL · ângulo 90° · técnica Z para oleosas, não “só vacinas”',
    roi_error: 'angulo_im_errado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica IM — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Assertiva correta sobre prática de medicação intramuscular.',
            icon: 'Target',
          },
          {
            label: 'Ventroglútea (núcleo)',
            detail: '1ª escolha em adultos — glúteo médio, afasta nervo ciático.',
            icon: 'Shield',
          },
          {
            label: 'Erro ROI — ângulo 25°',
            detail: 'IM = 90° no músculo — 25° confunde com SC ou técnica oblíqua.',
            icon: 'Gauge',
          },
          {
            label: 'Volume inflado',
            detail: 'Máximo clássico ~5 mL por sítio — letra A excede referência COFEN.',
            icon: 'Syringe',
          },
          {
            label: 'Técnica Z',
            detail: 'Usada para oleosas/SC — não foi criada exclusivamente para vacinas.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Ventroglútea lidera · IM = 90° · até 5 mL',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa correta sobre administração IM.',
          'Eliminar A: volume máximo acima do referencial COFEN — limite clássico é até 5 mL por aplicação.',
          'Eliminar B: agulha 40×12 como “mais utilizada” — generalização sem respaldo normativo.',
          'Eliminar D: técnica Z “só para vacinas” — Z serve a medicamentos oleosos/SC também.',
          'Eliminar E: ângulo 25° — IM exige 90° perpendicular ao músculo.',
          'Confirmar C: ventroglútea = 1ª escolha em adultos.',
          'Marcar C.',
          'Fixação: ângulo 25° e volume inflado são distratores numéricos clássicos.',
        ],
        footer_rule: 'Ventroglútea + 90° + 5 mL → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica IM',
        meta: slideMeta,
        content: 'IM — PARÂMETROS COFEN',
        rows: [
          { label: '1º sítio adulto', value: 'Ventroglútea (glúteo médio)', badge: 'hot' },
          { label: 'Ângulo', value: '90° no músculo', badge: 'ok' },
          { label: 'Volume', value: 'Até 5 mL por aplicação (glútea/ventroglútea)', badge: 'ok' },
          { label: 'Técnica Z', value: 'Oleosas e SC — não exclusiva de vacinas', badge: 'warn' },
          { label: 'SC (contraste)', value: '45° na hipoderme — não 25° na IM', badge: 'info' },
        ],
        footer_rule: '90° na IM · ventroglútea abre a lista',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA IM',
        items: [
          {
            label: 'Letra A — volume acima do máximo clássico',
            detail: 'Eleva o limite de volume IM além do referencial COFEN.',
            correct: 'Referência COFEN: até 5 mL por sítio — valor da letra A excede o máximo.',
          },
          {
            label: 'Letra B — agulha 40×12 “mais usada”',
            detail: 'Generaliza calibre sem critério de sítio/paciente.',
            correct: 'Escolha de agulha depende de sítio, idade e volume — afirmação absoluta é falsa.',
          },
          {
            label: 'Letra D — técnica Z só vacinas',
            detail: 'Restringe indicação da técnica Z.',
            correct: 'Técnica Z também serve medicamentos oleosos e SC — não nasceu só para vacina.',
          },
          {
            label: 'Letra E — ângulo 25°',
            detail: 'Punção oblíqua como padrão IM.',
            correct: 'IM = 90° perpendicular — 25° é distrator de ângulo SC/oblíquo.',
          },
        ],
        footer_rule: 'Trocar ângulo IM×SC é erro ROI desta prova',
      },
    ],
  },

  'fundep-enfermagem-vias-de-administracao-1778969007166-0': {
    family: 'conceito',
    guideline:
      'COFEN/Potter — idoso com massa muscular reduzida: técnica Z na IM previne extravasamento e dor; ferro IM exige técnica adequada',
    roi_error: 'vias_concept_generic_farmacologia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica Z em idoso — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Idoso com massa muscular reduzida + suplemento de ferro IM — método mais recomendado.',
            icon: 'Target',
          },
          {
            label: 'Técnica Z (núcleo)',
            detail: 'Desloca pele lateralmente antes da punção — selo oclui trilho e reduz extravasamento.',
            icon: 'Move',
          },
          {
            label: 'Massa muscular reduzida',
            detail: 'Camada muscular fina aumenta risco de injeção subcutânea inadvertida.',
            icon: 'User',
          },
          {
            label: 'Ferro IM',
            detail: 'Medicamento irritante/oleoso — exige técnica que mantenha depósito intramuscular.',
            icon: 'Syringe',
          },
          {
            label: 'Erro ROI — punção vertical sem Z',
            detail: 'Sem deslocamento cutâneo, idoso com pouca massa muscular extravasa ferro para SC.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Idoso + ferro IM → técnica Z',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: método mais recomendado para IM em idoso com pouca massa + ferro.',
          'Contexto: camada muscular fina + medicamento que pode extravasar.',
          'Eliminar A: técnica vertical simples — não selo o trilho da agulha.',
          'Eliminar C: técnica “V” — não é método IM reconhecido.',
          'Eliminar D: técnica horizontal — não descreve punção IM segura.',
          'Confirmar B: técnica em Z — deslocamento cutâneo antes da injeção.',
          'Marcar B.',
          'Fixação: Z = pele puxada → injeta → solta → trilho desalinhado.',
        ],
        footer_rule: 'Massa reduzida + irritante → Z → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — técnica Z',
        meta: slideMeta,
        content: 'TÉCNICA Z — IM',
        rows: [
          { label: 'Mecanismo', value: 'Deslocar pele 2–3 cm → injetar 90° → soltar', badge: 'hot' },
          { label: 'Indicação', value: 'Idosos · massa muscular reduzida · oleosos/irritantes', badge: 'ok' },
          { label: 'Benefício', value: 'Reduz extravasamento SC e dor local', badge: 'ok' },
          { label: 'Ferro IM', value: 'Medicamento clássico para técnica Z', badge: 'info' },
        ],
        footer_rule: 'Z sela o depósito no músculo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA Z vs VERTICAL',
        items: [
          {
            label: 'Letra A — punção vertical sem Z',
            detail: 'Técnica vertical simples sem deslocar a pele antes da agulha.',
            correct: 'Sem técnica Z, ferro IM extravasa em idoso com massa muscular reduzida — espelha erro ROI do mapa.',
          },
          {
            label: 'Letra C — técnica em V',
            detail: 'Formato em V na pele.',
            correct: 'Não é técnica IM padronizada — distrator de nomenclatura.',
          },
          {
            label: 'Letra D — técnica horizontal',
            detail: 'Inserção paralela à pele como padrão IM.',
            correct: 'IM usa 90° — horizontal não fecha indicação para ferro em idoso.',
          },
        ],
        footer_rule: 'Irritante + pouca massa = Z, não punção simples',
      },
    ],
  },

  'furb-enfermagem-vias-de-administracao-1776056366158-9': {
    family: 'conceito',
    guideline: 'COFEN — IM em adultos: ventroglútea é sítio de preferência (glúteo médio, segurança neurológica)',
    roi_error: 'ventrogluteo_inseguro',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sítio preferencial IM adulto — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Adulto — local de preferência para IM com segurança e eficácia.',
            icon: 'Target',
          },
          {
            label: 'Ventroglútea (núcleo)',
            detail: 'Glúteo médio — maior distância do nervo ciático, volume até 5 mL.',
            icon: 'Shield',
          },
          {
            label: 'Dorsoglútea',
            detail: 'Alto risco neural se técnica falha — não é 1ª escolha.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Deltoide',
            detail: 'Volume limitado (~2 mL) — opção, não preferência universal.',
            icon: 'Syringe',
          },
          {
            label: 'Vasto lateral',
            detail: 'Excelente em pediatria — adulto: ventroglútea precede na escala FURB.',
            icon: 'Baby',
          },
        ],
        footer_rule: 'Adulto IM → ventroglútea em 1º lugar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: local de preferência para IM em paciente adulto.',
          'Eliminar A: dorsoglúteo — risco de nervo ciático, não lidera prioridade.',
          'Eliminar B: “glúteo” genérico — banca quer sítio anatômico específico (ventroglútea).',
          'Eliminar D: deltoide — volume pequeno, não é preferência universal.',
          'Eliminar E: vasto lateral — 1ª em crianças; adulto: ventroglútea.',
          'Confirmar C: ventroglúteo.',
          'Marcar C.',
          'Fixação: “preferência” em adulto = ventroglútea, não dorsoglútea.',
        ],
        footer_rule: 'Preferência adulto → ventroglútea → C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — prioridade IM adulto',
        meta: slideMeta,
        content: 'IM ADULTO — SÍTIO',
        rows: [
          { label: 'Preferência', value: 'Ventroglútea (glúteo médio)', badge: 'hot' },
          { label: 'Dorsoglútea', value: 'Evitar como 1ª — risco neural', badge: 'warn' },
          { label: 'Deltoide', value: 'Até ~2 mL', badge: 'info' },
          { label: 'Vasto lateral', value: 'Pediatria — coxa anterolateral', badge: 'ok' },
        ],
        footer_rule: 'Ventroglútea > dorsoglútea em segurança',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SÍTIO IM ADULTO',
        items: [
          {
            label: 'Letra A — dorsoglúteo',
            detail: 'Nádega clássica com risco de nervo ciático.',
            correct: 'Dorsoglútea não é preferência — ventroglútea é mais segura.',
          },
          {
            label: 'Letra B — glúteo genérico',
            detail: 'Termo vago sem especificar glúteo médio.',
            correct: 'Prova exige ventroglútea (glúteo médio), não “glúteo” indefinido.',
          },
          {
            label: 'Letra D — deltoide',
            detail: 'Braço como sítio universal.',
            correct: 'Deltoide tem volume limitado — não lidera preferência em adulto.',
          },
          {
            label: 'Letra E — vasto lateral',
            detail: 'Coxa como 1ª escolha em adulto.',
            correct: 'Vasto lateral é referência pediátrica — adulto: ventroglútea.',
          },
        ],
        footer_rule: '“Glúteo” sem “ventro” não fecha gabarito',
      },
    ],
  },

  'furb-enfermagem-vias-de-administracao-1776056409987-0': {
    family: 'conceito',
    guideline: 'PNI/COFEN — IM <3 anos: evitar dorsoglútea (nervo ciático); preferir vasto lateral da coxa',
    roi_error: 'nervo_ciatico_gluteo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'IM pediátrica <3 anos — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Local a EVITAR para IM em menores de 3 anos — foco em segurança neurológica.',
            icon: 'Target',
          },
          {
            label: 'Dorsoglútea (núcleo)',
            detail: 'Contraindicada em crianças pequenas — músculo imaturo + risco de lesão do nervo ciático.',
            icon: 'Ban',
          },
          {
            label: 'Vasto lateral',
            detail: 'Sítio preferencial em lactentes/crianças — NÃO evitar.',
            icon: 'Baby',
          },
          {
            label: 'Ventroglútea',
            detail: 'Opção em crianças maiores com marcos — não é o “evitar” da prova.',
            icon: 'Shield',
          },
          {
            label: 'Erro ROI — inverter sítios',
            detail: 'Banca oferece coxa/deltoide como “evitar” — na verdade são seguros.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: '<3 anos → evitar dorsoglútea',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: qual local EVITAR para IM em <3 anos?',
          'Lembrar: nervo ciático passa próximo à dorsoglútea em criança.',
          'Eliminar A: ventroglútea — opção segura, não evitar.',
          'Eliminar B: vasto lateral — 1ª escolha pediátrica, não evitar.',
          'Eliminar C: deltoide — pode usar com volume pequeno, não é “evitar”.',
          'Eliminar E: anterior da coxa — não é sítio IM clássico, mas não é o gabarito “evitar”.',
          'Confirmar D: dorso glúteo — contraindicado em <3 anos.',
          'Marcar D.',
          'Fixação: criança pequena + glúteo = nervo ciático.',
        ],
        footer_rule: 'Evitar dorsoglútea <3 anos → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — IM pediátrica',
        meta: slideMeta,
        content: 'IM <3 ANOS — SÍTIOS',
        rows: [
          { label: 'Evitar', value: 'Dorsoglútea — risco nervo ciático', badge: 'hot' },
          { label: 'Preferir', value: 'Vasto lateral da coxa', badge: 'ok' },
          { label: 'Ventroglútea', value: 'Crianças maiores com técnica adequada', badge: 'info' },
          { label: 'Deltoide', value: 'Volume mínimo — não 1ª em lactente', badge: 'warn' },
        ],
        footer_rule: 'Bebê/criança → coxa, não nádega dorsal',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — IM PEDIÁTRICA',
        items: [
          {
            label: 'Letra A — ventroglútea',
            detail: 'Marcar glúteo médio como “evitar”.',
            correct: 'Ventroglútea é segura — o evitar é dorsoglútea em <3 anos.',
          },
          {
            label: 'Letra B — vasto lateral',
            detail: 'Coxa como local proibido.',
            correct: 'Vasto lateral é o sítio preferencial em crianças pequenas.',
          },
          {
            label: 'Letra C — deltoide',
            detail: 'Braço como único a evitar.',
            correct: 'Deltoide não é o foco de contraindicação nesta faixa etária.',
          },
          {
            label: 'Letra E — anterior da coxa',
            detail: 'Face anterior como gabarito.',
            correct: 'Dorsoglútea é o sítio clássico a evitar pelo nervo ciático.',
          },
        ],
        footer_rule: 'Pergunta pede EVITAR — dorsoglútea',
      },
    ],
  },

  'fuvest-enfermagem-vias-de-administracao-1778968768987-8': {
    family: 'vf',
    guideline:
      'COFEN — vasto lateral: terço médio do músculo · músculo desenvolvado · poucos nervos/vasos grandes · indicado em bebês/crianças',
    roi_error: 'nervo_ciatico_gluteo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vasto lateral IM — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Quatro assertivas sobre punção IM no vasto lateral — julgar I–IV antes das combinações.',
            icon: 'Target',
          },
          {
            label: 'I — terço médio',
            detail: 'Injeção no terço médio do vasto lateral — VERDADEIRO.',
            icon: 'CheckCircle',
          },
          {
            label: 'II — músculo fino (pegadinha)',
            detail: 'Vasto lateral é volumoso e bem desenvolvado — FALSO dizer “fino e pouco desenvolvido”.',
            icon: 'AlertTriangle',
          },
          {
            label: 'III — sem grandes nervos/vasos',
            detail: 'Sítio relativamente seguro — VERDADEIRO.',
            icon: 'Shield',
          },
          {
            label: 'IV — sem indicação em bebês (erro ROI)',
            detail: 'Vasto lateral é 1ª escolha pediátrica — FALSO negar indicação.',
            icon: 'Baby',
          },
        ],
        footer_rule: 'Vasto = terço médio · pediatria · músculo desenvolvido',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: V/F I–IV + combinações A–D.',
          'Julgar I: terço médio do vasto? → VERDADEIRO.',
          'Julgar II: músculo fino e pouco desenvolvido? → FALSO — vasto é volumoso.',
          'Julgar III: sem grandes nervos/vasos próximos? → VERDADEIRO.',
          'Julgar IV: sem indicação em bebês/crianças? → FALSO — é sítio pediátrico clássico.',
          'Conjunto: somente I e III verdadeiras.',
          'Eliminar A (I+II), C (II+III+IV), D (III+IV).',
          'Confirmar B — I e III.',
          'Marcar B.',
          'Fixação: negar pediatria no vasto = pegadinha Fuvest.',
        ],
        footer_rule: 'I=V · II=F · III=V · IV=F → B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — vasto lateral',
        meta: slideMeta,
        content: 'VASTO LATERAL — TÉCNICA',
        rows: [
          { label: 'Sítio', value: 'Terço médio do músculo vasto lateral', badge: 'hot' },
          { label: 'Pediatria', value: 'Indicado em bebês e crianças — 1ª escolha', badge: 'ok' },
          { label: 'Anatomia', value: 'Músculo desenvolvado — não “fino”', badge: 'ok' },
          { label: 'Segurança', value: 'Poucos nervos e vasos de grande calibre', badge: 'info' },
        ],
        footer_rule: 'Coxa anterolateral = pediatria segura',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F VASTO LATERAL',
        items: [
          {
            label: 'Letra A — I e II',
            detail: 'Aceita II (músculo fino/pouco desenvolvido).',
            correct: 'Vasto lateral é músculo volumoso — item II é falso.',
          },
          {
            label: 'Letra C — II, III e IV',
            detail: 'Valida negação pediátrica (IV) e músculo fino (II).',
            correct: 'IV nega indicação em bebês — vasto é justamente sítio pediátrico.',
          },
          {
            label: 'Letra D — III e IV',
            detail: 'Mantém IV verdadeiro (sem indicação em crianças).',
            correct: 'Bebês e crianças são indicação clássica do vasto lateral.',
          },
          {
            label: 'Confundir com dorsoglútea',
            detail: 'Aplicar lógica de glúteo na coxa.',
            correct: 'Vasto lateral substitui dorsoglútea em pediatria — não negar uso.',
          },
        ],
        footer_rule: 'II e IV são falsos — só I+III',
      },
    ],
  },

  'iaupe-enfermagem-vias-de-administracao-1776056401060-4': {
    family: 'vf',
    guideline:
      'COFEN — ângulos: IM 90° · SC 45° · ID 10–15° bevel up · punção venosa ~15–30° bevel up; dorsoglútea também 90°, não 60°',
    roi_error: 'angulo_im_errado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ângulos por via — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Quatro assertivas sobre ângulos de punção em IM, ID, SC e venosa — só uma combinação correta.',
            icon: 'Target',
          },
          {
            label: 'I — IM deltoide/dorsoglútea (pegadinha)',
            detail: 'Deltoide 90° ok — dorsoglútea 60° FALSO; IM = 90° em qualquer sítio muscular.',
            icon: 'Gauge',
          },
          {
            label: 'II — ID 15° lateralizado',
            detail: 'ID clássica: 10–15° com bisel para cima — “lateralizado” não fecha → FALSO.',
            icon: 'Syringe',
          },
          {
            label: 'III — SC 90° (erro ROI)',
            detail: 'SC = 45° (ou pinçamento) — 90° confunde com IM → FALSO.',
            icon: 'AlertTriangle',
          },
          {
            label: 'IV — punção venosa 15° bevel up',
            detail: 'Acesso venoso periférico: ~15–30° bisel superior — VERDADEIRO.',
            icon: 'CheckCircle',
          },
        ],
        footer_rule: 'IM 90° · SC 45° · ID 15° up · IV 15° up',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: julgar I–IV sobre ângulos de punção.',
          'Julgar I: deltoide 90° + dorsoglútea 60°? → FALSO — IM sempre 90°.',
          'Julgar II: ID 15° com bisel lateralizado? → FALSO — bisel para cima.',
          'Julgar III: SC 90° bisel baixo? → FALSO — SC ~45°.',
          'Julgar IV: punção venosa 15° bevel up? → VERDADEIRO.',
          'Somente IV correta — alternativas pedem combinações.',
          'Confirmar D — apenas IV.',
          'Marcar D.',
          'Fixação: trocar ângulo IM×SC é erro ROI clássico (item III).',
        ],
        footer_rule: 'Só IV verdadeira → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — ângulos de punção',
        meta: slideMeta,
        content: 'ÂNGULOS — DECORE',
        rows: [
          { label: 'IM', value: '90° no músculo — deltoide ou glútea', badge: 'hot' },
          { label: 'SC', value: '45° na hipoderme (ou 90° com prega em obesos)', badge: 'ok' },
          { label: 'ID', value: '10–15° — bisel para cima', badge: 'ok' },
          { label: 'Venosa', value: '~15–30° — bisel voltado para cima', badge: 'info' },
          { label: 'Pegadinha', value: 'Dorsoglútea 60° — IM não usa 60°', badge: 'warn' },
        ],
        footer_rule: '90° = IM · 45° = SC · 15° up = ID/venosa',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ÂNGULOS V/F',
        items: [
          {
            label: 'Letra A — I e II',
            detail: 'Aceita dorsoglútea 60° e ID lateralizada.',
            correct: 'IM exige 90° em todos os sítios — 60° na dorsoglútea é falso.',
          },
          {
            label: 'Letra B — I e III',
            detail: 'Valida SC 90° como técnica padrão.',
            correct: 'SC usa ~45° — 90° é perfil de IM ou prega em obesos, não regra geral.',
          },
          {
            label: 'Letra C — só II',
            detail: 'Mantém bisel lateralizado na ID.',
            correct: 'Intradérmica: bisel para cima, não lateralizado.',
          },
          {
            label: 'Letra E — só III',
            detail: 'Confirma SC 90° bisel baixo.',
            correct: 'Item III inverte ângulo SC×IM — é falso.',
          },
        ],
        footer_rule: 'Dorsoglútea 60° e SC 90° = distratores',
      },
    ],
  },

  'iaupe-enfermagem-vias-de-administracao-1776056401060-5': {
    family: 'vf',
    guideline:
      'COFEN — via retal (supositório) · SC mais lenta que IM · deltoide até ~2 mL com contraindicações — não 4–5 mL',
    roi_error: 'vias_concept_generic_farmacologia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vias mistas V/F — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Afirmativas sobre supositórios retais, administração subcutânea e músculo deltoide — julgar I, II e III.',
            icon: 'Target',
          },
          {
            label: 'I — supositórios retais',
            detail:
              'Mais finos que vaginais · armazenados na geladeira · introduzidos no esfíncter anal interno com contato na mucosa retal — VERDADEIRO.',
            icon: 'CheckCircle',
          },
          {
            label: 'II — via subcutânea',
            detail:
              'Medicamentos no tecido conjuntivo frouxo sob a derme — menos suprimento sanguíneo que músculos · absorção mais lenta que IM — VERDADEIRO.',
            icon: 'TrendingUp',
          },
          {
            label: 'III — músculo deltoide (pegadinha)',
            detail:
              '“Difícil acesso” · bem desenvolvido · 4–5 mL · sem contraindicação — FALSO: deltoide acessível, máx ~2 mL, há contraindicações.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Erro ROI — volume deltoide',
            detail: 'Banca infla quantidade no deltoide — referência ~2 mL, não 4–5 mL.',
            icon: 'Syringe',
          },
          {
            label: 'Tecido subcutâneo',
            detail: 'Hipoderme — vascularização menor que músculo estriado (IM).',
            icon: 'Layers',
          },
        ],
        footer_rule: 'I e II verdadeiras · III falsa (deltoide ~2 mL)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: V/F I–III + combinações A–E.',
          'Julgar I: supositórios retais mais finos que vaginais, geladeira, esfíncter anal interno? → VERDADEIRO.',
          'Julgar II: SC no tecido conjuntivo sob a derme, absorção mais lenta que IM? → VERDADEIRO.',
          'Julgar III: deltoide difícil acesso, 4–5 mL, sem contraindicação? → FALSO — máx ~2 mL.',
          'Conjunto: I e II verdadeiras, III falsa.',
          'Eliminar A (só I), B (só II), C (só III), E (II+III).',
          'Confirmar D — I e II.',
          'Marcar D.',
          'Fixação: deltoide 4–5 mL é pegadinha de volume.',
        ],
        footer_rule: 'I=V · II=V · III=F → D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — retal · SC · deltoide',
        meta: slideMeta,
        content: 'VIAS — PARÂMETROS',
        rows: [
          {
            label: 'Supositório retal',
            value: 'Mais fino que vaginal · geladeira · esfíncter anal interno · mucosa retal',
            badge: 'ok',
          },
          {
            label: 'Subcutânea',
            value: 'Tecido conjuntivo sob derme — absorção mais lenta que intramuscular',
            badge: 'hot',
          },
          { label: 'Deltoide IM', value: 'Acesso fácil · até ~2 mL · possui contraindicações', badge: 'warn' },
          { label: 'Pegadinha III', value: '4–5 mL no deltoide — volume inflado pela banca', badge: 'warn' },
        ],
        footer_rule: 'Deltoide ≠ 5 mL · SC < IM em velocidade',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F VIAS MISTAS',
        items: [
          {
            label: 'Letra A — só I',
            detail: 'Descarta II (SC mais lenta que IM).',
            correct: 'Item II descreve corretamente perfil de absorção SC.',
          },
          {
            label: 'Letra B — só II',
            detail: 'Descarta I (técnica retal).',
            correct: 'Item I sobre supositório retal está correto.',
          },
          {
            label: 'Letra C — só III',
            detail: 'Aceita deltoide 4–5 mL sem contraindicação.',
            correct: 'Deltoide: máximo ~2 mL e há contraindicações — III é falso.',
          },
          {
            label: 'Letra E — II e III',
            detail: 'Valida volume inflado no deltoide.',
            correct: 'III erra volume e contraindicações — só I+II fecham.',
          },
        ],
        footer_rule: 'Volume deltoide fecha eliminação de III',
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
    console.log(`[handcraft:vias-g17] OK ${slug}`);
  }
  console.log(`[handcraft:vias-g17] total=${ok}`);
}

main();
