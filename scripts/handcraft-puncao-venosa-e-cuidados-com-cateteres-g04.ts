#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — puncao-venosa-e-cuidados-com-cateteres-g04 (8 slugs P0 puncao_tempo).
 *
 *   npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g04
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  buildPuncaoGuidelineSnapshot,
  buildPuncaoSourcesForSlug,
} from '@/lib/catalogMigration/puncaoPedagogy';

const LOTE = 'puncao-venosa-e-cuidados-com-cateteres-g04';
const SUBTOPICO = 'Punção Venosa e Cuidados com Cateteres';
const BRANCH = 'puncao_tempo';
const REVIEWED = '2026-07-12';

function cleanPdfArtifacts(text: string): string {
  return text
    .replace(/\bcompoliuretano\b/gi, 'com poliuretano')
    .replace(/\bdeveobservar\b/gi, 'deve observar')
    .replace(/\bperíodorecomendado\b/gi, 'período recomendado')
    .replace(/\bàpacientes\b/gi, 'à pacientes')
    .replace(/\btécnicaspara\b/gi, 'técnicas para')
    .replace(/\bmeiode\b/gi, 'meio de')
    .replace(/\bserpuncionado\b/gi, 'ser puncionado')
    .replace(/\bdecurta\b/gi, 'de curta')
    .replace(/\baalternativa\b/gi, 'a alternativa')
    .replace(/\b24horas\b/gi, '24 horas')
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
  'cpcon-uepb-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340213288-3': {
    family: 'certo_errado',
    guideline: 'ANVISA 2017 — troca de equipos conforme tipo de infusão e integridade do sistema',
    roi_error: 'inverter_intervalos_equipo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Troca de equipos — intervalos ANVISA',
        chip_label: 'TEMPO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Medidas de prevenção de IRAS — intervalo correto de troca de equipos (ANVISA 2017).',
            icon: 'Target',
          },
          {
            label: 'Fatores',
            detail: 'Tipo de solução, infusão contínua ou intermitente, contaminação ou perda de integridade.',
            icon: 'Gauge',
          },
          {
            label: 'Infusão contínua',
            detail: 'Equipos não devem ser trocados antes de intervalo mínimo prolongado — salvo dano ou contaminação.',
            icon: 'Clock',
          },
          {
            label: 'Outros tipos',
            detail: 'Intermitente, NPP e hemocomponente têm janelas próprias — a banca inverte entre alternativas.',
            icon: 'Timer',
          },
          {
            label: 'Pegadinha',
            detail: 'Número de horas sem contexto de tipo de infusão — eliminar.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Tipo de infusão define o intervalo — não generalize troca curta para tudo.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Tabela — intervalos de troca',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'TEMPO: TIPO DE INFUSÃO DEFINE O INTERVALO',
        rows: [
          { label: 'Infusão contínua', value: 'Intervalo mínimo prolongado entre trocas de equipo.', badge: 'hot' },
          { label: 'Intermitente', value: 'Janela distinta da contínua — não copiar o mesmo número.', badge: 'info' },
          { label: 'NPP / hemocomponente', value: 'Troca em janela curta — não confundir com contínua.', badge: 'warn' },
          { label: 'Monitorização invasiva', value: 'Sistema fechado com critério próprio.', badge: 'info' },
        ],
        footer_rule: 'Contínua = intervalo mínimo longo; demais tipos têm regra específica.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Como resolver — troca de equipos',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: afirmativa CORRETA sobre troca de equipos (ANVISA 2017).',
          'Associar cada alternativa ao tipo de infusão citado (contínua, intermitente, NPP, hemocomponente).',
          'Fixar infusão contínua: não trocar equipos antes do intervalo mínimo prolongado.',
          'Eliminar A, B, C e D — intervalos trocados ou contexto errado.',
          'Letra E descreve a regra da infusão contínua.',
          'Marcar letra E.',
          'Fixação: troca antecipada só com contaminação ou integridade comprometida.',
        ],
        footer_rule: 'Número sem tipo de infusão = pegadinha clássica.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — intervalos trocados',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — TEMPO E TROCA DE EQUIPOS',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Monitorização invasiva',
            detail: 'Intervalo curto para sistema fechado de PA — não é regra da infusão contínua prolongada.',
            correct: 'Contexto específico — não fecha o comando sobre contínua.',
          },
          {
            label: 'Letra B — Intermitente',
            detail: 'Administração intermitente tem janela própria — não substitui critério da contínua.',
            correct: 'Tipo de infusão diferente — eliminar.',
          },
          {
            label: 'Letra C — Nutrição parenteral',
            detail: 'NPP exige troca em janela curta — não é equipo de infusão contínua genérica.',
            correct: 'Solução e frequência mudam o intervalo.',
          },
          {
            label: 'Letra D — Hemocomponente',
            detail: 'Hemocomponente pede troca rápida — não confundir com contínua de longa permanência.',
            correct: 'Só E descreve o mínimo prolongado da contínua.',
          },
        ],
        footer_rule: 'Memorize o par tipo de infusão × intervalo.',
      },
    ],
  },

  'cpcon-uepb-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340232037-0': {
    family: 'certo_errado',
    guideline: 'Manutenção CIVP intermitente — permanência do cateter × troca do equipo (ANVISA)',
    roi_error: 'inverter_cateter_equipo_intermitente',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Caso João — manutenção do acesso',
        chip_label: 'TEMPO',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário',
            detail: 'João, infusão intermitente, cateter periférico de poliuretano, sem complicações.',
            icon: 'User',
          },
          {
            label: 'Dois prazos',
            detail: 'A prova cobra par cateter × equipo — não são iguais no regime intermitente.',
            icon: 'Clock',
          },
          {
            label: 'Cateter',
            detail: 'Permanência estendida quando o acesso está íntegro e indicado.',
            icon: 'Syringe',
          },
          {
            label: 'Equipo',
            detail: 'Troca mais frequente que o cateter no intermitente — higiene do sistema de infusão.',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha',
            detail: 'Banca iguala os dois prazos ou inverte cateter curto com equipo longo.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Intermitente: cateter permanece; equipo troca com maior frequência.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Cateter × equipo no intermitente',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Cateter periférico', value: 'Permanência prolongada se íntegro — reavaliar diariamente.', badge: 'ok' },
          { label: 'Equipo intermitente', value: 'Troca em intervalo curto (diário) — não igualar ao cateter.', badge: 'hot' },
          { label: 'Sem rotina cega', value: 'Trocar por indicação clínica, contaminação ou perda de integridade.', badge: 'warn' },
        ],
        footer_rule: 'ANVISA: dois dispositivos, dois cronogramas no intermitente.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Prazos de João',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Caso: infusão intermitente + cateter periférico sem complicações.',
          'Separar prazo do cateter (permanência) e do equipo (troca do sistema).',
          'Eliminar pares que igualam os dois intervalos ou invertem lógica.',
          'Letra B: cateter de permanência estendida + equipo de troca frequente.',
          'Marcar letra B.',
          'Fixação: em similares, desenhe duas colunas — cateter × equipo.',
        ],
        footer_rule: 'Não troque cateter e equipo no mesmo ritmo no intermitente.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Pares errados de prazo',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — CASO CLÍNICO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Mesmo intervalo',
            detail: 'Cateter e equipo no mesmo prazo longo — não condiz com intermitente.',
            correct: 'Equipo exige troca mais frequente que o cateter.',
          },
          {
            label: 'Letra C — Cateter curto',
            detail: 'Reduz permanência do cateter e mantém equipo diário — inverte a lógica do B.',
            correct: 'Cateter pode permanecer mais com acesso íntegro.',
          },
          {
            label: 'Letra D — Equipo muito longo',
            detail: 'Estende troca do equipo além do recomendado no intermitente.',
            correct: 'Equipo não segue intervalo mínimo da contínua.',
          },
          {
            label: 'Letra E — Semana no cateter',
            detail: 'Permanência excessiva sem critério do caso — par inconsistente.',
            correct: 'B equilibra permanência do cateter e troca do equipo.',
          },
        ],
        footer_rule: 'Gabarito B — par cateter longo × equipo diário.',
      },
    ],
  },

  'fundatec-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562687359-6': {
    family: 'conceito',
    guideline: 'Punção de curta permanência — dispositivo venoso periférico flexível (jelco)',
    roi_error: 'confundir_escalpe_central_picc',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dispositivo para curta permanência',
        chip_label: 'TEMPO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Cateter recomendado para punção de curta permanência (alguns dias de terapia).',
            icon: 'Target',
          },
          {
            label: 'Periférico flexível',
            detail: 'Jelco/cateter de poliuretano — infusão por poucos dias com reavaliação diária.',
            icon: 'Syringe',
          },
          {
            label: 'Escalpe',
            detail: 'Punção brevíssima ou coleta — não é escolha para permanência de vários dias.',
            icon: 'Zap',
          },
          {
            label: 'Central / PICC',
            detail: 'Acesso profundo ou de média permanência — desproporcional à punção curta.',
            icon: 'XCircle',
          },
          {
            label: 'Agulhado',
            detail: 'Dispositivo com agulha fixa — uso muito limitado, não rotina para dias de infusão.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Curta permanência = periférico flexível, não central nem escalpe.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Escolha por tempo de uso',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Alguns dias', value: 'Dispositivo venoso periférico flexível.', badge: 'hot' },
          { label: 'Minutos/horas', value: 'Escalpe ou agulhado — terapia ultracurta.', badge: 'info' },
          { label: 'Semanas', value: 'PICC/midline ou central — outro indicativo.', badge: 'warn' },
        ],
        footer_rule: 'Tempo previsto de terapia guia o dispositivo.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Qual cateter escolher',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: curta permanência em torno de alguns dias de infusão.',
          'Eliminar B e C — acesso central/PICC é excessivo para punção curta simples.',
          'Eliminar D — escalpe serve a punção breve, não dias de terapia.',
          'Eliminar A — agulhado não é padrão para permanência de alguns dias.',
          'Letra E — dispositivo venoso periférico flexível (jelco).',
          'Marcar letra E.',
        ],
        footer_rule: 'Flexível periférico = curta permanência com segurança.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Dispositivo inadequado ao tempo',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — ESCOLHA DO CATETER',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Agulhado',
            detail: 'Agulha fixa limita mobilidade e tempo de uso.',
            correct: 'Não é escolha para infusão de alguns dias.',
          },
          {
            label: 'Letra B — Central',
            detail: 'Cateter venoso central exige indicação e técnica de barreira máxima.',
            correct: 'Desproporcional à punção periférica curta.',
          },
          {
            label: 'Letra C — PICC',
            detail: 'Acesso periférico profundo para semanas — não punção curta rotineira.',
            correct: 'Tempo de uso não justifica PICC aqui.',
          },
          {
            label: 'Letra D — Escalpe',
            detail: 'Scalp/butterfly para procedimentos breves.',
            correct: 'Terapia de dias pede cateter flexível (E).',
          },
        ],
        footer_rule: 'E fecha curta permanência periférica.',
      },
    ],
  },

  'fundatec-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562693149-7': {
    family: 'certo_errado',
    guideline: 'Antissepsia na punção — fricção com clorexidina alcoólica e secagem completa',
    roi_error: 'antissepsia_incorreta_puncao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Preparo da pele — punção periférica',
        chip_label: 'TEMPO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Técnicas ANVISA para preparo da pele antes da venopunção — evitar contaminação da corrente sanguínea.',
            icon: 'Target',
          },
          {
            label: 'Clorexidina alcoólica',
            detail: 'Fricção em movimentos de vai e vem — antisséptico de escolha na punção.',
            icon: 'Droplets',
          },
          {
            label: 'Secagem',
            detail: 'Aguardar secagem completa antes da inserção — não soprar ou fanfar.',
            icon: 'Clock',
          },
          {
            label: 'Não tocar',
            detail: 'Sítio não deve ser tocado após antissepsia — reantissepsia se necessário.',
            icon: 'Hand',
          },
          {
            label: 'Pegadinha',
            detail: 'Banca oferece barbear, PVPI com tempo errado ou álcool isolado.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Fricção + secagem da clorexidina = técnica correta.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Antissepsia na punção',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Antisséptico', value: 'Clorexidina alcoólica — fricção vai e vem.', badge: 'hot' },
          { label: 'Tempo', value: 'Friccionar e aguardar secagem completa antes de puncionar.', badge: 'ok' },
          { label: 'Evitar', value: 'Barbear com lâmina; tocar após antissepsia; só álcool rotineiro.', badge: 'warn' },
        ],
        footer_rule: 'Secagem importa tanto quanto a fricção.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Técnica correta de preparo',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: alternativa correta sobre preparo da pele (ANVISA).',
          'Letra A descreve fricção com clorexidina alcoólica em vai e vem — conduta recomendada.',
          'Eliminar B — barbear com lâmina aumenta microlesões.',
          'Eliminar C — tempos de PVPI/clorexidina trocados ou insuficientes.',
          'Eliminar D — tocar o sítio após antissepsia é proibido.',
          'Eliminar E — sujidade visível exige limpeza antes, mas punção usa clorexidina alcoólica.',
          'Marcar letra A.',
        ],
        footer_rule: 'Preparo da pele protege a corrente sanguínea na punção.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Erros clássicos de antissepsia',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — PREPARO DA PELE',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — Barbear',
            detail: 'Lâmina de barbear lesa a pele e favorece colonização.',
            correct: 'Remoção de pelos, se necessária, não é com lâmina obrigatória.',
          },
          {
            label: 'Letra C — Tempo fixo errado',
            detail: 'Mistura tempo de clorexidina com PVPI de forma inadequada.',
            correct: 'O essencial é fricção e secagem — não decorar segundos isolados.',
          },
          {
            label: 'Letra D — Tocar após antissepsia',
            detail: 'Contato pós-antissepsia contamina o sítio.',
            correct: 'Reantissepsia se precisar reposicionar — não tocar direto.',
          },
          {
            label: 'Letra E — Só álcool',
            detail: 'Álcool isolado não substitui clorexidina alcoólica na punção de rotina.',
            correct: 'A descreve a fricção correta com clorexidina.',
          },
        ],
        footer_rule: 'Fricção com clorexidina alcoólica fecha a questão.',
      },
    ],
  },

  'iaupe-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562677534-1': {
    family: 'certo_errado',
    guideline: 'Manutenção de cateter periférico — reavaliação diária e troca em emergência sem assepsia',
    roi_error: 'cronograma_fixo_periferico',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Manutenção do cateter periférico',
        chip_label: 'TEMPO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Inserção e manutenção de cateteres periféricos — assinale a CORRETA.',
            icon: 'Target',
          },
          {
            label: 'Avaliação do sítio',
            detail: 'Inspeção diária em todas as faixas etárias — rubor, dor, secreção.',
            icon: 'Eye',
          },
          {
            label: 'Permanência',
            detail: 'Reavaliar necessidade do cateter — remover quando não indicado.',
            icon: 'Clock',
          },
          {
            label: 'Emergência',
            detail: 'Acesso sem assepsia ideal deve ser substituído assim que possível.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha',
            detail: 'Cronograma fixo de troca ou manter cateter sem indicação.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Não há troca rotineira cega — emergência sem assepsia exige reposição.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Tempo de manutenção periférica',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Avaliação', value: 'Sítio diariamente — pediatria e adulto.', badge: 'ok' },
          { label: 'Permanência', value: 'Reavaliar necessidade — não cronograma fixo obrigatório.', badge: 'ok' },
          { label: 'Emergência', value: 'Trocar cateter se técnica asséptica foi comprometida.', badge: 'hot' },
          { label: 'Sem uso', value: 'Remover se não há medicação EV e não há necessidade.', badge: 'warn' },
        ],
        footer_rule: 'Indicação clínica manda — não relógio fixo.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Achar a CORRETA',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando CORRETA sobre manutenção de cateter periférico.',
          'A e B erram frequência de avaliação/reavaliação (semanal ou mínimo fixo).',
          'C propõe não trocar antes de intervalo mínimo curto — cronograma fixo incorreto.',
          'E recomenda manter cateter sem uso — conduta errada.',
          'D: cateter de emergência com possível falha asséptica — trocar tão logo possível.',
          'Marcar letra D.',
        ],
        footer_rule: 'Emergência + assepsia comprometida = reposição precoce.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Por que A, B, C e E falham',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — MANUTENÇÃO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Pediatria',
            detail: 'Avaliação do sítio é diária — não reduzir frequência.',
            correct: 'Monitorização contínua do acesso — incorreta como única verdade.',
          },
          {
            label: 'Letra B — Semanal',
            detail: 'Reavaliação da necessidade é mais frequente que semanal.',
            correct: 'Permanência exige revisão diária da indicação.',
          },
          {
            label: 'Letra C — Intervalo mínimo fixo',
            detail: 'Não há obrigação de manter cateter por prazo mínimo.',
            correct: 'Troca por indicação, não por cronograma cego.',
          },
          {
            label: 'Letra E — Manter sem uso',
            detail: 'Cateter ocioso aumenta risco de infecção sem benefício.',
            correct: 'Remover quando não há prescrição EV — só D é correta.',
          },
        ],
        footer_rule: 'D protege paciente de acesso emergencial contaminado.',
      },
    ],
  },

  'ibade-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562699843-7': {
    family: 'certo_errado',
    guideline: 'Cobertura do cateter periférico — troca por integridade; emergência sem assepsia',
    roi_error: 'curativo_cronograma_fixo',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cobertura do cateter periférico',
        chip_label: 'TEMPO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Propósito da cobertura: proteger o sítio e reduzir infecção — alternativa CORRETA.',
            icon: 'Target',
          },
          {
            label: 'Tipo de curativo',
            detail: 'Membrana transparente semipermeável ou semioclusiva limpa — padrão atual.',
            icon: 'Bandage',
          },
          {
            label: 'Troca',
            detail: 'Quando úmido, solto ou sujo — não em intervalo préestabelecido fixo.',
            icon: 'Clock',
          },
          {
            label: 'Cateter',
            detail: 'Não há troca rotineira do cateter por prazo fixo curto.',
            icon: 'Syringe',
          },
          {
            label: 'Emergência',
            detail: 'Instalação sem assepsia ideal — substituir o cateter precocemente.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Integridade do curativo e do acesso — não calendário rígido.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Curativo e tempo',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Cobertura', value: 'Transparente semipermeável ou semioclusiva estéril.', badge: 'ok' },
          { label: 'Troca curativo', value: 'Por umidade, soltura ou sujidade — não rotina fixa.', badge: 'ok' },
          { label: 'Troca cateter', value: 'Por indicação clínica — não prazo obrigatório curto.', badge: 'warn' },
          { label: 'Emergência', value: 'Comprometimento asséptico → trocar tão logo quanto possível.', badge: 'hot' },
        ],
        footer_rule: 'E destaca a exceção crítica: emergência sem assepsia.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Achar a CORRETA',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: cobertura do cateter periférico e prevenção de infecção.',
          'A descreve tipo de cobertura aceitável — mas não é a melhor resposta isolada da prova.',
          'B condiciona gaze/fita a prazo longo — inadequado como regra.',
          'C erra ao impor intervalo préestabelecido de curativo.',
          'D erra ao exigir troca rotineira do cateter em prazo curto.',
          'E: emergência com técnica asséptica comprometida — trocar precocemente.',
          'Marcar letra E.',
        ],
        footer_rule: 'A prova privilegia a conduta de emergência em E.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Por que as outras não fecham',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — COBERTURA',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Tipo de cobertura',
            detail: 'Descrição parcialmente verdadeira, mas incompleta frente ao foco temporal crítico.',
            correct: 'E traz a conduta mandatória em emergência — mais específica.',
          },
          {
            label: 'Letra B — Gaze e fita',
            detail: 'Gaze/fita não é primeira escolha rotineira por prazo.',
            correct: 'Preferir transparente; troca por integridade.',
          },
          {
            label: 'Letra C — Intervalo fixo',
            detail: 'Curativo não segue calendário cego.',
            correct: 'Trocar quando perder integridade.',
          },
          {
            label: 'Letra D — Troca rotineira',
            detail: 'Cateter periférico não tem rotina fixa de troca em prazo curto.',
            correct: 'Anvisa: reavaliar e trocar por indicação.',
          },
        ],
        footer_rule: 'Emergência sem assepsia = trocar cateter (E).',
      },
    ],
  },

  'maranatha-assessoria-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340191984-4': {
    family: 'certo_errado',
    guideline: 'Prevenção de flebite — não manter acesso por prazo mínimo fixo',
    roi_error: 'permanencia_minima_72h_flebite',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'NÃO reduz flebite — punção periférica',
        chip_label: 'TEMPO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Conduta que NÃO reduz flebite química ou mecânica em punção periférica.',
            icon: 'Target',
          },
          {
            label: 'Veia adequada',
            detail: 'Calibre compatível com dispositivo — reduz trauma mecânico.',
            icon: 'Activity',
          },
          {
            label: 'Pele limpa e seca',
            detail: 'Assepsia e técnica seca durante o procedimento.',
            icon: 'Droplets',
          },
          {
            label: 'Evitar articulação',
            detail: 'Menos flexão no sítio — menos trauma venoso.',
            icon: 'Move',
          },
          {
            label: 'Pegadinha',
            detail: 'Manter o mesmo local por prazo mínimo fixo — aumenta risco, não previne.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Flebite piora com permanência desnecessária no mesmo sítio.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Prevenção de flebite',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Veia × dispositivo', value: 'Calibre adequado — menos estresse venoso.', badge: 'ok' },
          { label: 'Sítio', value: 'Evitar articulações e reutilizar veia fragilizada.', badge: 'ok' },
          { label: 'Permanência', value: 'Reavaliar e remover — não impor dias mínimos no local.', badge: 'warn' },
        ],
        footer_rule: 'Tempo fixo no mesmo acesso não é prevenção.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Achar o NÃO',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando NÃO: o que não previne flebite química/mecânica.',
          'A, B e C são medidas preventivas corretas — eliminar.',
          'D propõe manter acesso no mesmo local por prazo mínimo fixo — conduta inadequada.',
          'Marcar letra D.',
          'Fixação: permanência prolongada no mesmo sítio favorece flebite mecânica.',
        ],
        footer_rule: 'NÃO = a conduta que parece protocolo mas agrava risco.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Medidas que previnem (não são o NÃO)',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — FLEBITE',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Calibre da veia',
            detail: 'Veia fina com cateter grosso traumatiza o endotélio.',
            correct: 'Conduta preventiva correta — não marque no NÃO.',
          },
          {
            label: 'Letra B — Região limpa e seca',
            detail: 'Contaminação e umidade favorecem complicação local.',
            correct: 'Técnica asséptica — eliminar do NÃO.',
          },
          {
            label: 'Letra C — Evitar articulação',
            detail: 'Flexão repetida machuca a veia no trajeto do cateter.',
            correct: 'Posicionamento adequado — correta, não é exceção.',
          },
          {
            label: 'Letra D — Prazo mínimo fixo',
            detail: 'Manter acesso por dias obrigatórios no mesmo local.',
            correct: 'Esta é o NÃO — agrava flebite mecânica.',
          },
        ],
        footer_rule: 'Só D falha como prevenção.',
      },
    ],
  },

  'objetiva-concursos-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340280693-7': {
    family: 'conceito',
    guideline: 'Scalp — observação diária do sítio; troca por indicação clínica',
    roi_error: 'nao_observar_scalp_diario',
    exam_vs_current:
      'Gabarito cita troca em janela de alguns dias; guideline atual prioriza observação diária e troca por indicação',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Scalp — observação e manutenção',
        chip_label: 'TEMPO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Critérios de escolha de veia e observação na venóclise/infusão.',
            icon: 'Target',
          },
          {
            label: 'Observação diária',
            detail: 'Com scalp, inspecionar pele: hiperemia, edema, secreção e dor.',
            icon: 'Eye',
          },
          {
            label: 'Troca',
            detail: 'Substituir quando houver complicação ou perda de função — não só por calendário.',
            icon: 'Clock',
          },
          {
            label: 'Sistema fechado',
            detail: 'Não desconectar rotineiramente a infusão para cada procedimento.',
            icon: 'Link',
          },
          {
            label: 'Pegadinha',
            detail: 'Aspirar coágulo ou inverter calibre jelco (14–22).',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Scalp exige olhar o sítio todo dia.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Manutenção do scalp',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Monitorização', value: 'Avaliar sítio diariamente — pele e dor.', badge: 'hot' },
          { label: 'Troca', value: 'Por complicação ou indicação — reavaliar permanência.', badge: 'ok' },
          { label: 'Obstrução', value: 'Não aspirar coágulo para reinjetar — seguir protocolo de patência.', badge: 'warn' },
        ],
        footer_rule: 'Observação diária é o núcleo do gabarito B.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Alternativa correta',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: alternativa CORRETA sobre escolha/observação de veia.',
          'Eliminar A — desconectar sistema rotineiramente não é conduta padrão.',
          'Letra B: observação diária da pele no scalp — hiperemia, edema, secreção, dor.',
          'Eliminar C — aspirar coágulo e reinjetar é perigoso.',
          'Eliminar D — calibre jelco invertido (fino em veia calibrosa).',
          'Marcar letra B.',
        ],
        footer_rule: 'Olhar o sítio todo dia fecha scalp seguro.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Condutas inadequadas',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — SCALP',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Desconectar',
            detail: 'Quebra de sistema fechado sem necessidade aumenta risco.',
            correct: 'Não é rotina para aplicar medicamento.',
          },
          {
            label: 'Letra C — Aspirar coágulo',
            detail: 'Manipulação agressiva pode embolizar ou danificar o vaso.',
            correct: 'Seguir protocolo de desobstrução — não aspirar e reinjetar.',
          },
          {
            label: 'Letra D — Calibre invertido',
            detail: 'Veia calibrosa pede cateter maior; fina pede menor.',
            correct: 'Números 14–22 invertidos na alternativa.',
          },
        ],
        footer_rule: 'B = vigilância diária do sítio com scalp.',
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
    console.log(`[handcraft:puncao-g04] OK ${slug}`);
  }
  console.log(`[handcraft:puncao-g04] total=${ok}`);
}

main();
