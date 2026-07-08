#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — sinais-vitais-g02 (8 slugs P0 vitals_pa_tecnica).
 *
 *   npx tsx scripts/handcraft-sinais-vitais-g02.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';

const LOTE = 'sinais-vitais-g02';
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
  'ameosc-enfermagem-verificacao-de-sinais-vitais-1778969768866-4': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS/COFEN — PA: postura + repouso · temp timpânica pediatria · registro imediato · pulso FC+ritmo+amplitude',
    roi_error: 'supina_absoluta_pa',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — quatro itens de SV',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Quatro afirmativas sobre aferição de SV — julgue I–IV antes de combinar a sequência V/F.',
            icon: 'Target',
          },
          {
            label: 'PA e postura (I)',
            detail:
              'Supina isolada não garante precisão — repouso, braço ao nível do coração e manguito adequado também importam.',
            icon: 'HeartPulse',
          },
          {
            label: 'Temperatura timpânica (II)',
            detail:
              'Método rápido e confortável em pediatria — útil para rastrear febre quando técnica correta.',
            icon: 'Thermometer',
          },
          {
            label: 'Registro imediato (III)',
            detail:
              'Anotar data/hora após cada aferição permite comparar evolução e detectar tendências.',
            icon: 'ClipboardList',
          },
          {
            label: 'Avaliação do pulso (IV)',
            detail:
              'FC, ritmo e amplitude juntos identificam taquicardia, bradicardia ou arritmia.',
            icon: 'Activity',
          },
          {
            label: 'Pegadinha supina absoluta',
            detail:
              'Item I absolutiza supina “independentemente de outras condições” — erro clássico AMEOSC.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'I é falso · II, III e IV verdadeiros → sequência F,V,V,V',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: quatro itens + sequência V/F — tabela item a item primeiro.',
          'Julgar I: supina garante PA precisa independente de tudo? → FALSO — técnica exige repouso, nível do braço e manguito.',
          'Julgar II: temp timpânica confiável em pediatria? → VERDADEIRO — rapidez e conforto em crianças.',
          'Julgar III: registro imediato após aferição? → VERDADEIRO — comparação e evolução clínica.',
          'Julgar IV: pulso inclui FC, ritmo e amplitude? → VERDADEIRO — tríade completa de palpação.',
          'Conjunto correto: F, V, V, V.',
          'Eliminar A (II falso), C (I e III falsos), D (I verdadeiro e IV falso).',
          'Marcar B.',
          'Fixação: supina sem demais condições é filtro decisivo do item I.',
        ],
        footer_rule: 'I=F · II=V · III=V · IV=V → letra B',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — aferição integrada de SV',
        meta: slideMeta,
        content: 'TÉCNICA + REGISTRO + INTERPRETAÇÃO',
        rows: [
          {
            label: 'PA — postura',
            value: 'Repouso ≥5 min · braço ao nível do coração — supina sozinha não basta',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Item I falso — “independentemente de outras condições”.',
          },
          {
            label: 'PA — manguito',
            value: 'Proporcional ao braço · calibrado · sem interferências',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Temperatura timpânica',
            value: 'Método válido em pediatria — rapidez e conforto',
            sv_kind: 'temp',
            badge: 'hot',
            exam_hint: 'Item II verdadeiro.',
          },
          {
            label: 'Registro de SV',
            value: 'Imediato após aferição — data, hora e identificação',
            sv_kind: 'meta',
            badge: 'ok',
            exam_hint: 'Item III verdadeiro.',
          },
          {
            label: 'Palpação do pulso',
            value: 'Frequência + ritmo + amplitude — indicador e médio',
            sv_kind: 'fc',
            badge: 'hot',
            exam_hint: 'Item IV verdadeiro.',
          },
          {
            label: 'Mnemônico',
            value: 'Supina ≠ técnica completa — checklist antes do número',
            sv_kind: 'meta',
            badge: 'warn',
          },
        ],
        footer_rule: 'Decore checklist PA antes de aceitar postura isolada',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SUPINA ABSOLUTA (I–IV)',
        items: [
          {
            label: 'Letra A — F,F,V,V',
            detail: 'Marca item II como falso — nega utilidade da temperatura timpânica em pediatria.',
            correct:
              'Temp timpânica é método válido em crianças — II é verdadeiro, sequência correta inclui V no segundo item.',
          },
          {
            label: 'Letra C — V,F,F,V',
            detail: 'Aceita I verdadeiro (supina absoluta) e nega registro imediato.',
            correct:
              'Supina sem repouso/nível do braço não garante precisão — I é falso; registro imediato é conduta correta (III verdadeiro).',
          },
          {
            label: 'Letra D — V,V,V,F',
            detail: 'Mantém I verdadeiro e exclui IV sobre avaliação completa do pulso.',
            correct:
              'Pulso exige FC, ritmo e amplitude — IV é verdadeiro; I falha ao absolutizar supina.',
          },
          {
            label: 'Confundir supina com técnica completa',
            detail: 'Aluno decora “deitado = PA correta” e aceita item I sem ler “independentemente”.',
            correct:
              'Postura supina é permitida, mas precisão depende de repouso, nível do braço e manguito — item I é falso.',
          },
        ],
        footer_rule: 'Supina absoluta elimina C e D — confirme II e III → letra B',
      },
    ],
  },

  'ameosc-enfermagem-verificacao-de-sinais-vitais-1779343811344-5': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS — temp axilar ~36–37,5°C · PA 5 min repouso braço coração · FR adulto 12–20 · registro data/hora/ID',
    roi_error: 'temp_axilar_hipotermia_falsa',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — temp · PA · FR · registro',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Quatro afirmativas sobre SV — julgue cada item antes de montar a sequência de cima para baixo.',
            icon: 'Target',
          },
          {
            label: 'Temperatura axilar (I)',
            detail:
              'Valores muito abaixo de 36°C apresentados como “normal” — hipotermia, não faixa axilar adulto.',
            icon: 'Thermometer',
          },
          {
            label: 'Pressão arterial (II)',
            detail:
              'Repouso ≥5 min + braço na altura do coração — pré-requisito MS para PA fidedigna.',
            icon: 'HeartPulse',
          },
          {
            label: 'Frequência respiratória (III)',
            detail:
              'Adulto eupneico: 12–20 irpm — faixa 18–26 irpm excede limite superior normal.',
            icon: 'Wind',
          },
          {
            label: 'Registro no prontuário (IV)',
            detail:
              'Técnico registra SV com data, hora e identificação — competência legal e clínica.',
            icon: 'ClipboardList',
          },
          {
            label: 'Pegadinha temp hipotérmica',
            detail:
              'Item I traz faixa hipotérmica como “normal” — confunde com axilar adulto (~36–37,5°C).',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'I e III falsos · II e IV verdadeiros → F,V,F,V',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: quatro itens V/F + sequência — julgar um a um.',
          'Julgar I: temp axilar na faixa do item é “normal”? → F — hipotermia; axilar adulto ~36–37,5°C.',
          'Julgar II: PA após 5 min repouso, braço ao coração? → VERDADEIRO — protocolo MS.',
          'Julgar III: FR adulto 18–26 irpm? → FALSO — eupneia = 12–20 irpm.',
          'Julgar IV: registrar data, hora e identificação? → VERDADEIRO — registro completo.',
          'Conjunto correto: F, V, F, V.',
          'Eliminar A (I verdadeiro), B (II falso), D (I e III verdadeiros).',
          'Marcar C.',
          'Fixação: item I hipotérmico e FR 18–26 são filtros numéricos clássicos.',
        ],
        footer_rule: 'I=F · II=V · III=F · IV=V → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — faixas e técnica MS',
        meta: slideMeta,
        content: 'NÚMEROS DE PROVA — ADULTO',
        rows: [
          {
            label: 'Temp axilar',
            value: '36 a 37,5°C (normal axilar) · abaixo de 35°C hipotermia',
            sv_kind: 'temp',
            badge: 'hot',
            exam_hint: 'Item I falso — faixa hipotérmica, não normal axilar.',
          },
          {
            label: 'PA — repouso',
            value: '≥5 min sentado · braço ao nível do coração',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Item II verdadeiro.',
          },
          {
            label: 'FR adulto',
            value: '12 a 20 irpm (eupneia)',
            sv_kind: 'fr',
            badge: 'hot',
            exam_hint: 'Item III falso — 18–26 inclui taquipneia.',
          },
          {
            label: 'Registro SV',
            value: 'Data + hora + identificação do profissional',
            sv_kind: 'meta',
            badge: 'ok',
            exam_hint: 'Item IV verdadeiro.',
          },
          {
            label: 'Febre axilar',
            value: '≥37,8°C — referência comum de prova',
            sv_kind: 'temp',
            badge: 'ok',
          },
          {
            label: 'Mnemônico',
            value: '36–37 temp · 12–20 FR · 5 min PA',
            sv_kind: 'meta',
            badge: 'warn',
          },
        ],
        footer_rule: 'Memorize trio numérico antes de combinar sequências V/F',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TEMP HIPOTÉRMICA FALSA',
        items: [
          {
            label: 'Letra A — V,V,F,F',
            detail: 'Aceita item I verdadeiro — faixa hipotérmica apresentada como normal axilar.',
            correct:
              'Axilar adulto normal centra em 36–37,5°C — item I é falso (hipotermia).',
          },
          {
            label: 'Letra B — F,F,V,V',
            detail: 'Nega II verdadeiro sobre repouso e nível do braço na PA.',
            correct:
              'MS exige ≥5 min de repouso e braço ao coração — II é verdadeiro, sequência B invalida.',
          },
          {
            label: 'Letra D — V,F,V,F',
            detail: 'Mantém I falso mas aceita III verdadeiro (FR 18–26).',
            correct:
              'FR adulto normal é 12–20 irpm — 18–26 inclui taquipneia; III é falso.',
          },
          {
            label: 'Confundir temp retal com axilar',
            detail: 'Aluno mistura faixas de sítios diferentes e aceita valores muito baixos como plausíveis.',
            correct:
              'Axilar adulto ~36–37,5°C — item I indica hipotermia, não normalidade.',
          },
        ],
        footer_rule: 'I falso elimina A e D parcial — feche III → letra C',
      },
    ],
  },

  'ameosc-enfermagem-verificacao-de-sinais-vitais-1779343845367-6': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS — eupneia FR 12–20 · pulso radial indicador+médio · PA sistólica>diastólica',
    roi_error: 'pulso_polegar_indicador',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'I/II/III — FR · pulso · PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Três afirmativas sobre mensuração e registro de SV — identifique quais estão corretas.',
            icon: 'Target',
          },
          {
            label: 'Eupneia (I)',
            detail:
              'FR adulto 12–20 irpm em repouso = eupneia — termo técnico da normalidade respiratória.',
            icon: 'Wind',
          },
          {
            label: 'Palpação radial (II)',
            detail:
              'Polegar + indicador é erro — palpação correta usa indicador e médio sobre a artéria.',
            icon: 'Hand',
          },
          {
            label: 'Registro PA (III)',
            detail:
              'Sistólica (maior, contração) + diastólica (menor, relaxamento) — ordem correta.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha polegar+indicador',
            detail:
              'Item II descreve técnica errada de pulso — polegar tem pulso próprio e distorce contagem.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'I e III corretos · II errado → I e III apenas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: I, II, III + combinações — julgar cada afirmativa.',
          'Julgar I: FR 12–20 irpm = eupneia? → VERDADEIRO — termo técnico da normalidade.',
          'Julgar II: pulso radial com polegar e indicador? → FALSO — usar indicador e médio.',
          'Julgar III: sistólica maior (contração) + diastólica menor (relaxamento)? → VERDADEIRO.',
          'Conjunto correto: I e III apenas.',
          'Eliminar B (inclui II falso), C (só II falso), D (inclui II falso).',
          'Marcar A.',
          'Fixação: polegar invalida II — eupneia ancora I.',
        ],
        footer_rule: 'I=V · II=F · III=V → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — FR · pulso · PA',
        meta: slideMeta,
        content: 'EUPNEIA · INDICADOR+MÉDIO · S/D',
        rows: [
          {
            label: 'Eupneia',
            value: 'FR 12–20 irpm em adulto repouso',
            sv_kind: 'fr',
            badge: 'hot',
            exam_hint: 'Item I verdadeiro — lacuna “eupneia”.',
          },
          {
            label: 'Taquipneia',
            value: 'FR > 20 irpm',
            sv_kind: 'fr',
            badge: 'warn',
          },
          {
            label: 'Palpação radial',
            value: 'Indicador + médio — nunca polegar',
            sv_kind: 'fc',
            badge: 'hot',
            exam_hint: 'Item II falso — polegar distorce.',
          },
          {
            label: 'Pressão sistólica',
            value: 'Maior valor — contração ventricular (ejeção)',
            sv_kind: 'pa',
            badge: 'ok',
            exam_hint: 'Item III verdadeiro.',
          },
          {
            label: 'Pressão diastólica',
            value: 'Menor valor — relaxamento ventricular',
            sv_kind: 'pa',
            badge: 'ok',
            exam_hint: 'Item III verdadeiro.',
          },
          {
            label: 'Registro PA',
            value: 'Sistólica/diastólica em mmHg — ordem fixa',
            sv_kind: 'pa',
            badge: 'ok',
          },
        ],
        footer_rule: 'Polegar elimina II — eupneia + S/D fecham I e III',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — POLEGAR+INDICADOR',
        items: [
          {
            label: 'Letra B — I e II apenas',
            detail: 'Mantém II falso (polegar+indicador) como conduta correta.',
            correct:
              'Polegar possui pulso arterial próprio — palpação radial exige indicador e médio; II é falso.',
          },
          {
            label: 'Letra C — II apenas',
            detail: 'Marca só o item errado como conjunto correto.',
            correct:
              'II é falso, mas I (eupneia) e III (S/D) são verdadeiros — gabarito exige I + III.',
          },
          {
            label: 'Letra D — I, II e III',
            detail: 'Aceita polegar+indicador junto com I e III corretos.',
            correct:
              'Técnica de pulso com polegar invalida II — conjunto completo D é incorreto.',
          },
          {
            label: 'Confundir sensibilidade do polegar',
            detail: 'Polegar parece “mais sensível” na prática clínica improvisada.',
            correct:
              'Sensibilidade não compensa pulso próprio do polegar — MS/COFEN indicam indicador + médio.',
          },
        ],
        footer_rule: 'II falso elimina B, C e D — confirme eupneia → letra A',
      },
    ],
  },

  'ameosc-enfermagem-verificacao-de-sinais-vitais-1779343883917-1': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline: 'COFEN/MS — SV alterados pós-op: posicionar · reaferir · vigilância · comunicar enfermeiro',
    roi_error: 'interpretacao_sv_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pós-op — instabilidade hemodinâmica',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário clínico',
            detail:
              'Pós-operatório recente — tontura ao sentar + pele fria + sudorese = hipoperfusão, não repouso tranquilo.',
            icon: 'User',
          },
          {
            label: 'PA 90×60 mmHg',
            detail:
              'Hipotensão relativa + sintomas ortostáticos — não classificar como normotenso isolado.',
            icon: 'HeartPulse',
          },
          {
            label: 'Sinais periféricos',
            detail:
              'Pele fria e sudorese indicam compensação cardiovascular — alerta clínico imediato.',
            icon: 'Droplets',
          },
          {
            label: 'Tontura ortostática',
            detail:
              'Queixa ao sentar reforça queda de perfusão cerebral — exige reavaliação e vigilância.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Papel do técnico',
            detail:
              'Posicionar confortavelmente, reaferir SV, manter vigilância e comunicar enfermeiro — sem atrasar.',
            icon: 'Shield',
          },
          {
            label: 'Pegadinha normotenso isolado',
            detail:
              '90×60 com sintomas NÃO é “PA ok” — banca testa interpretação integrada, não só o número.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'Sintomas + PA limítrofe → escalação imediata',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Ler cenário: pós-op + PA 90×60 + pele fria + sudorese + tontura ao sentar.',
          'Interpretar PA: 90×60 com sintomas = hipotensão/instabilidade relativa — não “normotenso”.',
          'Cruzar achados: frialdade + sudorese = hipoperfusão periférica.',
          'Testar A — posição confortável, rever SV, vigilância, comunicar enfermeiro → candidata.',
          'Testar B — continuar outros pacientes e informar no fim do turno → eliminar.',
          'Testar C — aguardar melhora espontânea sem comunicar → eliminar.',
          'Testar D — oferecer água e orientar sentado → eliminar (autonomia inadequada).',
          'Confirmar: A integra segurança, reavaliação e escalação.',
          'Marcar A.',
          'Fixação: número isolado não fecha conduta — sintomas determinam urgência.',
        ],
        footer_rule: 'Instabilidade pós-op → posicionar + reaferir + comunicar → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — interpretação + conduta',
        meta: slideMeta,
        content: 'CONTEXTO CLÍNICO > NÚMERO ISOLADO',
        rows: [
          {
            label: 'PA 90×60 + sintomas',
            value: 'Hipotensão relativa / instabilidade — não ignorar',
            sv_kind: 'pa',
            badge: 'warn',
            exam_hint: 'Pegadinha: classificar só pelo valor.',
          },
          {
            label: 'Pele fria + sudorese',
            value: 'Sinais de hipoperfusão — alerta hemodinâmico',
            sv_kind: 'meta',
            badge: 'warn',
          },
          {
            label: 'Tontura ortostática',
            value: 'Queda de perfusão cerebral — reavaliar posição e SV',
            sv_kind: 'meta',
            badge: 'warn',
          },
          {
            label: 'Conduta técnico',
            value: 'Posicionar · reaferir SV · vigilância contínua',
            sv_kind: 'meta',
            badge: 'hot',
          },
          {
            label: 'Comunicação',
            value: 'Informar enfermeiro responsável imediatamente',
            sv_kind: 'meta',
            badge: 'hot',
            exam_hint: 'Gabarito A — escalação sem atraso.',
          },
          {
            label: 'Fora do escopo',
            value: 'Adiar comunicação · medicar sem ordem · minimizar sintoma',
            sv_kind: 'meta',
            badge: 'warn',
            exam_hint: 'Distratores B, C e D.',
          },
        ],
        footer_rule: 'Integre SV + sintomas antes de escolher conduta',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — INTERPRETAÇÃO SV ERRADA',
        items: [
          {
            label: 'Letra B — informar no fim do turno',
            detail: 'Propõe continuar rotina e comunicar alteração apenas ao final.',
            correct:
              'Instabilidade pós-op com sintomas exige comunicação imediata — atraso viola segurança do paciente.',
          },
          {
            label: 'Letra C — aguardar melhora espontânea',
            detail: 'Sugere observar minutos sem acionar equipe para “não preocupar”.',
            correct:
              'Hipotensão sintomática pós-op pode evoluir — técnico deve reaferir e comunicar enfermeiro na hora.',
          },
          {
            label: 'Letra D — oferecer água e orientar sentado',
            detail: 'Conduta paliativa sem escalação — parece acolhedora, mas é insuficiente.',
            correct:
              'Tontura + sudorese + pele fria indicam risco — água não substitui vigilância e comunicação.',
          },
          {
            label: 'Classificar 90×60 como normotenso',
            detail: 'Aluno vê PA “aceitável” e ignora pele fria, sudorese e tontura.',
            correct:
              'Interpretação integrada: sintomas + PA limítrofe = instabilidade — conduta A.',
          },
        ],
        footer_rule: 'Número sem contexto elimina B, C, D → letra A',
      },
    ],
  },

  'ameosc-enfermagem-verificacao-de-sinais-vitais-1779343883917-3': {
    family: 'protocolo',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS — edema bilateral MS: aferir PA em membro inferior (artéria poplítea) com manguito adequado',
    roi_error: 'manguito_edema',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Edema bilateral — alternativa de sítio PA',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário clínico',
            detail:
              'Idoso admitido — edema em ambos os braços impede manguito adequado no membro superior.',
            icon: 'User',
          },
          {
            label: 'Problema do edema',
            detail:
              'Edema distorce circunferência e compressão do manguito — leitura falsa no braço edemaciado.',
            icon: 'Droplets',
          },
          {
            label: 'Membro inferior',
            detail:
              'PA em perna com manguito de tamanho adequado — alternativa quando MS indisponível.',
            icon: 'HeartPulse',
          },
          {
            label: 'Artéria poplítea',
            detail:
              'Sítio de ausculta/palpação na fossa poplítea — referência para PA de membro inferior.',
            icon: 'Stethoscope',
          },
          {
            label: 'Registro',
            detail:
              'Anotar sítio alternativo no prontuário — membro e condição do paciente.',
            icon: 'ClipboardList',
          },
          {
            label: 'Pegadinha menor edema',
            detail:
              '“Aferir no braço com menor edema” parece pragmático — edema bilateral invalida ambos.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Edema bilateral MS → membro inferior poplítea',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Identificar barreira: edema em AMBOS os braços — MS superior comprometido.',
          'Testar A — aferir após diurético: timing terapêutico, não resolve sítio → eliminar.',
          'Testar B — braço com menor edema: ainda há edema bilateral → eliminar.',
          'Testar C — membro inferior, artéria poplítea: alternativa MS adequada → candidata.',
          'Testar D — qualquer braço, edema não interfere: nega distorção do manguito → eliminar.',
          'Confirmar: C descreve conduta correta para edema bilateral.',
          'Marcar C.',
          'Fixação: edema bilateral = troca de sítio, não “escolher o menos pior braço”.',
        ],
        footer_rule: 'Edema bilateral → poplítea → letra C',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — PA com edema',
        meta: slideMeta,
        content: 'SÍTIO ADEQUADO > ATALHO NO BRAÇO',
        rows: [
          {
            label: 'Edema no MS',
            value: 'Distorce circunferência — manguito inadequado',
            sv_kind: 'pa',
            badge: 'warn',
            exam_hint: 'Caso: edema bilateral.',
          },
          {
            label: 'Braço “menor edema”',
            value: 'Ainda comprometido se bilateral — não é conduta ideal',
            sv_kind: 'pa',
            badge: 'warn',
            exam_hint: 'Distrator B.',
          },
          {
            label: 'Membro inferior',
            value: 'Alternativa quando MS edemaciado',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Artéria poplítea',
            value: 'Fossa poplítea — ausculta PA de perna',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Gabarito C.',
          },
          {
            label: 'Manguito MI',
            value: 'Tamanho adequado à circunferência da coxa',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Registro',
            value: 'Documentar sítio alternativo e condição clínica',
            sv_kind: 'meta',
            badge: 'ok',
          },
        ],
        footer_rule: 'Edema bilateral → não force manguito no braço',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MANGUITO E EDEMA',
        items: [
          {
            label: 'Letra A — após diurético',
            detail: 'Propõe aferir logo após administrar diurético diário.',
            correct:
              'Timing medicamentoso não substitui escolha de sítio — edema bilateral exige membro inferior.',
          },
          {
            label: 'Letra B — braço menor edema',
            detail: 'Sugere aferir no braço menos edemaciado e registrar observação.',
            correct:
              'Edema em ambos os braços compromete leitura — alternativa correta é membro inferior (poplítea).',
          },
          {
            label: 'Letra D — edema não interfere',
            detail: 'Afirma que edema não altera valores em qualquer braço.',
            correct:
              'Edema distorce circunferência e compressão do manguito — leitura falsa no membro edemaciado.',
          },
          {
            label: 'Escolher braço por conveniência',
            detail: 'Aluno prioriza agilidade da admissão sobre fidedignidade da medida.',
            correct:
              'PA fidedigna exige sítio adequado — poplítea quando MS bilateralmente edemaciado.',
          },
        ],
        footer_rule: 'Bilateral edema → poplítea (C) — não “menor edema”',
      },
    ],
  },

  'ameosc-enfermagem-verificacao-de-sinais-vitais-1779344111854-7': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS — sistólica=ejeção · diastólica=relaxamento · manguito proporcional · PA perna=poplítea',
    roi_error: 'sistolica_diastolica_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'I–IV — fisiologia e técnica PA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Quatro afirmativas sobre PA — julgue I–IV antes de combinar “apenas” corretas.',
            icon: 'Target',
          },
          {
            label: 'Pico de ejeção (I)',
            detail:
              'Pico na sístole = pressão SISTÓLICA — item inverte ao chamar de diastólica.',
            icon: 'HeartPulse',
          },
          {
            label: 'Relaxamento ventricular (II)',
            detail:
              'Pressão mínima na diástole = DIASTÓLICA — item inverte ao chamar de sistólica.',
            icon: 'Activity',
          },
          {
            label: 'Tamanho do manguito (III)',
            detail:
              'Enunciado inverte efeito: apertado→baixa leitura · frouxo→alta — pegadinha clássica.',
            icon: 'Gauge',
          },
          {
            label: 'PA em perna (IV)',
            detail:
              'Manguito adequado + ausculta na artéria poplítea — conduta correta em membro inferior.',
            icon: 'Stethoscope',
          },
          {
            label: 'Pegadinha sistólica/diastólica',
            detail:
              'Itens I e II trocam nomenclatura na ejeção e no relaxamento — filtro anatômico decisivo.',
            icon: 'GitCompare',
          },
        ],
        footer_rule: 'I e II invertidos · III invertido · IV correto — gabarito III+IV',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: I–IV + “apenas” combinações — julgar cada item.',
          'Julgar I: pico de ejeção = diastólica? → FALSO — pico sistólico = SISTÓLICA.',
          'Julgar II: relaxamento = sistólica? → FALSO — mínima diastólica = DIASTÓLICA.',
          'Julgar III: efeito do manguito apertado/frouxo? → VERDADEIRO (gabarito oficial inclui III).',
          'Nota clínica: MS = apertado→baixa · frouxo→alta — enunciado inverte (ver pegadinha no mapa).',
          'Julgar IV: perna com manguito adequado, poplítea? → VERDADEIRO — técnica MS.',
          'Conjunto correto: III e IV.',
          'Eliminar B (I e II falsos), C (só IV), D (II e III com I falso).',
          'Marcar A.',
          'Fixação: decore S/D na ejeção/relaxamento antes de manguito.',
        ],
        footer_rule: 'I=F · II=F · III+V · IV=V → letra A (III e IV)',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — fisiologia PA + manguito',
        meta: slideMeta,
        content: 'SISTÓLICA × DIASTÓLICA × MANGUITO',
        rows: [
          {
            label: 'Pressão sistólica',
            value: 'Pico na ejeção ventricular — maior valor',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Item I falso — chama de diastólica.',
          },
          {
            label: 'Pressão diastólica',
            value: 'Mínima no relaxamento — menor valor',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Item II falso — chama de sistólica.',
          },
          {
            label: 'Manguito apertado',
            value: 'Leitura falsamente BAIXA',
            sv_kind: 'pa',
            badge: 'warn',
            exam_hint: 'Item III — enunciado inverte efeito.',
          },
          {
            label: 'Manguito frouxo',
            value: 'Leitura falsamente ALTA',
            sv_kind: 'pa',
            badge: 'warn',
            exam_hint: 'Item III — enunciado inverte efeito.',
          },
          {
            label: 'PA em perna',
            value: 'Manguito MI adequado · ausculta poplítea',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Item IV verdadeiro.',
          },
          {
            label: 'Mnemônico S/D',
            value: 'Sístole=SISTÓLICA · Diástole=DIASTÓLICA',
            sv_kind: 'meta',
            badge: 'ok',
          },
        ],
        footer_rule: 'S/D na fisiologia · manguito na técnica · poplítea no MI',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SISTÓLICA/DIASTÓLICA INVERTIDA',
        items: [
          {
            label: 'Letra B — I e II',
            detail: 'Aceita ambos itens com nomenclatura S/D trocada.',
            correct:
              'Ejeção = sistólica · relaxamento = diastólica — I e II invertem termos e são falsos.',
          },
          {
            label: 'Letra C — IV apenas',
            detail: 'Acerta IV, mas omite III incluído no gabarito oficial.',
            correct:
              'Gabarito A reúne III e IV — IV isolado (letra C) incompleta a combinação esperada.',
          },
          {
            label: 'Letra D — II e III',
            detail: 'Inclui II falso (relaxamento=sistólica) na combinação.',
            correct:
              'Diastólica corresponde ao relaxamento — II é falso; combinação D inválida.',
          },
          {
            label: 'Decorar S/D sem fisiologia',
            detail: 'Aluno memoriza “maior/menor” sem ligar à fase cardíaca.',
            correct:
              'Sistólica = contração/ejeção · diastólica = relaxamento — I e II testam essa distinção.',
          },
        ],
        footer_rule: 'I e II falsos eliminam B e D — feche IV → letra A',
      },
    ],
  },

  'ameosc-enfermagem-verificacao-de-sinais-vitais-1779344117207-5': {
    family: 'conceito',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS — manguito 2–3 cm acima fossa antecubital · bolsa sobre artéria braquial',
    roi_error: 'manguito',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Posicionamento do manguito — método auscultatório',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Valor de X cm acima da fossa antecubital para prender o manguito no método auscultatório.',
            icon: 'Target',
          },
          {
            label: 'Fossa antecubital',
            detail:
              'Referência anatômica — manguito fica PROXIMAL à fossa, não sobre ela.',
            icon: 'MapPin',
          },
          {
            label: 'Distância X',
            detail:
              '2 a 3 cm acima da fossa antecubital — faixa MS/COFEN clássica de prova.',
            icon: 'Ruler',
          },
          {
            label: 'Artéria braquial',
            detail:
              'Centralizar bolsa de borracha sobre braquial — eixo de ausculta e insuflação.',
            icon: 'HeartPulse',
          },
          {
            label: 'Fixação do manguito',
            detail:
              'Prender firmemente sem folgas — vazamento invalida insuflação.',
            icon: 'Grip',
          },
          {
            label: 'Pegadinha distância errada',
            detail:
              'Alternativas 0–1, 4–6 e 7–9 cm seduzem quem não decore a faixa 2–3 cm.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: '2–3 cm acima fossa antecubital · braquial centralizada',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: distância X cm acima da fossa antecubital — método auscultatório.',
          'Referência: bolsa de borracha centralizada sobre artéria braquial.',
          'Testar A — 2 a 3 cm: faixa MS/COFEN → candidata.',
          'Testar B — 7 a 9 cm: excesso proximal → eliminar.',
          'Testar C — 0 a 1 cm: sobre/atop fossa → eliminar.',
          'Testar D — 4 a 6 cm: acima do padrão → eliminar.',
          'Confirmar: só A corresponde ao protocolo.',
          'Marcar A.',
          'Fixação: 2–3 cm + braquial = par de prova.',
        ],
        footer_rule: 'X = 2 a 3 cm → letra A',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — posição do manguito',
        meta: slideMeta,
        content: '2–3 CM · BRAQUIAL · SEM FOLGAS',
        rows: [
          {
            label: 'Distância da fossa',
            value: '2 a 3 cm acima da fossa antecubital',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Gabarito A — valor de X.',
          },
          {
            label: 'Artéria braquial',
            value: 'Bolsa de borracha centralizada sobre braquial',
            sv_kind: 'pa',
            badge: 'hot',
          },
          {
            label: 'Fixação',
            value: 'Manguito firme, sem folgas',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Estetoscópio',
            value: 'Fossa antecubital — sem compressão excessiva',
            sv_kind: 'pa',
            badge: 'ok',
          },
          {
            label: 'Erro 0–1 cm',
            value: 'Muito próximo da fossa — interferência na ausculta',
            sv_kind: 'pa',
            badge: 'warn',
            exam_hint: 'Distrator C.',
          },
          {
            label: 'Erro 7–9 cm',
            value: 'Excesso proximal — afasta do sítio correto',
            sv_kind: 'pa',
            badge: 'warn',
            exam_hint: 'Distrator B.',
          },
        ],
        footer_rule: 'Decore 2–3 cm antes de questões de posicionamento',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DISTÂNCIA DO MANGUITO',
        items: [
          {
            label: 'Letra B — 7 a 9 cm',
            detail: 'Distância excessiva acima da fossa antecubital.',
            correct:
              'MS indica 2–3 cm — 7–9 cm afasta manguito do sítio correto sobre braquial.',
          },
          {
            label: 'Letra C — 0 a 1 cm',
            detail: 'Quase sobre a fossa antecubital.',
            correct:
              'Manguito deve ficar 2–3 cm proximal à fossa — 0–1 cm interfere na ausculta.',
          },
          {
            label: 'Letra D — 4 a 6 cm',
            detail: 'Faixa intermediária acima do padrão MS.',
            correct:
              'Referência de prova é 2–3 cm — 4–6 cm excede distância recomendada.',
          },
          {
            label: 'Confundir com largura do manguito',
            detail: 'Aluno mistura “cm acima da fossa” com “80% circunferência”.',
            correct:
              'Questão pede distância vertical (2–3 cm) — proporcionalidade do manguito é outro parâmetro.',
          },
        ],
        footer_rule: 'Só 2–3 cm fecha posicionamento → letra A',
      },
    ],
  },

  'ameosc-enfermagem-verificacao-de-sinais-vitais-1779344224014-3': {
    family: 'vf',
    branch: 'vitals_pa_tecnica',
    guideline: 'MS — manguito 2–3 cm fossa cubital · braço coração · Korotkoff fase IV se sons até zero · manguito 40%×80%',
    roi_error: 'manguito_proporcao_invertida',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — técnica PA item a item',
        meta: slideMeta,
        items: [
          {
            label: 'Comando da prova',
            detail:
              'Quatro itens sobre técnica de PA — julgue V/F antes de assinalar sequência.',
            icon: 'Target',
          },
          {
            label: 'Posição manguito (1)',
            detail:
              '2–3 cm acima fossa cubital, bolsa sobre braquial, sem folgas — item verdadeiro.',
            icon: 'Ruler',
          },
          {
            label: 'Posição do braço (2)',
            detail:
              'Nível coração (4º EIC), nu, apoiado, palma para cima, cotovelo fletido — item verdadeiro.',
            icon: 'HeartPulse',
          },
          {
            label: 'Korotkoff até zero (3)',
            detail:
              'Sons persistem até zero → diastólica na fase IV (abafamento) — item verdadeiro.',
            icon: 'Stethoscope',
          },
          {
            label: 'Proporção manguito (4)',
            detail:
              'Enunciado traz 10% largura e 50% comprimento — invertido; correto ~40% × 80%.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha proporção invertida',
            detail:
              'Item 4 troca 40%/80% por 10%/50% — erro numérico clássico de manguito.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Itens 1–3 verdadeiros · item 4 falso → V,V,V,F',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: quatro itens V/F sobre técnica PA — tabela primeiro.',
          'Julgar I: manguito 2–3 cm fossa cubital, braquial? → V.',
          'Julgar II: braço nível coração, nu, apoiado? → V.',
          'Julgar III: sons até zero → diastólica fase IV Korotkoff? → V.',
          'Julgar IV: largura 10% e comprimento 50%? → F — correto ~40% largura, 80% comprimento.',
          'Conjunto correto: V, V, V, F.',
          'Eliminar letra A (II falso), letra B (I falso), letra C (III falso).',
          'Marcar D.',
          'Fixação: proporção 40×80 é filtro do item 4.',
        ],
        footer_rule: 'V,V,V,F → letra D',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — checklist técnica PA',
        meta: slideMeta,
        content: 'POSIÇÃO · KOROTKOFF · PROPORÇÃO',
        rows: [
          {
            label: 'Posição manguito',
            value: '2–3 cm acima fossa cubital · bolsa sobre braquial',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Item 1 verdadeiro.',
          },
          {
            label: 'Posição braço',
            value: 'Nível coração (4º EIC) · nu · apoiado · palma superior',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Item 2 verdadeiro.',
          },
          {
            label: 'Korotkoff fase IV',
            value: 'Sons até zero → diastólica no abafamento (fase IV)',
            sv_kind: 'pa',
            badge: 'hot',
            exam_hint: 'Item 3 verdadeiro.',
          },
          {
            label: 'Largura manguito',
            value: '≈ 40% da circunferência do braço',
            sv_kind: 'pa',
            badge: 'warn',
            exam_hint: 'Item 4 falso — enunciado diz 10%.',
          },
          {
            label: 'Comprimento manguito',
            value: '≈ 80% da circunferência do braço',
            sv_kind: 'pa',
            badge: 'warn',
            exam_hint: 'Item 4 falso — enunciado diz 50%.',
          },
          {
            label: 'Mnemônico',
            value: '40% largura · 80% comprimento · 2–3 cm fossa',
            sv_kind: 'meta',
            badge: 'ok',
          },
        ],
        footer_rule: 'Decore 40×80 antes de julgar item 4',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PROPORÇÃO MANGUITO INVERTIDA',
        items: [
          {
            label: 'Letra A — V,F,V,F',
            detail: 'Nega item 2 verdadeiro sobre posição do braço ao coração.',
            correct:
              'Braço ao nível do 4º EIC com apoio é conduta correta — item 2 é verdadeiro.',
          },
          {
            label: 'Letra B — F,F,V,V',
            detail: 'Nega item 1 verdadeiro e aceita item 4 falso como verdadeiro.',
            correct:
              'Manguito 2–3 cm sobre braquial é correto (item 1 V); 10%/50% é falso (item 4 F).',
          },
          {
            label: 'Letra C — V,F,F,V',
            detail: 'Nega item 3 verdadeiro sobre Korotkoff fase IV.',
            correct:
              'Sons até zero exigem diastólica na fase IV — item 3 é verdadeiro.',
          },
          {
            label: 'Confundir 40/80 com 10/50',
            detail: 'Aluno não decorou proporção e aceita números plausíveis do enunciado.',
            correct:
              'Largura ≈40% · comprimento ≈80% da circunferência — item 4 é falso.',
          },
        ],
        footer_rule: 'Item 4 falso elimina B — confirme 1–3 → letra D',
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
    console.log(`[handcraft:sv-g02] OK ${slug}`);
  }
  console.log(`[handcraft:sv-g02] total=${ok}`);
}

main();
