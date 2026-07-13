#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — puncao-venosa-e-cuidados-com-cateteres-g13 (7 slugs Técnica punção periférica).
 *
 *   npm run handcraft:puncao-venosa-e-cuidados-com-cateteres-g13
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  buildPuncaoGuidelineSnapshot,
  buildPuncaoSourcesForSlug,
} from '@/lib/catalogMigration/puncaoPedagogy';

const LOTE = 'puncao-venosa-e-cuidados-com-cateteres-g13';
const SUBTOPICO = 'Punção Venosa e Cuidados com Cateteres';
const BRANCH = 'puncao_periferica_antissepsia';
const REVIEWED = '2026-07-12';

function cleanPdfArtifacts(text: string): string {
  return text
    .replace(/\bqueapresenta\b/gi, 'que apresenta')
    .replace(/\bSão indicaçõesprincipais\b/gi, 'São indicações principais')
    .replace(/\bAtécnica\b/gi, 'A técnica')
    .replace(/\bOobjetivo\b/gi, 'O objetivo')
    .replace(/\brecuperação e promover\b/gi, 'recuperação e promover')
    .replace(/\b20segundos\b/gi, '20 segundos')
    .replace(/\bparacima\b/gi, 'para cima')
    .replace(/\bvolumemáximo\b/gi, 'volume máximo')
    .replace(/\bbocaaté\b/gi, 'boca até')
    .replace(/\brecipientepara\b/gi, 'recipiente para')
    .replace(/\binterferênciasnos\b/gi, 'interferências nos')
    .replace(/\bassinale-a:/gi, 'assinale-a:')
    .replace(/\bÉ CORRETO:/gi, 'É CORRETO:')
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
    topico: 'Enfermagem',
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
  'avancasp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340191984-3': {
    family: 'conceito',
    guideline: 'Material da punção venosa periférica — luvas de procedimento não estéreis; demais itens corretos',
    roi_error: 'luvas_estereis_puncao_rotina',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Kit da punção periférica — achar o erro',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Materiais da punção venosa periférica — uma alternativa está incorreta.',
            icon: 'Package',
          },
          {
            label: 'Antissepsia',
            detail: 'Algodão com álcool setenta por cento ou álcool sachê — correto.',
            icon: 'Droplets',
          },
          {
            label: 'Dispositivo',
            detail: 'Cateter rígido ou flexível conforme finalidade do acesso.',
            icon: 'Syringe',
          },
          {
            label: 'Salinização',
            detail: 'Seringa com SF identificada para flush quando indicado.',
            icon: 'Droplet',
          },
          {
            label: 'Pegadinha',
            detail: 'Luvas estéreis — não são rotina da punção periférica ambulatorial.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Punção periférica de rotina = luvas de procedimento, não estéreis.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Materiais × nível de barreira',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Corretos', value: 'Antisséptico, cateter, seringa SF, conector/extensor.', badge: 'ok' },
          { label: 'Erro (E)', value: 'Luvas estéreis — reservadas a campo estéril cirúrgico.', badge: 'hot' },
          { label: 'Rotina AVP', value: 'Luvas de procedimento + precaução padrão.', badge: 'info' },
        ],
        footer_rule: 'AVANCASP cobra luvas estéreis como item indevido.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Qual material está errado?',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: identificar o material inadequado na lista da punção periférica.',
          'Validar A — antisséptico (álcool) é obrigatório no sítio.',
          'Validar B — cateter conforme finalidade do acesso.',
          'Validar C — seringa com SF para salinização identificada.',
          'Validar D — conector valvulado ou extensor conforme necessidade.',
          'Letra E — luvas estéreis não compõem kit padrão de punção periférica de rotina.',
          'Marcar letra E.',
        ],
        footer_rule: 'Estéril ≠ punção venosa periférica comum.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — “quanto mais estéril, melhor”',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — MATERIAL',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Álcool',
            detail: 'Aluno elimina antisséptico achando que é opcional.',
            correct: 'Álcool no sítio é correto — erro está nas luvas estéreis.',
          },
          {
            label: 'Letra C — Seringa SF',
            detail: 'Flush/salinização faz parte da manutenção do acesso.',
            correct: 'Seringa identificada é material adequado — marque E.',
          },
          {
            label: 'Letra E — Luvas estéreis',
            detail: 'Confunde punção periférica com procedimento em campo estéril.',
            correct: 'Rotina AVP usa luvas de procedimento, não estéreis.',
          },
        ],
        footer_rule: 'Técnica asséptica do sítio ≠ luva estéril obrigatória.',
      },
    ],
  },

  'cogeps-unioeste-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562693149-1': {
    family: 'certo_errado',
    guideline: 'Venopunção periférica — veias dos MMSS; grandes volumes e ação rápida; ângulo baixo com bisel para cima',
    roi_error: 'arteria_90_graus_volume_5ml',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Venopunção periférica — conceitos',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Finalidade',
            detail: 'Grandes volumes e medicamentos com ação rápida na corrente sanguínea.',
            icon: 'Zap',
          },
          {
            label: 'Anatomia',
            detail: 'Palpar veias dos membros superiores — não “artérias” no garrote.',
            icon: 'Activity',
          },
          {
            label: 'Inserção',
            detail: 'Ângulo baixo (cerca de 15–30°) com bisel voltado para cima.',
            icon: 'MoveUpRight',
          },
          {
            label: 'Pegadinha',
            detail: 'Limitar a volumes muito pequenos ou punção a 90° — distratores clássicos.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Venopunção = veia + ângulo baixo + volume terapêutico.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Julgar cada afirmativa',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Volume', value: 'Não se restringe a volumes mínimos — infusão terapêutica ampla.', badge: 'warn' },
          { label: 'Palpação', value: 'Veias nos MMSS — não “artérias” ombro → cotovelo.', badge: 'warn' },
          { label: 'Correto (C)', value: 'Grandes volumes e ação rápida — indicação clássica.', badge: 'hot' },
          { label: 'Ângulo', value: '90° está errado — inserção oblíqua baixa.', badge: 'info' },
        ],
        footer_rule: 'Só letra C fecha como É CORRETO.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Eliminar afirmativas falsas',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: É CORRETO sobre técnica de venopunção periférica.',
          'Eliminar A — não se limita a volumes muito pequenos.',
          'Eliminar B — procura-se veia, não artéria, nos membros superiores.',
          'Eliminar D — inserção a 90° está incorreta (ângulo baixo).',
          'Letra C: grandes volumes e medicamentos com ação rápida — correta.',
          'Marcar letra C.',
        ],
        footer_rule: 'COGEPS troca veia por artéria e ângulo por 90°.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — técnica invertida',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — VENOPUNÇÃO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Volume mínimo',
            detail: 'Subestima capacidade da via venosa periférica.',
            correct: 'Via permite infusão de volumes maiores — letra C.',
          },
          {
            label: 'Letra B — Artéria',
            detail: 'Confunde pulso arterial com veia distendida pelo garrote.',
            correct: 'Palpar veias nos MMSS — não artérias.',
          },
          {
            label: 'Letra D — 90°',
            detail: 'Ângulo perpendicular perfura demais o vaso.',
            correct: 'Bisel para cima em ângulo baixo — não 90°.',
          },
        ],
        footer_rule: 'Venosa periférica ≠ punção arterial.',
      },
    ],
  },

  'coseac-uff-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562687359-2': {
    family: 'conceito',
    guideline: 'Indicações da punção venosa periférica — coletar sangue, infundir soluções e administrar medicamentos',
    roi_error: 'indicacoes_misturadas_sv_rx',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Para que serve o AVP?',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Definição',
            detail: 'Cateter venoso curto flexível no interior do vaso venoso.',
            icon: 'Syringe',
          },
          {
            label: 'Coleta',
            detail: 'Obter sangue venoso para exames laboratoriais.',
            icon: 'TestTube',
          },
          {
            label: 'Infusão',
            detail: 'Administrar soluções e medicamentos endovenosos.',
            icon: 'Droplets',
          },
          {
            label: 'Fora do escopo',
            detail: 'RX de tórax, PA isolada ou “função pulmonar” não são indicações do AVP.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'AVP = acesso venoso terapêutico e diagnóstico (sangue).',
      },
      {
        type: 'golden_rule',
        slide_title: 'Indicações × distratores',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'COLETAR · INFUNDIR · MEDICAR',
        rows: [
          { label: 'Letra D', value: 'Coletar sangue + infundir soluções + administrar medicamentos.', badge: 'hot' },
          { label: 'Letra A', value: 'Mistura função pulmonar e pulso — fora do escopo.', badge: 'warn' },
          { label: 'Letra B/C', value: 'PA ou perfusão com RX — combinações artificiais.', badge: 'info' },
          { label: 'Letra E', value: 'RX de tórax não é indicação de punção.', badge: 'warn' },
        ],
        footer_rule: 'Tríade D: sangue + solução + medicamento.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Escolher indicações corretas',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: indicações principais da punção venosa periférica.',
          'Eliminar A — função pulmonar e pulso não definem indicação do cateter.',
          'Eliminar B — PA e radiografia de tórax não são finalidades do AVP.',
          'Eliminar C — perfusão/PA misturados com infusão de forma confusa.',
          'Eliminar E — radiografia de tórax não pertence às indicações.',
          'Letra D: coletar sangue, infundir soluções e administrar medicamentos.',
          'Marcar letra D.',
        ],
        footer_rule: 'Prova COSEAC mistura SV e RX com acesso venoso.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — “qualquer procedimento”',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — INDICAÇÃO',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Função pulmonar',
            detail: 'Avaliação respiratória não exige cateter venoso.',
            correct: 'Indicação = sangue, solução e medicamento EV (D).',
          },
          {
            label: 'Letra B — PA + RX',
            detail: 'Sinais vitais e imagem não são indicações do AVP.',
            correct: 'Foque nas três ações venosas do gabarito.',
          },
          {
            label: 'Letra E — Pulso + RX',
            detail: 'Combinação aleatória de procedimentos diagnósticos.',
            correct: 'Coleta + infusão + medicação — letra D.',
          },
        ],
        footer_rule: 'Não marque alternativa que inclui radiografia.',
      },
    ],
  },

  'nc-ufpr-funpar-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340254185-4': {
    family: 'protocolo',
    guideline: 'ANVISA — punção periférica: garrote 5–15 cm acima do sítio, sem articular; ângulo baixo; bisel para cima',
    roi_error: 'angulo_60_bisel_baixo_barbear',
    exam_vs_current:
      'Distância do garrote (cinco a quinze cm) e ângulo de inserção baixo cobrados na prova FUNPAR/ANVISA.',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Técnica ANVISA — punção periférica',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Garrote',
            detail: 'Cinco a quinze cm acima do sítio — nunca sobre articulação.',
            icon: 'Circle',
          },
          {
            label: 'Ângulo',
            detail: 'Inserção oblíqua baixa (cerca de 15–30°), não perpendicular.',
            icon: 'MoveUpRight',
          },
          {
            label: 'Bisel',
            detail: 'Voltado para cima — facilita entrada no lúmen venoso.',
            icon: 'ArrowUp',
          },
          {
            label: 'Evitar',
            detail: 'Barbear, flexionar cotovelo pós-punção ou 60° de inclinação.',
            icon: 'Ban',
          },
        ],
        footer_rule: 'Garrote correto + ângulo baixo = letra A.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Cuidados ANVISA × erros',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Correto (A)', value: 'Garrote 5–15 cm acima, fora de articulação.', badge: 'hot' },
          { label: 'Ângulo 60°', value: 'Excessivo — risco de transfixar a veia.', badge: 'warn' },
          { label: 'Bisel baixo', value: 'Deve ficar para cima na punção venosa.', badge: 'warn' },
          { label: 'Barbear', value: 'Não é rotina — aumenta microlesões.', badge: 'info' },
          { label: 'Flexionar cotovelo', value: 'Após punção na fossa — conduta incorreta.', badge: 'warn' },
        ],
        footer_rule: 'FUNPAR ancora garrote como item A.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Qual cuidado é adequado?',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: cuidado adequado segundo ANVISA na punção periférica.',
          'Letra A: garrote cinco a quinze cm acima, sem sobrepor articulação — correto.',
          'Eliminar B — ângulo de 60° é excessivo para AVP.',
          'Eliminar C — bisel voltado para baixo está incorreto.',
          'Eliminar D — barbear não é recomendação de rotina.',
          'Eliminar E — flexionar braço após punção na fossa é inadequado.',
          'Marcar letra A.',
        ],
        footer_rule: 'Garrote distancia e posição — ponto clássico FUNPAR.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — ângulo e bisel',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — TÉCNICA',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra B — 60°',
            detail: 'Ângulo alto perfura parede posterior da veia.',
            correct: 'Inserção oblíqua baixa — garrote correto é A.',
          },
          {
            label: 'Letra C — Bisel para baixo',
            detail: 'Inverte orientação clássica da agulha/cateter.',
            correct: 'Bisel para cima em ângulo baixo.',
          },
          {
            label: 'Letra D — Barbear',
            detail: 'Procedimento desnecessário e irritante na maioria dos casos.',
            correct: 'ANVISA cobra posicionamento do garrote — A.',
          },
        ],
        footer_rule: 'Não confunda punção venosa com incisão perpendicular.',
      },
    ],
  },

  'objetiva-concursos-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562687359-4': {
    family: 'certo_errado',
    guideline: 'Carmagnani — punção periférica: não punir FAV; após 2ª falha outro profissional; escolha de veia sem “sempre” antecubital dominante',
    roi_error: 'fav_puncao_sempre_antecubital',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'C/E Carmagnani — punção',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Item I',
            detail: '“Sempre” a maior veia antecubital do membro dominante — ERRADO (E).',
            icon: 'XCircle',
          },
          {
            label: 'Item II',
            detail: 'Puncionar membro com fístula arteriovenosa — ERRADO (E).',
            icon: 'Ban',
          },
          {
            label: 'Item III',
            detail: 'Após 2ª tentativa sem sucesso, outro profissional punciona — CERTO (C).',
            icon: 'CheckCircle',
          },
          {
            label: 'Sequência',
            detail: 'E — E — C → letra A.',
            icon: 'ListOrdered',
          },
        ],
        footer_rule: 'FAV é território proibido para punção venosa.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Julgar I, II e III',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'I', value: 'E — “sempre” antecubital dominante é absoluto demais.', badge: 'warn' },
          { label: 'II', value: 'E — nunca punir braço com fístula AV.', badge: 'hot' },
          { label: 'III', value: 'C — troca de profissional após segunda falha.', badge: 'ok' },
          { label: 'Sequência', value: 'E — E — C (alternativa A).', badge: 'hot' },
        ],
        footer_rule: 'Memorize: FAV = braço proibido.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Montar E - E - C',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: C/E segundo Carmagnani — assinalar sequência correta.',
          'Item I: “sempre” veia mais calibrosa antecubital dominante → E (generalização indevida).',
          'Item II: membro com fístula arteriovenosa pode ser puncionado → E (proibido).',
          'Item III: após segunda tentativa falha, outro profissional → C (correto).',
          'Sequência E - E - C corresponde à letra A.',
          'Marcar letra A.',
        ],
        footer_rule: 'Confira cada item antes de bater a sequência.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — FAV e “sempre”',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — C/E',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Item I como C',
            detail: 'Escolha de veia é individualizada — não “sempre” antecubital dominante.',
            correct: 'Item I é E — sequência começa E-E-C.',
          },
          {
            label: 'Item II como C',
            detail: 'Fístula AV é contraindicação absoluta de punção nesse membro.',
            correct: 'Item II é E — nunca punir o braço da FAV.',
          },
          {
            label: 'Letra D (C-C-E)',
            detail: 'Marca FAV como permitida e troca só o item III.',
            correct: 'Só A fecha E-E-C.',
          },
        ],
        footer_rule: 'Hemodiálise/FAV: membro sagrado — não punir.',
      },
    ],
  },

  'vunesp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779340213288-4': {
    family: 'protocolo',
    guideline: 'Garrote na punção para coleta — tempo máximo curto para não alterar resultados laboratoriais',
    roi_error: 'garrote_prolongado_coleta',
    exam_vs_current:
      'Prova VUNESP limita uso do garrote a um minuto na coleta — alguns protocolos atuais citam até dois minutos; ensinar o gabarito da questão.',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Garrote na coleta venosa',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Função',
            detail: 'Distender a veia acima do sítio de punção para facilitar acesso.',
            icon: 'Circle',
          },
          {
            label: 'Coleta laboratorial',
            detail: 'Tempo curto — hemoconcentração altera resultados de exames.',
            icon: 'Clock',
          },
          {
            label: 'Limite da prova',
            detail: 'Não exceder um minuto com garrote aplicado.',
            icon: 'Timer',
          },
          {
            label: 'Pegadinha',
            detail: 'Alternativas com dois a cinco minutos — distensão prolongada.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Coleta = garrote breve — um minuto na VUNESP.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Tempo máximo do garrote',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        content: 'GARROTE CURTO NA COLETA',
        rows: [
          { label: 'Prova', value: 'Um minuto — letra E.', badge: 'hot' },
          { label: 'Risco', value: 'Hemoconcentração falsifica potássio, hemograma etc.', badge: 'warn' },
          { label: 'Distratores', value: 'Dois a cinco minutos — tempo excessivo.', badge: 'info' },
        ],
        footer_rule: 'Para laboratório: soltar garrote assim que a veia estiver acessível.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Quanto tempo no máximo?',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: tempo máximo do garrote para não interferir em exames laboratoriais.',
          'Eliminar A (cinco minutos), B (quatro), C (três) e D (dois) — tempo prolongado.',
          'Letra E: um minuto — limite cobrado pela banca.',
          'Marcar letra E.',
          'Fixação: após punção bem-sucedida, retirar garrote antes de prolongar estase.',
        ],
        footer_rule: 'VUNESP cobra o menor tempo entre as alternativas.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — garrote esquecido',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — COLETA',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra D — Dois minutos',
            detail: 'Parece “razoável”, mas a prova exige limite menor.',
            correct: 'Gabarito VUNESP = um minuto (E).',
          },
          {
            label: 'Letra A — Cinco minutos',
            detail: 'Tempo longo hemoconcentra a amostra.',
            correct: 'Coleta laboratorial exige garrote breve.',
          },
          {
            label: 'Esquecer de soltar',
            detail: 'Garrote após coleta altera perfil bioquímico.',
            correct: 'Um minuto é o teto desta questão.',
          },
        ],
        footer_rule: 'Garrote ≠ torniquete deixado durante toda a coleta.',
      },
    ],
  },

  'vunesp-enfermagem-puncao-venosa-e-cuidados-com-cateteres-1779562711132-4': {
    family: 'certo_errado',
    guideline: 'Punção venosa — assepsia ampla com álcool setenta por cento; bisel para cima; ângulo de dez a trinta graus',
    roi_error: 'tecnica_mista_procedimentos',
    exam_vs_current:
      'Afirmativa B cobra álcool setenta por cento, bisel para cima e ângulo de dez a trinta graus — padrão clássico de prova.',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Procedimentos básicos — achar o correto',
        chip_label: 'PUNÇÃO',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Qual técnica está descrita corretamente entre procedimentos básicos diversos.',
            icon: 'ListChecks',
          },
          {
            label: 'Punção venosa (B)',
            detail: 'Assepsia ampla + álcool setenta por cento; bisel para cima; ângulo dez a trinta graus.',
            icon: 'CheckCircle',
          },
          {
            label: 'Aspiração (A)',
            detail: 'Decúbito e tempo de sucção — distratores de outro procedimento.',
            icon: 'Wind',
          },
          {
            label: 'IM / SNG / coleta',
            detail: 'Letras C, D e E trazem erros de outras técnicas.',
            icon: 'XCircle',
          },
        ],
        footer_rule: 'Isolar a alternativa que descreve punção venosa correta.',
      },
      {
        type: 'golden_rule',
        slide_title: 'Punção × outros procedimentos',
        chip_label: 'REGRA DE OURO',
        meta: slideMeta,
        rows: [
          { label: 'Letra B', value: 'Assepsia ampla, álcool 70%, bisel para cima, 10–30°.', badge: 'hot' },
          { label: 'Letra A', value: 'Aspiração — posição e tempo incorretos.', badge: 'warn' },
          { label: 'Letra C', value: 'IM — volume máximo e bisel errados.', badge: 'info' },
          { label: 'Letra E', value: 'Coleta — hemólise proposital está errada.', badge: 'warn' },
        ],
        footer_rule: 'VUNESP mistura técnicas — só B fecha punção.',
      },
      {
        type: 'logic_flow',
        slide_title: 'Eliminar técnicas erradas',
        chip_label: 'PASSO A PASSO',
        meta: slideMeta,
        reveal_mode: 'tap',
        steps: [
          'Comando: técnica descrita corretamente entre procedimentos básicos.',
          'Eliminar A — aspiração com sucção contínua prolongada incorreta.',
          'Eliminar C — IM com volume máximo de 20 mL e bisel lateralizado errado.',
          'Eliminar D — sondagem gástrica com posicionamento inadequado.',
          'Eliminar E — coleta que provoca hemólise contra parede do tubo.',
          'Letra B: assepsia ampla, álcool setenta por cento, bisel para cima, 10–30°.',
          'Marcar letra B.',
        ],
        footer_rule: 'Foque no trecho de punção venosa da alternativa B.',
      },
      {
        type: 'danger_zone',
        slide_title: 'Armadilhas — mistura de técnicas',
        chip_label: 'ARMADILHAS',
        meta: slideMeta,
        content: 'PEGADINHAS — PROCEDIMENTOS',
        bullet_style: 'x_icon',
        items: [
          {
            label: 'Letra A — Aspiração',
            detail: 'Procedimento respiratório com tempo e posição inadequados.',
            correct: 'Não é punção venosa — eliminar.',
          },
          {
            label: 'Letra C — Intramuscular',
            detail: 'Volume e ângulo de IM estão incorretos na afirmativa.',
            correct: 'B descreve assepsia e ângulo do AVP.',
          },
          {
            label: 'Letra E — Hemólise',
            detail: 'Coleta deve evitar hemólise, não provocá-la.',
            correct: 'Técnica correta de punção = letra B.',
          },
        ],
        footer_rule: 'Em questão mista, localize o bloco da punção venosa.',
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
    console.log(`[handcraft:puncao-g13] OK ${slug}`);
  }
  console.log(`[handcraft:puncao-g13] total=${ok}`);
}

main();
