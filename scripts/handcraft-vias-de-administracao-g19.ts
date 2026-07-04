#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — vias-de-administracao-g19 (8 slugs P2 Perfis + INCORRETA/EXCETO).
 *
 *   npx tsx scripts/handcraft-vias-de-administracao-g19.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'vias-de-administracao-g19';
const SUBTOPICO = 'Vias de Administração';
const REVIEWED = '2026-07-03';

const COFEN_SOURCE = {
  id: 'vias-administracao-cofen',
  tier: 'A' as const,
  issuer: 'COFEN',
  title: 'Vias de administração de medicamentos',
  year: 2017,
  url: 'https://www.cofen.gov.br/',
  covers: [
    'camadas teciduais ID/SC/IM',
    'insulina SC',
    'rodízio de sítios',
    'lipodistrofia',
    'ângulos SC',
    'via oral absorção',
    'siglas de vias',
  ],
};

const POTTER_SOURCE = {
  id: 'potter-perry-farmacologia',
  tier: 'B' as const,
  issuer: 'Elsevier / Potter & Perry',
  title: 'Fundamentos de Enfermagem — Vias e técnica',
  year: 2020,
  covers: ['camadas anatômicas', 'insulina', 'absorção VO', 'ângulos de punção'],
};

const MS_INSULINA_SOURCE = {
  id: 'ms-insulina-sc',
  tier: 'A' as const,
  issuer: 'Ministério da Saúde',
  title: 'Cuidados na administração de insulina — via subcutânea',
  year: 2020,
  covers: ['rodízio de sítios', 'lipodistrofia', 'prega cutânea', 'evitar umbigo'],
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Pack = {
  family: 'vf' | 'conceito' | 'calc' | 'protocolo' | 'certo_errado';
  guideline: string;
  roi_error?: string;
  branch?: string;
  exam_vs_current?: string;
  sources?: (typeof COFEN_SOURCE)[];
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
    pedagogical_branch: pack.branch ?? 'via_vf_absorcao',
    content_standard: 'golden-v1',
    family: pack.family,
    content_review: {
      reviewed_at: REVIEWED,
      reviewer: 'handcraft',
      guideline_snapshot: pack.guideline,
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: pack.sources ?? [COFEN_SOURCE, POTTER_SOURCE],
  };
}

const SPECS: Record<string, Pack> = {
  'cogeps-unioeste-enfermagem-vias-de-administracao-1778968768987-2': {
    family: 'conceito',
    branch: 'via_vf_absorcao',
    guideline: 'COFEN/BRASIL 2014 — camadas teciduais: ID=derme · SC=hipoderme · IM=músculo',
    roi_error: 'confundir_camadas_id_sc_im',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Camadas teciduais — mapa CORRETA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Quatro afirmativas sobre onde cada via parenteral deposita o fármaco — feche camada anatômica antes da letra.',
            icon: 'Target',
          },
          {
            label: 'Intradérmica (ID)',
            detail: 'Depósito na derme — pápula cutânea; testes e BCG, não hipoderme.',
            icon: 'Syringe',
          },
          {
            label: 'Subcutânea (SC)',
            detail: 'Hipoderme/tecido adiposo — absorção lenta; não confundir com derme (ID).',
            icon: 'Layers',
          },
          {
            label: 'Intramuscular (IM)',
            detail: 'Fibras musculares — mais vascularizada que SC; não é hipoderme.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha SC→derme',
            detail: 'Letra B troca SC por derme — erro ROI confundir_camadas_id_sc_im.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha IM→hipoderme',
            detail: 'Letra C coloca IM na hipoderme — IM atinge músculo, não adiposo.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'ID=derme · SC=hipoderme · IM=músculo — três camadas, três vias',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: é CORRETO sobre vias parenterais (BRASIL, 2014) — uma alternativa descreve camada certa.',
          'Ler A: ID na derme → camada correta para intradérmica → manter.',
          'Eliminar B: SC na derme → SC é hipoderme, não derme.',
          'Eliminar C: IM na hipoderme → IM é músculo, não tecido adiposo.',
          'Eliminar D: ID no músculo → intradérmica não atinge fibras musculares.',
          'Confirmar: só A associa via e camada corretamente.',
          'Marcar A.',
          'Fixação: decore três camadas — derme (ID) · adiposo (SC) · músculo (IM).',
        ],
        footer_rule: 'Camada anatômica fecha a CORRETA — não inverta SC e ID',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — camadas por via',
        meta: slideMeta,
        content: 'PARENTERAL — CAMADA DE DEPÓSITO',
        rows: [
          { label: 'Intradérmica (ID)', value: 'Derme — pápula visível', badge: 'ok' },
          { label: 'Subcutânea (SC)', value: 'Hipoderme / tecido adiposo', badge: 'warn' },
          { label: 'Intramuscular (IM)', value: 'Fibras musculares', badge: 'hot' },
          { label: 'Intravenosa (IV)', value: 'Circulação direta — sem depósito tecidual', badge: 'info' },
          { label: 'Mnemônico', value: 'ID pele · SC gordura · IM músculo' },
        ],
        footer_rule: 'Prova COGEPS: banca troca derme e hipoderme entre SC e ID',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CAMADAS PARENTERAIS',
        items: [
          {
            label: 'Letra B — SC na derme',
            detail: 'Associa subcutânea ao estrato mais superficial da pele.',
            correct: 'SC deposita na hipoderme (adiposo), não na derme — camada da ID.',
          },
          {
            label: 'Letra C — IM na hipoderme',
            detail: 'Confunde músculo com tecido subcutâneo adiposo.',
            correct: 'IM atinge fibras musculares; hipoderme é alvo da SC, não da IM.',
          },
          {
            label: 'Letra D — ID no músculo',
            detail: 'Eleva a profundidade da intradérmica até o músculo.',
            correct: 'ID permanece na derme — agulha rasa, pápula cutânea visível.',
          },
        ],
        footer_rule: 'Três erros = três inversões de camada — A é a única correta',
      },
    ],
  },

  'idecan-enfermagem-vias-de-administracao-1778712108887-6': {
    family: 'certo_errado',
    branch: 'via_generico',
    guideline: 'MS/COFEN — insulina SC: rodízio obrigatório · lipodistrofia · prega para evitar IM',
    roi_error: 'rodizio_irrelevante_insulina',
    sources: [COFEN_SOURCE, MS_INSULINA_SOURCE, POTTER_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Insulina SC — mapa INCORRETA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Assinale a afirmativa INCORRETA sobre locais e técnica de insulina SC.',
            icon: 'Target',
          },
          {
            label: 'Sítios seguros',
            detail: 'Braço posterior, nádega QSL — afastados de osso, vaso e nervo; acesso para autoadministração.',
            icon: 'MapPin',
          },
          {
            label: 'Tecido saudável',
            detail: 'Evitar lipodistrofia/lipohipertrofia — tecido fibroso altera absorção.',
            icon: 'Shield',
          },
          {
            label: 'Prega subcutânea',
            detail: 'Pinça de pele evidencia adiposo e reduz risco de injetar no músculo.',
            icon: 'Hand',
          },
          {
            label: 'Rodízio — pegadinha',
            detail: 'Letra C nega rodízio — erro ROI rodizio_irrelevante_insulina; rodízio é essencial.',
            icon: 'RefreshCw',
          },
        ],
        footer_rule: 'INCORRETA = achar a falsa — rodízio nunca é irrelevante em insulina',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa INCORRETA sobre insulina SC — três são condutas corretas.',
          'Testar A: braço posterior e nádega QSL como sítios → conduta correta → eliminar.',
          'Testar B: tecido subcutâneo saudável, evitar lipodistrofia → conduta correta → eliminar.',
          'Testar D: prega para evidenciar SC e não atingir músculo → conduta correta → eliminar.',
          'Testar C: rodízio irrelevante → FALSO — rodízio previne lipodistrofia e absorção irregular.',
          'Confirmar: só C contradiz diretriz de insulina.',
          'Marcar C.',
          'Fixação: insulina = rodízio + tecido saudável + prega quando necessário.',
        ],
        footer_rule: 'Roteiro INCORRETA: valide A → B → D → C (falsa)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — insulina SC',
        meta: slideMeta,
        content: 'INSULINA — CUIDADOS DE SÍTIO',
        rows: [
          { label: 'Sítios recomendados', value: 'Abdômen (fora 5 cm do umbigo) · braço · coxa · nádega', badge: 'ok' },
          { label: 'Rodízio', value: 'Obrigatório — previne lipodistrofia', badge: 'hot' },
          { label: 'Lipodistrofia', value: 'Evitar reaplicar no mesmo ponto fibroso', badge: 'warn' },
          { label: 'Prega cutânea', value: 'Evidencia adiposo · evita injeção IM acidental', badge: 'info' },
          { label: 'Autoadministração', value: 'Sítio de fácil acesso e visualização', badge: 'ok' },
        ],
        footer_rule: 'Rodízio não é opcional — é núcleo do controle glicêmico seguro',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INSULINA INCORRETA',
        items: [
          {
            label: 'Letra A — sítios de aplicação',
            detail: 'Lista braço posterior e nádega QSL como locais válidos.',
            correct: 'Afirmativa correta: sítios clássicos de insulina SC com acesso para autoadministração.',
          },
          {
            label: 'Letra B — lipodistrofia',
            detail: 'Orienta tecido subcutâneo saudável e evitar áreas fibrosas.',
            correct: 'Afirmativa correta: lipodistrofia altera absorção — sítio deve ser saudável.',
          },
          {
            label: 'Letra D — prega subcutânea',
            detail: 'Descreve pinça de pele para não atingir músculo.',
            correct: 'Afirmativa correta: prega evidencia hipoderme e reduz IM acidental.',
          },
          {
            label: 'Letra C — rodízio irrelevante',
            detail: 'Nega importância do rodízio de pontos.',
            correct: 'INCORRETA: rodízio é fundamental — sem ele aumenta lipodistrofia e variabilidade glicêmica.',
          },
        ],
        footer_rule: 'Em INCORRETA de insulina, a falsa costuma negar rodízio ou técnica',
      },
    ],
  },

  'contemax-enfermagem-vias-de-administracao-1778968598934-5': {
    family: 'conceito',
    branch: 'via_vf_absorcao',
    guideline: 'MS/COFEN — insulina SC: alternar sítios previne lipodistrofia; absorção irregular na lipodistrofia',
    roi_error: 'mesmo_local_insulina',
    sources: [COFEN_SOURCE, MS_INSULINA_SOURCE, POTTER_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Insulina diabético — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Principal cuidado do técnico ao administrar insulina em diabético — foco em técnica SC.',
            icon: 'Target',
          },
          {
            label: 'Rodízio de sítios',
            detail: 'Alternar pontos previne lipodistrofia e absorção irregular — núcleo do gabarito.',
            icon: 'RefreshCw',
          },
          {
            label: 'SV antes de cada dose?',
            detail: 'Monitorização geral, mas não é o principal cuidado específico da via SC.',
            icon: 'HeartPulse',
          },
          {
            label: 'Mesmo local diário',
            detail: 'Letra E inverte conduta — repetir sítio favorece lipodistrofia.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Insulina IV hipoglicemia',
            detail: 'Letra D confunde via — hipoglicemia leve/moderada: glicose oral/EV, não insulina IV.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Insulina SC = rodízio + técnica — não confunda com monitorização geral',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: principal cuidado na administração de insulina — técnica de aplicação SC.',
          'Eliminar A: SV antes de cada dose — cuidado geral, não específico da técnica SC.',
          'Eliminar C: peso semanal — acompanhamento clínico, não cuidado imediato da punção.',
          'Eliminar D: insulina IV na hipoglicemia — conduta invertida; hipoglicemia recebe glicose, não insulina.',
          'Eliminar E: mesmo local diário — agrava lipodistrofia; oposto do recomendado.',
          'Confirmar B: alternar locais para prevenir lipodistrofia — cuidado técnico central.',
          'Marcar B.',
          'Fixação: insulina = rodízio de sítios + agulha adequada + não reutilizar área fibrosa.',
        ],
        footer_rule: 'Principal cuidado = técnica de sítio, não monitorização periférica',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — cuidados insulina',
        meta: slideMeta,
        content: 'INSULINA SC — PRIORIDADES',
        rows: [
          { label: 'Rodízio de sítios', value: 'Previne lipodistrofia e absorção errática', badge: 'hot' },
          { label: 'Agulha curta', value: 'Reduz risco de IM acidental', badge: 'ok' },
          { label: 'Não reutilizar sítio fibroso', value: 'Lipohipertrofia = glicemia imprevisível', badge: 'warn' },
          { label: 'Hipoglicemia', value: 'Glicose oral/EV — nunca insulina IV para corrigir', badge: 'info' },
          { label: 'SV', value: 'Monitorização geral — não substitui técnica de punção', badge: 'info' },
        ],
        footer_rule: 'Lipodistrofia = erro clássico de prova em insulina',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INSULINA CONTAMAX',
        items: [
          {
            label: 'Letra A — sinais vitais',
            detail: 'Parece cuidado completo, mas é monitorização geral do paciente.',
            correct: 'Não é o principal cuidado da técnica SC — rodízio de sítios prevalece.',
          },
          {
            label: 'Letra D — insulina IV hipoglicemia',
            detail: 'Associa insulina à correção de hipoglicemia — conduta perigosa.',
            correct: 'Hipoglicemia recebe carboidrato/glicose — insulina IV agravaria a queda glicêmica.',
          },
          {
            label: 'Letra E — mesmo local diário',
            detail: 'Justifica repetir sítio para “evitar erro de cálculo”.',
            correct: 'Repetir local causa lipodistrofia — rodízio é obrigatório, não opcional.',
          },
        ],
        footer_rule: 'B vence porque ataca lipodistrofia — tema mais cobrado que SV',
      },
    ],
  },

  'idecan-enfermagem-vias-de-administracao-1778968997293-4': {
    family: 'certo_errado',
    branch: 'via_generico',
    guideline: 'MS/COFEN — insulina SC: rodízio obrigatório · prega cutânea · sítios periféricos',
    roi_error: 'rodizio_irrelevante_insulina',
    sources: [COFEN_SOURCE, MS_INSULINA_SOURCE, POTTER_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Locais insulina — mapa INCORRETA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando IDECAN',
            detail: 'Mesmo núcleo IDECAN: locais SC seguros + técnica — achar a afirmativa falsa.',
            icon: 'Target',
          },
          {
            label: 'Quadrante nádega',
            detail: 'QSL (superior lateral) — sítio clássico longe de nervo ciático.',
            icon: 'MapPin',
          },
          {
            label: 'Braço posterior',
            detail: 'Terço superior posterior — acesso para autoadministração com rodízio.',
            icon: 'Hand',
          },
          {
            label: 'Tecido sem lipodistrofia',
            detail: 'Hipoderme saudável garante absorção previsível da insulina.',
            icon: 'Shield',
          },
          {
            label: 'Rodízio negado (C)',
            detail: 'Afirmar que rodízio é irrelevante — única falsa; restante são condutas corretas.',
            icon: 'RefreshCw',
          },
        ],
        footer_rule: 'IDECAN repete tema insulina — feche rodízio antes de marcar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: INCORRETA sobre locais e técnica de insulina SC.',
          'A: braço posterior + nádega QSL → sítios válidos → eliminar.',
          'B: evitar lipodistrofia → conduta correta → eliminar.',
          'D: prega para não atingir músculo → técnica correta → eliminar.',
          'C: rodízio irrelevante → FALSO — MS e COFEN exigem rodízio sistemático.',
          'Marcar C.',
          'Fixação: toda questão IDECAN insulina testa rodízio, prega ou lipodistrofia.',
        ],
        footer_rule: 'Três verdadeiras (A,B,D) + uma falsa (C) = padrão IDECAN',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore — insulina SC IDECAN',
        meta: slideMeta,
        content: 'INSULINA — TRÍADE IDECAN',
        rows: [
          { label: 'Rodízio', value: 'Sempre relevante — nunca marcar como irrelevante', badge: 'hot' },
          { label: 'Prega', value: 'Pinça de pele · evita IM acidental', badge: 'ok' },
          { label: 'Lipodistrofia', value: 'Tecido fibroso = absorção imprevisível', badge: 'warn' },
          { label: 'Sítios', value: 'Abdômen · braço · coxa · nádega QSL', badge: 'info' },
        ],
        footer_rule: 'Cai de novo: negar rodízio é a falsa mais frequente',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — IDECAN INSULINA',
        items: [
          {
            label: 'Letra A — locais braço/nádega',
            detail: 'Gramática imperfeita, mas conteúdo técnico válido.',
            correct: 'Afirmativa correta: braço posterior e nádega QSL são sítios clássicos de insulina.',
          },
          {
            label: 'Letra B — lipodistrofia',
            detail: 'Reforça evitar tecido alterado.',
            correct: 'Afirmativa correta: lipodistrofia compromete absorção — usar hipoderme saudável.',
          },
          {
            label: 'Letra D — prega subcutânea',
            detail: 'Técnica de pinça para evidenciar adiposo.',
            correct: 'Afirmativa correta: prega separa SC de músculo na punção.',
          },
          {
            label: 'Letra C — rodízio irrelevante',
            detail: 'Nega cuidado essencial do tratamento insulínico.',
            correct: 'INCORRETA: rodízio é pilar do controle — sem ele aumenta lipodistrofia.',
          },
        ],
        footer_rule: 'Não confunda gramática ruim (A) com afirmativa falsa (C)',
      },
    ],
  },

  'cotec-fadenor-enfermagem-vias-de-administracao-1778968666352-3': {
    family: 'conceito',
    branch: 'via_tecnica_admin',
    guideline: 'COFEN — SC com prega espessa: 90°; adiposo fino: 45° com pinça',
    roi_error: 'angulo_sc_errado',
    exam_vs_current: 'Gabarito prova = 90° (prega/espessura); guideline atual também aceita 45° em adiposo fino',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Ângulo SC — mapa Cotec',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Angulação da agulha na via subcutânea — prova Cotec cobra 90° na prega cutânea.',
            icon: 'Target',
          },
          {
            label: 'SC com prega',
            detail: 'Prega cutânea espessa → injeção a 90° na prega — padrão desta banca.',
            icon: 'Gauge',
          },
          {
            label: 'Ângulos rasos (30°–60°)',
            detail: 'Perfil de intradérmica ou SC muito fina — não gabarito Cotec aqui.',
            icon: 'Syringe',
          },
          {
            label: '80° intermediário',
            detail: 'Valor atípico — banca usa 45° ou 90° como referências clássicas.',
            icon: 'GitCompare',
          },
          {
            label: 'Pegadinha 45° vs 90°',
            detail: 'Erro ROI angulo_sc_errado — depende de espessura do adiposo e uso de prega.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Nesta prova: SC = 90° — feche gabarito antes de guideline genérico',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: angulação na via subcutânea — alternativas numéricas.',
          'Eliminar A (30°): ângulo de ID ou SC muito superficial.',
          'Eliminar B (50°) e C (60°): valores intermediários sem referência clássica nesta questão.',
          'Eliminar D (80°): atípico — banca trabalha 45° ou 90°.',
          'Confirmar E (90°): gabarito Cotec para SC — especialmente com prega cutânea.',
          'Marcar E.',
          'Fixação: prova pede número literal — E=90°; em outras bancas 45° pode ser gabarito com adiposo fino.',
        ],
        footer_rule: 'Resposta literal da prova prevalece quando espessura não é especificada',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — ângulos SC',
        meta: slideMeta,
        content: 'SC — ÂNGULO × TECIDO',
        rows: [
          { label: 'Adiposo fino', value: '45° com pinça de pele', badge: 'ok' },
          { label: 'Adiposo espesso / prega', value: '90° na prega cutânea', badge: 'hot' },
          { label: 'Intradérmica', value: '10–15° — pápula', badge: 'info' },
          { label: 'IM', value: '90° perpendicular ao músculo', badge: 'warn' },
          { label: 'Prega espessa SC', value: '90° na prega — referência Cotec', badge: 'hot' },
        ],
        footer_rule: 'Espessura do adiposo define ângulo — Cotec: 90° com prega',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ÂNGULO SC',
        items: [
          {
            label: 'Letra A — 30°',
            detail: 'Ângulo raso típico de intradérmica.',
            correct: 'ID usa 10–15°; 30° não é referência SC desta prova.',
          },
          {
            label: 'Letra B/C — 50° e 60°',
            detail: 'Valores intermediários sem respaldo em tabelas clássicas.',
            correct: 'Bancas costumam cobrar 45° (fino) ou 90° (prega) — não 50°/60°.',
          },
          {
            label: 'Letra D — 80°',
            detail: 'Quase perpendicular, mas não é o gabarito literal.',
            correct: '90° (E) é a alternativa exata pedida pela Cotec nesta questão.',
          },
        ],
        footer_rule: 'Decore gabarito E — mas entenda que 45° vale em outro contexto de espessura',
      },
    ],
  },

  'idecan-enfermagem-vias-de-administracao-1780066924385-0': {
    family: 'certo_errado',
    branch: 'via_generico',
    guideline: 'MS — insulina SC: evitar 5 cm ao redor do umbigo; abdômen, braço, coxa e glúteo são sítios válidos',
    roi_error: 'site_umbigo_insulina',
    sources: [COFEN_SOURCE, MS_INSULINA_SOURCE, POTTER_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sítios insulina — mapa EXCETO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando EXCETO',
            detail: 'Melhores locais para insulina — três são sítios válidos; um deve ser excluído.',
            icon: 'Target',
          },
          {
            label: 'Abdômen (barriga)',
            detail: 'Sítio preferencial — exceto área periumbilical (5 cm do umbigo).',
            icon: 'Circle',
          },
          {
            label: 'Braço posterior',
            detail: 'Terço superior posterior — sítio clássico com rodízio.',
            icon: 'Hand',
          },
          {
            label: 'Glúteo superior-lateral',
            detail: 'Quadrante superior e lateral — longe do ciático.',
            icon: 'MapPin',
          },
          {
            label: 'Perto do umbigo (A)',
            detail: 'Zona contraindicada — única EXCETO; restante são sítios recomendados.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'EXCETO insulina = achar o sítio proibido, não o recomendado',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: melhores locais para insulina, EXCETO — três alternativas descrevem sítios válidos.',
          'B: abdômen (barriga) → sítio recomendado (fora zona umbilical) → eliminar.',
          'C: braço terço superior posterior → sítio válido → eliminar.',
          'D: glúteo superior e lateral → sítio válido → eliminar.',
          'A: perto do umbigo → área a evitar (cicatriz, vascularização, técnica) → EXCETO.',
          'Marcar A.',
          'Fixação: abdômen sim, umbigo não — distância mínima ~5 cm do umbigo.',
        ],
        footer_rule: 'EXCETO = sítio proibido (umbigo), não sítio preferencial',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sítios insulina',
        meta: slideMeta,
        content: 'INSULINA — SÍTIOS E EXCEÇÕES',
        rows: [
          { label: 'Abdômen', value: 'Preferencial — evitar 5 cm do umbigo', badge: 'hot' },
          { label: 'Braço posterior', value: 'Terço superior — autoadministração', badge: 'ok' },
          { label: 'Coxa', value: 'Face anterior/lateral — rodízio', badge: 'ok' },
          { label: 'Glúteo QSL', value: 'Superior lateral — seguro', badge: 'ok' },
          { label: 'Evitar', value: 'Umbigo · lipodistrofia · cicatriz · hematoma', badge: 'warn' },
        ],
        footer_rule: 'Perto do umbigo ≠ abdômen — zona periumbilical é exceção',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — EXCETO INSULINA',
        items: [
          {
            label: 'Letra B — abdômen',
            detail: 'Parece igual a “perto do umbigo”, mas abdômen é sítio preferencial.',
            correct: 'Conduta correta: abdômen é sítio clássico — excluir só a área periumbilical.',
          },
          {
            label: 'Letra C — braço',
            detail: 'Descreve terço superior posterior do braço.',
            correct: 'Conduta correta: braço é sítio válido com rodízio sistemático.',
          },
          {
            label: 'Letra D — glúteo',
            detail: 'Parte superior e lateral das nádegas.',
            correct: 'Conduta correta: glúteo QSL é sítio seguro longe do nervo ciático.',
          },
          {
            label: 'Letra A — perto do umbigo',
            detail: 'Zona central do abdômen contraindicada para punção.',
            correct: 'Exceção falsa: perto do umbigo é sítio proibido — manter 5 cm de distância periumbilical.',
          },
        ],
        footer_rule: 'Não marque abdômen (B) por confundir com umbigo (A)',
      },
    ],
  },

  'fau-unicentro-enfermagem-vias-de-administracao-1776056383154-1': {
    family: 'conceito',
    branch: 'via_generico',
    guideline: 'COFEN — siglas clássicas: VO · IM · IV · SC · retal · inalatória · tópica',
    roi_error: 'sigla_invalida_via',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Siglas de vias — mapa da prova',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'Alternativa que NÃO corresponde a via de administração — reconhecer siglas válidas.',
            icon: 'Target',
          },
          {
            label: 'VO — oral',
            detail: 'Via enteral por boca — sigla clássica de prova.',
            icon: 'Pill',
          },
          {
            label: 'IM · IV · SC',
            detail: 'Parenterais padrão — intramuscular, intravenosa, subcutânea.',
            icon: 'Syringe',
          },
          {
            label: 'HD — hemodiálise',
            detail: 'Procedimento dialítico, não rota de administração de medicamento — EXCETO.',
            icon: 'XCircle',
          },
          {
            label: 'Pegadinha sigla inventada',
            detail: 'Banca mistura sigla de procedimento (HD) com vias farmacológicas.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Via = rota do fármaco ao organismo — HD é terapia renal',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: qual NÃO é via de administração de medicamentos.',
          'A VO → via oral válida → eliminar.',
          'B IM → intramuscular válida → eliminar.',
          'C IV → intravenosa válida → eliminar.',
          'D SC → subcutânea válida → eliminar.',
          'E HD → hemodiálise (procedimento), não sigla de via farmacológica.',
          'Marcar E.',
          'Fixação: VO · IM · IV · SC · ID · VR · inalatória — HD não entra na lista.',
        ],
        footer_rule: 'Procedimento ≠ via — HD filtra sangue, não administra por rota clássica',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — siglas de vias',
        meta: slideMeta,
        content: 'SIGLAS — VIAS CLÁSSICAS',
        rows: [
          { label: 'VO', value: 'Via oral', badge: 'ok' },
          { label: 'IM', value: 'Intramuscular', badge: 'ok' },
          { label: 'IV / EV', value: 'Intravenosa / endovenosa', badge: 'hot' },
          { label: 'SC', value: 'Subcutânea', badge: 'ok' },
          { label: 'ID', value: 'Intradérmica', badge: 'info' },
          { label: 'HD', value: 'Hemodiálise — procedimento, não via', badge: 'warn' },
        ],
        footer_rule: 'Decore siglas — desconfie de abreviações de procedimentos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SIGLAS',
        items: [
          {
            label: 'Letra A — VO',
            detail: 'Sigla universal de via oral.',
            correct: 'Via válida — eliminar em questão “NÃO corresponde”.',
          },
          {
            label: 'Letra B — IM',
            detail: 'Intramuscular — parenteral clássica.',
            correct: 'Via válida — depósito no músculo.',
          },
          {
            label: 'Letra C — IV',
            detail: 'Intravenosa — ação imediata.',
            correct: 'Via válida — acesso direto à circulação.',
          },
          {
            label: 'Letra D — SC',
            detail: 'Subcutânea — hipoderme.',
            correct: 'Via válida — absorção lenta e contínua.',
          },
        ],
        footer_rule: 'Só E (HD) não é via — restante são parenterais/enterais padrão',
      },
    ],
  },

  'instituto-consulplan-enfermagem-vias-de-administracao-1778968687469-8': {
    family: 'certo_errado',
    branch: 'via_generico',
    guideline: 'Potter/COFEN — VO: absorção principal no intestino delgado; via mais segura e econômica',
    roi_error: 'absorcao_pancreas_vo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Via oral — mapa INCORRETA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail: 'INCORRETA sobre via oral — três afirmativas verdadeiras sobre VO.',
            icon: 'Target',
          },
          {
            label: 'Absorção inicial',
            detail: 'Boca e estômago iniciam absorção (ex.: sublingual, alguns fármacos gástricos).',
            icon: 'Droplets',
          },
          {
            label: 'Via segura e econômica',
            detail: 'VO é referência de segurança e menor custo versus parenteral.',
            icon: 'Shield',
          },
          {
            label: 'Limitações do TGI',
            detail: '1ª passagem hepática, pH, motilidade e destruição enzimática limitam VO.',
            icon: 'Route',
          },
          {
            label: 'Pâncreas (C) — pegadinha',
            detail: 'Maioria dos fármacos absorve no intestino delgado, não no pâncreas — falsa.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'VO = delgado (absorção) · fígado (1ª passagem) — não pâncreas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: INCORRETA sobre administração via oral.',
          'A: absorção pode começar na boca e estômago → verdadeira → eliminar.',
          'B: via mais segura e menos dispendiosa → verdadeira → eliminar.',
          'D: limitações do trajeto digestivo → verdadeira → eliminar.',
          'C: maioria absorvida no pâncreas → FALSO — absorção principal no intestino delgado.',
          'Marcar C.',
          'Fixação: pâncreas secreta enzimas; absorção VO é mucosa intestinal.',
        ],
        footer_rule: 'INCORRETA VO: desconfie de órgão errado (pâncreas × delgado)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — via oral',
        meta: slideMeta,
        content: 'VO — ABSORÇÃO E PERFIL',
        rows: [
          { label: 'Início absorção', value: 'Boca (sublingual) · estômago (alguns)', badge: 'info' },
          { label: 'Absorção principal', value: 'Intestino delgado — vilosidades', badge: 'hot' },
          { label: '1ª passagem hepática', value: 'Fígado metaboliza antes da circulação geral', badge: 'warn' },
          { label: 'Segurança/custo', value: 'Via preferencial quando possível', badge: 'ok' },
          { label: 'Pâncreas', value: 'Secreção enzimática — não é sítio de absorção VO', badge: 'warn' },
        ],
        footer_rule: 'Delgado absorve · pâncreas digere — não inverta funções',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VO INCORRETA',
        items: [
          {
            label: 'Letra A — boca e estômago',
            detail: 'Cita início da absorção em vias enterais.',
            correct: 'Afirmativa correta: alguns fármacos absorvem já na boca (sublingual) ou estômago.',
          },
          {
            label: 'Letra B — segura e econômica',
            detail: 'Perfil clássico da via oral frente às parenterais.',
            correct: 'Afirmativa correta: VO é menos invasiva e de menor custo operacional.',
          },
          {
            label: 'Letra D — limitações TGI',
            detail: 'Menciona trajeto digestivo como fator limitante.',
            correct: 'Afirmativa correta: pH, enzimas e motilidade restringem biodisponibilidade VO.',
          },
          {
            label: 'Letra C — pâncreas',
            detail: 'Atribui absorção majoritária ao pâncreas exócrino.',
            correct: 'INCORRETA: absorção VO ocorre na mucosa do intestino delgado, não no pâncreas.',
          },
        ],
        footer_rule: 'C troca órgão digestório — clássico em INCORRETA de farmacocinética VO',
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
    console.log(`[handcraft:vias-g19] OK ${slug}`);
  }
  console.log(`[handcraft:vias-g19] total=${ok}`);
}

main();
