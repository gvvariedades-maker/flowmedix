#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — puncao-venosa-e-cuidados-com-cateteres-g03 (8 slugs P0 puncao_exceto).
 *
 *   npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g03
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  buildPuncaoGuidelineSnapshot,
  buildPuncaoSourcesForSlug,
} from '@/lib/catalogMigration/puncaoPedagogy';

const LOTE = 'puncao-venosa-e-cuidados-com-cateteres-g03';
const SUBTOPICO = 'Punção Venosa e Cuidados com Cateteres';
const BRANCH = 'puncao_exceto';
const REVIEWED = '2026-07-12';

function cleanPdfArtifacts(text: string): string {
  return text
    .replace(/\bumidade ousujidade\b/gi, 'umidade ou sujidade')
    .replace(/\baouso\b/gi, 'ao uso')
    .replace(/\bessasrecomendações\b/gi, 'essas recomendações')
    .replace(/\binfecçãorelacionada\b/gi, 'infecção relacionada')
    .replace(/\bparaassegurar\b/gi, 'para assegurar')
    .replace(/([.!?])([A-Za-zÀ-ú])/g, '$1 $2');
}

function cleanQuestionData(qd: Q['question_data']): Q['question_data'] {
  return {
    ...qd,
    instruction: cleanPdfArtifacts(qd.instruction),
    options: qd.options.map((o) => ({ ...o, text: cleanPdfArtifacts(o.text) })),
  };
}

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'calc' | 'certo_errado';
  guideline: string;
  roi_error?: string;
  exam_vs_current?: string;
  slides: unknown[];
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(q: Q, pack: Pack, slug: string) {
  const corpus = `${q.question_data.instruction} ${q.question_data.options.map((o) => o.text).join(' ')} ${JSON.stringify(pack.slides)}`;
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
      guideline_snapshot: buildPuncaoGuidelineSnapshot(corpus, pack.guideline),
      exam_vs_current: pack.exam_vs_current ?? 'none',
      catalog_slug: slug,
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: buildPuncaoSourcesForSlug(corpus),
  };
}

const SPECS: Record<string, Pack> = {
  'avancasp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340270805-8': {
    family: 'certo_errado',
    guideline: 'Cuidados na via intravenosa central — curativo por integridade, não cronograma fixo',
    roi_error: 'curativo_cvc_12h_cronograma',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — cuidados na via central',
        chip_label: 'INCORRETA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Cuidados na administração por via intravenosa central — marque a INCORRETA.',
            icon: 'Target',
          },
          {
            label: 'Fixação e sítio',
            detail: 'Observar fixação e avaliar diariamente o sítio por sinais de infecção — condutas corretas.',
            icon: 'Eye',
          },
          {
            label: 'Conexões',
            detail: 'Manter conexões fechadas e observar sangramento local — segurança do acesso.',
            icon: 'Link',
          },
          {
            label: 'Curativo',
            detail: 'Troca quando sujo, solto ou úmido — não em intervalo fixo de horas.',
            icon: 'Bandage',
          },
          {
            label: 'Pegadinha',
            detail: 'A banca oferece troca de curativo em intervalo fixo de horas como se fosse regra.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Curativo central: integridade do selo, não relógio.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Curativo em acesso central',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Troca do curativo', value: 'Quando sujo, solto ou úmido — por integridade.', badge: 'ok' },
          { label: 'Avaliação', value: 'Sítio diário — rubor, dor, secreção.', badge: 'ok' },
          { label: 'Conexões', value: 'Manter fechadas entre manipulações.', badge: 'ok' },
          { label: 'Pegadinha', value: 'Cronograma fixo em horas não substitui avaliação clínica.', badge: 'warn' },
        ],
        footer_rule: 'MS/Anvisa: curativo por necessidade clínica.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Achar a INCORRETA',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando INCORRETA: cuidados na via intravenosa central.',
          'Validar A (fixação), B (avaliação diária), D (sangramento), E (conexões fechadas) — corretas.',
          'Letra C propõe trocar curativo em intervalo fixo de horas — não é protocolo atual.',
          'Marcar letra C.',
          'Fixação: em similares, desconfie de periodicidade fixa de curativo em acesso vascular.',
        ],
        footer_rule: 'INCORRETA = uma conduta falsa entre várias corretas.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Por que A, B, D e E são corretas',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — INCORRETA VIA CENTRAL',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Fixação',
            detail: 'Cateter mal fixado aumenta risco de arrancamento e infecção.',
            correct: 'Conduta correta — não é a INCORRETA.',
          },
          {
            label: 'Letra B — Avaliação diária',
            detail: 'Inspeção do sítio detecta flebite e sinais precoces de infecção.',
            correct: 'Monitorização obrigatória — eliminar do INCORRETA.',
          },
          {
            label: 'Letra D — Sangramento',
            detail: 'Extravasamento de sangue no sítio exige conduta e registro.',
            correct: 'Observação pertinente — alternativa correta.',
          },
          {
            label: 'Letra E — Conexões fechadas',
            detail: 'Sistema fechado reduz entrada de microrganismos.',
            correct: 'Barreira de segurança — só C falha no intervalo fixo.',
          },
        ],
        footer_rule: 'A INCORRETA é o curativo em cronograma fixo de horas.',
      },
    ],
  },

  'avancasp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562687359-1': {
    family: 'certo_errado',
    guideline: 'Prevenção em CIVP — não tocar o sítio após antissepsia',
    roi_error: 'tocar_pos_antissepsia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'EXCETO — prevenção no CIVP',
        chip_label: 'EXCETO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Medidas de prevenção de eventos adversos no cateter intravenoso periférico — EXCETO.',
            icon: 'Target',
          },
          {
            label: 'Higiene das mãos',
            detail: 'HH antes e após manipular o cateter — medida base.',
            icon: 'Hand',
          },
          {
            label: 'Curativo identificado',
            detail: 'Rotular data/hora e tipo de dispositivo — rastreabilidade.',
            icon: 'Tag',
          },
          {
            label: 'Banho',
            detail: 'Proteger o sítio com impermeável quando a cobertura é permeável.',
            icon: 'Droplets',
          },
          {
            label: 'Intruso',
            detail: 'Tocar o local após antissepsia quebra o campo preparado.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Após antissepsia: mãos longe do sítio salvo técnica asséptica.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Campo asséptico do CIVP',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'ANTISSEPSIA FEITA → NÃO TOCAR O SÍTIO',
        rows: [
          { label: 'Antissepsia', value: 'Friccionar e aguardar secar antes da punção.', badge: 'ok' },
          { label: 'Pós-antissepsia', value: 'Não palpar nem reposicionar sem nova assepsia.', badge: 'warn' },
          { label: 'Avaliação', value: 'Observar flebite sem violar técnica — olhar, não cutucar.', badge: 'info' },
        ],
        footer_rule: 'O EXCETO é violar o sítio já preparado.',
      },
      {
        type: 'logic_flow',
        slide_title: 'EXCETO no CIVP',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'EXCETO em prevenção de eventos adversos no CIVP.',
          'A (HH), C (proteção no banho), D (avaliar flebite), E (identificação) — medidas corretas.',
          'B: tocar o local após antissepsia — quebra asséptica.',
          'Marcar letra B.',
          'Fixação: após preparar a pele, só avance com punção sem tocar o campo.',
        ],
        footer_rule: 'EXCETO = a única medida que aumenta contaminação.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Condutas corretas (não são o EXCETO)',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — ASSÉPSIA',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Higiene das mãos',
            detail: 'Primeira barreira contra microrganismos no cateter.',
            correct: 'Medida correta de prevenção — não marque no EXCETO.',
          },
          {
            label: 'Letra C — Proteção no banho',
            detail: 'Evita umidade no curativo permeável.',
            correct: 'Conduta adequada — eliminar do EXCETO.',
          },
          {
            label: 'Letra D — Avaliar flebite',
            detail: 'Inspeção visual do sítio faz parte da segurança.',
            correct: 'Monitorização correta — o EXCETO é tocar após antissepsia (B).',
          },
          {
            label: 'Letra E — Identificação',
            detail: 'Curativo rotulado orienta troca e comunicação.',
            correct: 'Documentação no dispositivo — alternativa correta.',
          },
        ],
        footer_rule: 'B é a exceção — contamina o sítio preparado.',
      },
    ],
  },

  'avancasp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562711132-3': {
    family: 'vf',
    guideline: 'Manuseio de dispositivos venosos — fixação por demanda; II e III verdadeiros',
    roi_error: 'fixacao_só_por_calendario',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — dispositivos venosos',
        chip_label: 'V/F',
        meta: slideMeta,
        items: [
          {
            label: 'Item I — Fixação',
            detail: 'Troca de fixação/curativo por demanda (úmido/sujo), não só calendário fixo.',
            icon: 'Calendar',
          },
          {
            label: 'Item II — Banho',
            detail: 'Proteger sítio com plástico se cobertura permeável — verdadeiro.',
            icon: 'Droplets',
          },
          {
            label: 'Item III — Pós-antissepsia',
            detail: 'Não tocar o sítio após antisséptico, salvo técnica asséptica — verdadeiro.',
            icon: 'Shield',
          },
          {
            label: 'Combinação',
            detail: 'Montar V/F de cada item antes de olhar as letras A–E.',
            icon: 'Layers',
          },
        ],
        footer_rule: 'I falso · II e III verdadeiros → letra D.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Fixação e curativo — demanda × calendário',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Curativo/fixação', value: 'Trocar quando úmido, solto ou sujo.', badge: 'ok' },
          { label: 'Item I (falso)', value: 'Periodicidade preestabelecida isolada — incorreto.', badge: 'warn' },
          { label: 'Banho', value: 'Proteger sítio se cobertura permeável.', badge: 'ok' },
          { label: 'Assépsia', value: 'Não tocar após antissepsia sem técnica.', badge: 'ok' },
        ],
        footer_rule: 'Calendário sozinho não substitui avaliação do curativo.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Julgar I, II e III',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Formato V/F: julgar cada item antes da combinação.',
          'Item I: fixação só por periodicidade — FALSO (trocar por demanda).',
          'Item II: proteger no banho com cobertura permeável — VERDADEIRO.',
          'Item III: não tocar após antissepsia salvo técnica — VERDADEIRO.',
          'Combinação: apenas II e III verdadeiros → letra D.',
          'Eliminar A, B, C, E.',
          'Marcar letra D.',
          'Fixação: em V/F de cateter, “só calendário” costuma ser falso.',
        ],
        footer_rule: 'V/F primeiro · combinação depois.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — item I',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F CIVP',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Marcar só o I',
            detail: 'Parece “organizado” trocar só por data.',
            correct: 'Norma exige troca por integridade — I é falso.',
          },
          {
            label: 'Descartar II',
            detail: 'Banho molha curativo permeável se não proteger.',
            correct: 'II é verdadeiro — entra no gabarito D.',
          },
          {
            label: 'Descartar III',
            detail: 'Tocar após antissepsia é erro clássico de prova.',
            correct: 'III é verdadeiro — reforça assépsia.',
          },
          {
            label: 'Letra E — nenhum verdadeiro',
            detail: 'II e III são claramente corretos.',
            correct: 'Combinação D (II+III) fecha a questão.',
          },
        ],
        footer_rule: 'Não pule o julgamento item a item.',
      },
    ],
  },

  'cev-urca-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340213288-1': {
    family: 'certo_errado',
    guideline: 'Administração endovenosa EXCETO — seleção de veia calibrosa e acessível',
    roi_error: 'veia_menos_proeminente',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'EXCETO — medicação endovenosa',
        chip_label: 'EXCETO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Informações corretas na administração endovenosa — marque o EXCETO.',
            icon: 'Target',
          },
          {
            label: 'Técnica de punção',
            detail: 'Mão dominante, bisel para cima, introdução no sentido do retorno — correto (A).',
            icon: 'Syringe',
          },
          {
            label: 'Antissepsia',
            detail: 'Álcool 70% proximal→distal, secar; sujidade com água e sabão antes — correto no enunciado (B).',
            icon: 'Droplets',
          },
          {
            label: 'Identificação',
            detail: 'Data, horário, dispositivo e profissional no acesso — correto (C).',
            icon: 'Tag',
          },
          {
            label: 'Seleção de veia',
            detail: 'Preferir veias menos proeminentes contradiz escolha calibrosa e acessível — EXCETO (D).',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'EXCETO = a falsa entre condutas que parecem certas.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Seleção de veia para punção',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Inspeção/palpação', value: 'Rede venosa antes da punção.', badge: 'ok' },
          { label: 'Veia alvo', value: 'Calibrosa, firme e acessível — não “esconder” o vaso.', badge: 'ok' },
          { label: 'Pegadinha D', value: 'Menos proeminentes ≠ critério técnico.', badge: 'warn' },
          { label: 'Cateter', value: 'Novo dispositivo a cada tentativa.', badge: 'ok' },
        ],
        footer_rule: 'A banca inverte critério de seleção venosa no EXCETO.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Resolver o EXCETO CEV',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'EXCETO em administração endovenosa.',
          'A, B, C e E descrevem condutas corretas na chave da prova.',
          'D prefere veias menos proeminentes — erro de seleção.',
          'Marcar letra D.',
          'Fixação: no EXCETO, não elimine B só por preferir clorexidina — julgue o enunciado literal.',
        ],
        footer_rule: 'Quatro corretas · uma intrusa.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas do EXCETO',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — CEV URCA',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — álcool 70%',
            detail: 'Aluno elimina achando que só clorexidina vale.',
            correct: 'No enunciado, B é conduta correta — EXCETO é D.',
          },
          {
            label: 'Letra A — bisel para cima',
            detail: 'Técnica adequada de punção.',
            correct: 'Alternativa correta — não é o EXCETO.',
          },
          {
            label: 'Letra C — identificação',
            detail: 'Rotulagem do acesso é obrigatória.',
            correct: 'Documentação correta — eliminar.',
          },
          {
            label: 'Letra E — cateter novo',
            detail: 'Reutilizar punção é proibido.',
            correct: 'Conduta correta — sobra D na seleção de veia.',
          },
        ],
        footer_rule: 'D é a única informação incorreta.',
      },
    ],
  },

  'cev-urca-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340213288-2': {
    family: 'protocolo',
    guideline: 'Troca de equipos — hemocomponentes em intervalo curto, não 24 h isolado',
    roi_error: 'equipo_hemo_24h',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — troca de equipos',
        chip_label: 'INCORRETA',
        meta: slideMeta,
        items: [
          {
            label: 'Contexto',
            detail: 'Infecção de corrente sanguínea ligada a dispositivos intravasculares — MS define troca de equipos.',
            icon: 'Target',
          },
          {
            label: 'Monitorização',
            detail: 'Equipo de sistema fechado — troca em prazo longo (96 h na alternativa A).',
            icon: 'Activity',
          },
          {
            label: 'Intermitente / NPT',
            detail: 'Infusão intermitente e nutrição parenteral — troca em 24 h ou por bolsa.',
            icon: 'Clock',
          },
          {
            label: 'Hemocomponentes',
            detail: 'Troca muito mais frequente que infusão comum — não 24 h genérico.',
            icon: 'Droplet',
          },
          {
            label: 'Troca com cateter',
            detail: 'Trocar equipos quando trocar o cateter — conduta correta (E).',
            icon: 'RefreshCw',
          },
        ],
        footer_rule: 'Hemocomponente ≠ equipo de soro de 24 h.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Prazos de troca — foco hemoterapia',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Hemocomponentes', value: 'Troca em poucas horas ou ao fim da bolsa.', badge: 'hot' },
          { label: 'Intermitente', value: 'Troca diária do equipo — alternativa B correta.', badge: 'ok' },
          { label: 'NPT', value: 'Troca por bolsa ou intervalo do MS — C correta.', badge: 'ok' },
          { label: 'Pegadinha D', value: '24 h para sangue — INCORRETA.', badge: 'warn' },
        ],
        footer_rule: 'Sangue exige equipo com filtro e troca precoce.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Achar a INCORRETA MS',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'INCORRETA sobre frequência de troca de equipos (MS).',
          'A, B, C e E alinhadas às recomendações usuais na prova.',
          'D fixa hemocomponentes em 24 h — intervalo longo demais.',
          'Marcar letra D.',
          'Fixação: hemoterapia → troca curta; não generalize 24 h.',
        ],
        footer_rule: 'Leia o tipo de solução antes do prazo.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Alternativas corretas',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — TROCA DE EQUIPO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Monitorização',
            detail: 'Sistema fechado de pressão tem prazo estendido na norma.',
            correct: 'Alternativa correta — não é a INCORRETA.',
          },
          {
            label: 'Letra B — Intermitente',
            detail: 'Equipo de intermitente troca diariamente.',
            correct: 'Conduta correta do MS — eliminar.',
          },
          {
            label: 'Letra C — NPT',
            detail: 'Nutrição parenteral troca por bolsa ou 24 h conforme protocolo.',
            correct: 'Descrição aceita na prova — não marque.',
          },
          {
            label: 'Letra E — Com troca de cateter',
            detail: 'Renovar equipos ao trocar o dispositivo vascular.',
            correct: 'Segurança do pacote — só D erra no sangue.',
          },
        ],
        footer_rule: 'D inverte prazo de hemocomponentes.',
      },
    ],
  },

  'funatec-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562677534-0': {
    family: 'certo_errado',
    guideline: 'Instalação de material venoso — consentimento é pré-procedimento, não etapa técnica',
    roi_error: 'consentimento_nao_instalacao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'NÃO é instalação venosa',
        chip_label: 'NÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Assertiva que NÃO representa procedimento de instalação de material venoso.',
            icon: 'Target',
          },
          {
            label: 'Purga do equipo',
            detail: 'Eliminar ar da linha antes da infusão — parte da instalação (B).',
            icon: 'Droplets',
          },
          {
            label: 'Punção',
            detail: 'Introduzir o cateter no vaso — núcleo da instalação (C).',
            icon: 'Syringe',
          },
          {
            label: 'Registro',
            detail: 'Anotar o procedimento no prontuário — fechamento (D).',
            icon: 'FileText',
          },
          {
            label: 'Acolhimento',
            detail: 'Apresentar-se e consentimento — etapa prévia, não “instalação” na chave.',
            icon: 'User',
          },
        ],
        footer_rule: 'A banca separa acolhimento da técnica de instalar.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Fases do acesso venoso',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Pré-procedimento', value: 'Identificação, explicação, consentimento.', badge: 'info' },
          { label: 'Instalação', value: 'Purga, punção, fixação, conexão.', badge: 'ok' },
          { label: 'Pós', value: 'Registro e monitorização.', badge: 'ok' },
          { label: 'Pegadinha A', value: 'Consentimento não é “instalação” no comando.', badge: 'warn' },
        ],
        footer_rule: 'Leia o verbo do comando: instalar × acolher.',
      },
      {
        type: 'logic_flow',
        slide_title: 'O que NÃO é instalação',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando NÃO: o que não é instalação de material venoso.',
          'B (purga), C (punção), D (registro) pertencem ao fluxo técnico/administrativo.',
          'A (apresentar e consentir) é antes da técnica — gabarito NÃO.',
          'Marcar letra A.',
          'Fixação: em “NÃO representa instalação”, etapas humanizadas costumam ser a resposta.',
        ],
        footer_rule: 'Consentimento é ética — punção é técnica.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — fases do procedimento',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — FUNATEC',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — Purga',
            detail: 'Preparar o equipo faz parte de instalar a linha.',
            correct: 'É procedimento de instalação — eliminar do NÃO.',
          },
          {
            label: 'Letra C — Punção',
            detail: 'Núcleo técnico do acesso venoso.',
            correct: 'Instalação propriamente dita — não marque.',
          },
          {
            label: 'Letra D — Registro',
            detail: 'Documentação encerra o procedimento.',
            correct: 'Fase pós-instalação — alternativa correta no conjunto.',
          },
          {
            label: 'Confundir com EXCETO',
            detail: 'Aqui o comando é NÃO (o que não é instalação), não EXCETO de conduta.',
            correct: 'A é pré-procedimento — única que “não instala”.',
          },
        ],
        footer_rule: 'Acolhimento ≠ punção na redação da banca.',
      },
    ],
  },

  'fundatec-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340232037-5': {
    family: 'certo_errado',
    guideline: 'Troca de curativo CIVP — fixador estéril, não fita adesiva comum',
    roi_error: 'fita_adhesiva_fixacao_civp',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'EXCETO — troca de curativo',
        chip_label: 'EXCETO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Troca de curativo do cateter venoso periférico — reduzir IRAS — EXCETO.',
            icon: 'Target',
          },
          {
            label: 'Higiene das mãos',
            detail: 'HH antes e após manipular o cateter — correto.',
            icon: 'Hand',
          },
          {
            label: 'Antissepsia',
            detail: 'Friccionar com álcool e avaliar o sítio — correto.',
            icon: 'Droplets',
          },
          {
            label: 'Cobertura',
            detail: 'Trocar quando perder integridade — correto.',
            icon: 'Bandage',
          },
          {
            label: 'Fixação inadequada',
            detail: 'Fita adesiva comum não substitui fixador estéril/transparente — EXCETO (A).',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Fixação estéril protege o cateter sem macerar a pele.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Fixação do CIVP',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Fixador adequado', value: 'Dispositivo estéril ou transparente sem impregnar algodão.', badge: 'ok' },
          { label: 'Evitar', value: 'Fita adesiva comum direto na pele/cateter.', badge: 'warn' },
          { label: 'Curativo', value: 'Troca por umidade, soltura ou sujidade.', badge: 'ok' },
        ],
        footer_rule: 'Fita comum = EXCETO em troca segura de curativo.',
      },
      {
        type: 'logic_flow',
        slide_title: 'EXCETO na troca',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'EXCETO em ações para reduzir IRAS na troca de curativo.',
          'B, C, D e E são medidas corretas de assepsia e avaliação.',
          'A propõe fita adesiva comum — inadequada.',
          'Marcar letra A.',
          'Fixação: em similares, desconfie de material caseiro de escritório no cateter.',
        ],
        footer_rule: 'Fixação estéril faz parte da segurança do acesso venoso.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Medidas corretas (não EXCETO)',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — CURATIVO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — Higiene das mãos',
            detail: 'Primeiro passo em qualquer manipulação.',
            correct: 'Conduta correta — não é o EXCETO.',
          },
          {
            label: 'Letra C — Álcool no sítio',
            detail: 'Antissepsia antes da nova cobertura.',
            correct: 'Técnica asséptica — eliminar.',
          },
          {
            label: 'Letra D — Avaliar sítio',
            detail: 'Inspeção de rubor, dor ou secreção.',
            correct: 'Monitorização obrigatória — correta.',
          },
          {
            label: 'Letra E — Troca por integridade',
            detail: 'Curativo úmido ou solto deve ser trocado.',
            correct: 'Por demanda — só A (fita comum) é exceção.',
          },
        ],
        footer_rule: 'A é a única conduta inaceitável.',
      },
    ],
  },

  'fundatec-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340270805-9': {
    family: 'protocolo',
    guideline: 'Flushing CIVP — sistema dedicado, não frasco grande de soro',
    roi_error: 'flushing_bag_grande_volume',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'INCORRETA — flushing do CIVP',
        chip_label: 'INCORRETA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Flushing e manutenção do cateter periférico — marque a INCORRETA.',
            icon: 'Target',
          },
          {
            label: 'Retorno sanguíneo',
            detail: 'Verificar refluxo antes de infundir — correto.',
            icon: 'Droplet',
          },
          {
            label: 'Flush antes da med',
            detail: 'Lavar o lúmen antes de cada medicamento — correto.',
            icon: 'Syringe',
          },
          {
            label: 'Fonte do flush',
            detail: 'Usar bags/frascos grandes de soro como fonte — contamina — INCORRETA (C).',
            icon: 'AlertTriangle',
          },
          {
            label: 'SF sem conservante',
            detail: 'Soro fisiológico em sistema fechado para lock/flush — correto.',
            icon: 'Shield',
          },
        ],
        footer_rule: 'Flush com ampola/seringa dedicada — não bolsa aberta.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Flushing seguro',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Fonte', value: 'Ampolas ou sistema fechado — não bag de grande volume.', badge: 'warn' },
          { label: 'Momento', value: 'Antes e após medicação; manter patência.', badge: 'ok' },
          { label: 'Solução', value: 'SF 0,9% sem conservante na manutenção.', badge: 'ok' },
          { label: 'Volume', value: 'Suficiente para limpar lúmen + extensão.', badge: 'info' },
        ],
        footer_rule: 'Grande volume aberto = risco de contaminação.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Achar a INCORRETA no flush',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'INCORRETA sobre flushing e manutenção do periférico.',
          'A, B, D e E descrevem práticas aceitas na chave.',
          'C sugere bags/frascos grandes como fonte — incorreto.',
          'Marcar letra C.',
          'Fixação: flushing sempre com sistema dedicado, nunca “bolsa de soro” aberta.',
        ],
        footer_rule: 'Patência do cateter ≠ reaproveitar bag.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Condutas corretas de flushing',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — MANUTENÇÃO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Refluxo',
            detail: 'Confirmar que o cateter está no vaso antes de infundir.',
            correct: 'Segurança da infusão — correta.',
          },
          {
            label: 'Letra B — Flush pré-med',
            detail: 'Evita incompatibilidade e obstrução.',
            correct: 'Técnica correta — eliminar do INCORRETA.',
          },
          {
            label: 'Letra D — SF sem conservante',
            detail: 'Solução adequada para lock em periférico.',
            correct: 'Alternativa correta — não marque.',
          },
          {
            label: 'Letra E — Volume do flush',
            detail: 'Volume deve cobrir lúmen e extensão.',
            correct: 'Descrição correta — só C erra na fonte.',
          },
        ],
        footer_rule: 'C é a INCORRETA — fonte contaminável.',
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
      question_data: cleanQuestionData(raw.question_data),
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:puncao-g03] OK ${slug}`);
  }
  console.log(`[handcraft:puncao-g03] total=${ok}`);
}

main();
