#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — coleta-de-exames-laboratoriais-g11 (8 slugs).
 *
 *   npx tsx scripts/handcraft-coleta-de-exames-laboratoriais-g11.ts
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

const LOTE = 'coleta-de-exames-laboratoriais-g11';
const BRANCH_DEFAULT = 'coleta_generico';

const SPECS: Record<string, Pack> = {
  'igeduc-enfermagem-coleta-de-exames-laboratoriais-1779562716126-3': {
    family: 'conceito',
    branch: 'coleta_tecnica_venosa',
    guideline: 'MS/Anvisa — coleta sangue segura: identificar paciente, higienizar mãos, material estéril descartável',
    sources: [MS_SOURCE, POTTER_SOURCE, CLSI_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Coleta sangue — conduta correta',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Alternativa CORRETA sobre coleta de sangue.', icon: 'Shield' },
          { label: 'C — ID + higiene + estéril', detail: 'Triade mínima de segurança pré-analítica.', icon: 'Check' },
          { label: 'Sem identificação', detail: 'Erro grave — risco troca de amostra.', icon: 'XCircle' },
          { label: 'Garrote reutilizado', detail: 'Violação biossegurança.', icon: 'Ban' },
          { label: 'Descarte comum', detail: 'Perfurocortante exige caixa rígida.', icon: 'Trash2' },
        ],
        footer_rule: 'C = identificar + higienizar + estéril descartável',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: coleta de sangue — marque a alternativa correta.',
          'Eliminar A (sem identificação do paciente).',
          'Eliminar B (garrote não descartável/reutilizado).',
          'Eliminar D/E (descarte inadequado de perfurocortante).',
          'Marcar C — identificar paciente, higienizar mãos, material estéril descartável.',
          'Em similares: biossegurança venosa = ID + HH + estéril descartável.',
        ],
        footer_rule: 'C = conduta segura',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — coleta segura',
        meta: slideMeta,
        content: 'COLETA VENOSA — CHECKLIST',
        rows: [
          { label: 'Identificação', value: 'Dois identificadores — pulseira + verbal', badge: 'hot' },
          { label: 'Higiene', value: 'Higienização das mãos (HH)', badge: 'hot' },
          { label: 'Material', value: 'Estéril e descartável — uso único', badge: 'ok' },
          { label: 'Descarte', value: 'Perfurocortante em coletor rígido', badge: 'warn' },
        ],
        footer_rule: 'Nunca pular identificação',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — COLETA IGEDUC',
        items: [
          { label: 'Letra A — sem identificação', detail: 'Pula pulseira/nome.', correct: 'Erro pré-analítico grave — eliminar.' },
          { label: 'Letra B — garrote reutilizado', detail: 'Contaminação cruzada.', correct: 'Material descartável — eliminar.' },
          { label: 'Letra D — lixo comum', detail: 'Agulha no lixo.', correct: 'Perfurocortante exige coletor — eliminar.' },
          { label: 'Letra E — agulha recapeada', detail: 'Risco acidente.', correct: 'Descarte sem recapear — C é gabarito.' },
          { label: 'Em outra banca…', detail: 'Ordem de tubos.', correct: 'Segurança = ID + HH + estéril — C.' },
        ],
        footer_rule: 'Biossegurança não negocia',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-consulpam-enfermagem-exames-complementares-1779563674260-5': {
    family: 'conceito',
    guideline: 'MS/Diretrizes — HAS estágio 2: PA 160–179 × 100–109 mmHg',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'HAS — classificação estágio 2',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Pressão arterial compatível com hipertensão estágio 2.', icon: 'Heart' },
          { label: 'D — 160–179/100–109', detail: 'Faixa oficial estágio 2 (MS/ VII Diretriz).', icon: 'Activity' },
          { label: 'Pré-hipertensão', detail: '130–139/85–89 — estágio anterior.', icon: 'TrendingUp' },
          { label: 'Estágio 1', detail: '140–159/90–99.', icon: 'Gauge' },
          { label: 'Estágio 3', detail: '≥180/≥110 — crise/grave.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Estágio 2 = 160–179 / 100–109',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: valor de PA que classifica hipertensão estágio 2.',
          'Estágio 2: sistólica 160–179 mmHg E/OU diastólica 100–109 mmHg.',
          'Eliminar faixas de normal, pré-hipertensão, estágio 1 e 3.',
          'Marcar D — 160–179/100–109 mmHg.',
          'Em similares: decore estágio 2 = 160–179 sobre 100–109.',
        ],
        footer_rule: 'D = HAS estágio 2',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação PA',
        meta: slideMeta,
        content: 'HAS — ESTÁGIOS (MS)',
        rows: [
          { label: 'Normal', value: '<120/<80', badge: 'ok' },
          { label: 'Estágio 1', value: '140–159 / 90–99', badge: 'ok' },
          { label: 'Estágio 2', value: '160–179 / 100–109', badge: 'hot' },
          { label: 'Estágio 3', value: '≥180 / ≥110', badge: 'warn' },
        ],
        footer_rule: 'Estágio 2 = 160–179/100–109',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PA CONSULPAM',
        items: [
          { label: 'Letra A — 120/80', detail: 'Normal.', correct: 'Não é hipertensão — eliminar.' },
          { label: 'Letra B — 140/90', detail: 'Limite estágio 1.', correct: 'Estágio 1 — não estágio 2.' },
          { label: 'Letra C — 150/95', detail: 'Dentro estágio 1.', correct: 'Ainda não 160/100 — eliminar.' },
          { label: 'Letra E — 185/115', detail: 'Estágio 3.', correct: 'Acima do estágio 2 — marcar D.' },
          { label: 'Em outra banca…', detail: 'Pré-hipertensão 135/85.', correct: 'Estágio 2 fixo: 160–179/100–109.' },
        ],
        footer_rule: 'Não confundir estágios 1 e 2',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'instituto-verbena-enfermagem-coleta-de-exames-laboratoriais-1779563248005-6': {
    family: 'protocolo',
    branch: 'coleta_nao_sanguinea',
    guideline: 'Anvisa/MS COVID — desparamentação EPI: luvas → avental → HH → óculos → máscara → gorro',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'COVID — desparamentação EPI',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Sequência CORRETA de retirada de EPI COVID-19.', icon: 'ShieldOff' },
          { label: 'C — ordem Verbena', detail: 'Luvas → avental → HH → óculos → máscara → gorro.', icon: 'ListOrdered' },
          { label: 'Máscara primeiro', detail: 'Retirar máscara antes das luvas contamina mãos.', icon: 'XCircle' },
          { label: 'Avental por último', detail: 'Superfície contaminada — luvas saem primeiro.', icon: 'AlertTriangle' },
          { label: 'HH entre etapas', detail: 'Higienizar mãos após avental — passo explícito da banca.', icon: 'Sparkles' },
        ],
        footer_rule: 'Desparamentar: luvas primeiro — máscara quase no fim',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: sequência correta de desparamentação COVID-19.',
          'Regra: retirar primeiro o EPI mais contaminado (luvas).',
          'Sequência gabarito Verbena: luvas → avental → higienizar mãos → óculos → máscara → gorro.',
          'Eliminar ordens que invertem máscara/luvas ou omitam HH.',
          'Marcar C.',
          'Em similares: desparamentação COVID — luvas saem primeiro; HH após avental.',
        ],
        footer_rule: 'C = sequência Verbena',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — desparamentação',
        meta: slideMeta,
        content: 'COVID — RETIRADA EPI',
        rows: [
          { label: '1º', value: 'Luvas', badge: 'hot' },
          { label: '2º', value: 'Avental', badge: 'ok' },
          { label: '3º', value: 'Higienizar mãos', badge: 'hot' },
          { label: '4º–6º', value: 'Óculos → máscara → gorro', badge: 'ok' },
        ],
        footer_rule: 'Decore ordem da banca Verbena',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — DESPARAMENTAÇÃO',
        items: [
          { label: 'Letra A — máscara primeiro', detail: 'Contamina mãos nuas.', correct: 'Luvas retiram antes — eliminar A.' },
          { label: 'Letra B — gorro antes luvas', detail: 'Inverte sequência.', correct: 'Gorro é último em C — eliminar.' },
          { label: 'Letra D — avental antes luvas', detail: 'Superfície suja toca pele.', correct: 'Luvas primeiro — marcar C.' },
          { label: 'Letra E — sem HH', detail: 'Pula higienização.', correct: 'HH após avental na sequência C.' },
          { label: 'Em outra banca…', detail: 'Paramentação diferente.', correct: 'Desparamentação Verbena = C literal.' },
        ],
        footer_rule: 'Luvas saem primeiro sempre',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'itame-enfermagem-exames-complementares-1779563679414-4': {
    family: 'conceito',
    guideline: 'Potter — cadastro ambulatorial: ECG (eletrocardiograma) registra atividade elétrica cardíaca',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Cadastro — ECG',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Exame do cadastro ambulatorial — identificação correta.', icon: 'ClipboardList' },
          { label: 'D — Eletrocardiograma', detail: 'Registro gráfico da atividade elétrica cardíaca.', icon: 'Activity' },
          { label: 'Radiografia', detail: 'Imagem anatômica — não elétrica.', icon: 'Scan' },
          { label: 'Ecocardiograma', detail: 'Ultrassom cardíaco — outro exame.', icon: 'Heart' },
          { label: 'Espirometria', detail: 'Função pulmonar.', icon: 'Wind' },
        ],
        footer_rule: 'ECG = eletrocardiograma',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: qual exame compõe cadastro — eletrocardiograma.',
          'ECG avalia ritmo, frequência e condução elétrica.',
          'Eliminar RX, eco, espirometria como sinônimo de ECG.',
          'Marcar D — Eletrocardiograma.',
          'Em similares: cadastro ambulatorial inclui ECG de rotina.',
        ],
        footer_rule: 'D = Eletrocardiograma',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — ECG',
        meta: slideMeta,
        content: 'ECG — CONCEITO',
        rows: [
          { label: 'Nome', value: 'Eletrocardiograma (ECG)', badge: 'hot' },
          { label: 'Registra', value: 'Atividade elétrica cardíaca', badge: 'ok' },
          { label: 'Não é', value: 'RX, eco, espirometria', badge: 'warn' },
        ],
        footer_rule: 'ECG ≠ imagem anatômica',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — CADASTRO ITAME',
        items: [
          { label: 'Letra A — radiografia', detail: 'RX tórax.', correct: 'Imagem — não ECG.' },
          { label: 'Letra B — ecocardiograma', detail: 'US cardíaco.', correct: 'Anatomia/fluxo — não elétrico.' },
          { label: 'Letra C — espirometria', detail: 'Pulmão.', correct: 'Função respiratória — eliminar.' },
          { label: 'Letra E — teste ergométrico', detail: 'Esforço.', correct: 'Pode incluir ECG, mas nome pedido = Eletrocardiograma (D).' },
          { label: 'Em outra banca…', detail: '12 derivações.', correct: 'ECG = eletrocardiograma — D.' },
        ],
        footer_rule: 'Nome completo do exame',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'ivin-enfermagem-exames-laboratoriais-1779563559434-6': {
    family: 'conceito',
    branch: 'coleta_capilar_glicemia',
    guideline: 'MS/ADA — hipoglicemia: glicemia capilar <70 mg/dL; coleta capilar imediata',
    sources: [MS_SOURCE, POTTER_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Hipoglicemia — limiar capilar',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Valor que define hipoglicemia para conduta.', icon: 'Droplet' },
          { label: '<70 mg/dL', detail: 'Limiar clássico de hipoglicemia — glicemia capilar.', icon: 'AlertTriangle' },
          { label: 'Coleta capilar', detail: 'Punção digital — resultado imediato.', icon: 'Syringe' },
          { label: 'Pegadinha 100 mg/dL', detail: 'Ainda normal ou pré-diabetes — não hipoglicemia.', icon: 'XCircle' },
          { label: 'Sintomas adrenergicos', detail: 'Sudorese, tremor — confirmar com glicemia.', icon: 'Thermometer' },
        ],
        footer_rule: 'Hipoglicemia = <70 mg/dL capilar',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: valor de glicemia capilar que caracteriza hipoglicemia.',
          'Consenso clínico: <70 mg/dL (capilar/plasmático próximo).',
          'Eliminar 80, 100, 126 mg/dL (normal ou hiperglicemia).',
          'Marcar alternativa com <70 mg/dL.',
          'Em similares: hipoglicemia capilar — tratar abaixo de 70 mg/dL.',
        ],
        footer_rule: 'Gabarito = <70 mg/dL',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — glicemia capilar',
        meta: slideMeta,
        content: 'HIPOGLICEMIA — CORTE',
        rows: [
          { label: 'Hipoglicemia', value: '<70 mg/dL', badge: 'hot' },
          { label: 'Normal jejum', value: '70–99 mg/dL', badge: 'ok' },
          { label: 'Coleta', value: 'Capilar — glicosímetro', badge: 'ok' },
          { label: 'Conduta', value: '15 g carboidrato + reavaliar 15 min', badge: 'warn' },
        ],
        footer_rule: 'Decore 70 — limiar hipoglicemia',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — HIPOGLICEMIA IVIN',
        items: [
          { label: 'Letra com 100 mg/dL', detail: 'Normal.', correct: 'Não é hipoglicemia — eliminar.' },
          { label: 'Letra com 126 mg/dL', detail: 'Diabetes jejum.', correct: 'Hiperglicemia — não hipoglicemia.' },
          { label: 'Letra com 80 mg/dL', detail: 'Limite inferior normal.', correct: 'Ainda ≥70 — eliminar.' },
          { label: 'Confundir com HbA1c', detail: 'Unidade %.', correct: 'Capilar mg/dL — corte <70.' },
          { label: 'Em outra banca…', detail: 'Glicose sérica tubo cinza.', correct: 'Hipoglicemia aguda = capilar <70 mg/dL.' },
        ],
        footer_rule: '<70 = tratar hipoglicemia',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'lj-assessoria-enfermagem-coleta-de-exames-laboratoriais-1779562768558-7': {
    family: 'conceito',
    guideline: 'MS — fase pré-analítica: coleta correta garante qualidade/confiabilidade dos resultados laboratoriais',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Papel da coleta — qualidade',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Importância da coleta correta de amostras.', icon: 'Target' },
          { label: 'E — qualidade resultados', detail: 'Pré-analítico define confiabilidade do laudo.', icon: 'Check' },
          { label: 'Velocidade admin', detail: 'Secundário ao cuidado clínico.', icon: 'Clock' },
          { label: 'Redução custo', detail: 'Gestão — não núcleo técnico.', icon: 'DollarSign' },
          { label: 'Estética ambiente', detail: 'Conforto ≠ qualidade analítica.', icon: 'Palette' },
        ],
        footer_rule: 'Coleta certa = resultado confiável',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: papel/finalidade da coleta adequada.',
          'Erros pré-analíticos são principal causa de resultados inadequados.',
          'Coleta correta assegura qualidade dos resultados laboratoriais.',
          'Eliminar alternativas administrativas ou estéticas.',
          'Marcar E — qualidade dos resultados.',
          'Em similares: pré-analítico = qualidade do resultado — E.',
        ],
        footer_rule: 'E = qualidade dos resultados',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — pré-analítico',
        meta: slideMeta,
        content: 'COLETA — IMPACTO',
        rows: [
          { label: 'Identificação', value: 'Evita troca de paciente', badge: 'hot' },
          { label: 'Técnica', value: 'Hemólise/volume alteram analitos', badge: 'warn' },
          { label: 'Objetivo', value: 'Qualidade e confiabilidade do laudo', badge: 'hot' },
        ],
        footer_rule: 'Pré-analítico = 70% erros lab',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — LJ ASSESSORIA',
        items: [
          { label: 'Letra A — agilizar fila', detail: 'Organização.', correct: 'Não é finalidade principal — eliminar.' },
          { label: 'Letra B — reduzir custos', detail: 'Financeiro.', correct: 'Secundário — marcar E.' },
          { label: 'Letra C — conforto exclusivo', detail: 'Humanização.', correct: 'Importante, mas E qualidade prevalece.' },
          { label: 'Letra D — evitar reclamação', detail: 'Satisfação.', correct: 'Qualidade clínica — E.' },
          { label: 'Em outra banca…', detail: 'Precisão diagnóstica (Ieses).', correct: 'Mesmo eixo — qualidade/confiabilidade resultado.' },
        ],
        footer_rule: 'Resultado confiável = coleta correta',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'objetiva-concursos-enfermagem-coleta-de-exames-laboratoriais-1779562716126-8': {
    family: 'conceito',
    guideline: 'MS/CLSI — gasometria arterial: transporte ≤15 min ou gelo; amostra heparinizada sem bolhas',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Gasometria — transporte',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Transporte de amostra para gasometria arterial.', icon: 'Wind' },
          { label: '≤15 min', detail: 'Análise imediata ou transporte rápido — metabolismo eritrócito altera pH/pO₂.', icon: 'Clock' },
          { label: 'Gelo se atraso', detail: 'Resfriar reduz metabolismo celular.', icon: 'Snowflake' },
          { label: 'Bolhas', detail: 'Expulsar ar — altera pO₂.', icon: 'AlertTriangle' },
          { label: 'Tubo heparinizado', detail: 'Arterial com heparina líquida/lithium.', icon: 'Syringe' },
        ],
        footer_rule: 'Gasometria = rápido · sem bolhas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: conduta correta no transporte de gasometria.',
          'Amostra arterial sensível — analisar em até ~15 minutos.',
          'Eliminar transporte prolongado sem refrigeração.',
          'Marcar alternativa que indica transporte imediato/≤15 min (ou gelo se delay).',
          'Em similares: gasometria arterial — 15 min máximo ou gelo.',
        ],
        footer_rule: 'Transporte ≤15 min',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — gasometria',
        meta: slideMeta,
        content: 'GASOMETRIA — PRÉ-ANALÍTICO',
        rows: [
          { label: 'Tempo', value: 'Analisar ≤15 min ou resfriar', badge: 'hot' },
          { label: 'Bolhas', value: 'Eliminar ar da seringa', badge: 'warn' },
          { label: 'Tubo', value: 'Heparina arterial', badge: 'ok' },
        ],
        footer_rule: '15 min = número da gasometria',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — GASOMETRIA OBJETIVA',
        items: [
          { label: 'Transporte 1 h ambiente', detail: 'Metabolismo altera valores.', correct: 'Inviável — máximo ~15 min ou gelo.' },
          { label: 'Agitar com bolhas', detail: 'Ar dissolve O₂.', correct: 'Expulsar bolhas — falsos altos pO₂.' },
          { label: 'Tubo EDTA', detail: 'Roxo hematologia.', correct: 'Gasometria = heparina arterial.' },
          { label: 'Freezer', detail: 'Congelamento.', correct: 'Resfriar sim — congelar não para gasometria.' },
          { label: 'Em outra banca…', detail: 'Gasometria venosa.', correct: 'Mesmo princípio tempo curto — 15 min.' },
        ],
        footer_rule: 'Tempo altera pH e gases',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'objetiva-concursos-enfermagem-exames-laboratoriais-1779563621885-7': {
    family: 'vf',
    guideline: 'Barros — laboratório médico: afirmativas I e II corretas sobre papel/função do lab clínico',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Lab médico — I e II',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Afirmativas sobre laboratório médico — I e II corretas.', icon: 'ClipboardList' },
          { label: 'Item I', detail: 'Função diagnóstica/monitoramento — verdadeiro.', icon: 'Check' },
          { label: 'Item II', detail: 'Controle qualidade pré-analítico — verdadeiro.', icon: 'Shield' },
          { label: 'Item III', detail: 'Falso ou incompleto — excluir combinações com III.', icon: 'XCircle' },
          { label: 'Barros referência', detail: 'Banca Objetiva cita funções clássicas do lab.', icon: 'BookOpen' },
        ],
        footer_rule: 'Gabarito = I e II corretas',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: analise afirmativas I, II e III sobre laboratório médico.',
          'I descreve papel diagnóstico — correta.',
          'II aborda qualidade/controle — correta.',
          'III contém erro — excluir alternativas que incluem III isoladamente errada.',
          'Marcar alternativa “I e II apenas” (conforme opções da prova).',
          'Em similares: lab médico — diagnóstico + qualidade = I e II.',
        ],
        footer_rule: 'I + II = gabarito Objetiva',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — lab clínico',
        meta: slideMeta,
        content: 'LABORATÓRIO MÉDICO',
        rows: [
          { label: 'Função', value: 'Diagnóstico, monitoramento, rastreio', badge: 'hot' },
          { label: 'Qualidade', value: 'Pré/analítico/pós-analítico', badge: 'ok' },
          { label: 'Equipe', value: 'Bioquímicos + técnicos + enfermagem coleta', badge: 'ok' },
        ],
        footer_rule: 'Lab = ciência + qualidade',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — BARROS OBJETIVA',
        items: [
          { label: 'Letra só I', detail: 'Parcial.', correct: 'II também correta — eliminar.' },
          { label: 'Letra só II', detail: 'Parcial.', correct: 'I também — marcar I+II.' },
          { label: 'Letra I II III', detail: 'Inclui III falsa.', correct: 'III errada — excluir.' },
          { label: 'Letra só III', detail: 'Inverte.', correct: 'I e II verdadeiras.' },
          { label: 'Em outra banca…', detail: 'VF quatro itens.', correct: 'Objetiva Barros = I e II corretas.' },
        ],
        footer_rule: 'Validar cada assertiva',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },
};

runHandcraft(LOTE, SPECS, 'handcraft:coleta-g11', BRANCH_DEFAULT);
