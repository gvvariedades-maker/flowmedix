#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — puncao-venosa-e-cuidados-com-cateteres-g12 (8 slugs Antissepsia na punção).
 *
 *   npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g12
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  buildPuncaoGuidelineSnapshot,
  buildPuncaoSourcesForSlug,
} from '@/lib/catalogMigration/puncaoPedagogy';

const LOTE = 'puncao-venosa-e-cuidados-com-cateteres-g12';
const SUBTOPICO = 'Punção Venosa e Cuidados com Cateteres';
const BRANCH = 'puncao_periferica_antissepsia';
const REVIEWED = '2026-07-12';

function cleanPdfArtifacts(text: string): string {
  return text
    .replace(/\basmedidas\b/gi, 'as medidas')
    .replace(/\botécnico\b/gi, 'o técnico')
    .replace(/\bqualdeve\b/gi, 'qual deve')
    .replace(/\bpráticas decontrole\b/gi, 'práticas de controle')
    .replace(/\bdurante ainternação\b/gi, 'durante a internação')
    .replace(/\bmaisadequada\b/gi, 'mais adequada')
    .replace(/\bmaispróximos\b/gi, 'mais próximos')
    .replace(/\bdeassepsia\b/gi, 'de assepsia')
    .replace(/\bdacorrente\b/gi, 'da corrente')
    .replace(/\bÉ CORRETO\s*afirmar/gi, 'É CORRETO afirmar')
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
  /** Override do ramo L3 do lote (ex.: CVC em lote de antissepsia). */
  branch?: string;
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
    topico: 'Enfermagem',
    subtopico: SUBTOPICO,
    pedagogical_branch: pack.branch ?? BRANCH,
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
  'amauc-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562693149-9': {
    family: 'certo_errado',
    guideline: 'Antissepsia na punção venosa — assepsia ampla com algodão e álcool 70% no sítio',
    roi_error: 'concentracao_alcool_antissepsia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Antissepsia do sítio de punção',
        chip_label: 'ANTISSEPSIA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'É correto afirmar sobre assepsia ampla na punção venosa com algodão e qual concentração de álcool.',
            icon: 'Droplets',
          },
          {
            label: 'Assepsia ampla',
            detail: 'Friccionar o sítio em movimento centrífugo com antisséptico antes da punção.',
            icon: 'ShieldCheck',
          },
          {
            label: 'Álcool 70%',
            detail: 'Concentração usual para antissepsia cutânea em punção venosa no Brasil.',
            icon: 'CheckCircle',
          },
          {
            label: 'Outras concentrações',
            detail: '80%, 90%, 95% e 100% — distratores numéricos da prova.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Punção venosa = assepsia ampla + álcool 70% (padrão de prova).',
      },
      {
        type: 'golden_rule',
        slide_title: 'Antisséptico cutâneo — punção',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'ÁLCOOL 70% · FRICÇÃO · SECAR ANTES DA PUNÇÃO',
        rows: [
          { label: 'Concentração', value: 'Álcool 70% — padrão cobrado em concursos.', badge: 'hot' },
          { label: 'Técnica', value: 'Assepsia ampla com algodão ou gaze em fricção.', badge: 'ok' },
          { label: 'Evitar', value: 'Concentrações >70% sem justificativa no enunciado.', badge: 'warn' },
        ],
        footer_rule: 'AMAUC fixa 70% — não troque por 90% “mais forte”.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Julgar a afirmativa',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: É CORRETO afirmar sobre assepsia ampla com algodão na punção venosa.',
          'Padrão normativo de prova: álcool 70% para antissepsia do sítio.',
          'Eliminar A (80%), C (95%), D (90%) e E (100%) — concentrações distratoras.',
          'Letra B: álcool 70% — fecha a afirmativa correta.',
          'Marcar letra B.',
          'Fixação: aguardar secagem do antisséptico antes de punir.',
        ],
        footer_rule: '70% é o número clássico de antissepsia na punção.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — concentração do álcool',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — ANTISSEPSIA',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Álcool 80%',
            detail: 'Concentração próxima, mas não é o padrão cobrado nesta questão.',
            correct: 'Prova AMAUC exige 70% — não “quase 70”.',
          },
          {
            label: 'Letra D — Álcool 90%',
            detail: 'Aluno escolhe concentração “mais forte” pensando em maior efeito.',
            correct: 'Antissepsia de punção = 70% no gabarito, não 90%.',
          },
          {
            label: 'Letra E — Álcool 100%',
            detail: 'Álcool absoluto irrita pele e não é rotina de punção periférica.',
            correct: '100% é distrator extremo — marque 70% (B).',
          },
        ],
        footer_rule: 'Decore o par: assepsia ampla + álcool 70%.',
      },
    ],
  },

  'ameosc-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340232037-8': {
    family: 'protocolo',
    guideline: 'Precaução padrão — higienização das mãos antes e após manipular cateter venoso periférico',
    roi_error: 'luvas_substituem_hh',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'HH e cateter periférico',
        chip_label: 'ANTISSEPSIA',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário',
            detail: 'Colega manipula AVP sem higienizar mãos antes e depois — conduta do técnico testemunha.',
            icon: 'Users',
          },
          {
            label: 'Precaução padrão',
            detail: 'HH, EPIs e manejo de materiais contaminados são obrigatórios, não opcionais.',
            icon: 'ShieldCheck',
          },
          {
            label: 'Luvas ≠ HH',
            detail: 'Luva não substitui higienização das mãos antes/ após o procedimento.',
            icon: 'Hand',
          },
          {
            label: 'Conduta ativa',
            detail: 'Interromper, orientar colega e reforçar práticas de controle de infecção.',
            icon: 'Megaphone',
          },
        ],
        footer_rule: 'Segurança do paciente exige intervenção educativa imediata.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Momento da higienização das mãos',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Antes', value: 'HH antes de tocar cateter, equipo ou sítio de inserção.', badge: 'hot' },
          { label: 'Depois', value: 'HH após retirar luvas e ao finalizar manipulação.', badge: 'hot' },
          { label: 'Luvas', value: 'Complementam barreira — não dispensam HH.', badge: 'warn' },
          { label: 'Colega', value: 'Orientar na hora — cultura de segurança coletiva.', badge: 'ok' },
        ],
        footer_rule: 'AVP sem HH = risco de IRAS — aja, não apenas registre.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Conduta diante do colega',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Cenário: manipulação de AVP sem HH antes/depois.',
          'Eliminar A — luvas não substituem higienização das mãos.',
          'Eliminar B — HH não é “escolha individual”; é precaução padrão.',
          'Eliminar D — só registrar no fim do turno é tardio e passivo.',
          'Letra C: interromper, orientar sobre HH e reforçar controle de infecção.',
          'Marcar letra C.',
        ],
        footer_rule: 'Intervenção educativa imediata > registro silencioso.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — “já estou de luva”',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — PRECaução PADRÃO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Luvas bastam',
            detail: 'Barreira parcial não elimina necessidade de HH.',
            correct: 'HH antes e após manipular cateter — independente de luva.',
          },
          {
            label: 'Letra B — Não interferir',
            detail: 'Responsabilidade ética e legal é de toda a equipe.',
            correct: 'Controle de infecção é coletivo — oriente o colega na hora.',
          },
          {
            label: 'Letra D — Só documentar',
            detail: 'Registro sem intervenção não protege o paciente no momento.',
            correct: 'Conduta ativa (C) previne IRAS imediata no AVP.',
          },
        ],
        footer_rule: 'Prova cobra atitude proativa na segurança do paciente.',
      },
    ],
  },

  'facet-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340191984-2': {
    family: 'protocolo',
    branch: 'puncao_ipcs_cvc',
    guideline: 'CVC — desinfecção da conexão com álcool 70% após cada administração de medicamento',
    roi_error: 'curativo_cvc_vs_desinfeccao_conexao',
    exam_vs_current:
      'Prova cobra desinfecção da conexão do cateter central com álcool setenta por cento após cada medicação — prática do bundle de manutenção.',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Manutenção do CVC — antissepsia',
        chip_label: 'ANTISSEPSIA',
        meta: slideMeta,
        items: [
          {
            label: 'Contexto',
            detail: 'Prática que previne infecção de corrente sanguínea no CVC.',
            icon: 'Activity',
          },
          {
            label: 'Conexão / hub',
            detail: 'Ponto de entrada de medicamentos — desinfetar a cada manipulação.',
            icon: 'Link',
          },
          {
            label: 'Álcool 70%',
            detail: 'Friccionar a conexão após cada administração — bundle de manutenção.',
            icon: 'Droplets',
          },
          {
            label: 'Curativo',
            detail: 'Troca asséptica se descolar — não é o mesmo que desinfetar o hub.',
            icon: 'Bandage',
          },
        ],
        footer_rule: 'Cada medicação = nova desinfecção do hub com álcool 70%.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Qual prática é a mais adequada?',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: prática que previne infecção de corrente no CVC.',
          'A verdadeira (curativo), mas não responde o comando.',
          'Eliminar B — manutenção reativa (só se infectar) é tardia.',
          'Eliminar C — flush só na inserção ignora manutenção contínua.',
          'Eliminar E — antibiótico não substitui bundle do dispositivo.',
          'D: álcool 70% na conexão após cada medicação — fecha o bundle.',
          'Em similares: hub a cada manipulação ≠ troca de curativo.',
        ],
        footer_rule: 'Manipulação da conexão = fricção com álcool 70%.',
      },
      {
        type: 'golden_rule',
        slide_title: 'CVC — práticas corretas × incorretas',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Conexão', value: 'Álcool 70% com fricção após cada administração.', badge: 'hot' },
          { label: 'Curativo', value: 'Troca asséptica se descolar — certo, mas não é o foco.', badge: 'info' },
          { label: 'Só se infectar', value: 'Esperar sinal local para trocar — conduta tardia.', badge: 'warn' },
          { label: 'Antibiótico IV', value: 'Antibiótico IV não dispensa manutenção do CVC.', badge: 'warn' },
        ],
        footer_rule: 'Comando pede prevenção de corrente → desinfecção da conexão.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — curativo × conexão',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — CVC',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Troca de curativo',
            detail: 'Verdade sobre curativo, mas não responde o comando.',
            correct: 'Foco é desinfecção da conexão, não só curativo.',
          },
          {
            label: 'Letra B — Só se infectar',
            detail: 'Manutenção reativa aumenta risco de corrente.',
            correct: 'Prevenção exige cuidado proativo no hub.',
          },
          {
            label: 'Letra C — Flush só na inserção',
            detail: 'Lavar só na inserção ignora manutenção contínua.',
            correct: 'Flush do lúmen é rotina, não evento único.',
          },
          {
            label: 'Letra E — Antibiótico IV',
            detail: 'Tratamento não substitui bundle de manutenção.',
            correct: 'Desinfetar hub após cada medicação — conduta D.',
          },
          {
            label: 'Em outra banca…',
            detail: 'Podem cobrar curativo semanal se o comando for só curativo.',
            correct: 'Leia o comando: corrente/hub ≠ curativo do sítio.',
          },
        ],
        footer_rule: 'Não confunda troca de curativo com desinfecção do canhão.',
      },
    ],
  },

  'fepese-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340254185-1': {
    family: 'protocolo',
    guideline: 'Flushing de cateter periférico — soro fisiológico 0,9% para lavagem e manter permeabilidade',
    roi_error: 'flushing_solucao_errada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Flushing do AVP',
        chip_label: 'MANUTENÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Solução recomendada para flushing (lavagem) do cateter periférico.',
            icon: 'Syringe',
          },
          {
            label: 'Permeabilidade',
            detail: 'Avaliar sinais de perda de fluxo — obstrução ou fibrina no lúmen.',
            icon: 'Gauge',
          },
          {
            label: 'SF 0,9%',
            detail: 'Solução isotônica padrão para lavagem de cateter venoso periférico.',
            icon: 'Droplets',
          },
          {
            label: 'Evitar',
            detail: 'Água destilada, glicose, Ringer ou álcool no lúmen do cateter.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Flushing = SF 0,9% em volume pequeno conforme protocolo.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Soluções para flushing',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Correto', value: 'Soro fisiológico 0,9% — isotônico, seguro no lúmen.', badge: 'hot' },
          { label: 'Água destilada', value: 'Hipotônica — não usar para flushing de AVP.', badge: 'warn' },
          { label: 'Glicose / Ringer', value: 'Soluções terapêuticas — não substituem lavagem padrão.', badge: 'info' },
          { label: 'Álcool antisséptico', value: 'Antisséptico cutâneo — nunca no interior do cateter.', badge: 'warn' },
        ],
        footer_rule: 'FEPESE cobra SF 0,9% para manter permeabilidade.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Escolher a solução de lavagem',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: solução para flushing do cateter periférico.',
          'Eliminar A (água destilada) — hipotônica, lesa endotélio.',
          'Eliminar B (glicose 5%) — solução hipotônica/terapêutica, não flushing.',
          'Eliminar C (Ringer lactato) — não é lavagem de rotina do AVP.',
          'Eliminar E (álcool antisséptico) — antisséptico externo, proibido no lúmen.',
          'Letra D: soro fisiológico 0,9%.',
          'Marcar letra D.',
        ],
        footer_rule: 'Isotônico + seguro = SF 0,9%.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — “qualquer solução”',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — FLUSHING',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Água destilada',
            detail: 'Confunde lavagem com diluição ou limpeza genérica.',
            correct: 'Flushing de AVP exige solução isotônica — SF 0,9%.',
          },
          {
            label: 'Letra B — Glicose 5%',
            detail: 'Solução comum na infusão, mas não para flushing de manutenção.',
            correct: 'Glicose não é padrão de lavagem do cateter.',
          },
          {
            label: 'Letra E — Álcool antisséptico',
            detail: 'Mistura antissepsia cutânea com manutenção intraluminal.',
            correct: 'Álcool no lúmen danifica e não mantém permeabilidade — use SF 0,9%.',
          },
        ],
        footer_rule: 'Flushing ≠ antissepsia da pele.',
      },
    ],
  },

  'fepese-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562693149-8': {
    family: 'certo_errado',
    guideline: 'Punção venosa — técnica asséptica, materiais estéreis e escolha distal-proximal de veias',
    roi_error: 'antissepsia_opcional_ou_sem_risco',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Princípios da punção venosa segura',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'É CORRETO afirmar sobre cuidados na punção venosa — julgar cada afirmativa.',
            icon: 'Scale',
          },
          {
            label: 'Técnica asséptica',
            detail: 'Antissepsia do sítio + materiais estéreis — obrigatório, não opcional.',
            icon: 'ShieldCheck',
          },
          {
            label: 'Ordem dos vasos',
            detail: 'Distal → proximal: mão/antebraço antes de fossa quando possível.',
            icon: 'ArrowUp',
          },
          {
            label: 'Membro superior',
            detail: 'MS é preferência — MI evitado salvo indicação específica.',
            icon: 'Activity',
          },
        ],
        footer_rule: 'Punção tem risco de IRAS — exige competência e assepsia.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Verdades × mitos da punção',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Asséptico', value: 'Antisséptico + material estéril — obrigatório (letra E).', badge: 'hot' },
          { label: 'Ordem', value: 'Distal primeiro, proximal se falhar — não o inverso.', badge: 'ok' },
          { label: 'Sítio', value: 'Membros superiores preferenciais — não MI em idoso “de rotina”.', badge: 'info' },
          { label: 'Risco', value: 'Procedimento invasivo — não é “sem risco para qualquer um”.', badge: 'warn' },
        ],
        footer_rule: 'Só E fecha como afirmativa correta global.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Eliminar afirmativas falsas',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: qual afirmativa É CORRETA sobre punção venosa.',
          'Eliminar A — ordem invertida (proximal antes de distal).',
          'Eliminar B — membros inferiores não são primeira escolha em idosos.',
          'Eliminar C — antisséptico não é opcional; assepsia é obrigatória.',
          'Eliminar D — procedimento invasivo com riscos; exige técnica treinada.',
          'Letra E: técnica asséptica e materiais estéreis para minimizar infecção.',
          'Marcar letra E.',
        ],
        footer_rule: 'FEPESE testa se você trata punção como procedimento asséptico.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — “procedimento simples”',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — PUNÇÃO VENOSA',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Proximal primeiro',
            detail: 'Economiza veias distais para depois — lógica invertida.',
            correct: 'Puncionar distal antes de proximal — preserva acesso.',
          },
          {
            label: 'Letra C — Antisséptico opcional',
            detail: 'Confunde punção com procedimento “limpo” sem assepsia.',
            correct: 'Antissepsia é mandatória — não opcional.',
          },
          {
            label: 'Letra D — Sem riscos',
            detail: 'Minimiza flebite, hematoma e IRAS.',
            correct: 'Punção exige técnica asséptica e competência — letra E.',
          },
        ],
        footer_rule: 'Nunca marque alternativa que dispensa antissepsia.',
      },
    ],
  },

  'gama-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340270805-3': {
    family: 'protocolo',
    guideline: 'Administração IV segura — monitorar sítio do cateter, compatibilidade e assepsia na inserção',
    roi_error: 'ignorar_monitoramento_sitio',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Segurança na medicação IV',
        chip_label: 'MANUTENÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Prática mais adequada na administração IV com diferentes dispositivos.',
            icon: 'Target',
          },
          {
            label: 'Monitorar sítio',
            detail: 'Inspeção regular — infecção, extravasamento, flebite.',
            icon: 'Eye',
          },
          {
            label: 'Assepsia na inserção',
            detail: 'Pele desinfetada antes de punir — base da segurança.',
            icon: 'ShieldCheck',
          },
          {
            label: 'Compatibilidade',
            detail: 'Verificar medicamento × solução antes de administrar.',
            icon: 'FlaskConical',
          },
          {
            label: 'Competência',
            detail: 'Acesso venoso central exige treinamento — não improvisar por “experiência alheia”.',
            icon: 'GraduationCap',
          },
        ],
        footer_rule: 'Segurança = vigilância contínua do acesso + técnica na inserção.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Práticas seguras × inseguras',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Correto (A)', value: 'Monitorar inserção e agir ante complicações.', badge: 'hot' },
          { label: 'Errado', value: 'Ignorar compatibilidade medicamentosa.', badge: 'warn' },
          { label: 'Errado', value: 'Inserir AVP sem assepsia da pele.', badge: 'warn' },
          { label: 'Errado', value: 'Acesso central sem treinamento específico.', badge: 'warn' },
        ],
        footer_rule: 'GAMA cobra vigilância ativa do local do cateter.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Qual prática é a mais adequada?',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: prática mais adequada na administração IV.',
          'Letra A: monitorar sítio para infecção/extravasamento e reagir — correto.',
          'Eliminar B — administrar sem checar compatibilidade é inseguro.',
          'Eliminar C — inserir sem assepsia viola técnica asséptica.',
          'Eliminar D — acesso venoso central sem treinamento é conduta de risco.',
          'Marcar letra A.',
        ],
        footer_rule: 'Vigilância do sítio é pilar da segurança do paciente.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — atalhos perigosos',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — MEDICAÇÃO IV',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — Sem compatibilidade',
            detail: 'Incompatibilidade precipita obstrução e reação local.',
            correct: 'Sempre verificar medicamento × diluente antes de infundir.',
          },
          {
            label: 'Letra C — Sem assepsia',
            detail: 'Inserção sem antissepsia aumenta IRAS no sítio.',
            correct: 'Assepsia da pele é pré-requisito do AVP.',
          },
          {
            label: 'Letra D — Acesso central sem treino',
            detail: 'Dispositivo de alto risco exige capacitação formal.',
            correct: 'Monitoramento contínuo (A) é a prática mais adequada cobrada.',
          },
        ],
        footer_rule: 'Não escolha alternativa que viola assepsia ou competência.',
      },
    ],
  },

  'instituto-consulplan-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562699843-2': {
    family: 'vf',
    guideline: 'Prevenção ITU associada ao cateter vesical — HH, higiene íntima e posicionamento da bolsa abaixo da bexiga',
    roi_error: 'itu_ac_medidas_trocadas',
    exam_vs_current:
      'Item II (ingestão com meta fixa de líquidos) marcado F no gabarito da prova — hidratação sem meta universal em todos os protocolos.',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'ITU-AC — medidas V/F',
        chip_label: 'PREVENÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Julgar V/F cinco ações para reduzir ITU associada ao cateter vesical.',
            icon: 'ListChecks',
          },
          {
            label: 'I — Álcool no saco',
            detail: 'Passar álcool antisséptico na extremidade do saco coletor — FALSO.',
            icon: 'XCircle',
          },
          {
            label: 'II — Ingestão de líquidos',
            detail: 'Meta fixa de líquidos — FALSO nesta questão.',
            icon: 'XCircle',
          },
          {
            label: 'III — Higiene íntima',
            detail: 'Água morna + sabonete pH levemente ácido — VERDADEIRO.',
            icon: 'CheckCircle',
          },
          {
            label: 'IV — HH',
            detail: 'Higienizar mãos antes e após contato com cateter vesical — VERDADEIRO.',
            icon: 'CheckCircle',
          },
          {
            label: 'V — Posição da bolsa',
            detail: 'Saco acima da bexiga — FALSO; bolsa deve ficar abaixo da bexiga.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Sequência correta: V, F, V, V, F — letra C.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Medidas ITU-AC — o que cai',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'HH · HIGIENE ÍNTIMA · BOLSA ABAIXO DA BEXIGA',
        rows: [
          { label: 'I', value: 'F — não passar álcool na extremidade do saco coletor.', badge: 'warn' },
          { label: 'II', value: 'F — meta fixa de líquidos não é verdadeira aqui.', badge: 'info' },
          { label: 'III', value: 'V — higiene íntima com água morna e sabonete pH ácido.', badge: 'ok' },
          { label: 'IV', value: 'V — HH antes e após manipular cateter vesical.', badge: 'hot' },
          { label: 'V', value: 'F — bolsa abaixo da bexiga; não acima.', badge: 'warn' },
        ],
        footer_rule: 'Antissepsia correta = HH — não álcool no saco de drenagem.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Montar a sequência V/F',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: V/F sobre prevenção de ITU associada ao cateter vesical.',
          'Item I: álcool antisséptico no saco coletor → F (não é conduta recomendada).',
          'Item II: ingestão com meta fixa de líquidos → F nesta questão.',
          'Item III: higiene íntima água morna + sabonete pH ácido → V.',
          'Item IV: HH antes e após cateter vesical → V.',
          'Item V: bolsa no nível/acima da bexiga → F (deve ficar abaixo).',
          'Sequência V, F, V, V, F → letra C.',
          'Marcar letra C.',
        ],
        footer_rule: 'Confira cada romano antes de bater com alternativa.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — álcool “em tudo”',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — ITU-AC',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Item I — Álcool no saco',
            detail: 'Aluno generaliza antissepsia de punção para saco coletor.',
            correct: 'Não passar álcool na extremidade do saco — item F.',
          },
          {
            label: 'Item V — Bolsa alta',
            detail: 'Confunde “acima do chão” com “acima da bexiga”.',
            correct: 'Bolsa abaixo da bexiga — saco acima da bexiga é F.',
          },
          {
            label: 'Letra D — V,V,V,V,F',
            detail: 'Marca I como verdadeiro por excesso de antissepsia.',
            correct: 'Só C fecha V,F,V,V,F.',
          },
        ],
        footer_rule: 'HH sim; álcool no saco de urina não.',
      },
    ],
  },

  'selecon-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562677534-6': {
    family: 'conceito',
    guideline: 'Bundle de manutenção — desinfecção com álcool 70% dos canhões; torneirinhas = dânulas',
    roi_error: 'nomenclatura_hub_danula',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Nomenclatura do acesso venoso',
        chip_label: 'ANTISSEPSIA',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Desinfecção com álcool 70% dos canhões e das “torneirinhas” do acesso vascular.',
            icon: 'Link',
          },
          {
            label: 'Dânula',
            detail: 'Torneirinha/conector do equipo ou dispositivo — ponto de desinfecção no bundle.',
            icon: 'CircleDot',
          },
          {
            label: 'Hub',
            detail: 'Termo em inglês para conexão — sinônimo técnico, não é a resposta da banca.',
            icon: 'Globe',
          },
          {
            label: 'Jelco',
            detail: 'Cateter venoso periférico — dispositivo, não a torneirinha.',
            icon: 'Syringe',
          },
          {
            label: 'Extensor',
            detail: 'Linha de extensão — peça distinta da torneirinha de registro.',
            icon: 'GitBranch',
          },
        ],
        footer_rule: 'Torneirinha do equipo = dânula na nomenclatura de prova.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Peças do circuito venoso',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Dânula', value: 'Torneirinha de 3 vias / registro — desinfetar com álcool 70%.', badge: 'hot' },
          { label: 'Canhão', value: 'Extremidade de conexão do cateter — mesmo bundle de desinfecção.', badge: 'ok' },
          { label: 'Jelco', value: 'Dispositivo de punção periférica — não é sinônimo de torneirinha.', badge: 'info' },
          { label: 'Hub', value: 'Anglicismo — banca Selecon prefere dânula.', badge: 'warn' },
        ],
        footer_rule: 'Bundle = álcool 70% em canhões e dânulas antes de manipular.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Completar a lacuna',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: torneirinhas desinfetadas no bundle também são chamadas de…',
          'Eliminar A (hubs) — termo inglês; prova pede nomenclatura nacional.',
          'Eliminar B (jelcos) — cateter, não torneirinha.',
          'Eliminar D (extensores) — peça de linha, não o registro de 3 vias.',
          'Letra C (dânulas) — sinônimo de torneirinha no contexto do bundle.',
          'Marcar letra C.',
        ],
        footer_rule: 'Decore: dânula = torneirinha do circuito venoso.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — termos em inglês',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — NOMENCLATURA',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Hubs',
            detail: 'Termo técnico válido, mas não é o que a banca nomeia.',
            correct: 'Selecon cobra dânula para torneirinha.',
          },
          {
            label: 'Letra B — Jelcos',
            detail: 'Confunde dispositivo de acesso com conector do equipo.',
            correct: 'Jelco é o cateter — não a torneirinha.',
          },
          {
            label: 'Letra D — Extensores',
            detail: 'Extensor prolonga linha; torneirinha regula fluxo.',
            correct: 'Dânula fecha a lacuna do enunciado.',
          },
        ],
        footer_rule: 'Álcool 70% nos canhões e dânulas — não nos jelcos inteiros.',
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
    console.log(`[handcraft:puncao-g12] OK ${slug}`);
  }
  console.log(`[handcraft:puncao-g12] total=${ok}`);
}

main();
