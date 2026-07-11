#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g44 (8 slugs · 15º lote urgencias_generico).
 * Inferência strict-v2: XABCDE D · C/E choque qualitativo · Manchester · naloxona · pupilas/TCE · fratura fêmur · calor/frio PS.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  finalizeSlides as finalizeChoque,
  metaBase as metaChoque,
  slideMeta as choqueSlideMeta,
  type Pack as ChoquePack,
  type Q as ChoqueQ,
} from './lib/urgenciasChoqueGolden';
import {
  finalizeSlides as finalizeGenerico,
  metaBase as metaGenerico,
  slideMeta as genericoSlideMeta,
  type Pack as GenericoPack,
  type Q as GenericoQ,
} from './lib/urgenciasGenericoGolden';
import {
  finalizeSlides as finalizeManchester,
  manchesterColorRows,
  metaBase as metaManchester,
  slideMeta as manchesterSlideMeta,
  type Pack as ManchesterPack,
  type Q as ManchesterQ,
} from './lib/urgenciasManchesterGolden';

const LOTE = 'urgencias-g44';
const REVIEWER = 'handcraft-urgencias-g44';

const GENERICO_FOOTER = 'Urgência = vida + avaliação + equipe';
const CHOQUE_FOOTER = 'Volume perdido = hipovolêmico';
const MANCHESTER_FOOTER = 'Vermelho imediato · verde/azul esperam';

const XABCDE_D_NEURO = [
  { label: 'Sequência', value: 'XABCDE — avaliação primária sistematizada', badge: 'hot' },
  { label: 'D — Disability', value: 'Estado neurológico · nível de consciência · Glasgow', badge: 'ok' },
  { label: 'Componentes', value: 'Resposta ocular · verbal · motora', badge: 'ok' },
  { label: '× Função renal', value: 'Parâmetro nefrológico — não letra D', badge: 'warn' },
  { label: '× Escala de dor', value: 'Instrumento distinto da avaliação neurológica', badge: 'info' },
];

const CHOQUE_HIPOVOLEMICO_CE = [
  { label: 'Mecanismo', value: 'Hemorragia ou perda hídrica excessiva → hipovolemia', badge: 'hot' },
  { label: 'Sinais', value: 'Taquicardia · hipotensão · extremidades frias', badge: 'ok' },
  { label: 'Conduta', value: 'Reposição volêmica prioritária no atendimento inicial', badge: 'hot' },
  { label: '× Choque distributivo', value: 'Vasodilatação/sepse — perfil distinto do hipovolêmico', badge: 'warn' },
  { label: '× Só monitorizar', value: 'Monitorar ≠ tratar — volume perdido exige reposição', badge: 'info' },
];

const MANCHESTER_TEMPOS = [
  { label: 'Princípio', value: 'Cor define prioridade e tempo máximo de espera — não é fila única', badge: 'hot' },
  { label: 'Vermelho', value: 'Emergência — atendimento imediato', badge: 'warn' },
  { label: 'Laranja', value: 'Muito urgente — tempo curtíssimo', badge: 'ok' },
  { label: 'Amarelo/Verde/Azul', value: 'Tempos progressivamente maiores conforme gravidade', badge: 'info' },
  { label: '× Mesmo tempo', value: 'Todos iguais independente da cor — afirmativa falsa', badge: 'warn' },
];

const NALOXONA_OPIOIDES = [
  { label: 'Indicação', value: 'Intoxicação por opioides — depressão respiratória', badge: 'hot' },
  { label: 'Mecanismo', value: 'Antagonista competitivo dos receptores opioides', badge: 'ok' },
  { label: '× Atropina', value: 'Anticolinérgico/bradicardia — não reverte opioide', badge: 'warn' },
  { label: '× Vasopressores', value: 'Noradrenalina/dopamina — suporte hemodinâmico, não antídoto', badge: 'warn' },
  { label: '× Anticoagulante', value: 'Heparina — antitrombótico sem ação sobre opioide', badge: 'info' },
];

const PUPILA_TERMINOLOGIA = [
  { label: 'Isocoria', value: 'Pupilas de tamanhos iguais', badge: 'ok' },
  { label: 'Anisocoria', value: 'Pupilas de tamanhos desiguais', badge: 'hot' },
  { label: 'Miose', value: 'Constrição pupilar excessiva', badge: 'info' },
  { label: 'Midríase', value: 'Dilatação pupilar excessiva', badge: 'info' },
  { label: 'TCE', value: 'Assimetria pupilar pode sugerir trauma craniano — avaliar neurológico', badge: 'warn' },
];

const FRATURA_COLO_FEMUR = [
  { label: 'Contexto', value: 'Idoso · queda da própria altura · trauma de alta energia', badge: 'hot' },
  { label: 'Sinal típico', value: 'Rotação externa do pé', badge: 'hot' },
  { label: 'Associados', value: 'Encurtamento · impotência funcional · dor intensa', badge: 'ok' },
  { label: '× Abdução interna', value: 'Termo anatômico invertido — não descreve posição clássica', badge: 'warn' },
  { label: '× Queda plantar', value: 'Posição do pé, não sinal semiológico de fratura de colo', badge: 'info' },
];

const CALOR_FRIo_PS = [
  { label: 'Uso', value: 'Bolsas térmicas/compressas nas camadas superficiais da pele', badge: 'ok' },
  { label: '× Calor agudo', value: 'Hemorragia · lesão aberta · luxação/torção < 24 h — contraindicado', badge: 'hot' },
  { label: 'Fase aguda', value: 'Frio reduz edema e dor nas primeiras 24–48 h', badge: 'ok' },
  { label: '× Ferida cirúrgica isolada', value: 'Lista incompleta — não cobre contraindicações agudas de calor', badge: 'warn' },
  { label: 'Pegadinha', value: 'Banca mistura indicações de calor × contraindicações agudas', badge: 'info' },
];

type GenericoEntry = { branch: 'generico'; pack: GenericoPack; danger: Record<string, string> };
type ChoqueEntry = { branch: 'choque'; pack: ChoquePack; danger: Record<string, string> };
type ManchesterEntry = { branch: 'manchester'; pack: ManchesterPack; danger: Record<string, string> };
type HandcraftEntry = GenericoEntry | ChoqueEntry | ManchesterEntry;

const SPECS: Record<string, HandcraftEntry> = {
  'quadrix-enfermagem-processo-de-enfermagem-1780008241722-2': {
    branch: 'generico',
    pack: {
      family: 'certo_errado',
      guideline:
        'XABCDE — letra D avalia disability (estado neurológico), incluindo nível de consciência',
      roi_error: 'xabcde_d_neurologico',
      cluster: 'Certo ou errado — XABCDE D neurológico',
      danger_footer: 'Gabarito A — Certo',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'XABCDE — letra D',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Avaliação primária',
              detail: 'Sequência XABCDE no paciente crítico — ordem sistematizada.',
              icon: 'Activity',
            },
            {
              label: 'Letra D',
              detail: 'Disability — estado neurológico e nível de consciência.',
              icon: 'Brain',
            },
            {
              label: 'Instrumento',
              detail: 'Escala de Glasgow — respostas ocular · verbal · motora.',
              icon: 'Eye',
            },
            {
              label: '× Outros domínios',
              detail: 'Função renal · escala de dor · termometria — não são D.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca troca D neurológico por parâmetro de outro sistema.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Avaliação primária XABCDE — julgar afirmativa sobre letra D.',
            'D = disability — estado neurológico incluindo nível de consciência.',
            'Glasgow quantifica respostas ocular · verbal · motora.',
            'Afirmativa descreve corretamente o domínio D.',
            'Marcar A (Certo).',
            'Fixação: D no XABCDE = neurológico · não confundir com dor ou renal.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'XABCDE — decore D',
          meta: genericoSlideMeta,
          content: 'D — DISABILITY NEUROLÓGICO',
          rows: XABCDE_D_NEURO,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — negar D neurológico',
          items: [
            {
              label: 'Errado — negar afirmativa',
              detail: 'Marcar Errado nega que D avalie estado neurológico.',
              correct:
                'D no XABCDE inclui nível de consciência — afirmativa verdadeira.',
            },
            {
              label: 'Pegadinha — confundir domínios',
              detail: 'Trocar neurológico por escala de dor ou função renal.',
              correct:
                'Disability = Glasgow e resposta neurológica — gabarito Certo.',
            },
          ],
          footer_rule: 'Gabarito A — Certo',
        },
      ],
    },
    danger: {
      B: 'Errado nega que a letra D do XABCDE avalie estado neurológico e nível de consciência.',
    },
  },
  'quadrix-enfermagem-processo-de-enfermagem-1780008241722-4': {
    branch: 'choque',
    pack: {
      family: 'certo_errado' as 'protocolo',
      guideline:
        'Choque hipovolêmico — hemorragia/perda hídrica · taquicardia · hipotensão · extremidades frias · reposição volêmica prioritária',
      roi_error: 'choque_hipovolemico_ce',
      cluster: 'Certo ou errado — choque hipovolêmico (strict-v2 choque)',
      danger_footer: 'Gabarito A — Certo',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Choque hipovolêmico — julgar',
          meta: choqueSlideMeta,
          items: [
            {
              label: 'Causa',
              detail: 'Hemorragia ou perdas excessivas de líquidos — hipovolemia.',
              icon: 'Droplets',
            },
            {
              label: 'Sinais',
              detail: 'Taquicardia · hipotensão · extremidades frias.',
              icon: 'HeartPulse',
            },
            {
              label: 'Conduta',
              detail: 'Reposição volêmica prioritária no atendimento inicial.',
              icon: 'Syringe',
            },
            {
              label: '× Distributivo',
              detail: 'Sepse/vasodilatação — mecanismo distinto do hipovolêmico.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca nega sinais clássicos ou reposição volêmica inicial.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: choqueSlideMeta,
          steps: [
            'Choque hipovolêmico — julgar afirmativa sobre sinais e conduta.',
            'Hemorragia/perda hídrica → hipovolemia — mecanismo correto.',
            'Taquicardia · hipotensão · extremidades frias — semiologia compatível.',
            'Reposição volêmica é medida prioritária inicial.',
            'Marcar A (Certo).',
            'Fixação: volume perdido = sinais de perfusão + repor líquidos.',
          ],
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Hipovolêmico — decore',
          meta: choqueSlideMeta,
          content: 'CHOQUE HIPOVOLÊMICO',
          rows: CHOQUE_HIPOVOLEMICO_CE,
          footer_rule: CHOQUE_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: choqueSlideMeta,
          content: 'PEGADINHAS — negar choque hipovolêmico',
          items: [
            {
              label: 'Errado — negar afirmativa',
              detail: 'Marcar Errado invalida sinais e reposição volêmica descritos.',
              correct:
                'Afirmativa alinhada ao choque hipovolêmico clássico — verdadeira.',
            },
            {
              label: 'Pegadinha — confundir tipos de choque',
              detail: 'Misturar distributivo/obstrutivo com hipovolêmico.',
              correct:
                'Perda de volume + taquicardia/hipotensão + repor — gabarito Certo.',
            },
          ],
          footer_rule: 'Gabarito A — Certo',
        },
      ],
    },
    danger: {
      B: 'Errado nega sinais clássicos do choque hipovolêmico ou a prioridade da reposição volêmica.',
    },
  },
  'quadrix-enfermagem-processo-de-enfermagem-1780008241722-6': {
    branch: 'manchester',
    pack: {
      family: 'certo_errado' as 'protocolo',
      guideline:
        'Protocolo Manchester — cada cor define prioridade e tempo de espera distinto; não há atendimento imediato igual para todos',
      roi_error: 'manchester_tempos_distintos',
      cluster: 'Certo ou errado — Manchester tempos por cor (strict-v2)',
      danger_footer: 'Gabarito B — Errado',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Manchester — priorização',
          meta: manchesterSlideMeta,
          items: [
            {
              label: 'Triagem',
              detail: 'Protocolo Manchester — classificação de risco por cor.',
              icon: 'Tags',
            },
            {
              label: 'Vermelho',
              detail: 'Emergência — atendimento imediato.',
              icon: 'AlertCircle',
            },
            {
              label: 'Demais cores',
              detail: 'Tempos de espera progressivamente maiores conforme gravidade.',
              icon: 'Clock',
            },
            {
              label: '× Fila única',
              detail: 'Todos atendidos imediatamente pelo mesmo tempo — contraria o protocolo.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca iguala tempos independente da cor de triagem.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: MANCHESTER_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: manchesterSlideMeta,
          steps: [
            'Manchester — julgar afirmativa sobre tempo de atendimento.',
            'Protocolo vincula cor à gravidade e ao tempo máximo de espera.',
            'Vermelho = imediato · demais cores = tempos distintos.',
            'Afirmativa diz que todos são atendidos imediatamente pelo mesmo tempo — falsa.',
            'Marcar B (Errado).',
            'Fixação: Manchester = prioridade por risco · não fila homogênea.',
          ],
          footer_rule: MANCHESTER_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Manchester — decore',
          meta: manchesterSlideMeta,
          content: 'MANCHESTER — CORES E PRIORIDADE',
          rows: manchesterColorRows([
            {
              label: '× Mesmo tempo',
              value: 'Todos iguais independente da cor — afirmativa falsa',
              badge: 'warn',
            },
          ]),
          footer_rule: MANCHESTER_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: manchesterSlideMeta,
          content: 'PEGADINHAS — aceitar fila única no Manchester',
          items: [
            {
              label: 'Certo — aceitar afirmativa',
              detail: 'Marcar Certo valida mesmo tempo para todas as cores de triagem.',
              correct:
                'Manchester diferencia tempos por gravidade — afirmativa é Errada.',
            },
            {
              label: 'Pegadinha — fila cronológica',
              detail: 'Confundir triagem de risco Manchester com ordem de chegada.',
              correct:
                'Cor define prioridade e espera — gabarito Errado.',
            },
          ],
          footer_rule: 'Gabarito B — Errado',
        },
      ],
    },
    danger: {
      A: 'Certo aceita que todos os pacientes sejam atendidos imediatamente pelo mesmo tempo — contraria o Manchester.',
    },
  },
  'quadrix-enfermagem-urgencias-e-emergencias-1777103981770-5': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline:
        'Intoxicação por opioides — naloxona é o antagonista específico para reverter depressão respiratória',
      roi_error: 'naloxona_opioide_antagonista',
      cluster: 'Intoxicação opioide — antagonista naloxona',
      danger_footer: 'Gabarito D — naloxona',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Opioide — antídoto',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Cenário',
              detail: 'PS — suspeita de intoxicação por opioides · carrinho de parada.',
              icon: 'AlertTriangle',
            },
            {
              label: 'Risco',
              detail: 'Depressão respiratória — priorizar via aérea.',
              icon: 'Wind',
            },
            {
              label: 'Antagonista',
              detail: 'Naloxona — reverte efeito opioide.',
              icon: 'Syringe',
            },
            {
              label: '× Atropina',
              detail: 'Anticolinérgico — não antídoto opioide.',
              icon: 'Ban',
            },
            {
              label: '× Vasopressores',
              detail: 'Noradrenalina/dopamina — suporte hemodinâmico distinto.',
              icon: 'XCircle',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Intoxicação por opioides — identificar antagonista da droga.',
            'A atropina — anticolinérgico — eliminar.',
            'B noradrenalina · C dopamina — vasopressores — eliminar.',
            'E heparina — anticoagulante — eliminar.',
            'D naloxona — antagonista específico de opioides.',
            'Marcar D.',
            'Fixação: opioide = naloxona · não confundir com atropina ou vasopressor.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Naloxona — decore',
          meta: genericoSlideMeta,
          content: 'OPIOIDE — ANTAGONISTA',
          rows: NALOXONA_OPIOIDES,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Atropina é anticolinérgico/bradicardia — não reverte intoxicação por opioides.',
      B: 'Noradrenalina é vasopressor — não antagonista opioide.',
      C: 'Dopamina é amina vasoativa — não antídoto específico de opioide.',
      E: 'Heparina é anticoagulante — sem ação sobre receptores opioides.',
    },
  },
  'reis-e-reis-enfermagem-semiologia-em-enfermagem-1779563521756-5': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline:
        'Pupilas de tamanhos desiguais = anisocoria — avaliar em paciente acidentado com rebaixamento ou incapacidade de obedecer comandos',
      roi_error: 'pupilas_anisocoria_acidentado',
      cluster: 'Semiologia pupilar — anisocoria pós-acidente',
      danger_footer: 'Gabarito D — anisocóricas',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Pupilas — nomenclatura',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Contexto',
              detail: 'Paciente acidentado — não acordado/orientado — avaliar pupilas.',
              icon: 'Eye',
            },
            {
              label: 'Normal',
              detail: 'Isocóricas — tamanhos iguais · redondas · fotorreagentes.',
              icon: 'CheckCircle',
            },
            {
              label: 'Assimetria',
              detail: 'Tamanhos desiguais — anisocoria.',
              icon: 'AlertTriangle',
            },
            {
              label: '× Miose/midríase',
              detail: 'Alteração de tamanho global — não assimetria entre olhos.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca troca isocoria × anisocoria × miose × midríase.',
              icon: 'Target',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Paciente acidentado — pupilas de tamanhos desiguais — qual termo?',
            'A isocóricas — tamanhos iguais — eliminar.',
            'B mióticas · C midriáticas — alteração global — eliminar.',
            'D anisocóricas — assimetria pupilar — compatível com enunciado.',
            'Marcar D.',
            'Fixação: desigual = anisocoria · igual = isocoria.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Pupilas — decore',
          meta: genericoSlideMeta,
          content: 'TERMINOLOGIA PUPILAR',
          rows: PUPILA_TERMINOLOGIA,
          footer_rule: GENERICO_FOOTER,
        },
        null as unknown,
      ],
    },
    danger: {
      A: 'Isocóricas = tamanhos iguais — enunciado descreve desigualdade.',
      B: 'Mióticas = constrição — não nomenclatura de assimetria.',
      C: 'Midriáticas = dilatação global — não anisocoria.',
    },
  },
  'reis-e-reis-enfermagem-semiologia-em-enfermagem-1779563521756-6': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline:
        'Pupilas de tamanhos desiguais = anisocoria — sinal que pode sugerir TCE; não confundir com miose/midríase/isocoria',
      roi_error: 'pupilas_anisocoria_tce',
      cluster: 'Semiologia pupilar — anisocoria e TCE (generico)',
      danger_footer: 'Gabarito A — anisocóricas',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Pupilas — TCE',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Normal',
              detail: 'Pupilas normais — tamanhos semelhantes (isocoria).',
              icon: 'Eye',
            },
            {
              label: 'Assimetria',
              detail: 'Tamanhos desiguais — anisocoria.',
              icon: 'AlertTriangle',
            },
            {
              label: 'TCE',
              detail: 'Assimetria pupilar pode sugerir trauma cranioencefálico.',
              icon: 'Brain',
            },
            {
              label: '× Midríase/miose',
              detail: 'Alteração de diâmetro global — termos distintos.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca cita TCE mas cobra nomenclatura pupilar.',
              icon: 'Target',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Pupilas desiguais sugerem TCE — qual denominação?',
            'B midríase · D miose — alteração global — eliminar.',
            'C isocóricas — iguais — oposto do enunciado — eliminar.',
            'A anisocóricas — tamanhos diferentes — resposta correta.',
            'Marcar A.',
            'Fixação: TCE pode cursar com anisocoria — termo = assimetria pupilar.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Pupilas — decore TCE',
          meta: genericoSlideMeta,
          content: 'ANISOCORIA × TCE',
          rows: PUPILA_TERMINOLOGIA,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — TCE e nomenclatura pupilar',
          items: [
            {
              label: 'Pegadinha — midríase/miose',
              detail: 'TCE citado mas pergunta é anisocoria — não dilatação/constrição global.',
              correct: 'Anisocóricas = tamanhos desiguais — gabarito A.',
            },
            {
              label: 'Letra C — isocóricas',
              detail: 'Isocóricas = tamanhos iguais — contradiz pupilas desiguais do enunciado.',
              correct: 'Assimetria pupilar no TCE = anisocoria — marcar A.',
            },
          ],
          footer_rule: 'Gabarito A — anisocóricas',
        },
      ],
    },
    danger: {},
  },
  'selecon-enfermagem-semiologia-em-enfermagem-1779563521756-4': {
    branch: 'generico',
    pack: {
      family: 'conceito',
      guideline:
        'Fratura de colo de fêmur — sinal típico: rotação externa do pé (idoso pós-queda ou trauma)',
      roi_error: 'fratura_colo_femur_rotacao_externa',
      cluster: 'Semiologia ortopédica — fratura colo de fêmur',
      danger_footer: 'Gabarito A — rotação externa',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Semiologia ortopédica — colo de fêmur',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Semiologia ortopédica',
              detail: 'Fratura do colo de fêmur — comum em idosos após pequenas quedas ou acidentes.',
              icon: 'Bone',
            },
            {
              label: 'Sinal típico',
              detail: 'Rotação externa do pé — achado clássico desta fratura.',
              icon: 'Footprints',
            },
            {
              label: 'Associados',
              detail: 'Encurtamento · dor · impossibilidade de marcha.',
              icon: 'AlertTriangle',
            },
            {
              label: '× Termos invertidos',
              detail: 'Abdução/adução interna do pé — combinações anatômicas incorretas.',
              icon: 'Ban',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca troca rotação externa por termo genérico ou posição invertida.',
              icon: 'Target',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Semiologia ortopédica — fratura do colo de fêmur em idoso pós-queda ou acidente.',
            'Identificar sinal típico desta fratura.',
            'B abdução interna · C adução interna — termos invertidos — eliminar.',
            'D queda plantar — posição, não sinal semiológico — eliminar.',
            'A rotação externa do pé — clássico na fratura de colo de fêmur.',
            'Marcar A.',
            'Fixação: colo de fêmur = rotação externa do pé.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Fêmur — decore sinal',
          meta: genericoSlideMeta,
          content: 'FRATURA COLO DE FÊMUR',
          rows: FRATURA_COLO_FEMUR,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — termos invertidos colo de fêmur',
          items: [
            {
              label: 'Pegadinha — termos invertidos',
              detail: 'Abdução/adução interna do pé — semiologia ortopédica incorreta para colo de fêmur.',
              correct: 'Sinal típico = rotação externa do pé — gabarito A.',
            },
            {
              label: 'Letra D — queda plantar',
              detail: 'Queda plantar — posição do pé, não sinal típico de fratura do colo de fêmur.',
              correct: 'Idoso pós-queda + rotação externa — marcar A.',
            },
          ],
          footer_rule: 'Gabarito A — rotação externa',
        },
      ],
    },
    danger: {},
  },
  'selecon-enfermagem-urgencias-e-emergencias-1777104038968-1': {
    branch: 'generico',
    pack: {
      family: 'protocolo',
      guideline:
        'Primeiros socorros — contraindicar calor em hemorragia, lesão aberta e luxação/torção nas primeiras 24 h; fase aguda prefere frio',
      roi_error: 'calor_contraindicacao_aguda',
      cluster: 'Primeiros socorros — contraindicações de calor',
      danger_footer: 'Gabarito B — hemorragia/lesão/luxação aguda',
      slides: [
        {
          type: 'concept_map',
          slide_title: 'Calor e frio — PS',
          meta: genericoSlideMeta,
          items: [
            {
              label: 'Aplicação',
              detail: 'Bolsas térmicas/compressas nas camadas superficiais.',
              icon: 'Thermometer',
            },
            {
              label: 'Fase aguda',
              detail: 'Primeiras 24 h — preferir frio para edema/dor.',
              icon: 'Snowflake',
            },
            {
              label: '× Calor agudo',
              detail: 'Hemorragia · lesão aberta · luxação/torção recente.',
              icon: 'Ban',
            },
            {
              label: 'Indicações calor',
              detail: 'Fase subaguda/crônica — relaxamento · conforto.',
              icon: 'Sun',
            },
            {
              label: 'Pegadinha',
              detail: 'Banca lista indicações como se fossem contraindicações.',
              icon: 'AlertTriangle',
            },
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: genericoSlideMeta,
          steps: [
            'Primeiros socorros — contraindicações na aplicação de calor.',
            'A feridas cirúrgicas/flebites/idade — lista incompleta — eliminar.',
            'C traumatismos venosos/flebites misturados — não padrão clássico — eliminar.',
            'D relaxamento/anticoagulantes — indicações, não contraindicações agudas — eliminar.',
            'B hemorragias · lesões abertas · luxação/torção < 24 h — contraindicar calor.',
            'Marcar B.',
            'Fixação: agudo traumático = frio · calor agrava sangramento/edema inicial.',
          ],
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'golden_rule',
          slide_title: 'Calor/frio — decore PS',
          meta: genericoSlideMeta,
          content: 'CONTRAINDICAÇÕES — CALOR',
          rows: CALOR_FRIo_PS,
          footer_rule: GENERICO_FOOTER,
        },
        {
          type: 'danger_zone',
          bullet_style: 'x_icon',
          meta: genericoSlideMeta,
          content: 'PEGADINHAS — contraindicações de calor',
          items: [
            {
              label: 'Pegadinha — mistura indicações',
              detail: 'Banca lista indicações de calor como se fossem contraindicações agudas.',
              correct:
                'Hemorragia · lesão aberta · luxação/torção < 24 h — contraindicar calor — gabarito B.',
            },
            {
              label: 'Letra A — feridas cirúrgicas',
              detail: 'Feridas cirúrgicas/flebites/idade — lista parcial e imprecisa.',
              correct:
                'Contraindicação aguda clássica = hemorragia/lesão/luxação recente — marcar B.',
            },
          ],
          footer_rule: 'Gabarito B — hemorragia/lesão/luxação aguda',
        },
      ],
    },
    danger: {},
  },
};

function readQuestaoJson(path: string): unknown {
  const raw = readFileSync(path, 'utf8').replace(/^\uFEFF/, '');
  return JSON.parse(raw);
}

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;

  for (const [slug, entry] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = readQuestaoJson(path);

    if (entry.branch === 'generico') {
      const q = raw as GenericoQ;
      const slides = finalizeGenerico(slug, q, entry.pack, { [slug]: entry.danger });
      const out = {
        meta: metaGenerico(
          q,
          entry.pack.family,
          entry.pack.guideline,
          slug,
          entry.pack.roi_error,
          entry.pack.cluster,
          REVIEWER,
        ),
        question_data: q.question_data,
        reverse_study_slides: slides,
        modulo_slug: q.modulo_slug ?? slug,
      };
      writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    } else if (entry.branch === 'choque') {
      const q = raw as ChoqueQ;
      const slides = finalizeChoque(slug, q, entry.pack, { [slug]: entry.danger });
      const out = {
        meta: metaChoque(
          q,
          entry.pack.family,
          entry.pack.guideline,
          slug,
          entry.pack.roi_error,
          entry.pack.cluster,
          REVIEWER,
        ),
        question_data: q.question_data,
        reverse_study_slides: slides,
        modulo_slug: q.modulo_slug ?? slug,
      };
      writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    } else {
      const q = raw as ManchesterQ;
      const slides = finalizeManchester(slug, q, entry.pack, { [slug]: entry.danger });
      const out = {
        meta: metaManchester(
          q,
          entry.pack.family,
          entry.pack.guideline,
          slug,
          entry.pack.roi_error,
          entry.pack.cluster,
          REVIEWER,
        ),
        question_data: q.question_data,
        reverse_study_slides: slides,
        modulo_slug: q.modulo_slug ?? slug,
      };
      writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    }

    ok++;
    console.log(`[handcraft:urgencias-g44] OK ${slug} (${entry.branch})`);
  }

  console.log(`[handcraft:urgencias-g44] total=${ok}`);
}

main();
