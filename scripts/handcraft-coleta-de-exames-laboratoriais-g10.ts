#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — coleta-de-exames-laboratoriais-g10 (8 slugs).
 *
 *   npx tsx scripts/handcraft-coleta-de-exames-laboratoriais-g10.ts
 */
import {
  CLSI_SOURCE,
  MS_SOURCE,
  POTTER_SOURCE,
  cleanPdfNoise,
  runHandcraft,
  slideMeta,
  type Pack,
} from './handcraft-coleta-shared';

const LOTE = 'coleta-de-exames-laboratoriais-g10';
const BRANCH_DEFAULT = 'coleta_generico';

const ECG_INCORRETA_PACK: Pack = {
  family: 'certo_errado',
  guideline: 'Potter/MS — ECG padrão: 12 derivações (6 periféricas + 6 precordiais); afirmativa “6+3” é falsa',
  slides: [
    {
      type: 'concept_map',
      slide_title: 'ECG — derivações padrão',
      meta: slideMeta,
      items: [
        { label: 'Comando INCORRETA', detail: 'Marque a afirmativa FALSA sobre eletrocardiograma.', icon: 'AlertTriangle' },
        { label: '12 derivações', detail: '6 periféricas (I, II, III, aVR, aVL, aVF) + 6 precordiais (V1–V6).', icon: 'Activity' },
        { label: 'Pegadinha A — 6+3', detail: 'Soma 9 derivações — incompleto para ECG de repouso padrão.', icon: 'XCircle' },
        { label: 'Cadastro ambulatorial', detail: 'ECG faz parte do cadastro/exames complementares — não confundir com coleta sangue.', icon: 'ClipboardList' },
        { label: 'Exame não invasivo', detail: 'Registra atividade elétrica cardíaca — sem punção.', icon: 'Heart' },
      ],
      footer_rule: 'ECG padrão = 12 derivações (6+6)',
    },
    {
      type: 'logic_flow',
      reveal_mode: 'tap',
      meta: slideMeta,
      steps: [
        'Comando: assinale a afirmativa INCORRETA sobre eletrocardiograma.',
        'ECG de repouso clássico usa 12 derivações simultâneas.',
        'Letra A afirma 6 periféricas + 3 precordiais (9 total) — FALSA.',
        'Demais alternativas descrevem condutas/ conceitos corretos — eliminar.',
        'Marcar A como INCORRETA.',
        'Em similares: ECG = 6 periféricas + 6 precordiais — não 6+3.',
      ],
      footer_rule: 'A = INCORRETA (6+3 derivações)',
    },
    {
      type: 'golden_rule',
      slide_title: 'Referência — ECG 12 derivações',
      meta: slideMeta,
      content: 'ECG — MAPA RÁPIDO',
      rows: [
        { label: 'Periféricas', value: 'I, II, III, aVR, aVL, aVF (6)', badge: 'ok' },
        { label: 'Precordiais', value: 'V1, V2, V3, V4, V5, V6 (6)', badge: 'hot' },
        { label: 'Total', value: '12 derivações — repouso padrão', badge: 'hot' },
        { label: 'Pegadinha', value: '6+3 = 9 — incompleto', badge: 'warn' },
      ],
      footer_rule: 'Decore 6+6 — não 6+3',
    },
    {
      type: 'danger_zone',
      bullet_style: 'x_icon',
      meta: slideMeta,
      content: 'PEGADINHAS — ECG INCORRETA IDECAN',
      items: [
        { label: 'Letra A — 6+3 derivações', detail: 'Soma nove — parece plausível.', correct: 'ECG padrão tem 12 derivações (6+6) — afirmativa falsa (INCORRETA).' },
        { label: 'Letra B — registro elétrico', detail: 'Conceito correto do exame.', correct: 'Verdadeira — não marcar como INCORRETA.' },
        { label: 'Letra C — posicionamento eletrodos', detail: 'Técnica de aplicação.', correct: 'Conduta correta — eliminar.' },
        { label: 'Letra D — indicação clínica', detail: 'Uso diagnóstico válido.', correct: 'Afirmativa correta — não é a INCORRETA.' },
        { label: 'Em outra banca…', detail: 'Pergunta material de coleta sangue.', correct: 'ECG = 12 derivações — pegadinha numérica 6+3.' },
      ],
      footer_rule: 'INCORRETA = subcontagem de derivações',
    },
  ],
  cleanInstruction: cleanPdfNoise,
};

const SPECS: Record<string, Pack> = {
  'iaupe-enfermagem-exames-laboratoriais-1779563559434-8': {
    family: 'conceito',
    guideline: 'MS/Potter — DM: glicemia de jejum elevada reforça diagnóstico; exame laboratorial central = glicose',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'DM — exame laboratorial',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Paciente DM — qual exame laboratorial reforça o diagnóstico.', icon: 'FlaskConical' },
          { label: 'Glicose (E)', detail: 'Glicemia alterada confirma/sustenta diagnóstico de diabetes.', icon: 'Droplet' },
          { label: 'Hemograma', detail: 'Não confirma DM — avalia série vermelha/leucócitos.', icon: 'TestTube' },
          { label: 'Ureia/creatinina', detail: 'Função renal — complicação, não critério diagnóstico primário.', icon: 'Activity' },
          { label: 'Pegadinha — perfil lipídico', detail: 'Associado ao DM, mas não é o exame que “reforça diagnóstico”.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'DM → glicose sérica/capilar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: exame laboratorial que reforça diagnóstico de diabetes mellitus.',
          'Critério diagnóstico baseia-se em glicemia de jejum / HbA1c / TOTG — núcleo = glicose.',
          'Eliminar hemograma, ureia, creatinina, lipídios como resposta única pedida.',
          'Marcar E — Glicose.',
          'Em similares: DM confirmado por glicose/HbA1c — glicose é alternativa direta da banca.',
        ],
        footer_rule: 'E = Glicose',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — diagnóstico DM',
        meta: slideMeta,
        content: 'DIABETES — EXAMES',
        rows: [
          { label: 'Glicose jejum', value: '≥126 mg/dL (2x) — diagnóstico', badge: 'hot' },
          { label: 'HbA1c', value: '≥6,5% — critério alternativo', badge: 'ok' },
          { label: 'Hemograma', value: 'Não confirma DM', badge: 'warn' },
          { label: 'Função renal', value: 'Rastreio complicação — não diagnóstico', badge: 'ok' },
        ],
        footer_rule: 'Glicose = exame núcleo do DM',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DM IAUPE',
        items: [
          { label: 'Letra A — hemograma', detail: 'Exame hematológico.', correct: 'Não confirma diabetes — eliminar.' },
          { label: 'Letra B — ureia', detail: 'Função renal.', correct: 'Complicação renal, não critério diagnóstico primário.' },
          { label: 'Letra C — creatinina', detail: 'Clearance/filtração.', correct: 'Monitora rim — não reforça diagnóstico DM isolado.' },
          { label: 'Letra D — colesterol', detail: 'Perfil lipídico.', correct: 'Frequente no DM, mas gabarito pede glicose (E).' },
          { label: 'Em outra banca…', detail: 'Pergunta HbA1c isolada.', correct: 'Núcleo metabólico = glicose/HbA1c — aqui E Glicose.' },
        ],
        footer_rule: 'Não trocar glicose por hemograma',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'ibfc-enfermagem-coleta-de-exames-laboratoriais-1779563248005-3': {
    family: 'conceito',
    guideline: 'MS — transporte amostras: ≥18 h exige congelamento (−20 °C) para preservar analitos',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Transporte longo — freezer',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Transporte ≥18 h — conduta correta para amostra.', icon: 'Truck' },
          { label: 'Freezer (A)', detail: 'Congelamento preserva amostras biológicas em trânsito prolongado.', icon: 'Snowflake' },
          { label: 'Refrigerador comum', detail: '2–8 °C — insuficiente para 18+ horas sem degradação.', icon: 'Thermometer' },
          { label: 'Temperatura ambiente', detail: 'Acelera decomposição enzimática/bacteriana.', icon: 'AlertTriangle' },
          { label: 'Pré-analítico', detail: 'Tempo-temperatura define validade do resultado.', icon: 'Clock' },
        ],
        footer_rule: '≥18 h → congelar (freezer)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: transporte de amostra por 18 horas ou mais — o que fazer.',
          'Intervalo prolongado exige temperatura de congelamento para estabilidade.',
          'Eliminar ambiente, gelo comum sem controle, refrigerador leve se banca pede freezer.',
          'Marcar A — armazenar/congelar em freezer.',
          'Em similares: transporte ≥18 h → freezer (−20 °C) conforme manual MS.',
        ],
        footer_rule: 'A = freezer para ≥18 h',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — transporte',
        meta: slideMeta,
        content: 'TRANSPORTE — TEMPERATURA',
        rows: [
          { label: '≥18 h', value: 'Freezer (−20 °C) — congelamento', badge: 'hot' },
          { label: 'Curto prazo', value: 'Refrigerado 2–8 °C conforme analito', badge: 'ok' },
          { label: 'Evitar', value: 'Ambiente >24 h sem conservação', badge: 'warn' },
        ],
        footer_rule: 'Tempo longo = congelar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — TRANSPORTE IBFC',
        items: [
          { label: 'Letra B — temperatura ambiente', detail: 'Sem conservação.', correct: 'Degrada amostra em 18+ h — eliminar.' },
          { label: 'Letra C — gelo seco sem protocolo', detail: 'Pode confundir com cadena fria vacina.', correct: 'Banca pede freezer para amostra biológica.' },
          { label: 'Letra D — refrigerador doméstico', detail: '2–8 °C prolongado.', correct: 'Insuficiente para 18 h+ — A freezer é gabarito.' },
          { label: 'Letra E — descartar amostra', detail: 'Extremo.', correct: 'Conduta é preservar congelando — marcar A.' },
          { label: 'Em outra banca…', detail: 'Transporte 2 h refrigerado.', correct: 'Corte ≥18 h → freezer — decore o número.' },
        ],
        footer_rule: '18 h = limiar para congelar',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idecan-enfermagem-exames-complementares-1778712242196-2': ECG_INCORRETA_PACK,

  'idecan-enfermagem-exames-complementares-1779563685104-2': ECG_INCORRETA_PACK,

  'idecan-enfermagem-exames-laboratoriais-1778712242196-1': {
    family: 'conceito',
    guideline: 'Potter — reflexo de Babinski: extensão do hálux + abdução dedos = lesão trato corticoespinhal (UMN)',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Babinski — neurologia',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Babinski positivo indica lesão de…', icon: 'Brain' },
          { label: 'Trato corticoespinhal (B)', detail: 'Via motora superior — lesão piramidal.', icon: 'Activity' },
          { label: 'Médula lombar isolada', detail: 'Lesão LMN — reflexos diferentes.', icon: 'Bone' },
          { label: 'Cerebelo', detail: 'Ataxia/disdiadococinesia — não Babinski clássico.', icon: 'Shuffle' },
          { label: 'Pegadinha — nervo periférico', detail: 'Neuropatia periférica não dá Babinski positivo típico.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Babinski + = lesão UMN / corticoespinhal',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: Babinski positivo (extensão hálux + abdução dedos) indica lesão em…',
          'Reflexo plantar extensor = sinal de liberação piramidal.',
          'Lesão do trato corticoespinhal (via motora superior) explica o achado.',
          'Eliminar nervo periférico, cerebelo, raiz lombar isolada como gabarito.',
          'Marcar B — trato corticoespinhal.',
          'Em similares: Babinski positivo = lesão UMN — trato corticoespinhal.',
        ],
        footer_rule: 'B = trato corticoespinhal',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — Babinski',
        meta: slideMeta,
        content: 'REFLEXO PLANTAR',
        rows: [
          { label: 'Babinski +', value: 'Extensão hálux + leque dedos', badge: 'hot' },
          { label: 'Significa', value: 'Lesão trato corticoespinhal (UMN)', badge: 'hot' },
          { label: 'Normal adulto', value: 'Flexão plantar (negativo)', badge: 'ok' },
        ],
        footer_rule: 'UMN = Babinski extensor',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — BABINSKI IDECAN',
        items: [
          { label: 'Letra A — nervo periférico', detail: 'Neuropatia.', correct: 'Babinski positivo indica lesão central — não periférica isolada.' },
          { label: 'Letra C — cerebelo', detail: 'Coordenação.', correct: 'Sinal cerebelar ≠ Babinski extensor clássico.' },
          { label: 'Letra D — medula lombar LMN', detail: 'Lesão segmentar inferior.', correct: 'LMN flácido — Babinski + é UMN (B).' },
          { label: 'Letra E — plexo braquial', detail: 'Membro superior.', correct: 'Não explica plantar extensor — marcar B.' },
          { label: 'Em outra banca…', detail: 'Reflexo rotuliano.', correct: 'Babinski = corticoespinhal — decore UMN.' },
        ],
        footer_rule: 'Central ≠ periférico',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'idecan-enfermagem-exames-laboratoriais-1780066961947-6': {
    family: 'conceito',
    guideline: 'MS/Potter — sorologia: detecção de anticorpos no soro do paciente',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Sorologia — conceito',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Definição correta de exame sorológico.', icon: 'FlaskConical' },
          { label: 'Anticorpos no soro (D)', detail: 'Sorologia busca IgM/IgG contra agente no soro.', icon: 'Shield' },
          { label: 'Antígeno na urina', detail: 'Urinálise/ antígeno urinário — não sorologia.', icon: 'Droplets' },
          { label: 'Cultura', detail: 'Isolamento do microrganismo — outro método.', icon: 'Microscope' },
          { label: 'PCR sangue total', detail: 'Material genético — não definição clássica de sorologia.', icon: 'Dna' },
        ],
        footer_rule: 'Sorologia = anticorpos no soro',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: o que é exame sorológico.',
          'Soro = plasma sem fibrinogênio — amostra de tubo vermelho/amarelo.',
          'Sorologia detecta resposta humoral (anticorpos) no soro.',
          'Eliminar cultura, antígeno urinário, hemocultura como definição.',
          'Marcar D — detecção de anticorpos no soro.',
          'Em similares: sorologia = Ig no soro — tubo soro seco/gel.',
        ],
        footer_rule: 'D = anticorpos no soro',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — sorologia',
        meta: slideMeta,
        content: 'SOROLOGIA — DECORE',
        rows: [
          { label: 'Material', value: 'Soro (tubo vermelho/amarelo)', badge: 'ok' },
          { label: 'Detecta', value: 'Anticorpos (IgM/IgG)', badge: 'hot' },
          { label: 'Não é', value: 'Cultura, PCR isolada, antígeno urinário', badge: 'warn' },
        ],
        footer_rule: 'Soro + anticorpos',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — SOROLOGIA IDECAN',
        items: [
          { label: 'Letra A — cultura', detail: 'Crescimento in vitro.', correct: 'Isola agente — não define sorologia.' },
          { label: 'Letra B — antígeno fecal', detail: 'Parasitologia.', correct: 'Outro material — eliminar.' },
          { label: 'Letra C — hemograma', detail: 'Série vermelha/branca.', correct: 'Hematologia — não sorologia.' },
          { label: 'Letra E — urina', detail: 'EAS/urocultura.', correct: 'Sorologia usa soro — D anticorpos.' },
          { label: 'Em outra banca…', detail: 'Pergunta tubo roxo.', correct: 'Sorologia = soro vermelho + anticorpos.' },
        ],
        footer_rule: 'Não confundir sorologia com cultura',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'ieses-enfermagem-coleta-de-exames-laboratoriais-1779563248005-8': {
    family: 'conceito',
    guideline: 'MS — fase pré-analítica: coleta inadequada compromete precisão diagnóstica do resultado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pré-analítico — precisão',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Coleta correta garante…', icon: 'Target' },
          { label: 'Precisão diagnóstica (C)', detail: 'Resultado fiel ao estado clínico — qualidade pré-analítica.', icon: 'Check' },
          { label: 'Velocidade laudo', detail: 'Logística lab — não é o foco da coleta.', icon: 'Clock' },
          { label: 'Custo financeiro', detail: 'Gestão — secundário ao cuidado.', icon: 'DollarSign' },
          { label: 'Pegadinha — conforto apenas', detail: 'Conforto importa, mas núcleo = confiabilidade do exame.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Coleta certa = resultado confiável',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: finalidade da coleta correta de material biológico.',
          'Erro pré-analítico (identificação, hemólise, volume) distorce diagnóstico.',
          'Coleta adequada assegura precisão/confiabilidade do resultado.',
          'Eliminar alternativas sobre custo, rapidez administrativa, estética.',
          'Marcar C — precisão do diagnóstico.',
          'Em similares: pré-analítico = base da precisão diagnóstica.',
        ],
        footer_rule: 'C = precisão diagnóstica',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — pré-analítico',
        meta: slideMeta,
        content: 'FASE PRÉ-ANALÍTICA',
        rows: [
          { label: 'Identificação', value: 'Erro = resultado no paciente errado', badge: 'hot' },
          { label: 'Técnica', value: 'Hemólise/ volume alteram analitos', badge: 'warn' },
          { label: 'Objetivo', value: 'Precisão e confiabilidade diagnóstica', badge: 'hot' },
        ],
        footer_rule: 'Coleta = primeiro elo do diagnóstico',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ISES PRÉ-ANALÍTICO',
        items: [
          { label: 'Letra A — reduzir custos', detail: 'Gestão hospitalar.', correct: 'Secundário — não finalidade principal da coleta correta.' },
          { label: 'Letra B — agilizar fila', detail: 'Organização.', correct: 'Logística ≠ precisão diagnóstica.' },
          { label: 'Letra D — conforto exclusivo', detail: 'Humanização.', correct: 'Importante, mas gabarito é precisão (C).' },
          { label: 'Letra E — evitar retrabalho admin', detail: 'Papelada.', correct: 'Precisão clínica prevalece — marcar C.' },
          { label: 'Em outra banca…', detail: 'Pergunta ordem tubos.', correct: 'Pré-analítico sempre volta à confiabilidade do resultado.' },
        ],
        footer_rule: 'Resultado confiável = coleta correta',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'igeduc-enfermagem-coleta-de-exames-laboratoriais-1779562716126-2': {
    family: 'conceito',
    branch: 'coleta_tecnica_venosa',
    guideline: 'MS/Anvisa — ESF: enfermagem prepara, orienta e realiza coleta conforme protocolo',
    sources: [MS_SOURCE, POTTER_SOURCE, CLSI_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'ESF — papel da enfermagem',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Atribuição do técnico/enfermagem na coleta ESF.', icon: 'Users' },
          { label: 'A — preparar/orientar/coletar', detail: 'Triade completa do profissional na atenção básica.', icon: 'Check' },
          { label: 'Só orientar', detail: 'Incompleto — ESF coleta no território.', icon: 'XCircle' },
          { label: 'Só transportar', detail: 'Logística parcial — não esgota papel.', icon: 'Truck' },
          { label: 'Delegar 100% ao lab', detail: 'ESF realiza coleta de rotina — não só encaminha.', icon: 'Ban' },
        ],
        footer_rule: 'ESF = preparar + orientar + coletar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: função do profissional de enfermagem na coleta na ESF.',
          'Atenção básica integra educação, preparo e execução da coleta.',
          'Eliminar alternativas que restringem a orientação ou transporte isolado.',
          'Marcar A — preparar o paciente, orientar e realizar a coleta.',
          'Em similares: ESF — enfermagem faz pré-coleta + coleta + orientação.',
        ],
        footer_rule: 'A = preparar, orientar e coletar',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — ESF coleta',
        meta: slideMeta,
        content: 'ESF — ATRIBUIÇÕES',
        rows: [
          { label: 'Preparar', value: 'Jejum, identificação, material', badge: 'ok' },
          { label: 'Orientar', value: 'Paciente/família sobre procedimento', badge: 'ok' },
          { label: 'Coletar', value: 'Executar punção/amostra conforme protocolo', badge: 'hot' },
        ],
        footer_rule: 'Triade na atenção básica',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ESF IGEDUC',
        items: [
          { label: 'Letra B — só orientar', detail: 'Educação sem execução.', correct: 'ESF também coleta — incompleto.' },
          { label: 'Letra C — só transportar', detail: 'Logística.', correct: 'Transporte é etapa, não papel total.' },
          { label: 'Letra D — encaminhar sem coletar', detail: 'Delegação total.', correct: 'Profissional coleta na ESF — A correto.' },
          { label: 'Letra E — prescrever exames', detail: 'Médico prescreve.', correct: 'Enfermagem executa/orienta — marcar A.' },
          { label: 'Em outra banca…', detail: 'Biossegurança ID+higiene.', correct: 'Papel amplo ESF = preparar/orientar/coletar.' },
        ],
        footer_rule: 'Não reduzir enfermagem a transporte',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },
};

runHandcraft(LOTE, SPECS, 'handcraft:coleta-g10', BRANCH_DEFAULT);
