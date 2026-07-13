#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — puncao-venosa-e-cuidados-com-cateteres-g01 (8 slugs P0 puncao_flebite).
 *
 *   npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g01
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  buildPuncaoGuidelineSnapshot,
  buildPuncaoSourcesForSlug,
} from '@/lib/catalogMigration/puncaoPedagogy';

const LOTE = 'puncao-venosa-e-cuidados-com-cateteres-g01';
const SUBTOPICO = 'Punção Venosa e Cuidados com Cateteres';
const BRANCH = 'puncao_flebite';
const REVIEWED = '2026-07-11';

/** Corrige colagens típicas de PDF importado (TecConcursos etc.). */
function cleanPdfArtifacts(text: string): string {
  return text
    .replace(/\bdaagulha\b/gi, 'da agulha')
    .replace(/\bÉindicada\b/gi, 'É indicada')
    .replace(/\bumprocedimento\b/gi, 'um procedimento')
    .replace(/\bumação\b/gi, 'uma ação')
    .replace(/\bmelhorescondições\b/gi, 'melhores condições')
    .replace(/\bainfusão\b/gi, 'a infusão')
    .replace(/\bamedicação\b/gi, 'a medicação')
    .replace(/\bamedicamentos\b/gi, 'a medicamentos')
    .replace(/\baoacesso\b/gi, 'ao acesso')
    .replace(/\bdepermanência\b/gi, 'de permanência')
    .replace(/\bodesaparecimento\b/gi, 'o desaparecimento')
    .replace(/\bvenosadeve\b/gi, 'venosa deve')
    .replace(/\bapermanência\b/gi, 'a permanência')
    .replace(/\bvalidade dapermanência\b/gi, 'validade da permanência')
    .replace(/\btempo depermanência\b/gi, 'tempo de permanência')
    .replace(/([.!?])([A-Za-zÀ-ú])/g, '$1 $2');
}

function cleanQuestionData(qd: Q['question_data']): Q['question_data'] {
  return {
    ...qd,
    instruction: cleanPdfArtifacts(qd.instruction),
    options: qd.options.map((o) => ({ ...o, text: cleanPdfArtifacts(o.text) })),
  };
}

const EXAM_VS_BY_SLUG: Record<string, string> = {
  'fau-unicentro-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562711132-5':
    'FAU usa “flebite” como nome popular da infiltração de soro; na norma técnica infiltração ≠ flebite.',
};

type Q = {
  meta: Record<string, unknown>;
  question_data: { instruction: string; options: { id: string; text: string; is_correct: boolean }[] };
  modulo_slug?: string;
};

type Pack = {
  family: 'vf' | 'conceito' | 'protocolo' | 'calc';
  guideline: string;
  roi_error?: string;
  exam_vs_current?: string;
  slides: unknown[];
};

const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function metaBase(q: Q, pack: Pack, slug: string) {
  const examVs = pack.exam_vs_current ?? EXAM_VS_BY_SLUG[slug] ?? 'none';
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
      exam_vs_current: examVs,
      catalog_slug: slug,
      ...(pack.roi_error ? { roi_error: pack.roi_error } : {}),
    },
    sources: buildPuncaoSourcesForSlug(corpus),
  };
}

const SPECS: Record<string, Pack> = {
  'avancasp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340254185-7': {
    family: 'conceito',
    guideline: 'Complicações IV — parear nome × mecanismo; êmbolo = resíduo/coágulo deslocado',
    roi_error: 'trocar_definicoes_complicacoes',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Complicações IV — pareamento correto',
        chip_label: 'FLEBITE',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail:
              'Via endovenosa por punção na veia — medicamentos irritantes exigem ação rápida; acidentes na administração podem ocorrer. Apenas um exemplo contextualizado está correto.',
            icon: 'Target',
          },
          {
            label: 'Flebite (trilho)',
            detail: 'Inflamação do trajeto venoso — dor, calor, rubor; não é “aplicações no mesmo lugar” sozinho.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Infiltração (trilho)',
            detail: 'Solução infundida no subcutâneo — não confundir com sangue no interstício.',
            icon: 'Droplets',
          },
          {
            label: 'Hematoma (trilho)',
            detail: 'Sangue extravasado no tecido por punção — equimose; não é líquido da infusão.',
            icon: 'CircleX',
          },
          {
            label: 'Êmbolo (trilho)',
            detail: 'Deslocamento de resíduos medicamentosos mal distribuídos ou coágulos — par correto da prova.',
            icon: 'Zap',
          },
        ],
        footer_rule: 'Administração endovenosa em rotina — valide cada par de exemplos contextualizados.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Tabela — complicações do acesso venoso',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'VALIDE MECANISMO → NOME DA COMPLICAÇÃO',
        rows: [
          { label: 'Flebite', value: 'Inflamação venosa: dor, calor, rubor no trajeto.', badge: 'warn' },
          { label: 'Infiltração', value: 'Solução fora do vaso no subcutâneo.', badge: 'ok' },
          { label: 'Hematoma', value: 'Sangue no tecido — punção/trauma vascular.', badge: 'info' },
          { label: 'Esclerose', value: 'Irritação química crônica da parede venosa.', badge: 'info' },
          { label: 'Êmbolo', value: 'Resíduo medicamentoso ou coágulo deslocado na corrente.', badge: 'hot' },
        ],
        footer_rule: 'Prova AVANÇASP troca infiltração × hematoma × flebite nas definições.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Eliminação — qual par está correto?',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Ler o comando: apenas um par nome × mecanismo está correto.',
          'Letra A: flebite ≠ “só aplicações sucessivas” — eliminar.',
          'Letra B: esclerose ≠ assepsia inadequada como definição única — eliminar.',
          'Letra D: infiltração ≠ extravasamento de sangue por transfixação — eliminar.',
          'Letra E: hematoma ≠ passagem de líquido infundido ao subcutâneo — eliminar.',
          'Resta letra C: êmbolos = deslocamento de resíduos ou coágulos — coerente.',
          'Marcar letra C.',
          'Fixação: infiltração é solução fora da veia; hematoma é sangue no tecido.',
        ],
        footer_rule: 'Nomeie o mecanismo literal do enunciado antes de escolher a letra.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — definições trocadas',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — PAREAMENTO DE COMPLICAÇÕES',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra E — “hematoma” com mecanismo de infiltração',
            detail: 'A banca cola a definição de infiltração no rótulo hematoma.',
            correct: 'Hematoma = sangue no tecido; infiltração = solução infundida no subcutâneo.',
          },
          {
            label: 'Letra D — infiltração como sangue no interstício',
            detail: 'Infiltração é medicamento, não hemorragia por transfixação.',
            correct: 'Êmbolo (letra C) é o único par mecanismo × nome coerente nesta questão.',
          },
          {
            label: 'Letra A — flebite simplificada',
            detail: 'Repetir punção no mesmo sítio é fator de risco, não a definição completa de flebite.',
            correct: 'Flebite exige inflamação do trajeto venoso com sinais flogísticos.',
          },
          {
            label: 'Letra B — esclerose por assepsia',
            detail: 'Esclerose relaciona-se a irritantes/química venosa, não só contaminação.',
            correct: 'Não confunda esclerose com flebite infecciosa ou técnica.',
          },
        ],
        footer_rule: 'Decore os mecanismos — a banca inverte rótulos nas alternativas erradas.',
      },
    ],
  },

  'avancasp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340270805-4': {
    family: 'conceito',
    guideline: 'Infiltração = líquido infundido no subcutâneo por falha do acesso',
    roi_error: 'infiltracao_vs_flebite',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Infiltração × flebite × hematoma',
        chip_label: 'FLEBITE',
        meta: slideMeta,
        items: [
          {
            label: 'Mecanismo do caso',
            detail:
              'Ao administrar medicamentos endovenosos, líquido passou ao tecido subcutâneo por deslocamento da agulha ou penetração na parede do vaso.',
            icon: 'Droplets',
          },
          {
            label: 'Infiltração',
            detail: 'Solução medicamentosa fora do vaso no subcutâneo — mecanismo do enunciado.',
            icon: 'Target',
          },
          {
            label: 'Flebite',
            detail: 'Inflamação do trajeto venoso — dor, calor, rubor; não é líquido no subcutâneo.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Hematoma',
            detail: 'Sangue extravasado no tecido — equimose, não infusato.',
            icon: 'CircleX',
          },
          {
            label: 'Esclerose / abscesso',
            detail: 'Procedimento de rotina não impede esclerose por irritantes ou abscesso infeccioso — não o par correto aqui.',
            icon: 'Shield',
          },
        ],
        footer_rule: 'Infiltração = solução fora da veia; flebite = inflamação do trajeto.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Complicações locais — referência rápida',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'INFILTRAÇÃO: SUSPENDA · RETIRE · AVALIE · DOCUMENTE',
        rows: [
          {
            label: 'Infiltração',
            value: 'Solução fora do vaso no subcutâneo — suspenda infusão e retire dispositivo.',
            emphasis: 'success',
            badge: 'ok',
          },
          {
            label: 'Flebite',
            value: 'Dor, calor, rubor no trajeto venoso — retire cateter inflamado.',
            emphasis: 'alert',
            badge: 'warn',
          },
          {
            label: 'Hematoma',
            value: 'Sangue no tecido por punção — compressão, não é infusato.',
            badge: 'info',
          },
          {
            label: 'Esclerose',
            value: 'Irritação química/endurecimento venoso — evolução.',
            badge: 'info',
          },
          {
            label: 'Abscesso',
            value: 'Coleção purulenta infecciosa — não definição imediata de infiltração.',
            badge: 'info',
          },
        ],
        footer_rule: 'Classifique pelo mecanismo literal do enunciado.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Raciocínio — líquido no subcutâneo',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Identificar: líquido infundido passou ao tecido subcutâneo.',
          'Mecanismo: deslocamento da agulha ou perfuração da parede venosa.',
          'Classificar: solução fora do vaso = infiltração.',
          'Eliminar D (flebite): inflamação venosa, não líquido no subcutâneo.',
          'Eliminar C (hematoma): sangue, não medicamento.',
          'Eliminar A (esclerose) e B (abscesso): não descrevem o evento agudo.',
          'Marcar letra E — Infiltração.',
          'Conduta portátil: suspender, retirar cateter, avaliar extensão, documentar.',
        ],
        footer_rule: 'Flebite e infiltração são as trocas mais frequentes em prova.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — infiltração × flebite',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — LÍQUIDO NO SUBCUTÂNEO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra D — Flebite',
            detail: 'Aluno associa qualquer complicação IV à inflamação venosa.',
            correct: 'Flebite = dor/calor/rubor no trajeto; infiltração = solução fora do vaso.',
          },
          {
            label: 'Letra C — Hematoma',
            detail: 'Confunde extravasamento de sangue com extravasamento de infusato.',
            correct: 'Hematoma é equimose por punção; aqui o líquido é da infusão medicamentosa.',
          },
          {
            label: 'Letra A — Esclerose',
            detail: 'Esclerose é processo crônico por irritantes — não o quadro agudo.',
            correct: 'Infiltração fecha o mecanismo do enunciado.',
          },
          {
            label: 'Letra B — Abscesso',
            detail: 'Abscesso é complicação infecciosa tardia com pus.',
            correct: 'Não use abscesso para líquido infundido no subcutâneo.',
          },
        ],
        footer_rule: 'Leia o mecanismo antes do nome da complicação.',
      },
    ],
  },

  'coseac-uff-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562716126-0': {
    family: 'protocolo',
    guideline: 'Documentação de acesso venoso periférico — complicações locais + dispositivo + tempo',
    roi_error: 'documentacao_incompleta_acesso',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Registro do acesso venoso periférico',
        chip_label: 'FLEBITE',
        meta: slideMeta,
        items: [
          {
            label: 'Princípio SAE',
            detail: 'Registrar imediatamente após o procedimento — evita falha de comunicação.',
            icon: 'ClipboardList',
          },
          {
            label: 'Complicações locais',
            detail: 'Hematoma, flebite, tromboflebite, infiltração, extravasamento — núcleo do gabarito.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Dispositivo e sítio',
            detail: 'Tipo de cateter/dispositivo, localização anatômica e tipo de acesso.',
            icon: 'MapPin',
          },
          {
            label: 'Tempo de permanência',
            detail: 'Quanto tempo o acesso permaneceu — item obrigatório na alternativa correta.',
            icon: 'Clock',
          },
          {
            label: 'Pegadinha “periféricas”',
            detail: 'Complicações são locais ao sítio de punção — não “periféricas” genéricas.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Documentação completa = complicações + dispositivo + local + tempo.',
      },
      {
        type: 'golden_rule',
        slide_title: 'O que anotar no prontuário — AVP',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'AVP: COMPLICAÇÕES LOCAIS + DISPOSITIVO + LOCAL + TEMPO',
        rows: [
          {
            label: 'Complicações locais',
            value: 'Hematoma, flebite, tromboflebite, infiltração, extravasamento.',
            badge: 'hot',
          },
          { label: 'Dispositivo', value: 'Tipo de cateter/dispositivo venoso utilizado.', badge: 'ok' },
          { label: 'Localização', value: 'Sítio anatômico e tipo de acesso (periférico).', badge: 'ok' },
          { label: 'Tempo', value: 'Permanência do dispositivo no local.', badge: 'ok' },
          {
            label: 'Evitar',
            value: 'Só “local anatômico + medicamento” sem complicações e tempo.',
            badge: 'warn',
          },
        ],
        footer_rule: 'COSEAC cobra lista fechada de complicações locais na documentação.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Qual registro está completo?',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: o que registrar sobre acesso venoso periférico após o procedimento.',
          'Eliminar A e E: só local + medicamento — incompleto.',
          'Eliminar B e D: “inflamação/trombose” genérico ou “periféricas” — lista errada.',
          'Letra C lista: hematoma, flebite, tromboflebite, infiltração, extravasamento.',
          'Letra C inclui dispositivo, localização, tipo de acesso e tempo de permanência.',
          'Marcar letra C.',
          'Fixação: complicações locais + dispositivo + sítio + tempo = registro completo.',
        ],
        footer_rule: 'Prova testa lista normativa de complicações locais do AVP.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — documentação incompleta',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — PRONTUÁRIO DO AVP',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letras A/E — só local e medicamento',
            detail: 'Omitem complicações observadas e tempo de permanência.',
            correct: 'Registro exige complicações locais, dispositivo, local e tempo.',
          },
          {
            label: 'Letra B — “trombose” sem extravasamento',
            detail: 'Lista parcial e termos genéricos (“inflamação”).',
            correct: 'Use a lista: hematoma, flebite, tromboflebite, infiltração, extravasamento.',
          },
          {
            label: 'Letra D — “complicações periféricas”',
            detail: 'Termo vago — banca quer “complicações locais” ao sítio.',
            correct: 'Local = ao cateter; não confunda com complicação sistêmica.',
          },
          {
            label: 'Esquecer tempo de permanência',
            detail: 'Dispositivo e sítio sem tempo não fecham o registro COSEAC.',
            correct: 'Tempo de permanência é item explícito da alternativa correta.',
          },
        ],
        footer_rule: 'Decore a lista de complicações locais + os quatro eixos do registro.',
      },
    ],
  },

  'coseac-uff-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562716126-1': {
    family: 'protocolo',
    guideline: 'COSEAC UFF — registro AVP: falha de comunicação se omitir complicações ou tempo',
    roi_error: 'trocar_perifericas_por_locais',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SAE — registro que evita falha de comunicação',
        chip_label: 'DOCUMENTAÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Por que registrar já',
            detail:
              'Informação da assistência no prontuário imediatamente após o término — equipe seguinte precisa do quadro do AVP.',
            icon: 'ClipboardList',
          },
          {
            label: 'Mnemônico HE-FITE',
            detail: 'Hematoma · Extravasamento · Flebite · Infiltração · Tromboflebite — lista fechada da letra C.',
            icon: 'ClipboardCheck',
          },
          {
            label: 'Dispositivo + sítio',
            detail: 'Qual cateter, onde foi instalado e se o acesso é periférico.',
            icon: 'MapPin',
          },
          {
            label: 'Cronologia',
            detail: 'Tempo de permanência do dispositivo — distingue C de B e D.',
            icon: 'Timer',
          },
          {
            label: 'Armadilha “periféricas”',
            detail: 'Letra D fala em complicações periféricas e validade — vocabulário impreciso da banca.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Questão irmã da COSEAC — foque em HE-FITE + tempo, não só “flebite”.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Mnemônico HE-FITE + 3 dados do acesso',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'HE-FITE + DISPOSITIVO + LOCAL + TEMPO',
        rows: [
          { label: 'H', value: 'Hematoma no sítio.', badge: 'ok' },
          { label: 'E', value: 'Extravasamento (presente em C, ausente em B).', badge: 'hot' },
          { label: 'F', value: 'Flebite / tromboflebite no trajeto.', badge: 'ok' },
          { label: 'I', value: 'Infiltração de solução no subcutâneo.', badge: 'ok' },
          { label: 'T', value: 'Tempo de permanência do cateter.', badge: 'hot' },
          { label: 'Evitar', value: '“Inflamação/inchaço” genérico (B/D) ou só médico+medicamento (A/E).', badge: 'warn' },
        ],
        footer_rule: 'Extravasamento + tempo de permanência separam C das demais.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Eliminação — variante COSEAC (questão irmã)',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Tema: anotações de enfermagem sobre acesso venoso periférico após o procedimento.',
          'Letras A/E: citam médico e medicamentos — não listam complicações locais.',
          'Letra B: traz “inflamação/inchaço” e trombose, mas omite extravasamento.',
          'Letra D: “complicações periféricas” + validade da permanência — redação incorreta.',
          'Letra C: HE-FITE completo + dispositivo + localização + tipo + tempo de permanência.',
          'Marcar letra C.',
          'Diferença da questão irmã: use o mnemônico HE-FITE para não confundir com B.',
        ],
        footer_rule: 'B e C parecem — extravasamento e “complicações locais” fecham C.',
      },
      {
        type: 'danger_zone',
        slide_title: 'B × C — quase gêmeas',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — VARIANTE COSEAC',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — quase certa',
            detail: 'Lista flebite e infiltração, mas usa “inflamação/inchaço” e não cita extravasamento.',
            correct: 'Letra C inclui extravasamento e “complicações locais” (termo exato da banca).',
          },
          {
            label: 'Letra D — “periféricas”',
            detail: 'Troca “locais” por “periféricas” e fala em validade em vez de tempo de permanência.',
            correct: 'Complicações são locais ao cateter; tempo = permanência do dispositivo.',
          },
          {
            label: 'Letra A — foco no médico',
            detail: 'Registro centrado em quem punçou e medicamentos — ignora complicações.',
            correct: 'Enfermagem documenta complicações observadas no AVP.',
          },
          {
            label: 'Confundir com a questão irmã',
            detail: 'Enunciado idêntico — aluno decora letra sem ler lista palavra a palavra.',
            correct: 'Valide HE-FITE: extravasamento é o filtro entre B e C.',
          },
        ],
        footer_rule: 'Par duplicado COSEAC — decore o que só C traz: extravasamento + tempo.',
      },
    ],
  },

  'decorp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340232037-2': {
    family: 'protocolo',
    guideline: 'Infiltração ativa — suspender infusão e remover cateter imediatamente',
    roi_error: 'manter_cateter_infiltracao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Infiltração — conduta imediata',
        chip_label: 'FLEBITE',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário clínico',
            detail: 'Paciente com HAS e DM — sinais de infiltração no sítio do cateter durante IV.',
            icon: 'User',
          },
          {
            label: 'Sinais de infiltração',
            detail: 'Edema, frialdade, dor, fluxo resistido, ausência de retorno venoso.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Primeira ação',
            detail: 'Interromper imediatamente a infusão — não reduzir velocidade.',
            icon: 'OctagonX',
          },
          {
            label: 'Segunda ação',
            detail: 'Remover o cateter — não manter para “diluir” ou compressa no mesmo acesso.',
            icon: 'Syringe',
          },
          {
            label: 'Depois',
            detail: 'Avaliar extensão, elevar membro se indicado, novo acesso se necessário, documentar.',
            icon: 'ClipboardList',
          },
        ],
        footer_rule: 'Infiltração ativa = pare a infusão e retire o dispositivo.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Conduta — infiltração em curso',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'PARE · RETIRE · AVALIE · NOVO ACESSO SE PRECISAR',
        rows: [
          {
            label: 'Imediato',
            value: 'Suspender infusão + remover cateter.',
            emphasis: 'highlight',
            badge: 'hot',
          },
          {
            label: 'Proibido',
            value: 'Diminuir velocidade mantendo o mesmo cateter.',
            badge: 'warn',
          },
          {
            label: 'Proibido',
            value: 'Salina pelo mesmo cateter infiltrado.',
            badge: 'warn',
          },
          {
            label: 'Proibido',
            value: 'Só compressa fria sem retirar dispositivo.',
            badge: 'warn',
          },
          {
            label: 'Documentar',
            value: 'Sinais, horário, conduta e comunicação à equipe.',
            badge: 'ok',
          },
        ],
        footer_rule: 'Não “salve” o cateter infiltrado — retire e reavalie.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Conduta correta — infiltração',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Reconhecer infiltração em infusão IV (sinais locais no cateter).',
          'Eliminar B: reduzir velocidade prolonga dano do extravasamento.',
          'Eliminar C: manter cateter + compressa não trata infiltração ativa.',
          'Eliminar D: salina no mesmo acesso espalha mais o infusato.',
          'Letra A: interromper infusão e remover cateter — conduta padrão.',
          'Marcar letra A.',
          'Comunicar enfermeiro, avaliar lesão, considerar novo acesso, registrar.',
        ],
        footer_rule: 'Velocidade menor não corrige solução no subcutâneo.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — “manter o acesso”',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — INFILTRAÇÃO EM CURSO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — diminuir velocidade',
            detail: 'Seduz quem quer “minimizar dano” sem parar o extravasamento.',
            correct: 'Pare totalmente a infusão — o líquido continua saindo no subcutâneo.',
          },
          {
            label: 'Letra C — compressa fria no cateter',
            detail: 'Mantém dispositivo infiltrado no local.',
            correct: 'Retire o cateter antes de medidas de conforto local.',
          },
          {
            label: 'Letra D — salina no mesmo cateter',
            detail: 'Pode piorar extravasamento de medicamento vesicante/irritante.',
            correct: 'Novo acesso em veia pérvia após retirada.',
          },
          {
            label: 'Comorbidades (HAS/DM)',
            detail: 'Não mudam a conduta imediata da infiltração.',
            correct: 'Infiltração exige suspensão e remoção independente do diagnóstico.',
          },
        ],
        footer_rule: 'Infiltração = stop + remove — sem negociação.',
      },
    ],
  },

  'facape-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340191984-5': {
    family: 'protocolo',
    guideline: 'Flebite — suspender infusão, remover cateter, comunicar, documentar',
    roi_error: 'manter_infusao_flebite',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Flebite — reconhecer e agir',
        chip_label: 'FLEBITE',
        meta: slideMeta,
        items: [
          {
            label: 'Contexto',
            detail: 'Paciente de longa permanência — flebite é complicação frequente do AVP.',
            icon: 'Hospital',
          },
          {
            label: 'Sinais clássicos',
            detail: 'Dor local, eritema na pele e no trajeto da veia, calor local.',
            icon: 'Thermometer',
          },
          {
            label: 'Conduta núcleo',
            detail: 'Suspender infusão, remover cateter, comunicar enfermeiro, anotar no prontuário.',
            icon: 'CheckCircle',
          },
          {
            label: 'Erro típico',
            detail: 'Manter infusão “até sumir sintoma” ou esperar febre sistêmica.',
            icon: 'XCircle',
          },
          {
            label: 'Ardência isolada',
            detail: 'Medicação vesicante sem flogismo ≠ flebite confirmada — avaliar contexto.',
            icon: 'AlertCircle',
          },
        ],
        footer_rule: 'Flebite confirmada → retire o cateter e documente.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Protocolo — flebite no AVP',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'SUSPENDA · RETIRE · COMUNIQUE · REGISTRE',
        rows: [
          {
            label: 'Suspeita/clínica',
            value: 'Dor + eritema no trajeto + calor local.',
            badge: 'hot',
          },
          {
            label: 'Ação 1',
            value: 'Suspender a infusão imediatamente.',
            badge: 'ok',
          },
          {
            label: 'Ação 2',
            value: 'Remover o cateter do sítio inflamado.',
            badge: 'ok',
          },
          {
            label: 'Ação 3',
            value: 'Comunicar enfermeiro responsável.',
            badge: 'ok',
          },
          {
            label: 'Ação 4',
            value: 'Registrar no prontuário do paciente.',
            badge: 'ok',
          },
          {
            label: 'Evitar',
            value: 'Manter cateter, só antibiótico ou esperar sepse.',
            badge: 'warn',
          },
        ],
        footer_rule: 'FACAPE cobra sequência completa de comunicação e registro.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Alternativa correta — flebite',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: alternativa CORRETA sobre flebite.',
          'Eliminar B: “só monitorar” e manter infusão — conduta errada.',
          'Eliminar C: esperar infecção sistêmica para retirar — tardio e perigoso.',
          'Eliminar D: ardência de vesicante sem flogismo ≠ flebite definida — generalização.',
          'Eliminar E: manter cateter e punir depois — dupla punção desnecessária.',
          'Letra A: suspende, remove, comunica enfermeiro e documenta — completa.',
          'Marcar letra A.',
        ],
        footer_rule: 'Não mantenha infusão em flebite — retire e registre.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — manter o cateter',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — FLEBITE FACAPE',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — monitorar e manter infusão',
            detail: 'Minimiza flebite e atrasa retirada do dispositivo inflamado.',
            correct: 'Suspender infusão e remover cateter ao primeiro sinal flogístico.',
          },
          {
            label: 'Letra C — esperar febre/calafrios',
            detail: 'Confunde flebite local com sepse — conduta tardia.',
            correct: 'Aja no sítio antes da disseminação sistêmica.',
          },
          {
            label: 'Letra E — manter cateter “para não ficar sem infusão”',
            detail: 'Prioriza fluido em acesso comprometido.',
            correct: 'Novo acesso em outro sítio após remover o inflamado.',
          },
          {
            label: 'Letra D — ardência = flebite sempre',
            detail: 'Vesicante pode arder sem flebite estabelecida.',
            correct: 'Flebite exige sinais inflamatórios no trajeto venoso.',
          },
        ],
        footer_rule: 'Prova testa sequência enfermagem: suspender → remover → comunicar → anotar.',
      },
    ],
  },

  'fau-unicentro-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562687359-7': {
    family: 'conceito',
    guideline: 'Venoclise = infusão venosa de grandes volumes (soro, sangue)',
    roi_error: 'confundir_venoclise_flebite',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Termos — infusão venosa maciça',
        chip_label: 'FLEBITE',
        meta: slideMeta,
        items: [
          {
            label: 'Enunciado',
            detail: 'Injeção intravenosa de fluidos em grandes quantidades (soro, sangue).',
            icon: 'Droplets',
          },
          {
            label: 'Venoclise',
            detail: 'Termo para infusão venosa de grande volume — resposta da prova.',
            icon: 'Target',
          },
          {
            label: 'Flebite',
            detail: 'Complicação inflamatória do vaso — não é nome do procedimento.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Hemodiálise',
            detail: 'Terapia renal extracorpórea — outro contexto clínico.',
            icon: 'Filter',
          },
          {
            label: 'Hemostasia',
            detail: 'Mecanismo de parar sangramento — não infusão volumosa.',
            icon: 'Bandage',
          },
        ],
        footer_rule: 'Venoclise = volume grande por via venosa.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Glossário — acesso e infusão',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'VENOCLISE ≠ FLEBITE ≠ HEMODIÁLISE',
        rows: [
          { label: 'Venoclise', value: 'Infusão venosa de grandes volumes (soro, sangue).', badge: 'hot' },
          { label: 'Flebite', value: 'Inflamação da veia — complicação, não procedimento.', badge: 'warn' },
          { label: 'Hemodiálise', value: 'Filtração sanguínea em IR crônica/aguda.', badge: 'info' },
          { label: 'Hemostasia', value: 'Controle do sangramento (vasoconstrição, coágulo).', badge: 'info' },
          { label: 'Sinapse', value: 'Junção neuronal — fora do tema venoso.', badge: 'info' },
        ],
        footer_rule: 'Decore venoclise para “grande volume IV”.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Qual termo define o procedimento?',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Identificar: grandes volumes infundidos por via intravenosa.',
          'Eliminar C (flebite): é complicação, não nome da técnica.',
          'Eliminar D (hemodiálise): procedimento dialítico específico.',
          'Eliminar E (hemostasia): parar sangramento — conceito distinto.',
          'Eliminar B (sinapse): termo de neurofisiologia.',
          'Letra A (venoclise): infusão venosa de grande volume — correto.',
          'Marcar letra A.',
        ],
        footer_rule: 'Volume grande + IV = venoclise em provas de técnico.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — termos parecidos',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — VOCABULÁRIO IV',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra C — Flebite',
            detail: 'Está no mesmo capítulo do livro, mas não nomeia o procedimento.',
            correct: 'Flebite = inflamação; venoclise = infusão volumosa.',
          },
          {
            label: 'Letra D — Hemodiálise',
            detail: 'Também manipula sangue, mas em circuito dialítico.',
            correct: 'Venoclise é infusão direta em veia periférica/central.',
          },
          {
            label: 'Letra E — Hemostasia',
            detail: 'Seduz pelo prefixo “hemo-”.',
            correct: 'Hemostasia não define administração de soro em grande volume.',
          },
          {
            label: 'Letra B — Sinapse',
            detail: 'Distrator sem relação com acesso venoso.',
            correct: 'Venoclise fecha o enunciado literal.',
          },
        ],
        footer_rule: 'Separe procedimento (venoclise) de complicação (flebite).',
      },
    ],
  },

  'fau-unicentro-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562711132-5': {
    family: 'conceito',
    guideline: 'Linguagem popular: “flebite” para infiltração — gabarito de prova FAU',
    roi_error: 'flebite_popular_infiltracao',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Infiltração — nome popular × técnico',
        chip_label: 'FLEBITE',
        meta: slideMeta,
        items: [
          {
            label: 'Fenômeno',
            detail: 'Soro/medicamento fora do vaso — infiltração no subcutâneo.',
            icon: 'Droplets',
          },
          {
            label: 'Termo técnico',
            detail: 'Infiltração (ou extravasamento conforme contexto).',
            icon: 'BookOpen',
          },
          {
            label: 'Nome popular na prova',
            detail: 'FAU UNICENTRO usa “flebite” coloquial para esse evento — gabarito A.',
            icon: 'MessageCircle',
          },
          {
            label: 'Flebite técnica',
            detail: 'Inflamação do trajeto venoso — conceito distinto na norma.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Outros distratores',
            detail: 'Edema genérico, hematoma, esclerose, exsudato — não o apelido cobrado.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Prova pode usar termo popular — leia o enunciado literal.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Técnico × popular — infiltração',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'NA NORMA: INFILTRAÇÃO · NA PROVA FAU: “FLEBITE” POPULAR',
        rows: [
          {
            label: 'Infiltração (técnico)',
            value: 'Solução fora do vaso no subcutâneo.',
            badge: 'ok',
          },
          {
            label: 'Flebite (técnico)',
            value: 'Inflamação venosa com dor, calor, rubor no trajeto.',
            badge: 'warn',
          },
          {
            label: 'Nome popular (FAU)',
            value: '“Flebite” como apelido da infiltração de soro fora do acesso.',
            badge: 'hot',
          },
          { label: 'Edema', value: 'Acúmulo de fluido — termo amplo demais.', badge: 'info' },
          { label: 'Hematoma', value: 'Sangue no tecido — não soro infiltrado.', badge: 'info' },
        ],
        footer_rule: 'Registre exam_vs_current se ensinar fora do gabarito literal.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Como a banca nomeia a infiltração',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Enunciado: infiltração do soro fora do acesso venoso — como é chamada popularmente.',
          'Eliminar B (edema): termo genérico, não apelido específico da prova.',
          'Eliminar C (hematoma): sangue, não soro.',
          'Eliminar D (esclerose): cronicidade venosa — não infiltração aguda.',
          'Eliminar E (exsudato): secreção através de tecido — outro conceito.',
          'Letra A (flebite): resposta popular cobrada pela banca FAU.',
          'Marcar letra A.',
          'Na prática clínica: documente “infiltração”; na prova: siga o gabarito literal.',
        ],
        footer_rule: 'Questão de vocabulário popular — não de conduta.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — técnico × coloquial',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — NOME POPULAR',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Confundir com flebite técnica',
            detail: 'Aluno aplica definição COFEN e elimina letra A.',
            correct: 'A prova pede o nome popular, não a classificação normativa.',
          },
          {
            label: 'Letra C — hematoma',
            detail: 'Também é “inchaço” local, mas por sangue.',
            correct: 'Infiltração popular = soro fora da veia — flebite na letra A.',
          },
          {
            label: 'Letra B — edema',
            detail: 'Pode até ocorrer, mas não é o termo tradicional da banca.',
            correct: 'FAU consolida “flebite” para infiltração de soro.',
          },
          {
            label: 'Letra D — esclerose',
            detail: 'Endurecimento venoso crônico — distrator de farmacologia vascular.',
            correct: 'Não nomeia infiltração aguda de infusão.',
          },
        ],
        footer_rule: 'Na prática: infiltração; na prova FAU: “flebite” popular — ver exam_vs_current.',
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
    console.log(`[handcraft:puncao-g01] OK ${slug}`);
  }
  console.log(`[handcraft:puncao-g01] total=${ok}`);
}

main();
