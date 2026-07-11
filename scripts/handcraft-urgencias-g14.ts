#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — urgencias-g14 (8 slugs · urgencias_avc_iam).
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

const LOTE = 'urgencias-g14';
const REVIEWER = 'handcraft-urgencias-g14';

const SPECS: Record<string, Pack> = {
  'instituto-seletiva-enfermagem-semiologia-em-enfermagem-1779563521756-0': {
    family: 'protocolo',
    guideline: 'Escala de Cincinnati — face (assimetria) · braços (debilidade) · fala (alteração)',
    roi_error: 'cincinnati_tres_criterios',
    cluster: 'AVC — Escala de Cincinnati (3 critérios)',
    danger_footer: 'Gabarito B — face · braço · fala',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cincinnati — três critérios',
        meta: slideMeta,
        items: [
          { label: 'Enquadramento', detail: 'Triagem pré-hospitalar de AVC — identificar os três itens da Escala de Cincinnati.', icon: 'Target' },
          { label: 'Face', detail: 'Assimetria facial ao sorrir — queda labial unilateral.', icon: 'Smile' },
          { label: 'Braços', detail: 'Debilidade ou queda de um membro superior elevado.', icon: 'Hand' },
          { label: 'Fala', detail: 'Alteração na fala — disartria ou incompreensão.', icon: 'MessageCircle' },
          { label: 'Pegadinha — SSVV', detail: 'Taquicardia, taquipneia e hipertensão são vitais — não compõem Cincinnati.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Face · braço · fala → suspeita de AVC',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: três critérios da Escala de Cincinnati para suspeita de AVC.',
          'Mnemônico FAST: Face · Arms · Speech — qualquer alteração = suspeita.',
          'Eliminar letra A — taquicardia, taquipneia e hipertensão são parâmetros hemodinâmicos.',
          'Eliminar letra C — simetria facial é normal; marcha e deglutição não são os três itens.',
          'Eliminar letra D — Glasgow e marcha pertencem a outras escalas neurológicas.',
          'Resta assimetria facial, debilidade dos braços e alteração na fala.',
          'Marcar B.',
          'Fixação: Cincinnati ≠ Glasgow ≠ SSVV.',
        ],
        footer_rule: 'Um item alterado já aciona suspeita',
      },
      { type: 'golden_rule', meta: slideMeta, content: 'CINCINNATI = F · B · FALA', rows: cincinnatiRows(), footer_rule: 'Sorriso · braço · fala → 192' },
      null as unknown,
    ],
  },
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780003950945-9': {
    family: 'protocolo',
    guideline: 'Triagem rápida AVC com três itens — Escala de Cincinnati (face · braço · fala)',
    roi_error: 'cincinnati_vs_nihss_glasgow',
    cluster: 'AVC — Cincinnati vs outras escalas',
    danger_footer: 'Gabarito B — Escala de Cincinnati',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Caso UPA — triagem AVC',
        meta: slideMeta,
        items: [
          { label: 'Caso', detail: 'Fala arrastada · queda do braço direito · assimetria facial ao sorriso.', icon: 'User' },
          { label: 'Face', detail: 'Sorriso com assimetria acentuada — item Cincinnati positivo.', icon: 'Smile' },
          { label: 'Braços', detail: 'Queda do braço direito ao elevar MMSS.', icon: 'Hand' },
          { label: 'Fala', detail: 'Palavras incoerentes e articulação prejudicada.', icon: 'MessageCircle' },
          { label: 'Pegadinha — NIHSS', detail: 'NIHSS é hospitalar e detalhada — triagem rápida usa Cincinnati.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Três itens alterados → Cincinnati',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Caso clínico: fala arrastada, assimetria facial e queda de braço — padrão Cincinnati.',
          'Comando pede escala de triagem rápida com apenas três itens.',
          'Eliminar NIHSS — escala hospitalar detalhada, não triagem pré-hospitalar de 3 itens.',
          'Eliminar Glasgow — avalia consciência, não face/braço/fala isolados.',
          'Eliminar miniexame do estado mental — rastreio cognitivo, não triagem de AVC.',
          'Eliminar Rankin — mede incapacidade pós-AVC, não triagem aguda.',
          'Escala de Cincinnati — face, braço e fala — marcar B.',
          'Fixação: tempo é cérebro — triagem simples antes do transporte.',
        ],
        footer_rule: 'Cincinnati na UPA = mesmo FAST do SAMU',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'ESCALAS — NÃO CONFUNDIR',
        rows: [
          { label: 'Cincinnati', value: 'Face · braço · fala — triagem rápida 3 itens', badge: 'hot' },
          { label: 'NIHSS', value: 'Escala hospitalar detalhada — não triagem de 3 itens', badge: 'warn' },
          { label: 'Glasgow', value: 'Consciência · motor · verbal — outra ferramenta', badge: 'info' },
          { label: 'Rankin', value: 'Incapacidade pós-evento — não triagem aguda', badge: 'info' },
        ],
        footer_rule: 'Pré-hospitalar/UPA = Cincinnati',
      },
      null as unknown,
    ],
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780002845055-4': {
    family: 'conceito',
    guideline: 'Sinais de AVC — fraqueza/dormência unilateral, fala alterada, cefaleia súbita, perda visual — NÃO hipertonia',
    roi_error: 'avc_sinais_espurios_hipertonia',
    cluster: 'AVC — reconhecimento de sinais (espúrio)',
    danger_footer: 'Gabarito D — hipertonia não é sinal de AVC',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sinais de AVC — o que NÃO é',
        meta: slideMeta,
        items: [
          { label: 'Enquadramento', detail: 'Assinale a alternativa que NÃO contenha um sinal de AVC.', icon: 'ScanSearch' },
          { label: 'Cefaleia súbita', detail: 'Cefaleia intensa de início abrupto — sinal de alerta neurológico.', icon: 'Zap' },
          { label: 'Fraqueza unilateral', detail: 'Dormência ou fraqueza em face, braço ou perna de um lado.', icon: 'Hand' },
          { label: 'Fala alterada', detail: 'Perda súbita da fala ou dificuldade de compreensão.', icon: 'MessageCircle' },
          { label: 'Pegadinha — hipertonia', detail: 'AVC causa fraqueza/dormência — hipertonia e aumento de força são espúrios.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'AVC = déficit neurológico focal — não hipertonia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa que NÃO é sinal de AVC — buscar o espúrio entre sinais reais.',
          'Letra A — cefaleia súbita intensa: sinal de alerta em AVC hemorrágico → é sinal real, eliminar.',
          'Letra B — fraqueza/dormência unilateral: clássico de AVC → é sinal real, eliminar.',
          'Letra C — perda súbita da fala: item Cincinnati → é sinal real, eliminar.',
          'Letra E — perda visual súbita: pode ocorrer em AVC → é sinal real, eliminar.',
          'Letra D — aumento súbito de força e sensibilidade: AVC produz déficit, não hipertonia.',
          'Marcar D.',
          'Fixação: fraqueza unilateral ≠ hipertonia — a banca inverte o achado motor.',
        ],
        footer_rule: 'Déficit focal unilateral = AVC',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SINAIS DE ALERTA — AVC',
        rows: [
          { label: 'Motor', value: 'Fraqueza ou dormência unilateral — face, braço, perna', badge: 'hot' },
          { label: 'Fala', value: 'Disartria, afasia ou fala arrastada', badge: 'ok' },
          { label: 'Visual', value: 'Perda súbita de visão ou diplopia', badge: 'ok' },
          { label: 'Cefaleia', value: 'Dor intensa de início abrupto — hemorrágico', badge: 'warn' },
          { label: 'Espúrio', value: 'Hipertonia ou aumento de força — NÃO é padrão de AVC', badge: 'info' },
        ],
        footer_rule: 'Tempo é cérebro — reconhecer e acionar',
      },
      null as unknown,
    ],
  },
  'idib-enfermagem-urgencias-e-emergencias-1778934926888-5': {
    family: 'protocolo',
    guideline: 'Suspeita de AVE — registrar fala pastosa/arrastada e movimentos assimétricos nos MMSS',
    roi_error: 'ave_achados_tipicos_registro',
    cluster: 'AVC — achados típicos na avaliação',
    danger_footer: 'Gabarito D — fala pastosa e assimetria de MMSS',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'AVE — o que registrar',
        meta: slideMeta,
        items: [
          { label: 'Enquadramento', detail: 'Suspeita de AVE — observar e registrar alterações típicas.', icon: 'ClipboardList' },
          { label: 'Fala alterada', detail: 'Fala pastosa, arrastada ou incompreensível.', icon: 'MessageCircle' },
          { label: 'Assimetria motora', detail: 'Movimentos assimétricos nos membros superiores.', icon: 'Hand' },
          { label: 'Pegadinha — achados normais', detail: 'Mímica simétrica, pupilas isocóricas e orientação preservada são NORMAIS.', icon: 'AlertTriangle' },
          { label: 'Pegadinha — Glasgow isolado', detail: 'Glasgow mede consciência — achado típico de AVE é déficit focal.', icon: 'Brain' },
        ],
        footer_rule: 'Registrar déficit focal — não normalidade',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: o que observar e registrar em suspeita de AVE.',
          'Letra A — mímica facial simétrica ao sorrir: achado NORMAL → eliminar.',
          'Letra B — pupilas isocóricas e fala preservada: achado NORMAL → eliminar.',
          'Letra C — orientado no tempo e espaço: achado NORMAL → eliminar.',
          'Letra D — fala pastosa/arrastada + movimentos assimétricos nos MMSS: déficit focal típico.',
          'Marcar D.',
          'Fixação: a banca oferece achados normais como distrator — registrar o anormal.',
        ],
        footer_rule: 'Face · braço · fala alterados = suspeita',
      },
      { type: 'golden_rule', meta: slideMeta, content: 'AVE — ACHADOS TÍPICOS', rows: cincinnatiRows(), footer_rule: 'Registrar e acionar equipe médica' },
      null as unknown,
    ],
  },
  'atame-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1779344645032-2': {
    family: 'protocolo',
    guideline: 'AVC — monitorar complicações respiratórias e aspirar vias aéreas se necessário',
    roi_error: 'avc_conduta_respiratoria_vaa',
    cluster: 'AVC — conduta respiratória do técnico',
    danger_footer: 'Gabarito D — monitorar respiração e aspirar VAA',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'AVC — prioridade respiratória',
        meta: slideMeta,
        items: [
          { label: 'Enquadramento', detail: 'Conduta essencial do técnico em paciente com AVC.', icon: 'Wind' },
          { label: 'Via aérea', detail: 'Paciente com déficit neurológico pode perder reflexo de proteção — risco de aspiração.', icon: 'Shield' },
          { label: 'Monitorização', detail: 'Observar padrão respiratório, saturação e sinais de obstrução.', icon: 'Activity' },
          { label: 'Aspiração', detail: 'Aspiração de vias aéreas quando indicada — técnica do técnico.', icon: 'Syringe' },
          { label: 'Pegadinha — anticoagulante', detail: 'Anticoagulante é prescrição médica — não conduta autônoma do técnico.', icon: 'Ban' },
        ],
        footer_rule: 'Oxigenação cerebral depende de VAA pérvia',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: conduta essencial do técnico em paciente com AVC.',
          'Eliminar anticoagulantes — medicamento de prescrição médica, não autonomia do técnico.',
          'Eliminar cabeceira a 45° fixa — posicionamento depende de indicação clínica.',
          'Eliminar Glasgow seriado isolado — neurológico sim, mas respiração é prioridade de segurança imediata.',
          'Monitorar complicações respiratórias e aspirar vias aéreas se necessário — marcar D.',
          'Fixação: técnico garante VAA antes de escalas neurológicas isoladas.',
        ],
        footer_rule: 'Prevenir hipóxia e aspiração',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'AVC — CUIDADOS RESPIRATÓRIOS',
        rows: [
          { label: 'Monitorar', value: 'Padrão respiratório · saturação · secreções', badge: 'hot' },
          { label: 'Aspiração', value: 'Quando indicada — manter VAA pérvia', badge: 'ok' },
          { label: 'Posicionamento', value: 'Conforme indicação — não fixar 45° sem critério', badge: 'info' },
          { label: 'Neurológico', value: 'Glasgow seriado complementa — não substitui VAA', badge: 'warn' },
        ],
        footer_rule: 'Hipóxia agrava lesão cerebral',
      },
      null as unknown,
    ],
  },
  'fundatec-enfermagem-semiologia-em-enfermagem-1779563486900-3': {
    family: 'conceito',
    guideline: 'Sinal de Levine — punho sobre o peito indicando dor torácica (angina/IAM)',
    roi_error: 'iam_sinal_levine',
    cluster: 'IAM — Sinal de Levine',
    danger_footer: 'Gabarito C — Sinal de Levine',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sinal de Levine — IAM',
        meta: slideMeta,
        items: [
          { label: 'Enquadramento', detail: 'Paciente coloca punho sobre o peito para localizar dor torácica.', icon: 'Heart' },
          { label: 'Levine', detail: 'Gestual clássico de angina ou infarto — indicativo de dor precordial.', icon: 'Hand' },
          { label: 'Pegadinha — Murphy', detail: 'Murphy é colecistite — dor em hipocôndrio direito.', icon: 'AlertTriangle' },
          { label: 'Pegadinha — Blumberg', detail: 'Blumberg é irritação peritoneal — soltar pressão dolorosa.', icon: 'Ban' },
          { label: 'Pegadinha — Kernig', detail: 'Kernig é meningite — rigidez de nuca com extensão de perna.', icon: 'Brain' },
        ],
        footer_rule: 'Punho no peito = Levine = IAM/angina',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Lacuna: sinal em que paciente coloca punho sobre o peito por dor torácica.',
          'Eliminar Murphy — dor em HD por colecistite.',
          'Eliminar Blumberg — dor à descompressão abdominal.',
          'Eliminar Kernig — sinal meníngeo.',
          'Eliminar Nikolsky — descolamento epidérmico em bolhas.',
          'Sinal de Levine — marcar C.',
          'Fixação: semiologia cardíaca ≠ abdominal ≠ neurológica.',
        ],
        footer_rule: 'Levine = dor precordial clássica',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'SINAIS SEMIOLÓGICOS — NÃO CONFUNDIR',
        rows: [
          { label: 'Levine', value: 'Punho no peito — angina/IAM', badge: 'hot' },
          { label: 'Murphy', value: 'Inspiração interrompida — colecistite', badge: 'info' },
          { label: 'Blumberg', value: 'Descompressão dolorosa — peritonite', badge: 'info' },
          { label: 'Kernig', value: 'Extensão de perna — meningite', badge: 'info' },
        ],
        footer_rule: 'Cardíaco · abdominal · neurológico — contextos distintos',
      },
      null as unknown,
    ],
  },
  'ivin-enfermagem-urgencias-e-emergencias-1777104048047-9': {
    family: 'conceito',
    guideline: 'IAM — dor precordial retroesternal > intervalo breve, irradiação, sudorese, náusea, taquicardia',
    roi_error: 'iam_caso_clinico_reconhecimento',
    cluster: 'IAM — reconhecimento clínico',
    danger_footer: 'Gabarito D — Infarto Agudo do Miocárdio',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Caso V.N.M. — suspeita IAM',
        meta: slideMeta,
        items: [
          { label: 'Dor', detail: 'Precordial retroesternal com irradiação para membro superior.', icon: 'Heart' },
          { label: 'Duração', detail: 'Dor persistente — angina estável cede com repouso/nitrato.', icon: 'Clock' },
          { label: 'Autonômicos', detail: 'Sudorese, náusea, vômito e taquicardia — resposta simpática.', icon: 'Droplets' },
          { label: 'Pegadinha — angina estável', detail: 'Angina dura minutos e alivia — este quadro persiste.', icon: 'AlertTriangle' },
          { label: 'Pegadinha — FV', detail: 'FV é arritmia — caso descreve dor torácica isquêmica.', icon: 'Zap' },
        ],
        footer_rule: 'Dor precordial persistente + autonômicos = IAM',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Caso: dor precordial retroesternal, irradiação, sudorese, náusea, vômito, taquicardia.',
          'Eliminar angina estável — dor breve que cede; este quadro persiste.',
          'Eliminar fibrilação ventricular — arritmia, não síndrome isquêmica descrita.',
          'Eliminar hipoglicemia — não há sudorese com glicemia baixa como quadro principal.',
          'Eliminar edema agudo de pulmão — dispneia paroxística não é o foco do caso.',
          'Infarto Agudo do Miocárdio — marcar D.',
          'Fixação: IAM = dor persistente + autonômicos + irradiação.',
        ],
        footer_rule: 'Tempo de dor diferencia angina de IAM',
      },
      { type: 'golden_rule', meta: slideMeta, content: 'IAM — SINAIS CLÁSSICOS', rows: iamSinaisRows(), footer_rule: 'Acionar equipe e monitorar' },
      null as unknown,
    ],
  },
  'funatec-enfermagem-urgencias-e-emergencias-1777104077075-5': {
    family: 'protocolo',
    guideline: 'IAM pré-hospitalar — aspirina mastigável se não alérgico (protocolo APH)',
    roi_error: 'iam_aph_aspirina',
    cluster: 'IAM — conduta APH (aspirina)',
    danger_footer: 'Gabarito D — aspirina mastigável se não alérgico',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'IAM — APH do técnico',
        meta: slideMeta,
        items: [
          { label: 'Enquadramento', detail: 'Suspeita de IAM no atendimento pré-hospitalar — ação do técnico.', icon: 'Ambulance' },
          { label: 'Aspirina', detail: 'AAS mastigável se não houver alergia — antiplaquetário precoce.', icon: 'Pill' },
          { label: 'Repouso', detail: 'Posição confortável — evitar esforço do paciente.', icon: 'Bed' },
          { label: 'Pegadinha — analgésico potente', detail: 'Analgésico forte é conduta médica — técnico não prescreve opioides.', icon: 'Ban' },
          { label: 'Pegadinha — Trendelenburg', detail: 'Elevar pernas em IAM não é conduta padrão APH.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Aspirina precoce + transporte rápido',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: ação mais apropriada do técnico em suspeita de IAM no APH.',
          'Eliminar analgésico potente imediato — medicamento de prescrição médica.',
          'Eliminar decúbito dorsal com pernas elevadas — não é manobra padrão em IAM.',
          'Eliminar manobras de desobstrução — paciente não descreve obstrução de VAA.',
          'Administrar aspirina mastigável se não alérgico — marcar D.',
          'Fixação: APH IAM = repouso + aspirina (se permitido) + oxigênio se indicado + transporte.',
        ],
        footer_rule: 'Tempo isquêmico = miocárdio',
      },
      {
        type: 'golden_rule',
        meta: slideMeta,
        content: 'IAM — APH DO TÉCNICO',
        rows: [
          { label: 'Aspirina', value: 'Mastigável se não alérgico — antiplaquetário precoce', badge: 'hot' },
          { label: 'Repouso', value: 'Posição confortável — minimizar esforço', badge: 'ok' },
          { label: 'Oxigênio', value: 'Se saturação baixa — não rotina em todos', badge: 'warn' },
          { label: 'Transporte', value: 'Encaminhar rapidamente ao serviço de emergência', badge: 'hot' },
        ],
        footer_rule: 'Não atrasar transporte por procedimentos invasivos',
      },
      null as unknown,
    ],
  },
};

const DANGER_OVERRIDES: Record<string, Record<string, string>> = {
  'instituto-seletiva-enfermagem-semiologia-em-enfermagem-1779563521756-0': {
    A: 'Taquicardia, taquipneia e hipertensão são sinais vitais — Cincinnati avalia face, braço e fala.',
    C: 'Simetria facial é achado normal; marcha e deglutição não compõem os três critérios de Cincinnati.',
    D: 'Glasgow mede consciência — escala distinta dos três itens de triagem de AVC.',
  },
  'instituto-aocp-enfermagem-processo-de-enfermagem-1780003950945-9': {
    A: 'NIHSS é escala hospitalar detalhada — triagem rápida de 3 itens usa Cincinnati.',
    C: 'Glasgow avalia consciência, motor e verbal — não substitui face/braço/fala.',
    D: 'Miniexame do estado mental rastreia cognição — não triagem de AVC agudo.',
    E: 'Rankin mede incapacidade pós-AVC — não serve para triagem na chegada.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780002845055-4': {
    A: 'Cefaleia súbita intensa é sinal de alerta em AVC — especialmente hemorrágico.',
    B: 'Fraqueza ou dormência unilateral é achado clássico de AVC.',
    C: 'Perda súbita da fala integra a triagem de AVC (item Speech).',
    E: 'Perda visual súbita pode ocorrer em evento cerebrovascular.',
  },
  'idib-enfermagem-urgencias-e-emergencias-1778934926888-5': {
    A: 'Mímica facial simétrica é achado normal — não registra suspeita de AVE.',
    B: 'Pupilas isocóricas com fala preservada indicam ausência de déficit focal.',
    C: 'Orientação preservada no tempo e espaço é achado normal — não típico de AVE.',
  },
  'atame-enfermagem-oxigenoterapia-e-cuidados-respiratorios-1779344645032-2': {
    A: 'Anticoagulante depende de prescrição médica — não é conduta autônoma do técnico.',
    B: 'Posicionamento fixo a 45° não é conduta essencial universal em AVC.',
    C: 'Glasgow seriado é importante, mas monitorização respiratória previne hipóxia imediata.',
  },
  'fundatec-enfermagem-semiologia-em-enfermagem-1779563486900-3': {
    A: 'Murphy indica colecistite — dor em hipocôndrio direito à inspiração.',
    B: 'Blumberg indica irritação peritoneal — dor à descompressão.',
    D: 'Kernig indica meningite — rigidez com extensão de perna.',
    E: 'Nikolsky indica descolamento epidérmico — dermatológico.',
  },
  'ivin-enfermagem-urgencias-e-emergencias-1777104048047-9': {
    A: 'Angina estável dura pouco e cede — este quadro persiste com autonômicos.',
    B: 'Fibrilação ventricular é arritmia — caso descreve síndrome isquêmica torácica.',
    C: 'Hipoglicemia não explica dor precordial com irradiação e sudorese típica de IAM.',
    E: 'Edema agudo de pulmão cursa com dispneia paroxística — não o foco deste caso.',
  },
  'funatec-enfermagem-urgencias-e-emergencias-1777104077075-5': {
    A: 'Analgésico potente é prescrição médica — técnico não administra opioides por conta própria.',
    B: 'Decúbito com pernas elevadas não é manobra padrão de IAM no APH.',
    C: 'Desobstrução de VAA só se houver obstrução — caso é suspeita de IAM.',
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
    console.log(`[handcraft:urgencias-g14] OK ${slug}`);
  }
  console.log(`[handcraft:urgencias-g14] total=${ok}`);
}

main();
