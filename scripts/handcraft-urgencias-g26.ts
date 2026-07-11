#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g26 (8 slugs · urgencias_vf_protocolo · lote final 8/8).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  finalizeSlides,
  metaBase,
  slideMeta,
  vfRows,
  type Pack,
  type Q,
} from './lib/urgenciasVfProtocoloGolden';

const LOTE = 'urgencias-g26';
const REVIEWER = 'handcraft-urgencias-g26';

const VF_L3_FOOTER = 'V/F protocolo — julgue I→IV antes das letras A–D';

const SPECS: Record<string, Pack> = {
  'ameosc-enfermagem-processo-de-enfermagem-1780011961798-5': {
    family: 'vf',
    guideline: 'Trauma — colar cervical · alinhamento manual · capacete · prancha (MS/SBV)',
    roi_error: 'vf_imobilizacao_trauma_i_iv',
    cluster: 'V/F I–IV — imobilização trauma',
    danger_footer: 'Gabarito C — I e III',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Imobilização — mapa V/F',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Trauma com risco cervical — julgar I–IV sobre imobilização e montar a combinação correta.', icon: 'Target' },
          { label: 'Afirmativa I', detail: 'VERDADEIRA — colar cervical antes da prancha longa.', icon: 'Shield' },
          { label: 'Afirmativa II', detail: 'FALSA — capacete só sai se via aérea/RCP exigir; não é obrigatório em todos os casos.', icon: 'HardHat' },
          { label: 'Afirmativa III', detail: 'VERDADEIRA — alinhamento manual em linha neutra precede colar e prancha.', icon: 'Hand' },
          { label: 'Pegadinha — Afirmativa IV', detail: 'FALSA — prancha é para transporte/imobilização, não “conforto prolongado”.', icon: 'AlertTriangle' },
        ],
        footer_rule: VF_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato V/F: julgar I–IV separadamente, depois cruzar com as combinações A–D.',
          'I — colar cervical antes da prancha? → verdadeiro (com cabeça estabilizada).',
          'II — capacete sempre removido? → falso (manter se VA pérvia e estável).',
          'III — alinhamento manual antes de imobilização rígida? → verdadeiro.',
          'IV — prancha para conforto prolongado? → falso (transporte/imobilização).',
          'Conjunto verdadeiro: apenas I e III.',
          'Eliminar alternativas que incluem II ou IV como corretas.',
          'Marcar C.',
          'Fixação: monte o gabarito item a item antes de olhar as letras.',
        ],
        footer_rule: VF_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        slide_title: 'Imobilização — sequência',
        meta: slideMeta,
        content: 'TRAUMA CERVICAL — DECORE',
        rows: [
          { label: 'Passo 1', value: 'Estabilização manual em linha neutra', badge: 'hot' },
          { label: 'Passo 2', value: 'Colar cervical', badge: 'ok' },
          { label: 'Passo 3', value: 'Prancha longa — transporte', badge: 'ok' },
          { label: 'Capacete', value: 'Manter se VA pérvia; remover só se necessário', badge: 'warn' },
          { label: 'Prancha', value: 'Imobilização — não é conforto prolongado', badge: 'warn' },
        ],
        footer_rule: 'Manual → colar → prancha',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — IMOBILIZAÇÃO',
        items: [
          {
            label: 'Letra A — III e IV',
            detail: 'Inclui IV como verdadeira (prancha para conforto).',
            correct: 'IV é falsa — prancha não é para conforto prolongado; gabarito C (I e III).',
          },
          {
            label: 'Letra B — II e IV',
            detail: 'Valida retirada obrigatória do capacete e uso prolongado da prancha.',
            correct: 'II é falsa (capacete nem sempre sai) e IV é falsa.',
          },
          {
            label: 'Letra D — I e II',
            detail: 'Acerta I mas força retirada universal do capacete.',
            correct: 'II é falsa — capacete mantido quando via aérea está pérvia.',
          },
          {
            label: 'Pegadinha — capacete (II)',
            detail: 'Retirar capacete em todo trauma parece liberar via aérea.',
            correct: 'Manter capacete se VA pérvia; remover só se necessário para ventilação.',
          },
        ],
        footer_rule: 'Capacete e prancha são as pegadinhas II e IV',
      },
    ],
  },
  'cotec-fadenor-enfermagem-processo-de-enfermagem-1780010579953-1': {
    family: 'vf',
    guideline: 'Hipoperfusão — veia periférica provisória para vasoativas até acesso central (formato I PORQUE II)',
    roi_error: 'vf_vasoativa_periferica_porque',
    cluster: 'V/F I–II PORQUE — drogas vasoativas',
    danger_footer: 'Gabarito A — I e II, II justifica I',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Vasoativas — mapa V/F',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Choque hipovolêmico — perda de volume circulante e débito cardíaco — julgar I PORQUE II sobre drogas vasoativas.', icon: 'Target' },
          { label: 'Afirmativa I', detail: 'VERDADEIRA — veia periférica pode manter normotensão até acesso venoso central ser obtido.', icon: 'Syringe' },
          { label: 'Afirmativa II', detail: 'VERDADEIRA — hipotensão não pode ser tolerada mais que trinta a quarenta minutos.', icon: 'Activity' },
          { label: 'Pegadinha — acesso profundo imediato', detail: 'Esperar só via profunda antes de iniciar aminas simpaticomiméticas pode atrasar perfusão no choque hipovolêmico.', icon: 'Ban' },
        ],
        footer_rule: VF_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Choque — grave redução da perfusão de tecidos, isquemia e hipóxia — drogas vasoativas em infusão contínua:',
          'Contexto: choque hipovolêmico por perda de volume (hemorragia ou desidratação) além da compensação.',
          'I — veia periférica para garantir normotensão até acesso venoso central? → verdadeira (ponte temporária).',
          'II — hipotensão não tolerada por trinta a quarenta minutos? → verdadeira.',
          'II justifica I? → sim (urgência de restaurar perfusão com aminas simpaticomiméticas).',
          'Eliminar alternativas que negam I ou II ou rompem o PORQUE.',
          'Marcar A — I e II verdadeiras, e II justifica I.',
        ],
        footer_rule: VF_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'VASOATIVAS — DECORE',
        rows: vfRows([
          { roman: 'I', verdict: 'V', note: 'Periférica provisória até acesso venoso central' },
          { roman: 'II', verdict: 'V', note: 'Hipotensão — reversão rápida obrigatória' },
        ], [{ label: 'PORQUE', value: 'II justifica I — perfusão não espera via profunda', badge: 'hot' }]),
        footer_rule: VF_L3_FOOTER,
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — VASOATIVAS PORQUE',
        items: [
          {
            label: 'Pegadinha — acesso profundo imediato',
            detail: 'Esperar só via profunda antes de iniciar aminas simpaticomiméticas no choque hipovolêmico.',
            correct: 'I é verdadeira — veia periférica mantém normotensão até obter acesso venoso central.',
          },
          {
            label: 'Letra B — II não justifica I',
            detail: 'Aceita as duas assertivas mas nega o vínculo causal.',
            correct: 'II justifica I — hipotensão não tolerada exige iniciar droga sem aguardar só via profunda.',
          },
          {
            label: 'Letra C — I falsa',
            detail: 'Nega ponte periférica até acesso venoso central.',
            correct: 'I é verdadeira nesta prova — perfusão com aminas em infusão contínua.',
          },
          {
            label: 'Letra E — ambas falsas',
            detail: 'Nega I e II apesar do enunciado sobre choque hipovolêmico e hipotensão.',
            correct: 'I e II são verdadeiras — gabarito A com II justificando I.',
          },
        ],
        footer_rule: 'Gabarito A — I e II, II justifica I',
      },
    ],
  },
  'cpcon-uepb-enfermagem-semiologia-em-enfermagem-1779563505333-7': {
    family: 'vf',
    guideline: 'Dor torácica na APS — etiologias não cardíacas: GI, pulmonar, musculoesquelética, reumática, psicogênica',
    roi_error: 'vf_dor_toracica_etiologias_i_v',
    cluster: 'V/F I–V — dor torácica APS',
    danger_footer: 'Gabarito A — todas verdadeiras',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dor torácica — mapa V/F',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Dor torácica na atenção primária — nem todo caso é cardiovascular.', icon: 'Target' },
          { label: 'I — GI', detail: 'VERDADEIRA — refluxo, espasmo esofágico entram no diferencial.', icon: 'Stethoscope' },
          { label: 'II — Pulmonar', detail: 'VERDADEIRA — TEP, pneumotórax são causas possíveis.', icon: 'Wind' },
          { label: 'Pegadinha — só cardíaco', detail: 'Candidato marca subconjunto e exclui causas válidas (I, IV ou V).', icon: 'AlertTriangle' },
        ],
        footer_rule: VF_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Julgar I a V — causas não cardiovasculares de dor torácica:',
          'I gastrointestinais → verdadeira.',
          'II pulmonares → verdadeira.',
          'III musculoesqueléticas → verdadeira.',
          'IV reumáticas → verdadeira.',
          'V psicogênicas → verdadeira.',
          'Todas corretas — marcar A.',
          'Eliminar B/C/D/E que excluem etiologias válidas.',
        ],
        footer_rule: VF_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DOR TORÁCICA — NÃO SÓ CORAÇÃO',
        rows: vfRows([
          { roman: 'I', verdict: 'V', note: 'Gastrointestinais (DRGE, espasmo)' },
          { roman: 'II', verdict: 'V', note: 'Pulmonares (TEP, pneumotórax)' },
          { roman: 'III', verdict: 'V', note: 'Musculoesqueléticas' },
          { roman: 'IV', verdict: 'V', note: 'Reumáticas' },
          { roman: 'V', verdict: 'V', note: 'Psicogênicas (ansiedade)' },
        ]),
        footer_rule: VF_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'cpcon-uepb-enfermagem-urgencias-e-emergencias-1777103976379-1': {
    family: 'vf',
    guideline: 'Atendimento à vítima com crise — proteger cabeça, não objetos na boca, não imobilizar, PLS após (MS/SBV)',
    roi_error: 'vf_crise_protecao_i_iv',
    cluster: 'V/F I–IV — protocolo crise (formato combinatório)',
    danger_footer: 'Gabarito E — I, II e IV',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Crise — mapa V/F',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Convulsão — perda súbita da consciência com contrações musculares — julgar condutas I–IV.', icon: 'Target' },
          { label: 'Afirmativa I', detail: 'VERDADEIRA — proteger a cabeça da vítima com apoio macio.', icon: 'Shield' },
          { label: 'Afirmativa II', detail: 'VERDADEIRA — não colocar a mão dentro da boca (risco de mordida).', icon: 'Ban' },
          { label: 'Afirmativa III', detail: 'FALSA — não impedir movimentos segurando a vítima à força.', icon: 'XCircle' },
          { label: 'Pegadinha — imobilizar (III)', detail: 'Conter braços e pernas parece proteger — agrava risco na crise convulsiva.', icon: 'AlertTriangle' },
        ],
        footer_rule: VF_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Convulsão — procedimentos em pessoa com perda súbita da consciência — julgar I–IV:',
          'I — proteger cabeça com apoio macio? → verdadeira.',
          'II — não colocar mão na boca da vítima? → verdadeira.',
          'III — impedir movimentos segurando a vítima? → falsa.',
          'IV — posicionar de lado para escoar saliva/vômito e evitar broncoaspiração? → verdadeira.',
          'Conjunto: I, II e IV — marcar E.',
          'Eliminar alternativas que incluem III (imobilização forçada).',
        ],
        footer_rule: VF_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CRISE — PROTOCOLO V/F',
        rows: vfRows([
          { roman: 'I', verdict: 'V', note: 'Proteger cabeça — apoio macio' },
          { roman: 'II', verdict: 'V', note: 'Não objetos/mão na boca' },
          { roman: 'III', verdict: 'F', note: 'Não imobilizar movimentos' },
          { roman: 'IV', verdict: 'V', note: 'PLS após — evitar broncoaspiração' },
        ]),
        footer_rule: VF_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'gama-enfermagem-urgencias-e-emergencias-1777104031822-5': {
    family: 'vf',
    guideline: 'Trauma pélvico — hemorragia exsanguinante primeiro (X) · compressão direta · não indireta',
    roi_error: 'vf_trauma_pelvico_hemorragia_i_iii',
    cluster: 'V/F I–III — trauma pélvico hemorragia',
    danger_footer: 'Gabarito B — I e III',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Trauma pélvico — mapa V/F',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Trauma pélvico de alta energia — julgar I–III sobre hemorragia e XABCDE.', icon: 'Target' },
          { label: 'Afirmativa I', detail: 'VERDADEIRA — conter hemorragia externa intensa, depois XABCDE.', icon: 'Droplet' },
          { label: 'Afirmativa II', detail: 'FALSA — hemorragia externa exige compressão direta, não indireta.', icon: 'XCircle' },
          { label: 'Afirmativa III', detail: 'VERDADEIRA — técnico auxilia contenção com compressão direta/torniquete/hemostático.', icon: 'Hand' },
          { label: 'Pegadinha — compressão indireta (II)', detail: '“Indireta” parece menos invasiva — é conduta errada na hemorragia externa.', icon: 'AlertTriangle' },
        ],
        footer_rule: VF_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Trauma pélvico — julgar afirmativas I a III:',
          'I — hemorragia externa primeiro, depois XABCDE? → verdadeira.',
          'II — compressão indireta no ferimento? → falsa (direta ou torniquete).',
          'III — técnico auxilia contenção exsanguinante? → verdadeira.',
          'Conjunto verdadeiro: I e III — marcar B.',
          'Eliminar A, C e D que incluem II.',
        ],
        footer_rule: VF_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PÉLVICO — HEMORRAGIA',
        rows: vfRows([
          { roman: 'I', verdict: 'V', note: 'Hemorragia externa → depois XABCDE' },
          { roman: 'II', verdict: 'F', note: 'Compressão direta — não indireta' },
          { roman: 'III', verdict: 'V', note: 'Técnico auxilia contenção exsanguinante' },
        ]),
        footer_rule: VF_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1780001297464-1': {
    family: 'vf',
    guideline: 'Primeiros socorros — ABC inicial · hemorragia · imobilização · limites do técnico',
    roi_error: 'vf_primeiros_socorros_i_iv',
    cluster: 'V/F I–IV — primeiros socorros técnico',
    danger_footer: 'Gabarito B — I, II e IV',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Primeiros socorros — mapa V/F',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Primeiros socorros — medidas iniciais até atendimento especializado — julgar I–IV nos limites do técnico.', icon: 'Target' },
          { label: 'Afirmativa I', detail: 'VERDADEIRA — avaliação inicial inclui consciência, respiração e circulação.', icon: 'Activity' },
          { label: 'Afirmativa II', detail: 'VERDADEIRA — controle de hemorragias é medida prioritária.', icon: 'Droplet' },
          { label: 'Afirmativa III', detail: 'FALSA — manobras avançadas de suporte de vida sem treinamento ou protocolo específico.', icon: 'XCircle' },
          { label: 'Pegadinha — SBV avançado (III)', detail: 'Técnico em Enfermagem não executa suporte avançado sem capacitação formal.', icon: 'AlertTriangle' },
        ],
        footer_rule: VF_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Primeiros socorros — julgar I a IV:',
          'I — avaliação inicial consciência/respiração/circulação? → verdadeira.',
          'II — controle de hemorragias prioritário? → verdadeira.',
          'III — SBV avançado sem treinamento? → falsa.',
          'IV — imobilização de fraturas previne lesão? → verdadeira.',
          'Conjunto: I, II e IV — marcar B.',
        ],
        footer_rule: VF_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PRIMEIROS SOCORROS — DECORE',
        rows: vfRows([
          { roman: 'I', verdict: 'V', note: 'ABC — consciência, respiração, circulação' },
          { roman: 'II', verdict: 'V', note: 'Hemorragia — prioridade' },
          { roman: 'III', verdict: 'F', note: 'SBV avançado só com treinamento' },
          { roman: 'IV', verdict: 'V', note: 'Imobilizar fraturas — prevenir agravamento' },
        ]),
        footer_rule: VF_L3_FOOTER,
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PRIMEIROS SOCORROS',
        items: [
          {
            label: 'Pegadinha — SBV avançado (III)',
            detail: 'Manobras avançadas de suporte de vida sem treinamento parecem agir rápido.',
            correct: 'III é falsa — técnico atua dentro dos limites legais e da capacitação.',
          },
          {
            label: 'Letra A — II e III',
            detail: 'Inclui III (SBV avançado sem protocolo).',
            correct: 'III é falsa — gabarito B (I, II e IV).',
          },
          {
            label: 'Letra C — I e III',
            detail: 'Omite II e IV válidas e aceita III.',
            correct: 'Hemorragia e imobilização são verdadeiras; III continua falsa.',
          },
          {
            label: 'Letra D — I, II e III',
            detail: 'Inclui manobra avançada sem treinamento.',
            correct: 'III é falsa — técnico não faz suporte avançado sem protocolo.',
          },
        ],
        footer_rule: 'Gabarito B — I, II e IV',
      },
    ],
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1780001297464-3': {
    family: 'vf',
    guideline: 'Urgência — monitorar SSVV · apoiar estabilização · comunicar alterações · técnico não prescreve',
    roi_error: 'vf_atribuicoes_tecnico_i_iii',
    cluster: 'V/F I–IV — atribuições técnico urgência',
    danger_footer: 'Gabarito C — I, II e III',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Urgência — mapa V/F',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Atuação do técnico em urgência — julgar I–IV dentro da formação COFEN.', icon: 'Target' },
          { label: 'Afirmativa I', detail: 'VERDADEIRA — monitorar sinais vitais e observar continuamente.', icon: 'Activity' },
          { label: 'Afirmativa II', detail: 'VERDADEIRA — apoiar procedimentos de estabilização.', icon: 'Hand' },
          { label: 'Afirmativa III', detail: 'VERDADEIRA — comunicar alterações clínicas imediatamente.', icon: 'Bell' },
          { label: 'Pegadinha — prescrever (IV)', detail: 'FALSA — técnico não prescreve nem define plano terapêutico.', icon: 'AlertTriangle' },
        ],
        footer_rule: VF_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Atribuições do técnico em urgência — julgar I a IV:',
          'I — monitorar SSVV e observar? → verdadeira.',
          'II — apoiar estabilização? → verdadeira.',
          'III — comunicar alterações? → verdadeira.',
          'IV — prescrever condutas/plano? → falsa.',
          'Conjunto: I, II e III — marcar C.',
        ],
        footer_rule: VF_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'TÉCNICO EM URGÊNCIA',
        rows: vfRows([
          { roman: 'I', verdict: 'V', note: 'Monitorar SSVV e observar' },
          { roman: 'II', verdict: 'V', note: 'Apoiar estabilização' },
          { roman: 'III', verdict: 'V', note: 'Comunicar alterações à equipe' },
          { roman: 'IV', verdict: 'F', note: 'Não prescrever — atribuição médica/enfermeiro' },
        ]),
        footer_rule: VF_L3_FOOTER,
      },
      null as unknown,
    ],
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104090044-6': {
    family: 'vf',
    guideline: 'SAMU/regulação — fibra óptica · comunicação · atendimento telefônico (I–V combinatório)',
    roi_error: 'vf_samu_comunicacao_i_v',
    cluster: 'V/F I–V — SAMU e comunicação',
    danger_footer: 'Gabarito D — III, IV e V',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SAMU — mapa V/F',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Chamada de emergência e comunicação SAMU — julgar I–V sobre regulação e telefonia.', icon: 'Target' },
          { label: 'Afirmativa I', detail: 'FALSA — técnico do telefone identifica e coleta dados; instruções de primeiros socorros cabem ao regulador médico.', icon: 'XCircle' },
          { label: 'Afirmativa II', detail: 'FALSA — em rádio a confirmação não é “recebido, aguardando instruções”.', icon: 'XCircle' },
          { label: 'Afirmativa III', detail: 'VERDADEIRA — fibra óptica transmite dados por pulsos de luz em longas distâncias.', icon: 'Cable' },
          { label: 'Pegadinha — I e II (SAMU)', detail: 'Parecem descrever SAMU 192 — papéis do técnico do atendimento ao telefone × médico regulador diferem.', icon: 'AlertTriangle' },
        ],
        footer_rule: VF_L3_FOOTER,
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'SAMU — analise afirmativas sobre chamada de emergência e comunicação por rádio:',
          'I — técnico do atendimento ao telefone também fornece instruções de primeiros socorros? → falsa.',
          'II — rádio: “recebido, aguardando instruções” confirma entendimento? → falsa.',
          'III — cabo de fibra óptica com pulsos de luz? → verdadeira.',
          'IV — comunicação oral e escrita essencial no equipamento telefônico? → verdadeira.',
          'V — escuta ativa, interesse e suporte no atendimento ao cliente? → verdadeira.',
          'Conjunto: III, IV e V — marcar D.',
        ],
        footer_rule: VF_L3_FOOTER,
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SAMU — COMUNICAÇÃO',
        rows: vfRows([
          { roman: 'I', verdict: 'F', note: 'Técnico coleta dados — regulador orienta conduta' },
          { roman: 'II', verdict: 'F', note: 'Rádio: confirmação padrão ≠ aguardar instruções' },
          { roman: 'III', verdict: 'V', note: 'Fibra óptica — transmissão por luz' },
          { roman: 'IV', verdict: 'V', note: 'Comunicação oral/escrita no telefone' },
          { roman: 'V', verdict: 'V', note: 'Escuta ativa e suporte ao cliente' },
        ]),
        footer_rule: VF_L3_FOOTER,
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SAMU E COMUNICAÇÃO',
        items: [
          {
            label: 'Pegadinha — I e II (SAMU)',
            detail: 'Atribuir ao técnico do telefone orientação de primeiros socorros e frase de rádio incorreta.',
            correct: 'I e II são falsas — regulador médico orienta; rádio usa confirmação padrão.',
          },
          {
            label: 'Letra A — I a V',
            detail: 'Inclui I e II falsas.',
            correct: 'Gabarito D — apenas III, IV e V.',
          },
          {
            label: 'Letra B — I e II',
            detail: 'Só as duas primeiras — omite III, IV e V verdadeiras.',
            correct: 'III (fibra óptica), IV (comunicação) e V (atendimento) são verdadeiras.',
          },
          {
            label: 'Letra C — II, IV e V',
            detail: 'Inclui II falsa na combinação.',
            correct: 'II é falsa — frase de rádio incorreta nesta prova.',
          },
        ],
        footer_rule: 'Gabarito D — III, IV e V',
      },
    ],
  },
};

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'cotec-fadenor-enfermagem-processo-de-enfermagem-1780010579953-1': {
    B: 'I e II são verdadeiras, mas II não justifica I — o vínculo causal da assertiva II com a I é o que fecha A.',
    C: 'I é falsa — veia periférica pode garantir normotensão até o acesso venoso central.',
    E: 'Ambas são verdadeiras nesta questão — rejeitar “I e II falsas”.',
  },
  'cpcon-uepb-enfermagem-semiologia-em-enfermagem-1779563505333-7': {
    B: 'Exclui I e IV — todas as cinco etiologias listadas são aceitas na dor torácica não cardíaca.',
    C: 'Omite I e V — gabarito exige I a V verdadeiras.',
    D: 'Corta IV e V — reumáticas e psicogênicas também entram no diferencial.',
    E: 'Só II e V — subconjunto incompleto; todas são corretas.',
  },
  'cpcon-uepb-enfermagem-urgencias-e-emergencias-1777103976379-1': {
    A: 'Inclui III (imobilizar) — conduta proibida no protocolo.',
    B: 'Inclui III — não conter movimentos à força.',
    C: 'Falta IV (PLS) — conjunto incompleto.',
    D: 'II e III — III é falsa (não imobilizar).',
  },
  'gama-enfermagem-urgencias-e-emergencias-1777104031822-5': {
    A: 'Inclui II (compressão indireta) — hemorragia externa exige compressão direta.',
    C: 'Só III — falta I (priorizar hemorragia antes do XABCDE).',
    D: 'Inclui II — indireta é pegadinha desta prova.',
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1780001297464-1': {
    A: 'Inclui III (manobras avançadas de suporte de vida sem treinamento) — fora do escopo do técnico.',
    C: 'Inclui III e omite II/IV — controle de hemorragias e imobilização são verdadeiras.',
    D: 'Inclui III — manobras avançadas exigem capacitação e protocolo específico.',
  },
  'igeduc-enfermagem-urgencias-e-emergencias-1780001297464-3': {
    A: 'Inclui IV (prescrever) — técnico não prescreve.',
    B: 'Inclui IV e omite I/III — monitorar e comunicar são atribuições.',
    D: 'Inclui IV — definir plano terapêutico não é do técnico.',
  },
  'instituto-consulplan-enfermagem-urgencias-e-emergencias-1777104090044-6': {
    A: 'Inclui I e II — técnico do telefone e frase de rádio são falsas nesta questão.',
    B: 'Só I e II — omite III, IV e V verdadeiras (fibra óptica, comunicação, atendimento).',
    C: 'II é falsa — “recebido, aguardando instruções” não confirma mensagem em rádio.',
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
    console.log(`[handcraft:urgencias-g26] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g26] total=${ok}`);
}

main();
