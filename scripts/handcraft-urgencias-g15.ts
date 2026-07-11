#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g15 (8 slugs · urgencias_avc_iam · 2º lote).
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { loteQuestionsDir } from '@/lib/catalogMigration/paths';
import {
  cincinnatiRows,
  finalizeSlides,
  iamSinaisRows,
  metaBase,
  slideMeta,
  type Pack,
  type Q,
} from './lib/urgenciasAvcGolden';

const LOTE = 'urgencias-g15';
const REVIEWER = 'handcraft-urgencias-g15';

const SPECS: Record<string, Pack> = {
  'idecan-enfermagem-urgencias-e-emergencias-1778712392541-5': {
    family: 'protocolo',
    guideline:
      'Admissão AVE — triagem com escala validada, comunicar déficits neurológicos à equipe e providenciar acesso venoso calibroso',
    roi_error: 'ave_admissao_triagem_acesso_venoso',
    cluster: 'AVE — ações imediatas do técnico na admissão',
    danger_footer: 'Gabarito C — triagem AVC + comunicação + acesso venoso',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Admissão — suspeita de AVE',
        meta: slideMeta,
        items: [
          { label: 'Enquadramento', detail: 'Suspeita de AVE na chegada — tempo é cérebro.', icon: 'Clock' },
          { label: 'Triagem', detail: 'Aplicar escala de AVC validada (Cincinnati/FAST).', icon: 'ClipboardList' },
          { label: 'Comunicação', detail: 'Informar déficits neurológicos à equipe multiprofissional.', icon: 'Users' },
          { label: 'Acesso venoso', detail: 'Providenciar acesso calibroso para condutas subsequentes.', icon: 'Syringe' },
          { label: 'Pegadinha — sedativos', detail: 'Sedativos por agitação não são prioridade imediata do técnico na triagem.', icon: 'Ban' },
        ],
        footer_rule: 'Reconhecer · comunicar · acessar — não atrasar por sedação',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: ações imediatas do técnico na admissão com suspeita de AVE.',
          'Eliminar monitorar glicemia em intervalo fixo com sedativos — não descreve triagem imediata.',
          'Eliminar cabeceira elevada com meta pressórica-alvo — conduta médica avançada, não ação imediata do técnico.',
          'Eliminar retardar oxigênio até gasometria — não é conduta inicial padrão do técnico.',
          'Eliminar soluções hipotônicas — prescrição médica, não ação imediata do técnico.',
          'Triagem com escala validada + informar déficits + acesso venoso calibroso — marcar C.',
          'Fixação: técnico reconhece, comunica e prepara acesso — não prescreve sedação ou hipotônicos.',
        ],
        footer_rule: 'Tempo is cérebro — triagem antes de condutas avançadas',
      },
      { type: 'golden_rule', meta: slideMeta, content: 'AVE — ADMISSÃO DO TÉCNICO', rows: cincinnatiRows(), footer_rule: 'Triagem · comunicação · acesso venoso' },
      null as unknown,
    ],
  },
  'idecan-enfermagem-urgencias-e-emergencias-1780067013432-6': {
    family: 'conceito',
    guideline:
      'Caso Marcos — palidez, suor frio, PA elevada, tabagismo e dislipidemia com dor/dormência sugerem síndrome isquêmica cardíaca (IAM), não asma/cólera/diabetes isolados',
    roi_error: 'iam_caso_marcos_fatores_risco',
    cluster: 'IAM — reconhecimento clínico (caso com fatores de risco)',
    danger_footer: 'Gabarito B — Infarto',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Caso Marcos — leitura clínica',
        meta: slideMeta,
        items: [
          { label: 'Fatores de risco', detail: 'Tabagismo prolongado + colesterol elevado — perfil cardiovascular.', icon: 'Cigarette' },
          { label: 'Autonômicos', detail: 'Palidez, suor frio e pressão alta — resposta simpática.', icon: 'Droplets' },
          { label: 'Pegadinha — dormência braço', detail: 'Dormência pode confundir com AVC — contexto cardíaco prevalece aqui.', icon: 'AlertTriangle' },
          { label: 'IAM', detail: 'Dor/dormência + autonômicos + fatores de risco = suspeita de infarto.', icon: 'Heart' },
          { label: 'Pegadinha — asma/cólera', detail: 'Sem broncoespasmo ou diarreia profusa — descartar.', icon: 'Ban' },
        ],
        footer_rule: 'Fatores de risco cardíacos + autonômicos = IAM até prova contrária',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Caso: dormência MS esquerdo, dor costas, palidez, suor frio, PA alta, tabagista, colesterol alto.',
          'Eliminar asma — sem dispneia sibilante ou história asmática.',
          'Eliminar cólera — sem diarreia aquosa profusa ou desidratação cholérica.',
          'Eliminar diabetes — hiperglicemia não explica o quadro agudo descrito.',
          'Infarto — marcar B.',
          'Fixação: dormência isolada lembra AVC — mas autonômicos + fatores de risco cardíacos apontam IAM.',
        ],
        footer_rule: 'Contexto cardíaco vence achado neurológico isolado',
      },
      { type: 'golden_rule', meta: slideMeta, content: 'IAM — SINAIS + FATORES DE RISCO', rows: iamSinaisRows(), footer_rule: 'Tabagismo + dislipidemia aumentam suspeita' },
      null as unknown,
    ],
  },
  'idib-enfermagem-acidente-vascular-cerebral-avc-1778934918280-1': {
    family: 'protocolo',
    guideline:
      'Linha de Cuidado AVC (MS 2012) — déficits neurológicos leves, cirurgia grande porte recente e punção lombar recente são critérios de exclusão para trombólise',
    roi_error: 'avc_linha_cuidado_criterios_exclusao',
    cluster: 'AVC — Linha de Cuidado MS (critérios de exclusão)',
    danger_footer: 'Gabarito E — critérios de exclusão para trombólise',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Linha de Cuidado — AVC',
        meta: slideMeta,
        items: [
          { label: 'Enquadramento', detail: 'Rede de Urgências — estratégias específicas para AVC agudo.', icon: 'Network' },
          { label: 'Exclusão — déficit leve', detail: 'Déficit neurológico leve sem repercussão funcional significativa.', icon: 'AlertTriangle' },
          { label: 'Exclusão — cirurgia', detail: 'Cirurgia de grande porte ou procedimento invasivo em período recente.', icon: 'Scissors' },
          { label: 'Exclusão — punção lombar', detail: 'Punção lombar em período recente.', icon: 'Syringe' },
          { label: 'Pegadinha — NIHSS pré-hospitalar', detail: 'NIHSS é hospitalar — triagem rápida usa Cincinnati/FAST.', icon: 'Ban' },
        ],
        footer_rule: 'Conhecer exclusões evita erro de trombólise',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: afirmativa correta sobre Linha de Cuidado AVC (Manual MS 2013).',
          'Eliminar A — tomografia sem contraste é padrão, mas ultrassonografia não diferencia isquêmico/hemorrágico.',
          'Eliminar B — NIHSS não é escala pré-hospitalar recomendada — Cincinnati/FAST sim.',
          'Eliminar C — febre não é sinal principal de AVC agudo.',
          'Eliminar D — fatores de risco citados estão incorretos (sexo feminino/crianças como principais).',
          'Critérios de exclusão — déficit leve, cirurgia recente, punção lombar — marcar E.',
          'Fixação: linha de cuidado diferencia triagem, exclusão e conduta hospitalar.',
        ],
        footer_rule: 'Exclusão de trombólise = segurança do paciente',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'AVC — LINHA DE CUIDADO MS',
        rows: [
          { label: 'Triagem APH', value: 'Cincinnati/FAST — face · braço · fala', badge: 'hot' },
          { label: 'Imagem', value: 'TC crânio sem contraste — diferenciar isquêmico/hemorrágico', badge: 'ok' },
          { label: 'Exclusão', value: 'Déficit leve · cirurgia recente · punção lombar recente', badge: 'warn' },
          { label: 'NIHSS', value: 'Hospitalar detalhada — não triagem de 3 itens', badge: 'info' },
        ],
        footer_rule: 'Manual MS 2013 — rede de urgências',
      },
      null as unknown,
    ],
  },
  'idib-enfermagem-urgencias-e-emergencias-1778934926888-8': {
    family: 'protocolo',
    guideline:
      'IAM — condutas iniciais do auxiliar: acesso venoso, analgésico, AAS e clopidogrel; mortes concentram-se nas primeiras horas',
    roi_error: 'iam_condutas_auxiliar_aas_clopidogrel',
    cluster: 'IAM — condutas iniciais do auxiliar/técnico',
    danger_footer: 'Gabarito D — acesso venoso + analgésico + AAS + clopidogrel',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'IAM — janela crítica',
        meta: slideMeta,
        items: [
          { label: 'Mortalidade precoce', detail: 'Maioria das mortes nas primeiras horas — agir rápido.', icon: 'Clock' },
          { label: 'Acesso venoso', detail: 'Puncionar via para medicações e fluidos.', icon: 'Syringe' },
          { label: 'Analgésico', detail: 'Aliviar dor isquêmica — conforto e redução de estresse.', icon: 'Pill' },
          { label: 'Antiplaquetários', detail: 'AAS + clopidogrel — terapia antitrombótica inicial.', icon: 'Heart' },
          { label: 'Pegadinha — sulfato magnésio', detail: 'Magnésio/atropina não são conduta padrão inicial de IAM.', icon: 'Ban' },
        ],
        footer_rule: 'Primeiras horas decidem — antiplaquetário precoce',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: condutas iniciais do auxiliar de enfermagem em IAM.',
          'Eliminar sulfato de magnésio + atropina — não protocolo inicial de IAM.',
          'Eliminar hidratação com Ringer + ECG porta-balão — parcialmente correto, mas não lista analgésico/antiplaquetário.',
          'Eliminar morfina + betabloqueador condicionado — morfina médica; betabloqueador não é conduta inicial universal.',
          'Acesso venoso + analgésico + AAS + clopidogrel — marcar D.',
          'Fixação: antiplaquetário duplo precoce salva miocárdio — dentro do escopo do auxiliar.',
        ],
        footer_rule: 'Tempo is miocárdio — AAS + clopidogrel cedo',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'IAM — CONDUTAS INICIAIS',
        rows: [
          { label: 'Acesso', value: 'Venoso calibroso — medicações e monitorização', badge: 'hot' },
          { label: 'Analgésico', value: 'Controle da dor isquêmica', badge: 'ok' },
          { label: 'AAS', value: 'Ácido acetilsalicílico — antiplaquetário', badge: 'hot' },
          { label: 'Clopidogrel', value: 'Segundo antiplaquetário — dupla antiagregação', badge: 'hot' },
          { label: 'Evitar', value: 'Magnésio/atropina de rotina — não protocolo IAM inicial', badge: 'warn' },
        ],
        footer_rule: 'Auxiliar executa dentro de protocolo — não prescreve opioides',
      },
      null as unknown,
    ],
  },
  'selecon-enfermagem-semiologia-em-enfermagem-1779563537258-1': {
    family: 'conceito',
    guideline: 'AVC — início súbito de plegia/paresia facial, cefaleia e disfasia — sinais neurológicos focais persistentes',
    roi_error: 'avc_sinais_plegia_cefaleia_disfasia',
    cluster: 'AVC — sinais e sintomas neurológicos súbitos',
    danger_footer: 'Gabarito B — plegia facial, cefaleia e disfasia',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'AVC — sinais clássicos',
        meta: slideMeta,
        items: [
          { label: 'Início súbito', detail: 'Sinais neurológicos aparecem de forma abrupta e persistente.', icon: 'Zap' },
          { label: 'Plegia/paresia facial', detail: 'Fraqueza ou paralisia facial unilateral — item Cincinnati.', icon: 'Smile' },
          { label: 'Cefaleia', detail: 'Cefaleia súbita intensa — alerta neurológico.', icon: 'Brain' },
          { label: 'Disfasia', detail: 'Dificuldade de fala ou compreensão — item Speech.', icon: 'MessageCircle' },
          { label: 'Pegadinha — febre/taquicardia', detail: 'Sialorreia, febre e taquicardia sugerem infecção — não padrão AVC.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Déficit focal súbito = suspeita de AVC',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: sinais e sintomas neurológicos persistentes de início súbito no AVC.',
          'Eliminar A — sialorreia, febre e taquicardia: padrão infeccioso, não neurológico focal.',
          'Eliminar C — síncope e diarreia: não caracterizam AVC.',
          'Eliminar D — insuficiência respiratória e hiperglicemia: não são tríade clássica de AVC.',
          'Plegia/paresia facial, cefaleia e disfasia — marcar B.',
          'Fixação: FAST/Cincinnati condensam face · braço · fala — cefaleia reforça alerta.',
        ],
        footer_rule: 'Neurológico focal súbito → acionar emergência',
      },
      { type: 'golden_rule', meta: slideMeta, content: 'AVC — SINAIS SÚBITOS', rows: cincinnatiRows(), footer_rule: 'Face · fala · motor — tempo é cérebro' },
      null as unknown,
    ],
  },
  'legalle-enfermagem-processo-de-enfermagem-1780010905023-8': {
    family: 'conceito',
    guideline: 'AVC — classificação em isquêmico (obstrução) e hemorrágico (ruptura vascular)',
    roi_error: 'avc_tipos_isquemico_hemorragico',
    cluster: 'AVC — tipos (isquêmico × hemorrágico)',
    danger_footer: 'Gabarito C — AVC isquêmico e AVC hemorrágico',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Tipos de AVC',
        meta: slideMeta,
        items: [
          { label: 'Enquadramento', detail: 'Interrupção ou diminuição do fluxo sanguíneo cerebral — lesão celular.', icon: 'Brain' },
          { label: 'Isquêmico', detail: 'Obstrução de vaso — maior parte dos casos (~85%).', icon: 'MinusCircle' },
          { label: 'Hemorrágico', detail: 'Ruptura vascular — sangramento intracraniano.', icon: 'Droplet' },
          { label: 'Pegadinha — transitório', detail: 'AVC transitório (AIT) é evento distinto — não tipo permanente.', icon: 'AlertTriangle' },
          { label: 'Pegadinha — leve/grave', detail: 'Gravidade ≠ classificação etiológica.', icon: 'Ban' },
        ],
        footer_rule: 'Isquêmico × hemorrágico — TC define conduta',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: quais são os tipos de AVC?',
          'Eliminar transitório/permanente — AIT é evento, não classificação etiológica principal.',
          'Eliminar leve/grave — descreve gravidade, não mecanismo.',
          'Eliminar agudo/crônico — temporalidade, não tipo fisiopatológico.',
          'AVC isquêmico e AVC hemorrágico — marcar C.',
          'Fixação: TC sem contraste diferencia — conduta de trombólise depende do tipo.',
        ],
        footer_rule: 'Mecanismo isquêmico × hemorrágico guia tratamento',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'AVC — CLASSIFICAÇÃO',
        rows: [
          { label: 'Isquêmico', value: 'Obstrução arterial — trombo/êmbolo', badge: 'hot' },
          { label: 'Hemorrágico', value: 'Ruptura vascular — sangramento intracraniano', badge: 'warn' },
          { label: 'Diagnóstico', value: 'TC crânio sem contraste — diferenciar tipos', badge: 'ok' },
          { label: 'AIT', value: 'Evento transitório — não substitui classificação isquêmico/hemorrágico', badge: 'info' },
        ],
        footer_rule: 'Tipo define elegibilidade para trombólise',
      },
      null as unknown,
    ],
  },
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780005550040-3': {
    family: 'protocolo',
    guideline: 'IAM — transporte para emergência de referência: terapia antitrombótica com clopidogrel no preparo',
    roi_error: 'iam_transporte_clopidogrel',
    cluster: 'IAM — antitrombótico no preparo para transporte',
    danger_footer: 'Gabarito C — clopidogrel',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'IAM — preparo transporte',
        meta: slideMeta,
        items: [
          { label: 'Enquadramento', detail: 'Dor torácica aguda ≤75 anos — encaminhar a emergência de referência.', icon: 'Ambulance' },
          { label: 'Antitrombótico', detail: 'Clopidogrel — antiagregante plaquetário no preparo.', icon: 'Pill' },
          { label: 'Pegadinha — nitroglicerina', detail: 'Nitrato vasodilatador — não é o antitrombótico pedido.', icon: 'AlertTriangle' },
          { label: 'Pegadinha — morfina', detail: 'Opioide analgésico — prescrição médica, não antitrombótico.', icon: 'Ban' },
          { label: 'Pegadinha — cetamina/desmopressina', detail: 'Anestésico e hemostático — sem relação com IAM agudo.', icon: 'Ban' },
        ],
        footer_rule: 'Dupla antiagregação no transporte — clopidogrel + AAS quando indicado',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: terapia antitrombótica indicada no preparo para transporte em IAM.',
          'Eliminar nitroglicerina — vasodilatador, não antitrombótico plaquetário.',
          'Eliminar morfina — analgésico opioide, não antitrombótico.',
          'Eliminar cetamina — anestésico dissociativo, sem indicação em IAM.',
          'Eliminar desmopressina — hemostático, contrário ao objetivo antitrombótico.',
          'Clopidogrel — marcar C.',
          'Fixação: antitrombótico = antiagregante plaquetário — clopidogrel nesta prova.',
        ],
        footer_rule: 'Não atrasar transporte — medicar conforme protocolo',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'IAM — ANTITROMBÓTICO NO TRANSPORTE',
        rows: [
          { label: 'Clopidogrel', value: 'Antiagregante plaquetário — terapia antitrombótica', badge: 'hot' },
          { label: 'AAS', value: 'Frequentemente associado — dupla antiagregação', badge: 'ok' },
          { label: 'Nitroglicerina', value: 'Vasodilatador — não antitrombótico', badge: 'info' },
          { label: 'Transporte', value: 'Emergência de referência — tempo is miocárdio', badge: 'hot' },
        ],
        footer_rule: 'Anti agregante precoce — clopidogrel no preparo',
      },
      null as unknown,
    ],
  },
  'funcern-enfermagem-urgencias-e-emergencias-1777104007115-4': {
    family: 'conceito',
    guideline: 'Dor torácica por obstrução coronariana com hipóxia miocárdica — Infarto Agudo do Miocárdio',
    roi_error: 'iam_dor_toracica_obstrucao_coronariana',
    cluster: 'IAM — reconhecimento por dor torácica e fisiopatologia',
    danger_footer: 'Gabarito C — Infarto agudo do miocárdio',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Dor torácica — IAM',
        meta: slideMeta,
        items: [
          { label: 'Enquadramento', detail: 'Dor torácica intensa na urgência — pensar isquemia miocárdica.', icon: 'Heart' },
          { label: 'Fisiopatologia', detail: 'Obstrução coronariana → hipóxia miocárdica → necrose tecidual.', icon: 'Activity' },
          { label: 'IAM', detail: 'Infarto agudo do miocárdio — morte celular por isquemia prolongada.', icon: 'Zap' },
          { label: 'Pegadinha — endocardite', detail: 'Infecção valvar — febre e sopro, não obstrução coronariana aguda.', icon: 'AlertTriangle' },
          { label: 'Pegadinha — FA/IRA', detail: 'Arritmia ou insuficiência respiratória — mecanismos distintos.', icon: 'Ban' },
        ],
        footer_rule: 'Obstrução coronariana + dor = IAM',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: quadro por obstrução do fluxo sanguíneo miocárdico com necrose tecidual.',
          'Eliminar endocardite — processo infeccioso valvar.',
          'Eliminar fibrilação atrial — arritmia, não infarto por obstrução coronariana.',
          'Eliminar insuficiência respiratória aguda — hipóxia pulmonar, não isquemia miocárdica primária.',
          'Infarto agudo do miocárdio — marcar C.',
          'Fixação: obstrução coronariana → isquemia → necrose = IAM.',
        ],
        footer_rule: 'Dor torácica + obstrução coronariana = IAM',
      },
      { type: 'golden_rule', meta: slideMeta, content: 'IAM — FISIOPATOLOGIA', rows: iamSinaisRows(), footer_rule: 'Obstrução → hipóxia → necrose' },
      null as unknown,
    ],
  },
};

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'idecan-enfermagem-urgencias-e-emergencias-1778712392541-5': {
    A: 'Monitorar glicemia com sedativos não substitui triagem imediata com escala de AVC.',
    B: 'Cabeceira e metas de PAM são condutas médicas avançadas — não ação imediata do técnico.',
    D: 'Retardar oxigênio até gasometria não descreve conduta inicial padrão do técnico.',
    E: 'Soluções hipotônicas dependem de prescrição — não ação imediata do técnico na admissão.',
  },
  'idecan-enfermagem-urgencias-e-emergencias-1780067013432-6': {
    A: 'Asma cursa com broncoespasmo e sibilância — não o quadro descrito.',
    C: 'Cólera apresenta diarreia aquosa profusa — ausente no caso.',
    D: 'Diabetes isolada não explica palidez, suor frio e PA alta agudos com fatores cardíacos.',
  },
  'idib-enfermagem-acidente-vascular-cerebral-avc-1778934918280-1': {
    A: 'Ultrassonografia não é exame padrão para diferenciar AVC isquêmico e hemorrágico na urgência.',
    B: 'NIHSS é escala hospitalar detalhada — triagem pré-hospitalar usa Cincinnati/FAST.',
    C: 'Febre não integra os principais sinais de AVC agudo descritos no manual.',
    D: 'Fatores de risco citados (sexo feminino, crianças) não correspondem ao manual MS.',
  },
  'idib-enfermagem-urgencias-e-emergencias-1778934926888-8': {
    A: 'Sulfato de magnésio e atropina não compõem conduta inicial padrão de IAM.',
    B: 'Hidratação com Ringer e ECG não listam analgésico e antiplaquetários exigidos.',
    C: 'Morfina e betabloqueador condicionado não descrevem protocolo inicial do auxiliar.',
  },
  'selecon-enfermagem-semiologia-em-enfermagem-1779563537258-1': {
    A: 'Sialorreia, febre e taquicardia sugerem processo infeccioso — não padrão neurológico focal de AVC.',
    C: 'Síncope e diarreia não caracterizam AVC de início súbito.',
    D: 'Insuficiência respiratória e hiperglicemia isoladas não definem AVC.',
  },
  'legalle-enfermagem-processo-de-enfermagem-1780010905023-8': {
    A: 'AVC transitório (AIT) é evento distinto — classificação etiológica principal é isquêmico × hemorrágico.',
    B: 'Leve e grave descrevem gravidade — não tipos fisiopatológicos de AVC.',
    D: 'Agudo e crônico referem temporalidade — não mecanismo isquêmico/hemorrágico.',
  },
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780005550040-3': {
    A: 'Nitroglicerina é vasodilatador — não antitrombótico plaquetário pedido no comando.',
    B: 'Morfina é analgésico opioide — não antitrombótico.',
    D: 'Cetamina é anestésico — sem indicação como antitrombótico em IAM.',
    E: 'Desmopressina é hemostático — oposto ao objetivo antitrombótico.',
  },
  'funcern-enfermagem-urgencias-e-emergencias-1777104007115-4': {
    A: 'Endocardite é processo infeccioso valvar — não obstrução coronariana aguda.',
    B: 'Fibrilação atrial é arritmia — não necrose miocárdica por obstrução.',
    D: 'Insuficiência respiratória aguda é hipóxia pulmonar — mecanismo distinto do IAM.',
  },
};

function main() {
  const dir = loteQuestionsDir(LOTE);
  let ok = 0;
  for (const [slug, pack] of Object.entries(SPECS)) {
    const path = join(dir, `${slug}.json`);
    const raw = JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, '')) as Q;
    const slides = finalizeSlides(slug, raw, pack, DANGER_OVERRIDES);
    const out = {
      meta: metaBase(raw, pack.family, pack.guideline, slug, pack.roi_error, pack.cluster, REVIEWER),
      question_data: raw.question_data,
      reverse_study_slides: slides,
      modulo_slug: raw.modulo_slug ?? slug,
    };
    writeFileSync(path, `${JSON.stringify(out, null, 2)}\n`, 'utf8');
    ok++;
    console.log(`[handcraft:urgencias-g15] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g15] total=${ok}`);
}

main();
