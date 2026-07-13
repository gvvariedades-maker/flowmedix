#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — puncao-venosa-e-cuidados-com-cateteres-g15 (10 slugs multi-branch).
 *
 *   npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g15
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  buildPuncaoGuidelineSnapshot,
  buildPuncaoSourcesForSlug,
} from '@/lib/catalogMigration/puncaoPedagogy';

const LOTE = 'puncao-venosa-e-cuidados-com-cateteres-g15';
const SUBTOPICO = 'Punção Venosa e Cuidados com Cateteres';
const REVIEWED = '2026-07-12';

type Branch = 'puncao_generico' | 'puncao_periferica_antissepsia' | 'puncao_ipcs_cvc';

function cleanPdfArtifacts(text: string): string {
  return text
    .replace(/\bumidade ousujidade\b/gi, 'umidade ou sujidade')
    .replace(/\bdecomplicações\b/gi, 'de complicações')
    .replace(/\brompimentodo\b/gi, 'rompimento do')
    .replace(/\bparaterapias\b/gi, 'para terapias')
    .replace(/\bgarantindosegurança\b/gi, 'garantindo segurança')
    .replace(/\bpararealização\b/gi, 'para realização')
    .replace(/\bSão indicaçõesprincipais\b/gi, 'São indicações principais')
    .replace(/\bAtécnica\b/gi, 'A técnica')
    .replace(/\bOobjetivo\b/gi, 'O objetivo')
    .replace(/\b20segundos\b/gi, '20 segundos')
    .replace(/\bparacima\b/gi, 'para cima')
    .replace(/\bvolumemáximo\b/gi, 'volume máximo')
    .replace(/\bassinale aalternativa\b/gi, 'assinale a alternativa')
    .replace(/\bmarque aalternativa\b/gi, 'marque a alternativa')
    .replace(/\baalternativa\b/gi, 'a alternativa')
    .replace(/\bcorrespondea\b/gi, 'corresponde a')
    .replace(/\baoscuidados\b/gi, 'aos cuidados')
    .replace(/\bdocateter\b/gi, 'do cateter')
    .replace(/\bdeinserção\b/gi, 'de inserção')
    .replace(/\bdeacordo\b/gi, 'de acordo')
    .replace(/\bdeamostras\b/gi, 'de amostras')
    .replace(/\bdeórgãos\b/gi, 'de órgãos')
    .replace(/\bcalibreem\b/gi, 'calibre em')
    .replace(/\bempdiâmetro\b/gi, 'em diâmetro')
    .replace(/\bemdiâmetro\b/gi, 'em diâmetro')
    .replace(/\bprocedimento,analisar\b/gi, 'procedimento, analisar')
    .replace(/\bponto deinserção\b/gi, 'ponto de inserção')
    .replace(/\bprocedimento,quanto\b/gi, 'procedimento, quanto')
    .replace(/\n\d{4}\)\s*/g, '\n')
    .replace(/\bÉ CORRETO:/gi, 'É CORRETO:')
    .replace(/\bÉ CORRETO\b/gi, 'É CORRETO')
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
  branch: Branch;
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
    topico: 'Enfermagem',
    subtopico: SUBTOPICO,
    pedagogical_branch: pack.branch,
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
  'avancasp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340270805-6': {
    branch: 'puncao_generico',
    family: 'vf',
    guideline: 'Punção EV — segmento da veia maior que calibre da agulha; começar distal; sem tapinhas; irritante em veia calibrosa',
    roi_error: 'vf_cuidados_ev_segmento_tapinhas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — cuidados na administração EV',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Cinco assertivas sobre cuidados na administração endovenosa — julgar I a V e marcar a sequência V/F.',
            icon: 'Target',
          },
          {
            label: 'I — Segmento × agulha',
            detail: 'Trecho venoso deve acomodar o calibre — redação “segmento mais largo que agulha” é falsa.',
            icon: 'Gauge',
          },
          {
            label: 'II — Veias preferenciais',
            detail: 'Mão, cefálica, basílica, radial e antecubital são sítios clássicos de punção periférica.',
            icon: 'MapPin',
          },
          {
            label: 'III — Terapia prolongada',
            detail: 'Iniciar distal (mão/antebraço) — não punir veias centrais de início na periférica.',
            icon: 'ArrowUp',
          },
          {
            label: 'IV — Irritantes',
            detail: 'Agulha fina em veia de maior calibre dilui melhor antibióticos e soluções vesicantes.',
            icon: 'Droplets',
          },
          {
            label: 'V — Tapinhas',
            detail: 'Bater no local para visualizar a veia traumatiza o tecido — usar garrote e palpação suave.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Julgue I → V antes de montar a matriz nas alternativas.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Decore — matriz V/F AVANÇASP',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'I — Segmento', value: 'Falso — veia acomoda calibre; redação invertida na assertiva.', badge: 'hot' },
          { label: 'II — Veias', value: 'Verdadeiro — mão, cefálica, basílica, radial, antecubital.', badge: 'ok' },
          { label: 'III — Prolongada', value: 'Falso — começar distal; preservar veias proximais.', badge: 'warn' },
          { label: 'IV — Irritante', value: 'Verdadeiro — calibre fino em veia calibrosa para diluir.', badge: 'ok' },
          { label: 'V — Tapinhas', value: 'Falso — proscrito para visualização.', badge: 'hot' },
        ],
        footer_rule: 'Matriz F,V,F,V,F — distal antes de proximal.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Montar a sequência V/F',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: cinco cuidados na administração EV — julgar afirmativas I a V e escolher a sequência.',
          'Julgar I — “segmento mais largo que agulha” está invertido: o trecho venoso deve acomodar o calibre → FALSO.',
          'Julgar II — preferir mão, cefálica, basílica, radial e antecubital → VERDADEIRO.',
          'Julgar III — terapia prolongada iniciar pelas centrais → FALSO; preservar veias proximais começando distal.',
          'Julgar IV — irritante: agulha pequena em veia grande para diluir → VERDADEIRO.',
          'Julgar V — tapinhas no local → FALSO; usar garrote e técnica asséptica.',
          'Sequência F,V,F,V,F → letra C.',
        ],
        footer_rule: 'AVANÇASP cobra distal-proximal e proíbe tapinhas.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — sequências erradas',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — MATRIZ V/F',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Tudo verdadeiro',
            detail: 'Aceita tapinhas e punção central inicial — duas falsidades na matriz.',
            correct: 'Ignora itens 1, 3 e 5 falsos — eliminar.',
          },
          {
            label: 'Letra B — Tudo falso',
            detail: 'Nega veias preferenciais e regra do irritante em veia calibrosa.',
            correct: 'Itens 2 e 4 são verdadeiros — sequência inválida.',
          },
          {
            label: 'Letra D — Terceiro verdadeiro',
            detail: 'Marca terapia prolongada pelas centrais como correta.',
            correct: 'Item 3 é falso — começar distal, não central de rotina.',
          },
          {
            label: 'Letra E — Primeiro e quinto verdadeiros',
            detail: 'Valida segmento invertido e tapinhas.',
            correct: 'Itens 1 e 5 são falsos — só C fecha a matriz.',
          },
        ],
        footer_rule: 'Confira os três F antes de marcar C.',
      },
    ],
  },

  'instituto-access-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340213288-7': {
    branch: 'puncao_generico',
    family: 'protocolo',
    guideline: 'Infiltração durante infusão — suspender, comunicar enfermeiro e trocar dispositivo venoso',
    roi_error: 'infiltracao_manter_infusao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Infiltração — conduta imediata',
        chip_label: 'PROTOCOLO',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário',
            detail: 'ATB em infusão — sinais de infiltração no acesso venoso periférico.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Suspender',
            detail: 'Parar a infusão imediatamente — interromper exposição do tecido.',
            icon: 'Ban',
          },
          {
            label: 'Comunicar',
            detail: 'Avisar o enfermeiro responsável para reavaliar o acesso.',
            icon: 'Users',
          },
          {
            label: 'Trocar dispositivo',
            detail: 'Novo sítio e cateter estéril — não reutilizar o acesso comprometido.',
            icon: 'Syringe',
          },
          {
            label: 'Proibido',
            detail: 'Manter infusão, calor local para “absorver” ou reduzir gotejamento esperando melhora.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Infiltração = parar + escalar + novo acesso.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Tríade na infiltração',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: '1. Parar', value: 'Suspender infusão do antibiótico.', badge: 'hot' },
          { label: '2. Comunicar', value: 'Enfermeiro avalia extensão e conduta.', badge: 'ok' },
          { label: '3. Trocar', value: 'Novo dispositivo venoso em outro sítio.', badge: 'ok' },
          { label: 'Erros A/C/D', value: 'Continuar, calor úmido ou observar mantendo infusão.', badge: 'warn' },
        ],
        footer_rule: 'Segurança do paciente > concluir o ATB no acesso errado.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Conduta imediata do técnico',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Cenário: infiltração durante preparo/infusão de antibiótico EV.',
          'Eliminar A — continuar infusão e registrar depois agrava lesão.',
          'Eliminar C — calor úmido com infusão ativa favorece extravasamento.',
          'Eliminar D — reduzir gotejamento e aguardar mascara o problema.',
          'Letra B: suspender infusão, avisar enfermeiro e trocar dispositivo venoso.',
          'Marcar letra B.',
        ],
        footer_rule: 'ACCESS cobra interrupção imediata na infiltração.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — “não parar a infusão”',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — EXTRAVASAMENTO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Continuar',
            detail: 'Registrar ao final deixa o irritante no subcutâneo por mais tempo.',
            correct: 'Conduta insegura — eliminar.',
          },
          {
            label: 'Letra C — Calor úmido',
            detail: 'Aumenta absorção local sem resolver o cateter mal posicionado.',
            correct: 'Não substitui suspender e trocar o acesso.',
          },
          {
            label: 'Letra D — Reduzir gotejamento',
            detail: 'Fluxo menor não corrige punção extravenosa.',
            correct: 'Observação passiva — só B fecha o protocolo.',
          },
        ],
        footer_rule: 'Suspeita de infiltração → interromper antes de qualquer manobra local.',
      },
    ],
  },

  'instituto-consulplan-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562687359-9': {
    branch: 'puncao_generico',
    family: 'vf',
    guideline: 'Terapia EV — planejar acesso; flebite contraindica reutilizar a mesma veia; permanência não limitada a 6h; observar paciente e infusão',
    roi_error: 'vf_flebite_mesma_veia_6h',
    exam_vs_current:
      'Item III (máximo 6h) reflete texto de prova — guidelines atuais priorizam avaliação clínica sobre tempo fixo curto.',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'V/F — efeitos colaterais da terapia EV',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Quatro afirmativas sobre prevenção de efeitos colaterais da terapia endovenosa.',
            icon: 'Target',
          },
          {
            label: 'Planejamento (I)',
            detail: 'Antes de iniciar: duração, tipo de infusão, veia, local e cateter adequados.',
            icon: 'ClipboardList',
          },
          {
            label: 'Flebite (II)',
            detail: 'Veia inflamada não deve receber novo acesso no mesmo trajeto.',
            icon: 'Ban',
          },
          {
            label: 'Permanência (III)',
            detail: 'Tempo máximo de 6 horas é regra rígida de prova — clinicamente avalia-se necessidade.',
            icon: 'Clock',
          },
          {
            label: 'Observação (IV)',
            detail: 'Monitorar paciente, solução, medicação, volume e velocidade durante a infusão.',
            icon: 'Eye',
          },
        ],
        footer_rule: 'Corretos: I e IV — letra B.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Itens verdadeiros × falsos',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'I — Planejar', value: 'Verdadeiro — escolha individualizada do acesso.', badge: 'ok' },
          { label: 'II — Flebite', value: 'Falso — sinal inflamatório impede reutilizar a mesma veia.', badge: 'hot' },
          { label: 'III — 6 horas', value: 'Falso — permanência não se limita a cronômetro fixo de 6h.', badge: 'warn' },
          { label: 'IV — Observar', value: 'Verdadeiro — vigilância contínua da infusão.', badge: 'ok' },
        ],
        footer_rule: 'CONSULPLAN separa planejamento (I) de calendarização (III).',
      },
      {
        type: 'logic_flow',
        slide_title: 'Julgar I a IV',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: prevenção de efeitos colaterais da terapia EV — apenas corretos em…',
          'Item I — considerar duração, infusão, veia, local e cateter → VERDADEIRO.',
          'Item II — flebite não impede novo acesso na mesma veia → FALSO.',
          'Item III — cateter não pode ultrapassar seis horas → FALSO (regra de prova inadequada).',
          'Item IV — observar paciente, solução, medicação, volume e velocidade → VERDADEIRO.',
          'Corretos apenas I e IV → letra B.',
        ],
        footer_rule: 'Flebite = trocar de veia, não insistir no mesmo trajeto.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — II e III',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — TERAPIA EV',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — I e II',
            detail: 'Aceita reutilizar veia com flebite — risco de piora inflamatória.',
            correct: 'Item II é falso — eliminar.',
          },
          {
            label: 'Letra C — II e III',
            detail: 'Combina flebite permissiva com limite rígido de 6h.',
            correct: 'Ambos itens falsos na lógica clínica — não é gabarito.',
          },
          {
            label: 'Letra D — III e IV',
            detail: 'Calendariza 6h mas acerta a observação contínua.',
            correct: 'Item III é falso — só B (I e IV) fecha.',
          },
        ],
        footer_rule: 'Não punir veia com flebite ativa.',
      },
    ],
  },

  'objetiva-concursos-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340254185-5': {
    branch: 'puncao_periferica_antissepsia',
    family: 'vf',
    guideline: 'AVP — indicações EV; antissepsia álcool 70% ou clorexidina 0,5% por 30s; inserção com bisel para cima e método direto/indireto',
    roi_error: 'avp_antissepsia_bisel_todos_itens',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'AVP — três itens corretos',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Punção venosa periférica — analisar três itens e marcar onde todos estão corretos.',
            icon: 'Target',
          },
          {
            label: 'Indicações (I)',
            detail: 'EV para desequilíbrio hidroeletrolítico, perda maciça, disfunção orgânica, infecção, cirurgia e impossibilidade de via oral.',
            icon: 'Droplets',
          },
          {
            label: 'Antissepsia (II)',
            detail: 'Álcool 70% ou clorexidina alcoólica 0,5% — fricção circular 5–8 cm por 30s, centro para fora, aguardar secar.',
            icon: 'Shield',
          },
          {
            label: 'Inserção (III)',
            detail: 'Bisel da agulha/cateter voltado para cima; técnica direta ou indireta conforme protocolo.',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha',
            detail: 'Alternativas que validam só um ou dois itens — gabarito exige os três.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Três pilares: indicação, antissepsia e técnica de inserção.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Checklist da punção periférica',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Indicação', value: 'Hidratação, reposição e medicação quando VO inviável.', badge: 'ok' },
          { label: 'Antissepsia', value: 'Álcool 70% ou clorexidina 0,5% · 30s · evaporação.', badge: 'hot' },
          { label: 'Técnica', value: 'Bisel para cima · método direto/indireto.', badge: 'hot' },
        ],
        footer_rule: 'Antissepsia + bisel = decore OBJETIVA.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Validar I, II e III',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: punção venosa periférica — julgar três itens.',
          'Item I — indicações da via EV (desequilíbrio, perda, disfunção, infecção, cirurgia, VO impossível) → CORRETO.',
          'Item II — antissepsia com álcool 70% ou clorexidina 0,5%, fricção 30s, aguardar secar → CORRETO.',
          'Item III — inserção com bisel para cima, método direto ou indireto → CORRETO.',
          'Três itens corretos → letra D (em todos os itens).',
        ],
        footer_rule: 'OBJETIVA raramente erra antissepsia quando cobra os três juntos.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — respostas parciais',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — AVP',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Só item I',
            detail: 'Indicações corretas, mas ignora antissepsia e técnica de inserção.',
            correct: 'Resposta incompleta — II e III também estão certos.',
          },
          {
            label: 'Letra B — Só item II',
            detail: 'Antissepsia isolada não fecha a questão.',
            correct: 'I e III também são verdadeiros — eliminar.',
          },
          {
            label: 'Letra C — I e III',
            detail: 'Esquece a antissepsia com tempo e produto corretos.',
            correct: 'Item II é verdadeiro — gabarito é D (todos).',
          },
        ],
        footer_rule: 'Quando os três itens fecham, marque “todos”.',
      },
    ],
  },

  'ivin-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562705224-1': {
    branch: 'puncao_ipcs_cvc',
    family: 'vf',
    guideline: 'Cateterismo cardíaco — hematoma local, sangramento arterial, alergia ao contraste; pós femoral/braquial imobilizar membro',
    roi_error: 'cateterismo_manter_membro_movimento',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cateterismo cardíaco — cuidados',
        chip_label: 'CATETERISMO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Exame invasivo diagnóstico — julgar quatro itens sobre cuidados antes, durante e após.',
            icon: 'Target',
          },
          {
            label: 'Complicações locais (I)',
            detail: 'Hematoma no sítio de punção é complicação vascular frequente.',
            icon: 'Circle',
          },
          {
            label: 'Sangramento (II)',
            detail: 'Dispositivos arteriais mantidos horas após o procedimento exigem vigilância de sangramento.',
            icon: 'Droplet',
          },
          {
            label: 'Alergia (III)',
            detail: 'Contraste iodado durante o exame — risco de reação alérgica.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pós femoral/braquial (IV)',
            detail: 'Via arterial percutânea exige repouso e imobilização — não mobilização ativa.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Corretos I, II e III — IV é a pegadinha.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Pós-procedimento arterial',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'I — Hematoma', value: 'Complicação local comum no sítio de introdução.', badge: 'ok' },
          { label: 'II — Sangramento', value: 'Vigilância por dispositivo arterial residual.', badge: 'ok' },
          { label: 'III — Contraste', value: 'Risco alérgico na fase intra-procedimento.', badge: 'ok' },
          { label: 'IV — Mobilidade', value: 'Femoral/braquial: imobilizar membro — não manter em movimento.', badge: 'hot' },
        ],
        footer_rule: 'Repouso no sítio arterial previne hematoma e sangramento.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Julgar os quatro itens',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: cuidados de enfermagem no cateterismo cardíaco — itens I a IV.',
          'Item I — complicações vasculares locais, incluindo hematoma → VERDADEIRO.',
          'Item II — risco de sangramento por punção arterial mantida → VERDADEIRO.',
          'Item III — reação alérgica ao contraste iodado → VERDADEIRO.',
          'Item IV — pós femoral/braquial manter membro em movimento → FALSO; imobilizar.',
          'Corretos I, II e III → letra B.',
        ],
        footer_rule: 'IVIN inverte imobilização com mobilização no item IV.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — incluir o item IV',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — PÓS-CATETERISMO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — II, III e IV',
            detail: 'Valida mobilização do membro após acesso femoral/braquial.',
            correct: 'Item IV é falso — eliminar.',
          },
          {
            label: 'Letra C — I, III e IV',
            detail: 'Acerta hematoma e alergia, mas aceita movimento no pós.',
            correct: 'Imobilização é obrigatória — não marcar IV.',
          },
          {
            label: 'Letra E — Todos corretos',
            detail: 'Generaliza inclusive a orientação de movimentar o membro.',
            correct: 'IV falsifica a conduta pós-arterial — só B fecha.',
          },
        ],
        footer_rule: 'Femoral/braquial = repouso, compressão e vigilância.',
      },
    ],
  },

  'objetiva-concursos-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340280693-0': {
    branch: 'puncao_ipcs_cvc',
    family: 'conceito',
    guideline: 'Punção jugular interna — risco de punção arterial, lesão nervosa, disfonia por nervo laríngeo e hematomas',
    roi_error: 'jugular_riscos_nervo_vago_temporal',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Riscos — veia jugular interna',
        chip_label: 'ACESSO CENTRAL',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Principais riscos da punção da veia jugular interna para o paciente.',
            icon: 'Target',
          },
          {
            label: 'Punção arterial',
            detail: 'Artéria carótida adjacente — risco de punção arterial acidental.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Lesão nervosa',
            detail: 'Estruturas nervosas do pescoço — parestesia ou déficit motor.',
            icon: 'Zap',
          },
          {
            label: 'Disfonia',
            detail: 'Lesão do nervo laríngeo recorrente — alteração da voz.',
            icon: 'Mic',
          },
          {
            label: 'Hematomas',
            detail: 'Sangramento no trajeto de punção — coleção cervical.',
            icon: 'Circle',
          },
        ],
        footer_rule: 'Jugular interna = carótida, nervos e hematoma no colo.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Riscos clássicos da jugular',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Arterial', value: 'Punção acidental da carótida.', badge: 'hot' },
          { label: 'Nervosa', value: 'Lesão de nervos cervicais — disfonia se laríngeo.', badge: 'ok' },
          { label: 'Hematoma', value: 'Sangramento local frequente.', badge: 'ok' },
          { label: 'Distrator B/C', value: 'Nervo vago, temporal, atrofia — não são pacote da letra A.', badge: 'warn' },
        ],
        footer_rule: 'Letra A lista o quartetto clássico de prova.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Escolher a lista de riscos',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: principais riscos da punção da veia jugular interna.',
          'Eliminar B — mistura hematoma com nervo vago e atrofia muscular.',
          'Eliminar C — infecção genérica sem punção arterial típica.',
          'Eliminar D — artéria temporal e nervo raquídeo não são riscos clássicos da jugular interna.',
          'Letra A: punção arterial, lesão nervosa, disfonia por nervo laríngeo e hematomas.',
          'Marcar letra A.',
        ],
        footer_rule: 'OBJETIVA ancora disfonia no nervo laríngeo, não vago.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — nervos trocados',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — JUGULAR INTERNA',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — Nervo vago',
            detail: 'Disfonia na jugular costuma ser laríngeo recorrente, não vago isolado.',
            correct: 'Lista misturada — eliminar.',
          },
          {
            label: 'Letra C — Atrofia muscular',
            detail: 'Não compõe o conjunto clássico cobrado na punção jugular.',
            correct: 'Risco genérico fora do gabarito A.',
          },
          {
            label: 'Letra D — Artéria temporal',
            detail: 'Acesso cervical interno — carótida, não temporal.',
            correct: 'Anatomia errada para o sítio de punção.',
          },
        ],
        footer_rule: 'Carótida + laríngeo + hematoma = tríade OBJETIVA.',
      },
    ],
  },

  'metrocapital-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562693149-4': {
    branch: 'puncao_periferica_antissepsia',
    family: 'conceito',
    guideline: 'Má punção venosa — injeção paravascular (solução fora do lúmen venoso)',
    roi_error: 'paravascular_vs_broncoaspiracao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Intercorrência da má punção',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Intercorrência relacionada à má realização de punção venosa.',
            icon: 'Target',
          },
          {
            label: 'Paravascular',
            detail: 'Agulha/cateter fora do vaso — solução no subcutâneo (infiltração).',
            icon: 'XCircle',
          },
          {
            label: 'Broncoaspiração',
            detail: 'Via aérea — não decorre de punção venosa periférica.',
            icon: 'Wind',
          },
          {
            label: 'Isquemia/compartimental',
            detail: 'Complicações arteriais ou de pressão — outro contexto clínico.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Hematoma periarterial',
            detail: 'Sangramento arterial — punção de artéria, não erro venoso típico da questão.',
            icon: 'Circle',
          },
        ],
        footer_rule: 'Má punção venosa = solução fora da veia.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Erro técnico × nome',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Paravascular (A)', value: 'Infiltração — medicamento no tecido, não no lúmen.', badge: 'hot' },
          { label: 'Broncoaspiração', value: 'Via respiratória — distrator.', badge: 'info' },
          { label: 'Isquemia', value: 'Fluxo arterial comprometido — outro mecanismo.', badge: 'warn' },
          { label: 'Hematoma periarterial', value: 'Artéria punida — não é paravascular venoso.', badge: 'warn' },
        ],
        footer_rule: 'Paravascular = extravasamento na punção venosa.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Nomear a intercorrência',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: intercorrência da má punção venosa.',
          'Eliminar B — broncoaspiração é via aérea, não venosa.',
          'Eliminar C — isquemia vascular não define infiltração por punção errada.',
          'Eliminar D — síndrome compartimental é outro diagnóstico.',
          'Eliminar E — hematoma periarterial sugere punção arterial.',
          'Letra A: injeção paravascular — solução fora do vaso.',
          'Marcar letra A.',
        ],
        footer_rule: 'METROCAPITAL cobra infiltração pelo nome paravascular.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — outras vias',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — COMPLICAÇÃO LOCAL',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — Broncoaspiração',
            detail: 'Aspiração de conteúdo para traqueia — sem relação com punção periférica.',
            correct: 'Procedimento diferente — eliminar.',
          },
          {
            label: 'Letra C — Isquemia',
            detail: 'Oclusão arterial ou compressão — não é infiltração venosa.',
            correct: 'Mecanismo vascular arterial, não paravascular.',
          },
          {
            label: 'Letra E — Periarterial',
            detail: 'Hematoma ao redor de artéria — punção arterial acidental.',
            correct: 'Não descreve erro venoso clássico — A é infiltração.',
          },
        ],
        footer_rule: 'Venosa mal feita → solução no subcutâneo.',
      },
    ],
  },

  'objetiva-concursos-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562699843-4': {
    branch: 'puncao_periferica_antissepsia',
    family: 'vf',
    guideline: 'Venóclise Kawamoto — complicações no sítio e trajeto; vigilância local; não usar Glasgow no curativo; indica fluidos, medicação, NPT e hemoderivados',
    roi_error: 'venoclise_glasgow_sitio_insercao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Venóclise — Kawamoto',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Três itens sobre venóclise segundo Kawamoto — julgar o que está correto.',
            icon: 'Target',
          },
          {
            label: 'Complicações (I)',
            detail: 'Dor, hiperemia e sinais flogísticos no sítio e ao longo do trajeto venoso.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Glasgow (II)',
            detail: 'Escala neurológica não avalia curativo de punção — pegadinha clássica.',
            icon: 'Brain',
          },
          {
            label: 'Indicações (III)',
            detail: 'Fluidos, medicamentos, nutrição parenteral e hemoderivados por via venosa.',
            icon: 'Droplets',
          },
          {
            label: 'Vigilância',
            detail: 'Inspeção do sítio de inserção — rubor, edema, dor, temperatura.',
            icon: 'Eye',
          },
        ],
        footer_rule: 'Inspecione o sítio — vigilância local, não escala neurológica.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Kawamoto — venóclise',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'I — Complicações', value: 'Alterações locais e no trajeto venoso.', badge: 'ok' },
          { label: 'II — Glasgow', value: 'Não se aplica ao sítio de inserção do cateter.', badge: 'hot' },
          { label: 'III — Indicações', value: 'Fluidos, medicação, NPT e hemoderivados.', badge: 'ok' },
        ],
        footer_rule: 'Glasgow = consciência; punção = inspeção do sítio.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Julgar I, II e III',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: venóclise segundo Kawamoto — itens I a III.',
          'Item I — alterações no ponto de inserção e trajeto (dor, hiperemia, flogismo) → CORRETO.',
          'Item II — Glasgow para observar local de inserção → INCORRETO.',
          'Item III — indicada para fluidos, medicamentos, NPT e hemoderivados → CORRETO.',
          'Corretos I e III → letra C.',
        ],
        footer_rule: 'OBJETIVA mistura escala neurológica com curativo venoso.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — Glasgow no sítio',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — VENÓCLISE',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Só item I',
            detail: 'Acerta complicações mas ignora indicações amplas da venóclise.',
            correct: 'Item III também é verdadeiro — incompleto.',
          },
          {
            label: 'Letra B — Só item II',
            detail: 'Glasgow no curativo é conduta absurda na punção.',
            correct: 'Item II é falso — eliminar.',
          },
          {
            label: 'Letra D — II e III',
            detail: 'Valida Glasgow e indicações, mas II está errado.',
            correct: 'Escala de consciência ≠ vigilância do acesso.',
          },
        ],
        footer_rule: 'Inspecione o sítio — não aplique Glasgow no curativo.',
      },
    ],
  },

  'itame-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562677534-4': {
    branch: 'puncao_generico',
    family: 'conceito',
    guideline: 'PAM invasiva — cateterização arterial radial e femoral para mensuração contínua acurada',
    roi_error: 'pam_radial_femoral',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PAM — artérias de cateterização',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Pressão arterial média invasiva — artérias mais utilizadas para cateterização.',
            icon: 'Target',
          },
          {
            label: 'Radial',
            detail: 'Acesso periférico frequente em UTI — monitorização contínua com menor morbidade.',
            icon: 'Activity',
          },
          {
            label: 'Femoral',
            detail: 'Artéria calibrosa em paciente crítico — PAM e débito quando radial inviável.',
            icon: 'Heart',
          },
          {
            label: 'Pegadinha',
            detail: 'Carótida, aorta isolada ou pares sem femoral — listas incompletas da prova.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'PAM invasiva clássica: radial + femoral.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Artérias para PAM',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Correto (A)', value: 'Radial e femoral — pares mais cobrados.', badge: 'hot' },
          { label: 'B — Radial/braquial', value: 'Braquial não fecha o par ITAME.', badge: 'warn' },
          { label: 'C — Braquial/aorta', value: 'Aorta isolada não é resposta de técnico de rotina.', badge: 'info' },
          { label: 'D — Aorta/poplítea', value: 'Poplítea não compõe dupla clássica da questão.', badge: 'info' },
        ],
        footer_rule: 'Memorize: radial (periférica) + femoral (central).',
      },
      {
        type: 'logic_flow',
        slide_title: 'Escolher o par arterial',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: artérias principais para cateterização e PAM acurada.',
          'Eliminar B — braquial não forma o par cobrado com radial nesta questão.',
          'Eliminar C — braquial e aorta não são dupla clássica ITAME.',
          'Eliminar D — aorta e poplítea fogem do gabarito de técnico.',
          'Letra A: radial e femoral.',
          'Marcar letra A.',
        ],
        footer_rule: 'ITAME ancora PAM em radial + femoral.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — pares arteriais',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — PAM',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — Radial e braquial',
            detail: 'Braquial é menos usual que femoral para PAM em críticos.',
            correct: 'Par incompleto frente ao gabarito A.',
          },
          {
            label: 'Letra C — Braquial e aorta',
            detail: 'Aorta exige cenário específico — não resposta padrão de prova.',
            correct: 'Lista não corresponde ao par radial/femoral.',
          },
          {
            label: 'Letra D — Aorta e poplítea',
            detail: 'Poplítea não substitui femoral na dupla cobrada.',
            correct: 'Só A fecha radial + femoral.',
          },
        ],
        footer_rule: 'Crítico monitorizado: pense radial primeiro, femoral se preciso.',
      },
    ],
  },

  'objetiva-concursos-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562711132-0': {
    branch: 'puncao_generico',
    family: 'conceito',
    guideline: 'Medicação EV — veias superficiais da fossa cubital, dorso da mão e antebraço; ângulo de 15° ou paralelo à pele',
    roi_error: 'ev_lacunas_veias_superficiais_15_graus',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Lacunas — técnica EV',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Preencher lacunas: tipo de vaso, região e ângulo da medicação endovenosa.',
            icon: 'Target',
          },
          {
            label: 'Veias superficiais',
            detail: 'Medicação EV aplica-se em veias, não artérias.',
            icon: 'Droplets',
          },
          {
            label: 'Fossa cubital',
            detail: 'Região de grande calibre — cubital entre sítios clássicos.',
            icon: 'MapPin',
          },
          {
            label: 'Mão e antebraço',
            detail: 'Dorso da mão e antebraço também são sítios periféricos citados.',
            icon: 'Hand',
          },
          {
            label: 'Ângulo 15°',
            detail: 'Inserção baixa ou paralela à pele — não 30°, 45° ou 90°.',
            icon: 'Compass',
          },
        ],
        footer_rule: 'Lacunas: veias superficiais | cubital | 15°.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Frase completa — EV periférica',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'VEIAS SUPERFICIAIS · FOSSA CUBITAL · 15°',
        rows: [
          { label: 'Vaso', value: 'Veias superficiais — nunca artérias.', badge: 'hot' },
          { label: 'Região', value: 'Cubital (grande calibre) + mão/antebraço.', badge: 'ok' },
          { label: 'Ângulo', value: '15° ou paralelo à pele.', badge: 'hot' },
          { label: 'Erro B/C', value: 'Artérias ou ângulos 30°/45°/90°.', badge: 'warn' },
        ],
        footer_rule: 'Letra D fecha as três lacunas.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Preencher as lacunas',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: medicação endovenosa em ___ de grande calibre da região ___, dorso da mão e antebraço, ângulo de ___.',
          'Eliminar A — veias profundas e 30° não fecham o enunciado.',
          'Eliminar B — artérias superficiais e femoral são via errada.',
          'Eliminar C — artérias profundas e 45° invertem vaso e técnica.',
          'Letra D: veias superficiais | cubital | 15°.',
          'Marcar letra D.',
        ],
        footer_rule: 'OBJETIVA cobra veia superficial + ângulo baixo.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — artéria e ângulo',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — LACUNAS EV',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — 30°',
            detail: 'Ângulo mais aberto que o citado no gabarito de medicação EV de rotina.',
            correct: 'Cubital com 15° — não 30°.',
          },
          {
            label: 'Letra B — Artérias',
            detail: 'Medicação endovenosa exige veia, não artéria superficial femoral.',
            correct: 'Vaso errado — eliminar.',
          },
          {
            label: 'Letra C — 45° profundo',
            detail: 'Artérias profundas e braquial não preenchem o texto da questão.',
            correct: 'Só D combina veias superficiais + cubital + 15°.',
          },
        ],
        footer_rule: 'EV = veia + ângulo baixo na periferia.',
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
    console.log(`[handcraft:puncao-g15] OK ${slug} (${pack.branch})`);
  }
  console.log(`[handcraft:puncao-g15] total=${ok}`);
}

main();
