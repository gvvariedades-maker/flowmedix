#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g01 (8 slugs · urgencias_rcp_sbv).
 *
 *   npx tsx scripts/init-urgencias-g01.ts
 *   npx tsx scripts/handcraft-urgencias-g01.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  dangerFromOptions,
  metaBase,
  rcpParamRows,
  slideMeta,
  type Pack,
  type Q,
} from './lib/urgenciasRcpGolden';

const LOTE = 'urgencias-g01';

const SPECS: Record<string, Pack> = {
  'fundatec-enfermagem-processo-de-enfermagem-1780006969552-5': {
    family: 'protocolo',
    guideline: 'MS/SBV — deterioração precoce UTI: taquipneia + rebaixamento de consciência',
    roi_error: 'rcp_sinais_precoces_deterioracao',
    cluster: 'RCP adulto — sinais pré-PCR em paciente crítico',
    danger_footer: 'Taquipneia + alteração de consciência antecedem PCR — não bradicardia isolada',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PCR em UTI — alerta precoce',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário',
            detail: 'Adulto em unidade crítica — PCR raramente súbita; há janela de deterioração.',
            icon: 'Building2',
          },
          {
            label: 'Trilho fisiológico',
            detail: 'Instabilidade progressiva horas antes — sinais respiratórios e neurológicos.',
            icon: 'Activity',
          },
          {
            label: 'Sinal precoce',
            detail: 'Taquipneia progressiva + alteração do nível de consciência.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — bradicardia',
            detail: 'Bradicardia extrema isolada não é o primeiro achado típico de deterioração.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Detectar cedo → acionar equipe → prevenir PCR',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Paciente crítico — qual sinal PRECOCE de deterioração antes da PCR?',
          'Eliminar hipertensão sustentada isolada — não padrão de deterioração respiratória iminente.',
          'Eliminar diurese abrupta e dor lombar isolada — não trilho respiratório/neurológico.',
          'Eliminar bradicardia extrema como primeiro achado típico.',
          'Resta taquipneia progressiva com rebaixamento de consciência.',
          'Marcar E.',
        ],
        footer_rule: 'Respiração + consciência = alarme precoce',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DETERIORAÇÃO PRÉ-PCR',
        rows: [
          { label: 'Padrão', value: 'Instabilidade progressiva horas antes da PCR', badge: 'hot' },
          { label: 'Sinal precoce', value: 'Taquipneia + alteração de consciência', badge: 'ok' },
          { label: 'Não é primeiro', value: 'Bradicardia extrema isolada · PA alta isolada', badge: 'warn' },
          { label: 'Ação', value: 'Escalar equipe · monitorar · preparar SBV/RCP se evoluir a PCR', badge: 'info' },
          { label: 'Se PCR instalar', value: 'Compressões 100–120/min · acionar DEA · 30:2', badge: 'warn' },
        ],
        footer_rule: 'UTI: PCR raramente súbita — vigie respiração e mentação',
      },
      null as unknown,
    ],
  },
};

Object.assign(SPECS, {
  'cpcon-enfermagem-urgencias-e-emergencias-rcp-premium-pilot': {
    family: 'vf',
    guideline: 'AHA/MS SBV — 30:2 · pulso ~2 min (não a cada ciclo)',
    roi_error: 'rcp_pulso_cada_ciclo',
    cluster: 'RCP adulto — V/F I–III pulso × 30:2',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'RCP plantão — mapa V/F',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'PCR adulto inconsciente — julgar I, II e III sobre SBV.', icon: 'Target' },
          {
            label: 'I — Segurança e checagem',
            detail: 'VERDADEIRA: segurança da cena + responsividade e respiração.',
            icon: 'Shield',
          },
          {
            label: 'II — 30:2',
            detail: 'VERDADEIRA: dois socorristas → compressões e ventilações sincronizadas 30:2.',
            icon: 'Wind',
          },
          {
            label: 'III — Pulso a cada ciclo',
            detail: 'FALSA: pulso não é checado a cada ciclo — reavaliar ~a cada 2 min.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Pegadinha-âncora',
            detail: 'Banca troca pulso a cada 30:2 por pausa prolongada nas compressões.',
            icon: 'Activity',
          },
        ],
        footer_rule: 'I e II verdadeiras · III é a armadilha',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Formato: julgar asserções I, II e III — combinação nas letras.',
          'I: segurança + responsividade/respiração → verdadeira.',
          'II: 30:2 com dois socorristas → verdadeira.',
          'III: pulso a cada ciclo antes de ventilar → falsa (intervalo ~2 min).',
          'Eliminar combinações que incluem III ou excluem I/II.',
          'Marcar B — I e II, apenas.',
          'Fixação: minimizar pausas nas compressões.',
        ],
        footer_rule: 'III erra o intervalo de pulso',
      },
      {
        type: 'golden_rule',
        slide_title: 'Parâmetros RCP adulto',
        meta: slideMeta,
        content: 'DECORE — SBV ADULTO',
        rows: rcpParamRows(),
        footer_rule: 'Pulso ~2 min · não a cada ciclo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PULSO × CICLO',
        items: [
          {
            label: 'Letra A — só I',
            detail: 'Omite II (30:2) que também é verdadeira.',
            correct: 'II é verdadeira: dois socorristas usam 30:2 sincronizado.',
          },
          {
            label: 'Letra C — II e III',
            detail: 'Aceita pulso a cada ciclo — erro clássico de prova.',
            correct: 'III é falsa: pulso reavaliado ~a cada 2 min, não a cada 30:2.',
          },
          {
            label: 'Letra D — todas',
            detail: 'Inclui III falsa sobre pulso.',
            correct: 'III invalida a combinação — pulso não é a cada ciclo.',
          },
          {
            label: 'Letra E — só III',
            detail: 'Isola a asserção errada como única verdadeira.',
            correct: 'III é falsa — compressões contínuas com checagem espaçada.',
          },
        ],
        footer_rule: 'Pulso frequente = menos perfusão cerebral',
      },
    ],
  },
  'fenix-instituto-enfermagem-processo-de-enfermagem-1780001846202-6': {
    family: 'protocolo',
    guideline: 'MS/SBV — PCR: compressões torácicas eficazes antes de O₂/IV/monitor',
    roi_error: 'rcp_o2_antes_compressao',
    cluster: 'RCP adulto — sequência inicial compressões',
    danger_footer: 'PCR súbita: compressões antes de O₂, via venosa ou monitor — gabarito B',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PCR — sequência inicial',
        meta: slideMeta,
        items: [
          {
            label: 'Comando',
            detail: 'Primeiros socorros em PCR — prioridade do atendimento básico inicial.',
            icon: 'Target',
          },
          {
            label: 'Elo central',
            detail: 'Compressões torácicas eficazes mantêm perfusão até DEA/SAMU.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha — O₂ primeiro',
            detail: 'Oxigênio suplementar não precede compressões na PCR súbita.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — acesso/PA',
            detail: 'Via venosa, monitor ou PA não atrasam início das compressões.',
            icon: 'Syringe',
          },
        ],
        footer_rule: 'Comprimir cedo e bem',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PCR — qual prioridade do atendimento básico inicial?',
          'Eliminar O₂ suplementar como 1ª ação isolada.',
          'Eliminar acesso venoso e monitorização antes de RCP.',
          'Eliminar aferir PA em detrimento de compressões.',
          'Resta compressões torácicas eficazes.',
          'Marcar B.',
        ],
        footer_rule: 'C-A-B no adulto',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SEQUÊNCIA PCR',
        rows: rcpParamRows([
          { label: 'Prioridade inicial', value: 'Compressões torácicas eficazes', badge: 'hot' },
        ]),
        footer_rule: 'Perfusão > procedimentos secundários',
      },
      null as unknown,
    ],
  },
  'fepese-enfermagem-processo-de-enfermagem-1780002217274-3': {
    family: 'protocolo',
    guideline: 'AHA cadeia de sobrevivência — 1º elo: reconhecimento e ativação',
    roi_error: 'rcp_elo_compressao_antes_reconhecimento',
    cluster: 'RCP adulto — cadeia de sobrevivência (1º elo)',
    danger_footer: '1º elo = reconhecimento + 192 — RCP e DEA vêm depois — gabarito D',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cadeia de sobrevivência — 1º elo',
        meta: slideMeta,
        items: [
          {
            label: 'Sistemas integrados',
            detail: 'PCR exige pessoas, protocolos, recursos e dados — AHA unificada.',
            icon: 'Link',
          },
          {
            label: '1º elo',
            detail: 'Reconhecimento da PCR + ativação do sistema de emergência (192/equipe).',
            icon: 'Phone',
          },
          {
            label: 'Elos seguintes',
            detail: 'RCP alta qualidade → DEA → suporte avançado → cuidados pós-PCR.',
            icon: 'HeartPulse',
          },
          {
            label: 'Pegadinha',
            detail: 'RCP/DEA não são o primeiro elo — vêm após reconhecer e acionar.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Ver → chamar → comprimir',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Pergunta: primeiro elo da cadeia de sobrevivência na PCR?',
          'Eliminar ventilação avançada e ressuscitação avançada como 1º elo.',
          'Eliminar RCP e desfibrilação antes do reconhecimento/ativação.',
          'Resta reconhecimento e ativação de emergência.',
          'Marcar D.',
        ],
        footer_rule: 'Sem reconhecer, nada mais começa',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CADEIA AHA — ORDEM',
        rows: [
          { label: '1º elo', value: 'Reconhecimento + ativação (192)', badge: 'hot' },
          { label: '2º', value: 'RCP de alta qualidade imediata', badge: 'ok' },
          { label: '3º', value: 'DEA / desfibrilação precoce', badge: 'ok' },
          { label: '4º', value: 'Suporte avançado', badge: 'info' },
          { label: '5º', value: 'Cuidados pós-PCR', badge: 'info' },
        ],
        footer_rule: 'Esta prova cobra o elo 1',
      },
      null as unknown,
    ],
  },
  'iaupe-enfermagem-urgencias-e-emergencias-1777104012755-1': {
    family: 'vf',
    guideline: 'AHA/MS RCP — minimizar pausas · 90° braços · 100–120/min · 5–6 cm',
    roi_error: 'rcp_interrupcoes_compressao',
    cluster: 'RCP adulto — V/F I–IV compressões × interrupções',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'RCP — mapa V/F I–IV',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'PCR isquêmica — julgar quatro afirmativas sobre RCP de alta qualidade.', icon: 'Target' },
          { label: 'I — Cadeia imediata', detail: 'VERDADEIRA: reconhecer PCR · acionar emergência · RCP · DEA.', icon: 'Phone' },
          { label: 'II — Interrupções', detail: 'FALSA: deve MINIMIZAR pausas — II inverte (maximizar interrupções).', icon: 'AlertTriangle' },
          { label: 'III — Ângulo 60°', detail: 'FALSA: braços estendidos ~90° sobre o tórax, não 60°.', icon: 'Gauge' },
          { label: 'IV — Frequência/profundidade', detail: 'VERDADEIRA: 100–120/min · 5–6 cm · retorno completo do tórax.', icon: 'Activity' },
        ],
        footer_rule: 'II e III são as armadilhas numéricas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Julgar I, II, III e IV sobre RCP na PCR.',
          'I: reconhecimento + 192 + RCP + DEA → verdadeira.',
          'II: maximizar interrupções → falsa (minimizar pausas).',
          'III: braços a 60° → falsa (≈90°).',
          'IV: 100–120/min e 5–6 cm → verdadeira.',
          'Combinação: I e IV apenas.',
          'Marcar B.',
        ],
        footer_rule: 'Minimizar pausa · braços 90°',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'COMPRESSÕES — QUALIDADE',
        rows: rcpParamRows([
          { label: 'Ângulo braços', value: 'Estendidos ~90° sobre o tórax', badge: 'warn' },
          { label: 'Pausas', value: 'Minimizar interrupções — fluxo contínuo', badge: 'hot' },
        ]),
        footer_rule: 'II inverte pausa · III erra ângulo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COMPRESSÃO',
        items: [
          {
            label: 'Letra A — todas',
            detail: 'Inclui II e III falsas.',
            correct: 'II erra pausas e III erra ângulo — não marcar todas.',
          },
          {
            label: 'Letra C — só IV',
            detail: 'Omite I verdadeira sobre cadeia de atendimento.',
            correct: 'I também é verdadeira — reconhecimento + RCP + DEA.',
          },
          {
            label: 'Letra D — I e III',
            detail: 'III é falsa no ângulo dos braços.',
            correct: 'Braços ≈90°, não 60° — só I e IV corretas.',
          },
          {
            label: 'Letra E — I, II e IV',
            detail: 'II maximiza interrupções — falsa.',
            correct: 'Minimizar pausas nas compressões — excluir II.',
          },
        ],
        footer_rule: 'B = I + IV — compressão de qualidade',
      },
    ],
  },
  'fauel-enfermagem-urgencias-e-emergencias-1777104018306-9': {
    family: 'protocolo',
    guideline: 'AHA 2020 — VAA: compressões 100–120/min · 10 vent/min · ritmo q2min',
    roi_error: 'rcp_vaa_frequencia_ventilacao',
    cluster: 'RCP adulto — pós-intubação (VAA)',
    danger_footer: 'VAA: 100–120/min + 10 vent/min + ritmo a cada 2 min — gabarito C',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PCR com via aérea avançada',
        meta: slideMeta,
        items: [
          {
            label: 'Cenário',
            detail: 'PCR em adulto 72a — após intubação orotraqueal, manter RCP contínua.',
            icon: 'User',
          },
          {
            label: 'Compressões',
            detail: '100–120/min contínuas — mínima interrupção para ritmo/DEA.',
            icon: 'Activity',
          },
          {
            label: 'Ventilação VAA',
            detail: '10 ventilações/min (1 a cada 6 s) — evitar hiperventilação.',
            icon: 'Wind',
          },
          {
            label: 'Ritmo',
            detail: 'Checar ritmo a cada 2 min — não confundir com pulso a cada ciclo 30:2.',
            icon: 'Zap',
          },
          {
            label: 'Pegadinha',
            detail: 'Banca troca 60–100/min, 6 vent/min ou 120–160/min.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'VAA: compressão contínua 100–120/min — não confundir com 30:2',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PCR com intubação — parâmetros corretos pós-VAA?',
          'Eliminar 60–100/min e 80–100/min — abaixo do alvo atual.',
          'Eliminar 6 vent/min (1/10 s) — hiperventilação relativa.',
          'Eliminar 120–160/min — frequência excessiva de compressões.',
          'Resta 100–120/min + 10 vent/min + ritmo a cada 2 min.',
          'Marcar C.',
        ],
        footer_rule: '100–120 + 10/min + q2min',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'RCP COM VAA',
        rows: [
          { label: 'Compressões', value: '100–120/min contínuas', badge: 'hot' },
          { label: 'Ventilação', value: '10/min (1 a cada 6 s)', badge: 'ok' },
          { label: 'Ritmo/DEA', value: 'Reavaliar a cada 2 min', badge: 'warn' },
          { label: 'Sem VAA', value: '30:2 com 2 socorristas', badge: 'info' },
        ],
        footer_rule: 'Pós-intubação: compressão contínua',
      },
      null as unknown,
    ],
  },
  'fgv-enfermagem-urgencias-e-emergencias-1777104063550-2': {
    family: 'vf',
    guideline: 'AHA cadeia intra × extra-hospitalar — ressuscitação avançada em ambos',
    roi_error: 'rcp_cadeia_intra_extra',
    cluster: 'RCP adulto — V/F cadeia intra/extra-hospitalar',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cadeias intra × extra-hospitalar',
        meta: slideMeta,
        items: [
          {
            label: 'I — Início da cadeia',
            detail: 'FALSA: intra começa prevenção; extra começa RCP — ambos reconhecem PCR cedo.',
            icon: 'Building2',
          },
          {
            label: 'II — Ressuscitação avançada',
            detail: 'FALSA: suporte avançado existe nas duas cadeias, não só extra-hospitalar.',
            icon: 'Ambulance',
          },
          {
            label: 'III — Pós-PCR',
            detail: 'VERDADEIRA: cuidados pós-PCR (incl. ventilação) são comuns às duas.',
            icon: 'Heart',
          },
          {
            label: 'Pegadinha',
            detail: 'FGV inverte qual cadeia tem suporte avançado.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'II e III verdadeiras nesta prova',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Julgar I, II e III sobre cadeias intra e extra-hospitalares.',
          'I: início das cadeias → falsa (troca elos).',
          'II: ressuscitação avançada só extra → falsa.',
          'III: cuidados pós-PCR comuns → verdadeira.',
          'Combinação correta: II e III apenas.',
          'Marcar D.',
        ],
        footer_rule: 'Avançado não é exclusivo do extra-hospitalar',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'CADEIAS AHA',
        rows: [
          { label: 'Extra-hospitalar', value: 'Reconhecimento · 192 · RCP · DEA · avançado · pós-PCR', badge: 'ok' },
          { label: 'Intra-hospitalar', value: 'Prevenção/monitor · equipe · RCP · DEA · avançado · pós-PCR', badge: 'ok' },
          { label: 'Comum', value: 'Cuidados pós-PCR e suporte avançado em ambas', badge: 'hot' },
        ],
        footer_rule: 'Não excluir suporte avançado do hospital',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CADEIA',
        items: [
          {
            label: 'Letra A — só I',
            detail: 'I é falsa sobre início das cadeias.',
            correct: 'I inverte prevenção × RCP precoce — eliminar.',
          },
          {
            label: 'Letra B — só II',
            detail: 'II isolada ignora III verdadeira.',
            correct: 'III também é verdadeira — pós-PCR comum.',
          },
          {
            label: 'Letra C — só III',
            detail: 'III sozinha omite II verdadeira.',
            correct: 'II é verdadeira: avançado existe no intra também.',
          },
          {
            label: 'Letra E — todas',
            detail: 'Inclui I falsa.',
            correct: 'I erra o primeiro elo — não marcar todas.',
          },
        ],
        footer_rule: 'D = II + III',
      },
    ],
  },
  'fgv-enfermagem-urgencias-e-emergencias-1777104063550-1': {
    family: 'protocolo',
    guideline: 'AHA PCR na gestante — priorizar VA/O₂ · desfibrilar se indicado · deslocar útero',
    roi_error: 'rcp_gestante_feto_bcf',
    cluster: 'RCP adulto — gestante com PCR',
    danger_footer: 'Gestante em PCR: priorizar VA/O₂ materno — desfibrilar se indicado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PCR na gestante',
        meta: slideMeta,
        items: [
          {
            label: 'Prioridade materna',
            detail: 'RCP materna eficaz é melhor chance para mãe e feto — foco na gestante.',
            icon: 'HeartPulse',
          },
          {
            label: 'Vias aéreas/O₂',
            detail: 'Oxigenação e manejo de VA são prioridade — gestante desloca diafragma.',
            icon: 'Wind',
          },
          {
            label: 'Desfibrilação',
            detail: 'Não contraindicada — mesmo energia/adulto; salva a mãe.',
            icon: 'Zap',
          },
          {
            label: 'Pegadinha — BCF',
            detail: 'Monitorizar BCF fetal não atrasa compressões na PCR materna.',
            icon: 'Baby',
          },
          {
            label: 'Pegadinha — lateralizar tudo',
            detail: 'Deslocar útero à esquerda ≠ lateralizar gestante inteira sem comprimir.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Salvar a mãe salva o feto',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'PCR em gestante — conduta correta segundo diretrizes?',
          'Eliminar priorizar BCF fetal em detrimento de RCP materna.',
          'Eliminar evitar desfibrilação por “proteger feto”.',
          'Eliminar ventilação 1/3 s ou lateralização total sem RCP.',
          'Resta priorizar oxigenação e manejo de vias aéreas.',
          'Marcar A.',
        ],
        footer_rule: 'VA/O₂ primeiro na gestante em PCR',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PCR GESTANTE',
        rows: [
          { label: 'Prioridade', value: 'VA + O₂ + RCP materna de qualidade', badge: 'hot' },
          { label: 'Útero', value: 'Deslocar à esquerda (alívio aortocaval)', badge: 'ok' },
          { label: 'DEA', value: 'Indicado — não contraindicado na gestante', badge: 'warn' },
          { label: 'BCF', value: 'Não atrasar compressões para monitor fetal', badge: 'warn' },
        ],
        footer_rule: 'Mãe estável → melhor prognóstico fetal',
      },
      null as unknown,
    ],
  },
});

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'fundatec-enfermagem-processo-de-enfermagem-1780006969552-5': {
    A: 'Bradicardia extrema isolada não é o padrão típico de alerta precoce nesta prova.',
    B: 'Hipertensão sustentada isolada não sinaliza deterioração respiratória iminente.',
    C: 'Diurese abrupta não compõe o trilho taquipneia + rebaixamento de consciência.',
    D: 'Dor lombar isolada sem outros sinais não antecede PCR no cenário crítico.',
  },
  'fenix-instituto-enfermagem-processo-de-enfermagem-1780001846202-6': {
    A: 'O₂ suplementar não é 1ª prioridade — iniciar compressões eficazes.',
    C: 'Acesso venoso não precede RCP básica na PCR súbita.',
    D: 'Monitorização contínua não substitui compressões imediatas.',
    E: 'Pressão arterial não é conduta inicial na PCR.',
  },
  'fepese-enfermagem-processo-de-enfermagem-1780002217274-3': {
    A: 'Ventilação avançada é elo posterior — não o primeiro.',
    B: 'Desfibrilação vem após reconhecimento e RCP precoce.',
    C: 'RCP é elo 2 — após reconhecer e acionar 192.',
    E: 'Ressuscitação avançada não é o 1º elo.',
  },
  'fauel-enfermagem-urgencias-e-emergencias-1777104018306-9': {
    A: '60–100/min e 6 vent/min — parâmetros incorretos pós-VAA.',
    B: '80–100/min abaixo do alvo 100–120/min atual.',
    D: '10 vent/min exige 100–120 compressões — não 6 vent com 100–120 isolado errado combo.',
    E: '120–160/min excede frequência recomendada de compressões.',
  },
  'fgv-enfermagem-urgencias-e-emergencias-1777104063550-1': {
    B: 'BCF fetal não é prioridade sobre RCP materna na PCR.',
    C: 'Deslocar útero ≠ lateralizar gestante sem manter compressões.',
    D: '1 ventilação/3 s não é padrão pós-VAA neste contexto.',
    E: 'Desfibrilação não é evitada na gestante em PCR.',
  },
};

function finalizeSlides(slug: string, q: Q, pack: Pack): unknown[] {
  return pack.slides.map((slide, idx) => {
    if (slide !== null) return slide;
    const overrides = DANGER_OVERRIDES[slug];
    if (!overrides) throw new Error(`danger_zone missing for ${slug}`);
    return dangerFromOptions(
      q,
      `PEGADINHAS — ${pack.roi_error.replace(/_/g, ' ')}`,
      overrides,
      pack.danger_footer ??
        `Gabarito ${q.question_data.options.find((o) => o.is_correct)?.id} — ${pack.cluster}`,
    );
  });
}

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8')) as Q;
    const slides = finalizeSlides(slug, raw, pack);
    const out = {
      meta: metaBase(raw, pack.family, pack.guideline, slug, pack.roi_error, pack.cluster, 'handcraft-urgencias-g01'),
      question_data: raw.question_data,
      reverse_study_slides: slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:urgencias-g01] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g01] total=${ok}`);
}

main();
