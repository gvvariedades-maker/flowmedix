#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g12 (8 slugs · urgencias_xabcde_trauma).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  finalizeSlides,
  metaBase,
  slideMeta,
  xabcdeRows,
  type Pack,
  type Q,
} from './lib/urgenciasTraumaGolden';

const LOTE = 'urgencias-g12';
const REVIEWER = 'handcraft-urgencias-g12';

const SPECS: Record<string, Pack> = {
  'ameosc-enfermagem-processo-de-enfermagem-1780011961798-7': {
    family: 'protocolo',
    guideline: 'XABCDE — X = hemorragia exsanguinante; controle hemorrágico antes das demais etapas',
    roi_error: 'xabcde_x_hemorragia',
    cluster: 'XABCDE — etapa X hemorragia',
    danger_footer: 'Gabarito D — foco no controle de hemorragias',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'XABCDE — letra X',
        meta: slideMeta,
        items: [
          { label: 'X — exsanguinação', detail: 'Hemorragia com risco imediato de morte — tratar primeiro.', icon: 'Droplet' },
          { label: 'Controle', detail: 'Compressão direta · torniquete se necessário.', icon: 'Hand' },
          { label: 'Pegadinha — só consciência', detail: 'X não é apenas Glasgow — é sangramento massivo.', icon: 'AlertTriangle' },
          { label: 'Pegadinha — VM invasiva', detail: 'Ventilação invasiva não define a etapa X.', icon: 'Wind' },
        ],
        footer_rule: 'XABCDE trauma — hemorragia antes de queimadura secundária',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'XABCDE — procedimento da letra X:',
          'Eliminar avaliar só consciência.',
          'Eliminar priorizar VM invasiva.',
          'Eliminar negligenciar hipotermia como descrição da etapa X.',
          'Foco no controle de hemorragias — marcar D.',
        ],
        footer_rule: 'Hemorragia externa massiva = X',
      },
      { type: 'golden_rule', meta: slideMeta, content: 'XABCDE — DECORE', rows: xabcdeRows(), footer_rule: 'X · A · B · C · D · E' },
      null as unknown,
    ],
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780003709908-2': {
    family: 'protocolo',
    guideline: 'Hemorragia externa — compressão direta com curativo limpo; não torniquete direto na ferida',
    roi_error: 'hemorragia_compressao_direta',
    cluster: 'Hemorragia externa — compressão direta',
    danger_footer: 'Gabarito E — compressão direta',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Corte profundo — sangramento',
        meta: slideMeta,
        items: [
          { label: 'Hemorragia ativa', detail: 'Membro superior — prioridade hemostática imediata.', icon: 'Droplet' },
          { label: 'Compressão direta', detail: 'Curativo limpo pressionando o leito do sangramento.', icon: 'Hand' },
          { label: 'Pegadinha — só elevar/frio', detail: 'Elevação sem compressão não estanca.', icon: 'AlertTriangle' },
          { label: 'Pegadinha — torniquete na ferida', detail: 'Torniquete proximal — não sobre a ferida aberta.', icon: 'Ban' },
        ],
        footer_rule: 'Trauma XABCDE — compressão direta; queimadura não é o foco',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Hemorragia externa após corte — conduta imediata:',
          'Eliminar elevar + frio sem compressão.',
          'Eliminar lavar e esperar estancar sozinho.',
          'Eliminar aguardar médico sem compressão.',
          'Eliminar torniquete direto sobre ferida.',
          'Compressão direta com curativo limpo — marcar E.',
        ],
        footer_rule: 'Curativo + pressão contínua',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'HEMORRAGIA EXTERNA',
        rows: [
          { label: '1º', value: 'Compressão direta contínua', badge: 'hot' },
          { label: 'Elevar', value: 'Auxilia após compressão — não substitui', badge: 'ok' },
          { label: 'Torniquete', value: 'Se compressão falhar — proximal', badge: 'warn' },
        ],
        footer_rule: 'Não atrasar hemostasia',
      },
      null as unknown,
    ],
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780006444165-3': {
    family: 'protocolo',
    guideline: 'XABCDE — X hemorragia grave antes de via aérea isolada ou acesso venoso',
    roi_error: 'xabcde_prioridade_hemorragia',
    cluster: 'XABCDE — prioridade imediata no trauma',
    danger_footer: 'Gabarito E — controlar hemorragia externa grave',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Primeira abordagem trauma',
        meta: slideMeta,
        items: [
          { label: 'Politrauma', detail: 'Sequência XABCDE — do que mata em segundos ao que mata em minutos.', icon: 'Activity' },
          { label: 'X — hemorragia', detail: 'Sangramento externo grave — prioridade técnica imediata.', icon: 'Droplet' },
          { label: 'Pegadinha — só VAA', detail: 'Via aérea importa — mas hemorragia exsanguinante vem no X.', icon: 'Wind' },
          { label: 'Pegadinha — acesso venoso', detail: 'Fluido não substitui hemostasia externa.', icon: 'Syringe' },
        ],
        footer_rule: 'Politrauma XABCDE — esmagamento exige mesmo X',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trauma — prioridade imediata do técnico (XABCDE):',
          'Eliminar apenas permeabilizar VAA como 1ª ação isolada.',
          'Eliminar acesso venoso antes de hemostasia.',
          'Eliminar Glasgow antes de controlar sangramento grave.',
          'Eliminar expor tórax como prioridade única.',
          'Controlar hemorragia externa grave — compressão ou torniquete — marcar E.',
        ],
        footer_rule: 'X = exsanguinação',
      },
      { type: 'golden_rule', meta: slideMeta, content: 'XABCDE — ORDEM', rows: xabcdeRows(), footer_rule: 'Hemorragia massiva não espera' },
      null as unknown,
    ],
  },
  'cotec-fadenor-enfermagem-urgencias-e-emergencias-1777104018306-8': {
    family: 'protocolo',
    guideline: 'Trauma — segurança cena · responsividade · coluna manual · VAA pérvia simultânea',
    roi_error: 'trauma_vaa_coluna_simultanea',
    cluster: 'Trauma — VAA e coluna cervical',
    danger_footer: 'Gabarito A — VAA pérvias com manobras e aspiração',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Trauma — primeiros passos',
        meta: slideMeta,
        items: [
          { label: 'Cena segura', detail: 'Proteger equipe e vítima antes de abordar.', icon: 'Shield' },
          { label: 'Coluna manual', detail: 'Estabilização cervical simultânea à avaliação.', icon: 'Bone' },
          { label: 'Via aérea', detail: 'Manobras de abertura · aspirar secreções · corpo estranho.', icon: 'Wind' },
          { label: 'Pegadinha — colar antes VAA', detail: 'Colar não substitui manobras iniciais de perviedade.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Trauma XABCDE — queimadura não atrasa VAA inicial',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trauma/suspeita — ação CORRETA no primeiro momento:',
          'A: avaliar VAA — manobras · secreções · corpo estranho — correto.',
          'B: colar antes de ventilação — sequência inadequada.',
          'C: O₂ só após colar fixo — não é o núcleo da afirmativa correta.',
          'D: membros antes de C circulação — ordem errada.',
          'E: Glasgow só hospitalar — não descreve o momento APH.',
          'Marcar A.',
        ],
        footer_rule: 'XABCDE trauma — VAA e coluna cervical',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TRAUMA — APH',
        rows: [
          { label: 'Segurança', value: 'Cena · EPI', badge: 'hot' },
          { label: 'A', value: 'VAA pérvia + coluna estabilizada', badge: 'ok' },
          { label: 'Aspiração', value: 'Secreções · corpo estranho visível', badge: 'warn' },
        ],
        footer_rule: 'Não hiperextender sem indicação',
      },
      null as unknown,
    ],
  },
  'educa-pb-enfermagem-processo-de-enfermagem-1780007246385-8': {
    family: 'protocolo',
    guideline: 'Imobilização coluna — alinhamento manual + dispositivos cabeça-tronco-pelve; colar isolado insuficiente',
    roi_error: 'imobilizacao_coluna_completa',
    cluster: 'Imobilização — coluna vertebral no trauma',
    danger_footer: 'Gabarito C — alinhamento + restrição cabeça-tronco-pelve',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Imobilização vertebral',
        meta: slideMeta,
        items: [
          { label: 'Politrauma', detail: 'Suspeita de lesão medular até prova contrária.', icon: 'Bone' },
          { label: 'Alinhamento manual', detail: 'Estabilização inicial antes do dispositivo.', icon: 'Hand' },
          { label: 'Dispositivos', detail: 'Restringir cabeça · tronco · pelve — não só colar.', icon: 'Shield' },
          { label: 'Pegadinha — colar isolado', detail: 'Colar cervical sozinho não imobiliza coluna completa.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'XABCDE trauma — coluna e transporte',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Imobilização no transporte de trauma — CORRETA:',
          'Eliminar colar isolado como suficiente.',
          'Eliminar prancha só por conforto prolongado.',
          'Eliminar tração em qualquer fratura sem critério.',
          'Alinhamento manual + dispositivos cabeça-tronco-pelve — marcar C.',
        ],
        footer_rule: 'Imobilização em bloco',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'IMOBILIZAÇÃO — COLUNA',
        rows: [
          { label: 'Manual', value: 'Estabilização inicial da cabeça', badge: 'hot' },
          { label: 'Colar', value: 'Auxiliar — não substitui prancha/bloqueio', badge: 'ok' },
          { label: 'Prancha', value: 'Transporte com restrição global', badge: 'warn' },
        ],
        footer_rule: 'Imobilização trauma — queimadura térmica é outro módulo',
      },
      null as unknown,
    ],
  },
  'facet-enfermagem-urgencias-e-emergencias-1777103976379-2': {
    family: 'protocolo',
    guideline: 'ABCDE — D (Disability) = Glasgow rápido na avaliação neurológica inicial',
    roi_error: 'abcde_d_glasgow',
    cluster: 'ABCDE — Disability e Glasgow',
    danger_footer: 'Gabarito B — Escala de Coma de Glasgow',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'ABCDE — letra D',
        meta: slideMeta,
        items: [
          { label: 'Disability', detail: 'Avaliação neurológica rápida no trauma.', icon: 'Brain' },
          { label: 'Glasgow', detail: 'Ferramenta padrão para nível de consciência.', icon: 'ClipboardList' },
          { label: 'Pegadinha — PA', detail: 'Pressão arterial é circulação (C) — não D isolado.', icon: 'Activity' },
          { label: 'Pegadinha — exame completo', detail: 'D é triagem neurológica — não exame de todo corpo.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'ABCDE trauma — Glasgow no D; esmagamento lembra BT16',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'ABCDE — Disability: método para avaliação neurológica rápida:',
          'Eliminar PA sistêmica.',
          'Eliminar função respiratória (é B).',
          'Eliminar exame físico completo.',
          'Eliminar fluidos IV como método de D.',
          'Escala de Coma de Glasgow — marcar B.',
        ],
        footer_rule: 'GCS no D — não no E hospitalar apenas',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ABCDE — D',
        rows: [
          { label: 'D', value: 'Disability — neurológico rápido', badge: 'hot' },
          { label: 'Ferramenta', value: 'Glasgow (E+V+M)', badge: 'ok' },
          { label: '≠ C', value: 'Circulação/hemorragia', badge: 'warn' },
        ],
        footer_rule: 'Rebaixamento → proteger via aérea',
      },
      null as unknown,
    ],
  },
  'facet-enfermagem-urgencias-e-emergencias-1777103976379-3': {
    family: 'protocolo',
    guideline: 'ABCDE — C = controle hemorragia externa + reposição volêmica',
    roi_error: 'abcde_c_hemorragia',
    cluster: 'ABCDE — Circulation hemorragia',
    danger_footer: 'Gabarito B — controle hemorragia + reposição',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'ABCDE trauma — Circulation',
        meta: slideMeta,
        items: [
          { label: 'Trauma ABCDE', detail: 'Circulation no trauma — hemorragia externa e perfusão.', icon: 'HeartPulse' },
          { label: 'Hemorragia externa', detail: 'Compressão · torniquete se indicado.', icon: 'Droplet' },
          { label: 'Reposição', detail: 'Volêmica conforme protocolo avançado.', icon: 'Syringe' },
          { label: 'Pegadinha — analgesia', detail: 'Analgesia não é ação fundamental de C.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'ABCDE trauma — C = hemorragia; queimadura é módulo à parte',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trauma — etapa C: ação fundamental:',
          'Eliminar avaliação neurológica detalhada (D).',
          'Eliminar analgesia imediata como núcleo de C.',
          'Eliminar cânula orofaríngea (A/B).',
          'Eliminar talas em todas fraturas como prioridade de C.',
          'Controle hemorragias externas + reposição volêmica — marcar B.',
        ],
        footer_rule: 'C = sangue + perfusão',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ABCDE trauma — C',
        rows: [
          { label: 'C', value: 'Circulation — hemorragia e perfusão', badge: 'hot' },
          { label: 'Externa', value: 'Compressão direta · torniquete', badge: 'ok' },
          { label: 'Volêmica', value: 'Fluidos conforme protocolo', badge: 'warn' },
        ],
        footer_rule: 'Hemorragia oculta — imagem no hospital',
      },
      null as unknown,
    ],
  },
  'fgv-enfermagem-processo-de-enfermagem-1780002110600-4': {
    family: 'protocolo',
    guideline: 'Amputação traumática — após BT primária, controlar hemorragia no segmento afetado',
    roi_error: 'amputacao_controle_hemorragia',
    cluster: 'Amputação — controle hemorrágico pós-BT',
    danger_footer: 'Gabarito E — controlar hemorragia no segmento',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Amputação traumática',
        meta: slideMeta,
        items: [
          { label: 'Amputação traumática', detail: 'Trauma XABCDE — risco de hemorragia grave no coto.', icon: 'AlertTriangle' },
          { label: 'BT primária', detail: 'Avaliação primária concluída — próximo passo hemostático.', icon: 'ListOrdered' },
          { label: 'Hemorragia', detail: 'Controle no segmento amputado — prioridade.', icon: 'Droplet' },
          { label: 'Pegadinha — O₂ rotina', detail: 'Oxigênio se hipoxemia — não antes de estancar hemorragia no trauma.', icon: 'Wind' },
        ],
        footer_rule: 'XABCDE trauma — amputação, esmagamento e hemostasia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Amputação — após avaliação primária BT, primeira medida:',
          'Eliminar oximetria isolada.',
          'Eliminar curativo seco sem compressão hemostática.',
          'Eliminar O₂ suplementar como prioridade sobre sangramento.',
          'Eliminar mobilização completa antes de hemostasia.',
          'Controlar hemorragia no segmento afetado — marcar E.',
        ],
        footer_rule: 'Hemostasia > transporte elegante',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'AMPUTAÇÃO — APH',
        rows: [
          { label: '1º pós-BT', value: 'Controle hemorrágico no coto', badge: 'hot' },
          { label: 'Curativo', value: 'Pressão + empacotamento estéril', badge: 'ok' },
          { label: 'Imobilizar', value: 'Após hemostasia — coluna conforme trauma', badge: 'warn' },
        ],
        footer_rule: 'Preservar segmento para replantio quando possível',
      },
      null as unknown,
    ],
  },
};

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'ameosc-enfermagem-processo-de-enfermagem-1780011961798-7': {
    A: 'Avaliar só consciência é etapa D — não descreve a letra X.',
    B: 'Ventilação mecânica invasiva não define o procedimento da etapa X.',
    C: 'Hipotermia é etapa E — não o foco da letra X.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780003709908-2': {
    A: 'Elevar e frio sem compressão não estanca hemorragia ativa.',
    B: 'Lavar e aguardar não substitui compressão direta imediata.',
    C: 'Aguardar médico sem compressão agrava hipoperfusão por perda sanguínea.',
    D: 'Torniquete sobre a ferida é técnica incorreta — deve ser proximal.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780006444165-3': {
    A: 'Via aérea é crucial — mas hemorragia exsanguinante (X) precede na prioridade cobrada.',
    B: 'Acesso venoso não substitui hemostasia externa imediata.',
    C: 'Glasgow é D — não prioridade sobre sangramento grave visível.',
    D: 'Expor tórax é parte de E — não a prioridade técnica imediata isolada.',
  },
  'cotec-fadenor-enfermagem-urgencias-e-emergencias-1777104018306-8': {
    B: 'Colar cervical antes de garantir ventilação não descreve a sequência correta inicial.',
    C: 'Oxigênio após colar fixo não é a afirmativa correta do momento inicial.',
    D: 'Lesões de membros vêm após ABC — ordem incorreta para o instante descrito.',
    E: 'Glasgow na admissão hospitalar não descreve a ação APH imediata correta.',
  },
  'educa-pb-enfermagem-processo-de-enfermagem-1780007246385-8': {
    A: 'Colar cervical isolado não garante imobilização completa da coluna.',
    B: 'Prancha longa não é prioridade por conforto — é por restrição de movimento.',
    D: 'Tração em qualquer fratura de membro inferior sem critério clínico não corresponde à conduta indicada.',
  },
  'facet-enfermagem-urgencias-e-emergencias-1777103976379-2': {
    A: 'Pressão arterial integra avaliação circulatória — não o método de Disability.',
    C: 'Função respiratória pertence à etapa B.',
    D: 'Exame físico completo é secundário — D é triagem neurológica rápida.',
    E: 'Fluidos IV são conduta de circulação — não método de avaliação neurológica.',
  },
  'facet-enfermagem-urgencias-e-emergencias-1777103976379-3': {
    A: 'Avaliação neurológica detalhada é etapa D.',
    C: 'Analgesia não é a ação fundamental de Circulation.',
    D: 'Cânula orofaríngea pertence à via aérea (A/B).',
    E: 'Talas em fraturas não substituem controle de hemorragia em C.',
  },
  'fgv-enfermagem-processo-de-enfermagem-1780002110600-4': {
    A: 'Oximetria monitoriza — não é a primeira medida pós-BT na amputação sangrante.',
    B: 'Curativo seco sem hemostasia ativa é insuficiente.',
    C: 'Oxigênio suplementar segue indicação de saturação — pegadinha O₂ antes de hemostasia no trauma.',
    D: 'Mobilização e prancha importantes — mas após controle do sangramento.',
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const slides = finalizeSlides(slug, raw, pack, DANGER_OVERRIDES);
    const out = {
      meta: metaBase(raw, pack.family, pack.guideline, slug, pack.roi_error, pack.cluster, REVIEWER),
      question_data: raw.question_data,
      reverse_study_slides: slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:urgencias-g12] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g12] total=${ok}`);
}

main();
