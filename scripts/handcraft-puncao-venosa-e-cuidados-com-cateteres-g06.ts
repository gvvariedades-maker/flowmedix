#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — puncao-venosa-e-cuidados-com-cateteres-g06 (4 slugs P0 puncao_ipcs_cvc).
 *
 *   npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g06
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  buildPuncaoGuidelineSnapshot,
  buildPuncaoSourcesForSlug,
} from '@/lib/catalogMigration/puncaoPedagogy';

const LOTE = 'puncao-venosa-e-cuidados-com-cateteres-g06';
const SUBTOPICO = 'Punção Venosa e Cuidados com Cateteres';
const BRANCH = 'puncao_ipcs_cvc';
const REVIEWED = '2026-07-12';

function cleanPdfArtifacts(text: string): string {
  return text
    .replace(/\befetivapara\b/gi, 'efetiva para')
    .replace(/\bdeinserção\b/gi, 'de inserção')
    .replace(/\bOenfermeiro\b/gi, 'O enfermeiro')
    .replace(/\bparadiagnóstico\b/gi, 'para diagnóstico')
    .replace(/\batribuiçõestécnicas\b/gi, 'atribuições técnicas')
    .replace(/\bpadrãopré-aprovada\b/gi, 'padrão pré-aprovada')
    .replace(/\bnopróximo\b/gi, 'no próximo')
    .replace(/\batéavaliação\b/gi, 'até avaliação')
    .replace(/\bfocodesconhecido\b/gi, 'foco desconhecido')
    .replace(/\bde enfermagem realizar\b/gi, 'de enfermagem realizar')
    .replace(/\btécnico deenfermagem\b/gi, 'técnico de enfermagem')
    .replace(/\bempacientes\b/gi, 'em pacientes')
    .replace(/\bpode havercomprometimento\b/gi, 'pode haver comprometimento')
    .replace(/\bserpalpada\b/gi, 'ser palpada')
    .replace(/\n\d{4}\)\s*/g, '\n')
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
  'adm-tec-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340191984-7': {
    family: 'protocolo',
    guideline: 'Bundle CVC — assepsia + barreira máxima + curativo por integridade + remoção precoce',
    roi_error: 'bundle_incompleto_curativo_72h',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'IPCS no CVC — bundle de prevenção',
        chip_label: 'IPCS — CVC',
        meta: slideMeta,
        items: [
          {
            label: 'Contexto',
            detail: 'UTI com aumento de infecção relacionada a cateter venoso central — medida mais efetiva de prevenção.',
            icon: 'Gauge',
          },
          {
            label: 'Antissepsia',
            detail: 'Higiene das mãos e antissepsia cutânea antes da inserção — clorexidina alcoólica adequada.',
            icon: 'Droplets',
          },
          {
            label: 'Barreira estéril',
            detail: 'Técnica asséptica rigorosa com barreira estéril máxima na inserção e manutenção.',
            icon: 'Shield',
          },
          {
            label: 'Curativo',
            detail: 'Trocar quando sujo, solto ou úmido — não em cronograma fixo independente da integridade.',
            icon: 'Bandage',
          },
          {
            label: 'Remoção precoce',
            detail: 'Retirar o CVC assim que não houver indicação clínica para o acesso.',
            icon: 'CircleX',
          },
        ],
        footer_rule: 'IPCS no CVC = bundle completo — uma medida isolada não substitui o pacote.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Bundle de prevenção — IPCS',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'BUNDLE DO CVC: ASSEPSIA + BARREIRA MÁXIMA + CURATIVO CERTO + REMOÇÃO PRECOCE',
        rows: [
          { label: 'Higienização', value: 'Mãos e antissepsia cutânea na inserção e manipulação.', badge: 'ok' },
          { label: 'Barreira', value: 'Barreira estéril máxima — inserção e manutenção.', badge: 'hot' },
          { label: 'Curativo', value: 'Troca por integridade — não calendário cego.', badge: 'warn' },
          { label: 'Remoção', value: 'CVC fora assim que não for necessário.', badge: 'ok' },
        ],
        footer_rule: 'Gabarito B resume o bundle integrado.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Prevenção de IPCS na UTI',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: abordagem mais efetiva para IPCS em cateter venoso central.',
          'Fixar bundle: assepsia + barreira máxima + curativo adequado + remoção precoce.',
          'Eliminar A — antissepsia isolada + curativo em intervalo fixo sem avaliar integridade.',
          'Eliminar C — punção femoral de rotina + antibiótico profilático.',
          'Eliminar D — cultura rotineira + iodo no lúmen como estratégia principal.',
          'Letra B: técnica asséptica rigorosa, barreira máxima e remoção quando indicado.',
          'Marcar letra B.',
        ],
        footer_rule: 'Bundle integrado vence “uma medida só”.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — bundle incompleto',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — IPCS NO CVC',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Medida isolada',
            detail: 'Cita antissepsia e curativo fixo sem barreira máxima nem remoção precoce.',
            correct: 'Bundle incompleto — não é a abordagem mais efetiva.',
          },
          {
            label: 'Letra C — Femoral + ATB',
            detail: 'Acesso femoral não é preferência de rotina; ATB profilático não faz parte do bundle.',
            correct: 'Condutas que aumentam risco ou não têm evidência.',
          },
          {
            label: 'Letra D — Cultura rotineira',
            detail: 'Vigilância microbiológica e iodo no lúmen não substituem inserção segura.',
            correct: 'Foco errado — prevenção começa no bundle de inserção.',
          },
        ],
        footer_rule: 'Interrogue: medida isolada × pacote completo (B).',
      },
    ],
  },

  'facet-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340213288-5': {
    family: 'protocolo',
    guideline: 'Suspeita de IPCS no CVC — suspender infusão, culturas, comunicar equipe, não retirar sem prescrição',
    roi_error: 'retirar_cvc_sem_prescricao_ou_manter_npt',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Suspeita de IPCS — CVC oncológico',
        chip_label: 'IPCS — CVC',
        meta: slideMeta,
        items: [
          {
            label: 'Sinais',
            detail: 'Febre, dor torácica, hipotensão, eritema no sítio, secreção, rigidez venosa, infusado turvo.',
            icon: 'Thermometer',
          },
          {
            label: 'Contexto',
            detail: 'NPT por CVC subclávio — alto risco de IPCS se infecção primária de corrente sanguínea.',
            icon: 'Gauge',
          },
          {
            label: 'Primeiro passo',
            detail: 'Comunicar equipe médica e suspender infusão da NPT.',
            icon: 'Phone',
          },
          {
            label: 'Diagnóstico',
            detail: 'Coletar culturas de ponta de cateter e sangue periférico pareado.',
            icon: 'TestTube',
          },
          {
            label: 'Pegadinha',
            detail: 'Trocar cateter às cegas, manter NPT ou retirar sem prescrição.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Suspeita de IPCS = acionar equipe + culturas + suspender infusão.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Conduta na suspeita',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Comunicar', value: 'Equipe médica imediatamente.', badge: 'hot' },
          { label: 'Suspender', value: 'Parar NPT/infusão pelo CVC suspeito.', badge: 'ok' },
          { label: 'Culturas', value: 'Ponta de cateter + sangue periférico.', badge: 'ok' },
          { label: 'Cuidados', value: 'Plano para sepse relacionada à corrente sanguínea.', badge: 'ok' },
          { label: 'Evitar', value: 'Retirada sem prescrição; manter via até cultura; troca às cegas.', badge: 'warn' },
        ],
        footer_rule: 'Enfermagem detecta, comunica e inicia protocolo — médico prescreve retirada.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Conduta tecnicamente correta',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Caso: CVC + NPT com sinais de IPCS (febre, eritema, secreção, rigidez venosa).',
          'Eliminar A — troca imediata do cateter com ATB empírico sem avaliação completa.',
          'Eliminar B — manter via e NPT até cultura — agrava risco.',
          'Eliminar C — pomada tópica e manter infusão — inadequado.',
          'Eliminar D — retirar sem prescrição — ultrapassa atribuição; decisão é médica.',
          'Letra E: comunicar médico, suspender NPT, culturas, plano de sepse.',
          'Marcar letra E.',
        ],
        footer_rule: 'Detecção precoce + comunicação + culturas antes da conduta definitiva.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Condutas inadequadas',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — IPCS SUSPEITA',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Troca de emergência',
            detail: 'Repuncionar sem protocolo e ATB empírico padronizado sem avaliação.',
            correct: 'Precisa diagnóstico e prescrição antes de nova inserção.',
          },
          {
            label: 'Letra B — Manter NPT',
            detail: 'Via suspeita continua infundindo — contaminação persistente.',
            correct: 'Suspender infusão pelo CVC é prioridade.',
          },
          {
            label: 'Letra C — Pomada tópica',
            detail: 'Antibiótico local não trata IPCS sistêmica; manter NPT é perigoso.',
            correct: 'Conduta paliativa inadequada.',
          },
          {
            label: 'Letra D — Retirar sem prescrição',
            detail: 'Técnico/enfermeiro não retira CVC por conta própria mesmo com suspeita.',
            correct: 'E comunica e coleta culturas dentro da atribuição.',
          },
        ],
        footer_rule: 'E equilibra urgência, legalidade e protocolo CDC/MS.',
      },
    ],
  },

  'imparh-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562693149-2': {
    family: 'certo_errado',
    guideline: 'Punção periférica asséptica — aguardar secagem do antisséptico antes de inserir',
    roi_error: 'puncionar_sem_secagem_antisseptico',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Punção periférica — prevenir IPCS',
        chip_label: 'IPCS — CVC',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Punção asséptica do acesso periférico para reduzir infecção da corrente sanguínea na UTI.',
            icon: 'Target',
          },
          {
            label: 'Antissepsia',
            detail: 'Clorexidina alcoólica com fricção — aguardar secagem completa.',
            icon: 'Droplets',
          },
          {
            label: 'Não tocar',
            detail: 'Sítio não deve ser tocado após antissepsia — reantissepsia se necessário.',
            icon: 'Hand',
          },
          {
            label: 'Dispositivo',
            detail: 'Cateter flexível (poliuretano) — menor trauma que agulha de aço de permanência.',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha',
            detail: 'Palpar após antissepsia sem nova fricção; punções ilimitadas pelo mesmo profissional.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Secagem do antisséptico é etapa crítica antes da inserção.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Antissepsia na punção',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Secagem', value: 'Aguardar secagem espontânea antes de puncionar.', badge: 'hot' },
          { label: 'Fricção', value: 'Clorexidina alcoólica — movimentos de vai e vem.', badge: 'ok' },
          { label: 'Sítio', value: 'Não tocar após antissepsia — contaminar invalida preparo.', badge: 'warn' },
        ],
        footer_rule: 'Puncionar sobre antisséptico úmido aumenta risco de IPCS.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Alternativa correta',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando CORRETA sobre punção periférica asséptica na UTI.',
          'Eliminar A — agulha de aço não tem menos infecção que flexível.',
          'Eliminar B — exceção para palpar após antissepsia enfraquece barreira.',
          'Eliminar D — há limite de tentativas; trocar profissional após falhas.',
          'Letra C: aguardar secagem espontânea do antisséptico antes da punção.',
          'Marcar letra C.',
        ],
        footer_rule: 'Secagem = tempo de ação microbicida do antisséptico.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Por que A, B e D falham',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — ASSEPSIA',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Agulha de aço',
            detail: 'Dispositivos flexíveis reduzem trauma e complicações.',
            correct: 'Aço não é superior em prevenção infecciosa.',
          },
          {
            label: 'Letra B — Tocar para palpar',
            detail: 'Contato pós-antissepsia contamina — reantissepsia obrigatória.',
            correct: 'Exceção na alternativa invalida técnica rigorosa.',
          },
          {
            label: 'Letra D — Tentativas ilimitadas',
            detail: 'Múltiplas punções no mesmo membro aumentam trauma e infecção.',
            correct: 'Limite de tentativas e troca de operador — protocolo.',
          },
        ],
        footer_rule: 'C fecha a etapa de secagem obrigatória.',
      },
    ],
  },

  'instituto-consulplan-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562693149-0': {
    family: 'vf',
    guideline: 'Vias de contaminação do CVC — inserção, conexões e corrente sanguínea',
    roi_error: 'vf_vias_contaminacao_cvc',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Infecção no cateter — vias',
        chip_label: 'IPCS — CVC',
        meta: slideMeta,
        items: [
          {
            label: 'Contexto',
            detail: 'Cateter central × periférico — infecção pode comprometer o paciente se rotina falha.',
            icon: 'Gauge',
          },
          {
            label: 'I — Passagem',
            detail: 'Contaminação durante a inserção do cateter (técnica/assepsia).',
            icon: 'Syringe',
          },
          {
            label: 'II — Conexões',
            detail: 'Quebra ou vazamento nas conexões da linha — porta de entrada de microrganismos.',
            icon: 'Link',
          },
          {
            label: 'III — Corrente sanguínea',
            detail: 'Infecção na via distal, reservatório e circulação — IPCS estabelecida.',
            icon: 'Droplets',
          },
          {
            label: 'Pegadinha',
            detail: 'Marcar só uma via — as três coexistem no modelo de IPCS.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Inserção, manutenção e circulação — três portas de infecção.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Três vias de contaminação',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'I', value: 'Contaminação na passagem/inserção do cateter.', badge: 'ok' },
          { label: 'II', value: 'Quebra ou vazamento nas conexões.', badge: 'ok' },
          { label: 'III', value: 'Infecção distal + reservatório + corrente sanguínea.', badge: 'ok' },
        ],
        footer_rule: 'I + II + III = alternativa A.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Avaliar I, II e III',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: o que pode ocorrer quando há infecção no cateter.',
          'I Verdadeiro — contaminação na inserção.',
          'II Verdadeiro — falha nas conexões da linha.',
          'III Verdadeiro — propagação à corrente sanguínea.',
          'Todas as afirmativas corretas.',
          'Marcar letra A (I, II e III).',
        ],
        footer_rule: 'Bundle previne cada porta: inserção, conexão, manutenção.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Por que não só uma via',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — V/F ITENS',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — Só III',
            detail: 'Ignora contaminação na inserção e nas conexões.',
            correct: 'IPCS tem múltiplas vias de entrada.',
          },
          {
            label: 'Letra C — I e II',
            detail: 'Esquece disseminação hematogênica/distal.',
            correct: 'III descreve corrente sanguínea — verdadeiro.',
          },
          {
            label: 'Letra D — I e III',
            detail: 'Omite quebra de conexão como porta.',
            correct: 'Manutenção do sistema fechado é pilar do bundle.',
          },
        ],
        footer_rule: 'Modelo completo = três itens verdadeiros.',
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
    console.log(`[handcraft:puncao-g06] OK ${slug}`);
  }
  console.log(`[handcraft:puncao-g06] total=${ok}`);
}

main();
