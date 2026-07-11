#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g07 (8 slugs · urgencias_rcp_sbv).
 *
 *   npx tsx scripts/init-urgencias-g07.ts
 *   npx tsx scripts/handcraft-urgencias-g07.ts
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

const LOTE = 'urgencias-g07';
const REVIEWER = 'handcraft-urgencias-g07';

type Family = Pack['family'] | 'certo_errado';
type PackExt = Omit<Pack, 'family'> & { family: Family };

const SPECS: Record<string, PackExt> = {
  'ms-sarmento-enfermagem-vias-de-administracao-1778968646731-7': {
    family: 'protocolo',
    guideline: 'Suporte avançado adulto — acesso IV preferencial; intraósseo se IV indisponível',
    roi_error: 'suporte_avancado_acesso_iv_io',
    cluster: 'Suporte avançado — via de acesso na ressuscitação',
    danger_footer: 'IV primeiro — IO se indisponível — gabarito C',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Suporte avançado — acesso',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'Algoritmo adulto — compressões e drogas conforme ritmo.',
            icon: 'HeartPulse',
          },
          {
            label: 'Acesso venoso',
            detail: 'Via IV periférica é a primeira escolha para medicamentos no suporte avançado.',
            icon: 'Syringe',
          },
          {
            label: 'Acesso intraósseo',
            detail: 'Alternativa aceitável quando não há acesso IV disponível.',
            icon: 'Bone',
          },
          {
            label: 'Pegadinha — ritmos e drogas',
            detail: 'Confundir fibrilação atrial com ritmo chocável ou indicar antiarrítmico antes do vasopressor.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'FV/TVSP são chocáveis — FA não',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Algoritmo de parada cardiorrespiratória adulto — alternativa correta?',
          'Eliminar vasopressor isolado em ritmos não chocáveis sem contexto (A).',
          'Eliminar amiodarona como primeira droga em FA (B).',
          'Eliminar dupla desfibrilação em fibrilação atrial (D).',
          'Acesso IV preferencial — intraósseo se IV indisponível.',
          'Marcar C.',
        ],
        footer_rule: 'Medicamento exige via de acesso',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ACESSO — PCR ADULTO',
        rows: [
          { label: '1ª via', value: 'Acesso venoso periférico', badge: 'hot' },
          { label: 'Alternativa', value: 'Intraósseo se IV indisponível', badge: 'ok' },
          { label: 'Chocáveis', value: 'FV e TV sem pulso — desfibrilar', badge: 'warn' },
          { label: 'Não chocável', value: 'AESP — vasopressor + causas reversíveis', badge: 'info' },
        ],
        footer_rule: 'Compressões contínuas durante acesso',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — acesso iv io suporte avancado',
        items: [
          {
            label: 'Letra A — vasopressor em FA',
            detail: 'Fibrilação atrial não é ritmo de parada tratado só com vasopressor isolado.',
            correct: 'Acesso IV preferencial — intraósseo se indisponível no suporte avançado.',
          },
          {
            label: 'Letra B — amiodarona em FA',
            detail: 'Confunde fibrilação atrial com taquicardia ventricular sem pulso.',
            correct: 'Antiarrítmico após vasopressor em ritmos chocáveis refratários.',
          },
          {
            label: 'Letra D — dupla desfibrilação em FA',
            detail: 'Fibrilação atrial não indica dupla desfibrilação sequencial na PCR.',
            correct: 'Via IV de primeira escolha na ressuscitação cardiopulmonar.',
          },
        ],
        footer_rule: 'Gabarito C — IV · IO alternativo',
      },
    ],
  },
  'ivin-enfermagem-urgencias-e-emergencias-1777104056718-3': {
    family: 'protocolo',
    guideline: 'PCR — vasopressor de primeira linha; antiarrítmicos amiodarona e lidocaína em ritmos chocáveis',
    roi_error: 'pcr_vasopressor_antiarritmicos',
    cluster: 'Farmacologia da PCR — vasopressor e antiarrítmicos',
    danger_footer: 'Vasopressor 1ª linha · amiodarona e lidocaína — gabarito E',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Drogas na PCR',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'Manejo farmacológico com vasopressores e antiarrítmicos no suporte avançado.',
            icon: 'HeartPulse',
          },
          {
            label: 'Vasopressor',
            detail: 'Primeiro fármaco em qualquer ritmo de parada — aumenta perfusão coronariana.',
            icon: 'Syringe',
          },
          {
            label: 'Antiarrítmicos',
            detail: 'Amiodarona e lidocaína nos ritmos chocáveis refratários.',
            icon: 'Zap',
          },
          {
            label: 'Pegadinha — trocar drogas',
            detail: 'Substituir vasopressor por vasopressina isolada ou antiarrítmico antes do vasopressor.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Compressões antes e durante drogas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Lacunas — manejo farmacológico da parada cardiorrespiratória?',
          'Eliminar vasopressina como único vasopressor inicial (A).',
          'Eliminar magnésio e atropina no lugar dos antiarrítmicos (B).',
          'Eliminar vasopressor alternativo como antiarrítmico (C e D).',
          'Vasopressor de primeira linha · amiodarona · lidocaína.',
          'Marcar E.',
        ],
        footer_rule: 'Vasopressor em todos os ritmos de parada',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PCR — FÁRMACOS',
        rows: [
          { label: 'Vasopressor', value: 'Primeiro em qualquer ritmo de parada', badge: 'hot' },
          { label: 'Antiarrítmicos', value: 'Amiodarona e lidocaína — FV/TVSP', badge: 'ok' },
          { label: 'RCP', value: 'Compressões 100–120/min durante todo o ciclo', badge: 'warn' },
        ],
        footer_rule: 'Droga não substitui compressão de qualidade',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — pcr vasopressor antiarritmicos',
        items: [
          {
            label: 'Letra A — vasopressina isolada',
            detail: 'Troca o vasopressor de primeira linha por outro agente.',
            correct: 'Vasopressor inicial em qualquer ritmo — depois antiarrítmicos.',
          },
          {
            label: 'Letra B — magnésio e atropina',
            detail: 'Antiarrítmicos incorretos para ritmos chocáveis refratários.',
            correct: 'Amiodarona e lidocaína nos ritmos chocáveis.',
          },
          {
            label: 'Letra C — vasopressor trocado',
            detail: 'Mistura vasopressor com papel de antiarrítmico na parada cardiorrespiratória.',
            correct: 'Vasopressor de primeira linha — amiodarona e lidocaína depois.',
          },
        ],
        footer_rule: 'Gabarito E — esquema clássico da prova',
      },
    ],
  },
  'ivin-enfermagem-urgencias-e-emergencias-1777104048047-8': {
    family: 'conceito',
    guideline: 'Suporte avançado — vasopressor de primeira linha na reanimação cardiorrespiratória',
    roi_error: 'suporte_avancado_vasopressor_primeira_linha',
    cluster: 'Medicamento no suporte avançado de vida',
    danger_footer: 'Vasopressor de primeira linha na PCR — gabarito C',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Suporte avançado — droga',
        meta: slideMeta,
        items: [
          {
            label: 'Reanimação cardiorrespiratória',
            detail: 'Suporte avançado inclui vasopressor após compressões de qualidade.',
            icon: 'HeartPulse',
          },
          {
            label: 'Vasopressor',
            detail: 'Primeiro medicamento em qualquer ritmo de parada cardiorrespiratória.',
            icon: 'Syringe',
          },
          {
            label: 'Outras drogas',
            detail: 'IECA, manitol e bicarbonato não são vasopressores de primeira linha na PCR.',
            icon: 'Pill',
          },
          {
            label: 'Pegadinha — anti-hipertensivo',
            detail: 'Confundir captopril ou enalapril com droga de ressuscitação.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Vasopressor após compressões efetivas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Medicamento no suporte avançado durante a reanimação cardiorrespiratória?',
          'Eliminar captopril — anti-hipertensivo (A).',
          'Eliminar enalapril — IECA (B).',
          'Eliminar manitol — osmótico (D).',
          'Eliminar bicarbonato de rotina (E).',
          'Vasopressor de primeira linha — marcar C.',
        ],
        footer_rule: 'Não usar IECA na parada',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: '1ª DROGA — PCR',
        rows: [
          { label: 'PCR', value: 'Vasopressor em todos os ritmos de parada', badge: 'hot' },
          { label: 'Não usar', value: 'IECA · manitol · bicarbonato de rotina', badge: 'warn' },
          { label: 'RCP', value: 'Compressões 100–120/min antes e com drogas', badge: 'ok' },
        ],
        footer_rule: 'Droga vasoativa — não anti-hipertensivo',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — suporte avancado vasopressor primeira linha',
        items: [
          {
            label: 'Letra A — captopril',
            detail: 'Inibidor da ECA não é droga de ressuscitação.',
            correct: 'Vasopressor de primeira linha na parada cardiorrespiratória.',
          },
          {
            label: 'Letra B — enalapril',
            detail: 'Anti-hipertensivo oral — fora do algoritmo de PCR.',
            correct: 'Medicamento vasoativo inicial no suporte avançado.',
          },
          {
            label: 'Letra D — manitol',
            detail: 'Osmótico para edema cerebral — não vasopressor de PCR.',
            correct: 'Vasopressor na reanimação cardiorrespiratória.',
          },
          {
            label: 'Letra E — bicarbonato',
            detail: 'Não é rotina na parada cardiorrespiratória.',
            correct: 'Vasopressor de primeira linha — gabarito C.',
          },
        ],
        footer_rule: 'Gabarito C — vasopressor na PCR',
      },
    ],
  },
  'selecon-enfermagem-urgencias-e-emergencias-1777104038968-3': {
    family: 'protocolo',
    guideline: 'Pós-ROSC — SatO2 alvo moderada; ventilação controlada sem hiperventilar',
    roi_error: 'pos_rosc_ventilacao_samu',
    cluster: 'Ventilação e oxigenação pós-retorno da circulação',
    danger_footer: 'Saturação alvo SAMU · não hiperventilar — gabarito B',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pós-ROSC',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'Retorno da circulação espontânea — manter RCP de suporte e oxigenação no SBV.',
            icon: 'HeartPulse',
          },
          {
            label: 'Suporte Básico de Vida',
            detail: 'Protocolo SAMU para ventilação e oxigenação após ressuscitação cardiopulmonar.',
            icon: 'Activity',
          },
          {
            label: 'Saturação alvo',
            detail: 'Manter saturação periférica no alvo do protocolo SAMU — evitar hipóxia e hiperóxia.',
            icon: 'Gauge',
          },
          {
            label: 'Ventilação',
            detail: 'Bolsa-válvula-máscara com frequência controlada — não hiperventilar.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — hiperventilar',
            detail: 'Insuflações rápidas demais ou SatO2 alvo excessivo prejudicam perfusão.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Hiperventilação reduz retorno venoso',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Protocolo SAMU — ventilação e oxigenação pós-RCP no adulto?',
          'Eliminar saturação abaixo do alvo com hiperinsuflação (A).',
          'Eliminar saturação acima do alvo com hiperventilação (C).',
          'Eliminar cabeceira elevada com frequência excessiva (D).',
          'Permeabilidade da via aérea · saturação alvo do protocolo · dez a doze insuflações por minuto sem hiperventilar.',
          'Marcar B.',
        ],
        footer_rule: 'Ventilar devagar após ROSC',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'PÓS-ROSC — SAMU',
        rows: [
          { label: 'Via aérea', value: 'Manter permeabilidade', badge: 'hot' },
          { label: 'SatO2', value: 'Alvo do protocolo SAMU pós-ROSC', badge: 'ok' },
          { label: 'Ventilação', value: 'Dez a doze insuflações/min — não hiperventilar', badge: 'warn' },
          { label: 'RCP', value: 'Compressões torácicas 100–120/min se nova parada', badge: 'warn' },
          { label: 'Pós-ROSC', value: 'Monitorar retorno da circulação espontânea', badge: 'info' },
        ],
        footer_rule: 'Oxigenar sem excesso',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — pos rosc ventilacao samu',
        items: [
          {
            label: 'Letra A — SatO2 baixa e hiperinsuflação',
            detail: 'Alvo de saturação abaixo do recomendado com ventilação excessiva.',
            correct: 'Saturação alvo do protocolo com ventilação controlada sem hiperventilar.',
          },
          {
            label: 'Letra C — saturação alta e hiperventilação',
            detail: 'Hiperóxia e hiperventilação após retorno da circulação.',
            correct: 'Manter saturação no alvo do SAMU e não hiperventilar com bolsa-válvula-máscara.',
          },
          {
            label: 'Letra D — cabeceira e frequência alta',
            detail: 'Posicionamento e frequência de insuflações inadequados.',
            correct: 'Via aérea pérvia · saturação alvo · insuflações lentas sem hiperventilar.',
          },
        ],
        footer_rule: 'Gabarito B — SAMU pós-RCP',
      },
    ],
  },
  'idib-enfermagem-urgencias-e-emergencias-1778934926888-4': {
    family: 'protocolo',
    guideline: 'Overdose de opioides — abrir via aérea, ventilação de resgate e naloxona (AHA 2020)',
    roi_error: 'opioide_depressao_respiratoria_naloxona',
    cluster: 'Depressão respiratória por opioides — antídoto',
    danger_footer: 'Via aérea + ventilação + naloxona — gabarito C',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Opioides — UPA',
        meta: slideMeta,
        items: [
          {
            label: 'Caso clínico',
            detail: 'Analgésico opioide · rebaixamento · bradipneia · hipotensão.',
            icon: 'User',
          },
          {
            label: 'Via aérea',
            detail: 'Abrir via aérea e ventilar — prioridade antes de drogas.',
            icon: 'Wind',
          },
          {
            label: 'Naloxona',
            detail: 'Antagonista opioide na suspeita de overdose com depressão respiratória.',
            icon: 'Syringe',
          },
          {
            label: 'Pegadinha — RCP imediata',
            detail: 'Iniciar compressões torácicas completas sem tratar depressão respiratória reversível.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Bradipneia + opioide → ventilar e naloxona',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Fibromialgia em opioides — rebaixamento e bradipneia (AHA 2020)?',
          'Eliminar só abrir via aérea e naloxona sem ventilar (A).',
          'Eliminar ventilar sem naloxona quando suspeita de opioide (B).',
          'Eliminar RCP de alta qualidade como primeira conduta (D).',
          'Eliminar RCP + DEA antes de ventilação e naloxona (E).',
          'Abrir via aérea · ventilações de resgate · naloxona — marcar C.',
        ],
        footer_rule: 'Depressão respiratória ≠ PCR estabelecida',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'OPIOIDES — AHA',
        rows: [
          { label: '1', value: 'Abrir via aérea', badge: 'hot' },
          { label: '2', value: 'Ventilações de resgate', badge: 'ok' },
          { label: '3', value: 'Naloxona na suspeita de overdose', badge: 'warn' },
          { label: 'RCP plena', value: 'Se parada cardiorrespiratória confirmada', badge: 'info' },
        ],
        footer_rule: 'Ventilar antes de comprimir se há pulso',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — opioide depressao respiratoria naloxona',
        items: [
          {
            label: 'Letra A — via aérea sem ventilar',
            detail: 'Abrir via aérea sem ventilação de resgate adequada.',
            correct: 'Ventilar e administrar naloxona na suspeita de opioide.',
          },
          {
            label: 'Letra B — ventilar sem naloxona',
            detail: 'Ventilação isolada sem antagonista quando há suspeita de overdose.',
            correct: 'Naloxona associada à ventilação de resgate.',
          },
          {
            label: 'Letra D — RCP imediata',
            detail: 'Compressões torácicas sem tratar causa respiratória reversível.',
            correct: 'Via aérea · ventilação · naloxona neste quadro.',
          },
        ],
        footer_rule: 'Gabarito C — AHA opioides',
      },
    ],
  },
  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780003868364-6': {
    family: 'protocolo',
    guideline: 'SAMU — hipoglicemia: avaliação primária, responsividade e oxigênio; glicose conforme protocolo',
    roi_error: 'samu_hipoglicemia_avaliacao_primaria',
    cluster: 'APH — hipoglicemia sintomática no SAMU',
    danger_footer: 'Avaliação primária + O2 — gabarito E',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'SAMU — hipoglicemia',
        meta: slideMeta,
        items: [
          {
            label: 'Suporte Básico de Vida',
            detail: 'Protocolo SAMU 192 — avaliação primária na hipoglicemia sintomática pré-hospitalar.',
            icon: 'HeartPulse',
          },
          {
            label: 'Parada cardiorrespiratória',
            detail: 'Se evoluir para PCR — compressões torácicas imediatas após avaliação primária.',
            icon: 'HeartOff',
          },
          {
            label: 'Caso clínico',
            detail: 'Homem de 54 anos confuso, sudoreico, tremores — glicemia capilar baixa no atendimento pré-hospitalar SAMU (protocolo Ministério da Saúde).',
            icon: 'User',
          },
          {
            label: 'Avaliação primária',
            detail: 'Responsividade e permeabilidade das vias aéreas no Suporte Básico de Vida pré-hospitalar.',
            icon: 'Activity',
          },
          {
            label: 'Oxigênio',
            detail: 'Máscara não reinalante com fluxo adequado quando indicado na hipoxemia.',
            icon: 'Wind',
          },
          {
            label: 'Pegadinha — transporte ou espera',
            detail: 'Transportar sem estabilizar ou aguardar suporte avançado sem SBV inicial.',
            icon: 'AlertTriangle',
          },
        ],
        footer_rule: 'Estabilizar na cena — SAMU 192',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Hipoglicemia sintomática no atendimento pré-hospitalar — conduta do técnico SAMU?',
          'Eliminar transporte imediato sem estabilização (A).',
          'Eliminar suspender atendimento aguardando enfermeiro (B).',
          'Eliminar reavaliar sem intervenção ou usar insulina (C).',
          'Eliminar glicose oral sem avaliação primária completa (D).',
          'Avaliação primária · responsividade · via aérea · oxigênio conforme protocolo MS — marcar E.',
        ],
        footer_rule: 'Glicemia baixa + alteração neurológica = urgência',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SAMU — HIPOGLICEMIA',
        rows: [
          { label: 'Avaliação', value: 'Primária — responsividade e via aérea', badge: 'hot' },
          { label: 'O2', value: 'Máscara não reinalante se hipoxemia no protocolo SAMU', badge: 'ok' },
          { label: 'Glicose', value: 'Conforme protocolo MS e prescrição verbal do médico regulador', badge: 'warn' },
          { label: 'Não', value: 'Transportar sem tratar · aguardar sem SBV', badge: 'info' },
        ],
        footer_rule: 'Comunicar central de regulação',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — samu hipoglicemia avaliacao primaria',
        items: [
          {
            label: 'Letra A — transporte imediato',
            detail: 'Deslocar sem estabilização inicial na cena.',
            correct: 'Avaliação primária com responsividade e via aérea antes do transporte.',
          },
          {
            label: 'Letra B — aguardar suporte avançado',
            detail: 'Suspender SBV aguardando profissional de nível superior.',
            correct: 'Técnico realiza avaliação primária e oxigenação conforme protocolo.',
          },
          {
            label: 'Letra D — glicose oral precipitada',
            detail: 'Administrar glicose oral sem avaliação primária sistemática.',
            correct: 'Responsividade · via aérea · oxigênio — depois glicose conforme protocolo.',
          },
        ],
        footer_rule: 'Gabarito E — SBV + O2',
      },
    ],
  },
  'idecan-enfermagem-urgencias-e-emergencias-1778712400677-8': {
    family: 'certo_errado',
    guideline: 'RCP — superfície firme e rígida; compressões antes de acessos secundários',
    roi_error: 'rcp_superficie_macia_certo_errado',
    cluster: 'Certo ou errado — posicionamento para compressões',
    danger_footer: 'Superfície firme — afirmativa errada — gabarito B',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Posicionamento RCP',
        meta: slideMeta,
        items: [
          {
            label: 'Ressuscitação cardiopulmonar',
            detail: 'Compressões torácicas exigem superfície firme e rígida.',
            icon: 'HeartPulse',
          },
          {
            label: 'Superfície macia',
            detail: 'Cama mole ou superfície macia absorve força — compressão ineficaz.',
            icon: 'Bed',
          },
          {
            label: 'Pegadinha — conforto antes de RCP',
            detail: 'Priorizar superfície macia ou acesso venoso antes das compressões.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Acesso venoso',
            detail: 'Não atrasa compressões torácicas de alta qualidade.',
            icon: 'Syringe',
          },
        ],
        footer_rule: 'Firme > confortável na PCR',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Afirmativa: superfície macia e acesso venoso antes das manobras de RCP?',
          'Superfície macia reduz profundidade efetiva das compressões.',
          'Acesso venoso não é pré-requisito para iniciar compressões.',
          'Afirmativa falsa — julgar ERRADO.',
          'Marcar B (Errado).',
        ],
        footer_rule: 'C-A-B — comprimir em superfície firme',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'RCP — POSIÇÃO',
        rows: [
          { label: 'Superfície', value: 'Firme e rígida — chão ou prancha', badge: 'hot' },
          { label: 'Compressões', value: '100–120/min · 5–6 cm · retorno total', badge: 'ok' },
          { label: 'Não', value: 'Superfície macia · esperar acesso venoso', badge: 'warn' },
        ],
        footer_rule: 'Qualidade da compressão primeiro',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — rcp superficie macia certo errado',
        items: [
          {
            label: 'Certo — afirmativa da banca',
            detail: 'Julgar como verdadeira a superfície macia para RCP.',
            correct: 'Errado — compressões exigem superfície firme; não priorizar conforto.',
          },
          {
            label: 'Pegadinha — superfície macia',
            detail: 'Priorizar cama mole ou macia em vez de superfície firme na parada cardiorrespiratória.',
            correct: 'Posicionar em superfície rígida — compressões torácicas de alta qualidade primeiro.',
          },
        ],
        footer_rule: 'Gabarito B — Errado',
      },
    ],
  },
  'quadrix-enfermagem-processo-de-enfermagem-1780008241722-3': {
    family: 'certo_errado',
    guideline: 'RCP adulto — 100–120 compressões/min; frequência menor que 100 é incorreta',
    roi_error: 'rcp_frequencia_lenta_certo_errado',
    cluster: 'Certo ou errado — frequência das compressões torácicas',
    danger_footer: 'Frequência <100/min é errado — gabarito B',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Frequência RCP',
        meta: slideMeta,
        items: [
          {
            label: 'Parada cardiorrespiratória',
            detail: 'Compressões torácicas de alta qualidade no adulto.',
            icon: 'HeartPulse',
          },
          {
            label: 'Frequência correta',
            detail: 'Cem a cento e vinte compressões por minuto.',
            icon: 'Gauge',
          },
          {
            label: 'Pegadinha — comprimir devagar',
            detail: 'Reduzir frequência abaixo de 100/min para evitar lesão — mito da prova.',
            icon: 'AlertTriangle',
          },
          {
            label: 'Profundidade',
            detail: 'Cinco a seis centímetros com retorno total do tórax.',
            icon: 'ArrowDown',
          },
        ],
        footer_rule: 'Lento demais = perfusão ruim',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Afirmativa: compressões abaixo de cem por minuto para reduzir lesão torácica?',
          'Diretrizes recomendam cento a cento e vinte compressões por minuto no adulto.',
          'Frequência baixa reduz perfusão coronariana e cerebral.',
          'Afirmativa falsa — julgar ERRADO.',
          'Marcar B (Errado).',
        ],
        footer_rule: 'Qualidade > medo de lesão',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'DECORE — FREQUÊNCIA',
        rows: rcpParamRows(),
        footer_rule: 'Não comprimir devagar na PCR',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — rcp frequencia lenta certo errado',
        items: [
          {
            label: 'Certo — afirmativa da banca',
            detail: 'Aceitar frequência de compressões abaixo do alvo para evitar lesão.',
            correct: 'Errado — alvo é compressões rápidas com alta qualidade na parada cardiorrespiratória.',
          },
          {
            label: 'Pegadinha — comprimir devagar',
            detail: 'Reduzir ritmo das compressões torácicas abaixo do recomendado na PCR adulto.',
            correct: 'Cem a cento e vinte compressões por minuto — não comprimir devagar.',
          },
        ],
        footer_rule: 'Gabarito B — Errado',
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
    const meta = metaBase(
      raw,
      pack.family,
      pack.guideline,
      slug,
      pack.roi_error,
      pack.cluster,
      REVIEWER,
    );
    const out = {
      meta,
      question_data: raw.question_data,
      reverse_study_slides: pack.slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:urgencias-g07] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g07] total=${ok}`);
}

main();
