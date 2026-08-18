#!/usr/bin/env tsx
/**
 * Handcraft golden-v1 — coleta-de-exames-laboratoriais-g12 (8 slugs).
 *
 *   npx tsx scripts/handcraft-coleta-de-exames-laboratoriais-g12.ts
 */
import {
  CLSI_SOURCE,
  MS_PNI_SOURCE,
  MS_SOURCE,
  POTTER_SOURCE,
  cleanPdfNoise,
  runHandcraft,
  slideMeta,
  type Pack,
  type Q,
} from './handcraft-coleta-shared';

const LOTE = 'coleta-de-exames-laboratoriais-g12';
const BRANCH_DEFAULT = 'coleta_generico';

const PEZINHO_FIGURE_FRAGMENT =
  '<p><strong>Teste do pezinho — cartão de papel filtro</strong> (transcrição da figura VUNESP):</p>' +
  '<p><strong>VI</strong> — área/borda externa do cartão: <em>não</em> preencher; manter margem limpa.</p>' +
  '<p><strong>VIII</strong> — preenchimento das círculos/indicações com gotas de sangue capilar, ' +
  'sem sobrepor bordas; secar horizontalmente antes de transportar.</p>' +
  '<p>Com base na figura transcrita acima, identifique a conduta correta de manuseio/preenchimento.</p>';

const SPECS: Record<string, Pack> = {
  'selecon-enfermagem-exames-complementares-1779563674260-7': {
    family: 'conceito',
    guideline: 'Potter — radiografia: artefato por movimento/partículas compromete interpretação — conduta C',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Radiografia — artefatos',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Artefato em radiografia — alternativa correta Selecon.', icon: 'Scan' },
          { label: 'Gabarito C', detail: 'Conduta/tipo de artefato conforme enunciado Selecon.', icon: 'Check' },
          { label: 'Movimento paciente', detail: 'Borra imagem — artefato clássico.', icon: 'Move' },
          { label: 'Posicionamento', detail: 'Centralização e inspiração reduzem artefatos.', icon: 'Target' },
          { label: 'Proteção', detail: 'Colimação e EPI — qualidade + segurança.', icon: 'Shield' },
        ],
        footer_rule: 'Artefato = imagem não anatômica',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: questão sobre artefato em radiografia (Selecon).',
          'Ler alternativas — identificar afirmativa alinhada ao enunciado.',
          'Eliminar opções que confundem artefato com anatomia patológica.',
          'Marcar C — gabarito oficial da banca.',
          'Em similares: artefato RX = movimento, dobra filme, objetos externos.',
        ],
        footer_rule: 'C = gabarito Selecon',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — RX qualidade',
        meta: slideMeta,
        content: 'RADIOGRAFIA — ARTEFATOS',
        rows: [
          { label: 'Movimento', value: 'Imagem borrada — repetir se necessário', badge: 'hot' },
          { label: 'Objetos', value: 'Retirar adornos, centralizar', badge: 'ok' },
          { label: 'Técnica', value: 'Colimação + inspiração profunda', badge: 'ok' },
        ],
        footer_rule: 'RX limpo = diagnóstico confiável',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — RX SELECON',
        items: [
          { label: 'Letra A', detail: 'Confunde patologia com artefato.', correct: 'Artefato é falha técnica — eliminar se incoerente.' },
          { label: 'Letra B', detail: 'Distrator plausível.', correct: 'Conferir enunciado — C é gabarito.' },
          { label: 'Letra D', detail: 'Inverte conduta.', correct: 'Marcar C conforme prova.' },
          { label: 'Letra E', detail: 'Exagera exposição.', correct: 'ALARA — C prevalece.' },
          { label: 'Em outra banca…', detail: 'Contraste iodado.', correct: 'Artefato RX = qualidade imagem — C Selecon.' },
        ],
        footer_rule: 'Repetir RX se artefato crítico',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'unifil-enfermagem-coleta-de-exames-laboratoriais-1779562768558-0': {
    family: 'conceito',
    branch: 'coleta_capilar_glicemia',
    guideline: 'MS/PNI — teste do pezinho: coletar preferencialmente 48 h de vida (3º–5º dia ideal triagem)',
    sources: [MS_PNI_SOURCE, MS_SOURCE, POTTER_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pezinho — timing PNI',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Momento ideal coleta teste do pezinho.', icon: 'Baby' },
          { label: '48 h de vida', detail: 'PNI: após 48 h — metabolitos estabilizados pós-alimentação.', icon: 'Clock' },
          { label: 'Antes 24 h', detail: 'Falso negativo PKU — evitar coleta precoce.', icon: 'XCircle' },
          { label: 'Papel filtro', detail: 'Punção calcanhar — gotas no cartão.', icon: 'Droplet' },
          { label: 'Secagem horizontal', detail: 'Evitar empilhar cartões úmidos.', icon: 'Layers' },
        ],
        footer_rule: 'Pezinho ≥48 h de vida (PNI)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: idade/tempo ideal para teste do pezinho.',
          'MS/PNI recomenda coleta a partir de 48 horas de vida.',
          'Eliminar “imediato ao nascer” ou “após 7 dias” como ideal único.',
          'Marcar alternativa com 48 h (conforme opções Unifil).',
          'Em similares: pezinho PNI — 48 h mínimo; 3º–5º dia janela clássica.',
        ],
        footer_rule: '48 h = número PNI',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — triagem neonatal',
        meta: slideMeta,
        content: 'TESTE DO PEZINHO — PNI',
        rows: [
          { label: 'Timing', value: '≥48 h de vida — ideal 3º–5º dia', badge: 'hot' },
          { label: 'Material', value: 'Papel filtro — sangue capilar calcanhar', badge: 'ok' },
          { label: 'Evitar', value: '<48 h — falsos negativos PKU', badge: 'warn' },
        ],
        footer_rule: 'Decore 48 h PNI',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PEZINHO UNIFIL',
        items: [
          { label: 'Coleta ao nascer', detail: 'Precoce.', correct: 'Antes 48 h — risco falso negativo PKU.' },
          { label: 'Após 30 dias', detail: 'Tardio demais.', correct: 'Triagem neonatal perde janela — 48 h ideal.' },
          { label: 'Soro venoso', detail: 'Material errado.', correct: 'Pezinho = capilar em papel filtro.' },
          { label: 'Urina', detail: 'Outro exame.', correct: 'Pezinho sangue seco — 48 h.' },
          { label: 'Em outra banca…', detail: 'Manuseio cartão borda.', correct: 'Timing PNI = 48 h mínimo.' },
        ],
        footer_rule: '48 h antes de descartar triagem',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'unifil-enfermagem-exames-laboratoriais-1779563646977-7': {
    family: 'conceito',
    branch: 'coleta_jejum_preparo',
    guideline: 'MS — etanol: abstinência mínima 72 h antes; evitar álcool que altera resultado',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Etanol — preparo 72 h',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Orientação pré-exame de etanol/álcool.', icon: 'Wine' },
          { label: '72 h abstinência', detail: 'Evitar bebidas alcoólicas 3 dias antes — clearance completa.', icon: 'Clock' },
          { label: 'Jejum 8 h', detail: 'Outros exames — etanol pede abstinência alcoólica específica.', icon: 'Utensils' },
          { label: 'Medicamentos', detail: 'Informar remédios com álcool (xaropes).', icon: 'Pill' },
          { label: 'Pegadinha 24 h', detail: 'Insuficiente para banca Unifil.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Etanol = 72 h sem álcool',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: preparo do paciente para dosagem de etanol.',
          'Álcool residual altera resultado — abstinência prolongada necessária.',
          'Eliminar 12 h, 24 h, 48 h se banca pede 72 h.',
          'Marcar alternativa com abstinência de 72 horas.',
          'Em similares: etanol sérico/urinário — 72 h sem bebida alcoólica.',
        ],
        footer_rule: '72 h abstinência alcoólica',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — preparo etanol',
        meta: slideMeta,
        content: 'ETANOL — PREPARO',
        rows: [
          { label: 'Abstinência', value: '72 h (3 dias) sem álcool', badge: 'hot' },
          { label: 'Evitar', value: 'Cerveja, vinho, destilados, xaropes alcoólicos', badge: 'warn' },
          { label: 'Jejum', value: 'Conforme protocolo lab — foco é álcool', badge: 'ok' },
        ],
        footer_rule: 'Decore 72 h etanol',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ETANOL UNIFIL',
        items: [
          { label: '24 h sem álcool', detail: 'Curto.', correct: 'Insuficiente — banca pede 72 h.' },
          { label: '48 h', detail: 'Metade do ideal.', correct: '72 h completas — eliminar.' },
          { label: 'Jejum só 8 h', detail: 'Confunde exames.', correct: 'Abstinência alcoólica 72 h — foco etanol.' },
          { label: 'Álcool gel mãos', detail: 'Tópico.', correct: 'Orientar bebidas — 72 h abstinência.' },
          { label: 'Em outra banca…', detail: 'GGT com álcool.', correct: 'Etanol dosagem = 72 h sem bebida.' },
        ],
        footer_rule: '3 dias = 72 h',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'univali-enfermagem-exames-complementares-1779563674260-1': {
    family: 'conceito',
    guideline: 'MS — pré-hipertensão: PA 130–139/85–89 mmHg; 138/86 enquadra pré-hipertensão',
    slides: [
      {
        type: 'concept_map',
        slide_title: 'PA — pré-hipertensão',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Classificar PA 138 × 86 mmHg.', icon: 'Heart' },
          { label: 'Pré-hipertensão', detail: '130–139 / 85–89 — risco futuro HAS.', icon: 'TrendingUp' },
          { label: 'Normal', detail: '<120/<80.', icon: 'Check' },
          { label: 'Estágio 1', detail: '140–159/90–99.', icon: 'Gauge' },
          { label: '138/86', detail: 'Dentro faixa pré-hipertensão — gabarito Univali.', icon: 'Activity' },
        ],
        footer_rule: '138/86 = pré-hipertensão',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: classificação de PA 138/86 mmHg.',
          'Sistólica 138 (130–139) e diastólica 86 (85–89) = pré-hipertensão.',
          'Eliminar normal, estágio 1 e crise.',
          'Marcar alternativa “pré-hipertensão”.',
          'Em similares: 130–139/85–89 = pré-hipertensão MS.',
        ],
        footer_rule: 'Pré-hipertensão = 130–139/85–89',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — classificação PA',
        meta: slideMeta,
        content: 'PA — FAIXAS MS',
        rows: [
          { label: 'Normal', value: '<120/<80', badge: 'ok' },
          { label: 'Pré-hipertensão', value: '130–139 / 85–89', badge: 'hot' },
          { label: 'Estágio 1', value: '140–159 / 90–99', badge: 'warn' },
        ],
        footer_rule: '138/86 cai em pré-hipertensão',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PA UNIVALI',
        items: [
          { label: 'Normal', detail: 'Subestima risco.', correct: '138/86 acima normal — pré-hipertensão.' },
          { label: 'Estágio 1', detail: 'Precoce.', correct: 'Ainda não 140/90 — pré-hipertensão.' },
          { label: 'Estágio 2', detail: 'Exagero.', correct: '160/100+ — não 138/86.' },
          { label: 'Hipotensão', detail: 'Inverso.', correct: 'PA elevada limítrofe — pré-hipertensão.' },
          { label: 'Em outra banca…', detail: 'HAS estágio 2 160/100.', correct: '138/86 = pré-hipertensão.' },
        ],
        footer_rule: 'Limítrofe ≠ normal',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-coleta-de-exames-laboratoriais-1779563165114-8': {
    family: 'text_fragment',
    branch: 'coleta_capilar_glicemia',
    guideline: 'MS/PNI — pezinho: preencher círculos sem invadir borda (VI); secar horizontal (VIII)',
    sources: [MS_PNI_SOURCE, MS_SOURCE, POTTER_SOURCE],
    patchQuestion: (q: Q) => ({
      ...q,
      meta: { ...q.meta, figure_policy: 'transcribed' as const },
      question_data: {
        ...q.question_data,
        text_fragment: PEZINHO_FIGURE_FRAGMENT,
        instruction: 'Com base na figura transcrita acima, assinale a alternativa correta sobre o teste do pezinho.',
      },
    }),
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pezinho — figura VI e VIII',
        meta: slideMeta,
        items: [
          { label: 'Figura transcrita', detail: 'VI = margem/borda; VIII = preenchimento círculos.', icon: 'FileText' },
          { label: 'Borda livre (VI)', detail: 'Não preencher área externa — identificação e leitura óptica.', icon: 'Square' },
          { label: 'Gotas nos círculos (VIII)', detail: 'Saturar círculos sem sobrepor bordas.', icon: 'Droplet' },
          { label: 'Secagem', detail: 'Horizontal — evitar hemólise/contato.', icon: 'Wind' },
          { label: 'Capilar calcanhar', detail: 'Material pezinho — não venoso em tubo.', icon: 'Baby' },
        ],
        footer_rule: 'Respeitar borda + círculos saturados',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: figura VI e VIII — conduta correta pezinho.',
          'VI: preservar borda/margem do cartão — não manchar.',
          'VIII: preencher círculos indicados com gotas capilares adequadas.',
          'Eliminar alternativas que preenchem borda ou secam vertical empilhado.',
          'Marcar alternativa alinhada à figura (gabarito VUNESP da prova).',
          'Em similares: pezinho — borda limpa + círculos preenchidos + secagem horizontal.',
        ],
        footer_rule: 'Figura VI/VIII = técnica cartão',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — cartão pezinho',
        meta: slideMeta,
        content: 'PAPEL FILTRO — PEZINHO',
        rows: [
          { label: 'Borda (VI)', value: 'Não preencher margem externa', badge: 'hot' },
          { label: 'Círculos (VIII)', value: 'Gotas capilares saturando área', badge: 'hot' },
          { label: 'Secagem', value: 'Horizontal 4 h ambiente', badge: 'ok' },
        ],
        footer_rule: 'Cartão inválido se borda suja',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — PEZINHO VUNESP',
        items: [
          { label: 'Preencher borda', detail: 'Viola VI.', correct: 'Margem deve ficar limpa — rejeição lab.' },
          { label: 'Uma gota insuficiente', detail: 'Círculo pálido.', correct: 'Saturar círculos VIII — volume adequado.' },
          { label: 'Empilhar cartões úmidos', detail: 'Mancha.', correct: 'Secar horizontal separado.' },
          { label: 'Tubo EDTA', detail: 'Material venoso.', correct: 'Pezinho = capilar papel filtro.' },
          { label: 'Em outra banca…', detail: '48 h timing.', correct: 'Figura = técnica preenchimento borda/círculos.' },
        ],
        footer_rule: 'Borda limpa = leitura válida',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'vunesp-enfermagem-coleta-de-exames-laboratoriais-1779563248005-5': {
    family: 'conceito',
    branch: 'coleta_capilar_glicemia',
    guideline: 'MS/PNI — manuseio cartão pezinho: não tocar área de coleta; segurar pelas bordas (C)',
    sources: [MS_PNI_SOURCE, MS_SOURCE, POTTER_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Pezinho — manuseio cartão',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Manuseio correto do cartão de papel filtro.', icon: 'Hand' },
          { label: 'C — pelas bordas', detail: 'Evitar tocar círculos de coleta — contamina/leitura inválida.', icon: 'Check' },
          { label: 'Dobrar cartão', detail: 'Danifica área reagente.', icon: 'XCircle' },
          { label: 'Empilhar úmido', detail: 'Manchas cruzadas.', icon: 'Layers' },
          { label: 'Luvas com pó', detail: 'Contaminação proteica.', icon: 'AlertTriangle' },
        ],
        footer_rule: 'Segurar bordas — não tocar círculos',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: manuseio do cartão teste do pezinho.',
          'Contato na área de coleta invalida amostra.',
          'Eliminar dobrar, empilhar úmido, tocar círculos.',
          'Marcar C — manusear pelas bordas/extremidades.',
          'Em similares: pezinho — bordas limpas, círculos intocados antes secagem.',
        ],
        footer_rule: 'C = manuseio pelas bordas',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — manuseio',
        meta: slideMeta,
        content: 'CARTÃO PEZINHO',
        rows: [
          { label: 'Segurar', value: 'Pelas bordas — longe dos círculos', badge: 'hot' },
          { label: 'Evitar', value: 'Dobra, umidade cruzada, pó', badge: 'warn' },
          { label: 'Secagem', value: 'Horizontal antes transporte', badge: 'ok' },
        ],
        footer_rule: 'Dedo no círculo = cartão inválido',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — MANUSEIO VUNESP',
        items: [
          { label: 'Letra A — tocar círculos', detail: 'Contamina.', correct: 'Inválida amostra — eliminar.' },
          { label: 'Letra B — dobrar ao meio', detail: 'Danifica filtro.', correct: 'Cartão plano — C bordas.' },
          { label: 'Letra D — transporte úmido', detail: 'Sem secar.', correct: 'Secar horizontal — manuseio borda.' },
          { label: 'Letra E — envelope plástico fechado', detail: 'Umidade.', correct: 'Saco papel — C manuseio.' },
          { label: 'Em outra banca…', detail: '48 h coleta.', correct: 'Manuseio = pelas bordas (C).' },
        ],
        footer_rule: 'Borda limpa + mãos longe círculos',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'igeduc-enfermagem-coleta-de-exames-laboratoriais-1779563248005-2': {
    family: 'certo_errado',
    branch: 'coleta_tecnica_venosa',
    guideline: 'CLSI — ordem tubos com escalpe: citrato primeiro; afirmativa errada = B Errado',
    sources: [MS_SOURCE, POTTER_SOURCE, CLSI_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'Escalpe — ordem tubos C/E',
        meta: slideMeta,
        items: [
          { label: 'Comando C/E', detail: 'Escalpe + ordem tubos — julgar Certo/Errado.', icon: 'Syringe' },
          { label: 'B — Errado', detail: 'Sequência apresentada contraria ordem normativa.', icon: 'XCircle' },
          { label: 'Citrato primeiro', detail: 'Azul abre quando na sequência multiparamétrica.', icon: 'Droplet' },
          { label: 'Contaminação cruzada', detail: 'Ordem invertida altera analitos.', icon: 'AlertTriangle' },
          { label: 'Escalpe', detail: 'Mesma regra CLSI do vácuo multiponto.', icon: 'ListOrdered' },
        ],
        footer_rule: 'B = Errado (ordem falsa)',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: item Certo/Errado sobre escalpe e tubo de coagulação/ordem.',
          'Afirmativa descreve sequência incorreta de tubos.',
          'CLSI: citrato (azul) primeiro quando presente — ordem da assertiva falha.',
          'Marcar B — Errado.',
          'Em similares: escalpe obedece mesma ordem GP41 — sequência falsa = Errado.',
        ],
        footer_rule: 'B = Errado',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — ordem escalpe',
        meta: slideMeta,
        content: 'ESCALPE + ORDEM',
        rows: [
          { label: '1º', value: 'Citrato azul (se pedido)', badge: 'hot' },
          { label: 'Sequência', value: 'Soro → heparina → fluoreto → EDTA', badge: 'ok' },
          { label: 'C/E', value: 'Assertiva literal — ordem errada = Errado', badge: 'warn' },
        ],
        footer_rule: 'Ordem importa com escalpe',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ESCALPE IGEDUC',
        items: [
          { label: 'Letra A — Certo', detail: 'Aceita ordem errada.', correct: 'Sequência falsa — B Errado.' },
          { label: 'Confundir com punção', detail: 'Técnica agulha.', correct: 'Foco ordem tubos — B Errado.' },
          { label: 'EDTA primeiro', detail: 'Pegadinha comum.', correct: 'Citrato precede — assertiva Errada.' },
          { label: 'Ignorar escalpe', detail: 'Achar regra diferente.', correct: 'Mesma CLSI — B Errado.' },
          { label: 'Em outra banca…', detail: 'Material hemograma.', correct: 'C/E ordem = B Errado nesta prova.' },
        ],
        footer_rule: 'C/E = assertiva literal',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },

  'igeduc-enfermagem-infeccoes-no-contexto-da-biosseguranca-1780000569658-7': {
    family: 'conceito',
    branch: 'coleta_tecnica_venosa',
    guideline: 'MS/Anvisa — coleta sangue ESF: identificação, higienização mãos, material estéril descartável (C)',
    sources: [MS_SOURCE, POTTER_SOURCE, CLSI_SOURCE],
    slides: [
      {
        type: 'concept_map',
        slide_title: 'ESF — coleta sangue segura',
        meta: slideMeta,
        items: [
          { label: 'Comando', detail: 'Coleta de sangue segura na ESF.', icon: 'Shield' },
          { label: 'C — ID + HH + estéril', detail: 'Triade biossegurança pré-analítica.', icon: 'Check' },
          { label: 'Sem identificação', detail: 'Erro grave troca amostra.', icon: 'XCircle' },
          { label: 'Garrote reutilizado', detail: 'Violação descartável.', icon: 'Ban' },
          { label: 'Descarte lixo comum', detail: 'Perfurocortante proibido.', icon: 'Trash2' },
        ],
        footer_rule: 'C = identificar + higienizar + estéril',
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: slideMeta,
        steps: [
          'Comando: alternativa correta coleta sangue ESF.',
          'Eliminar A (sem ID), B (garrote reutilizado), D (descarte errado).',
          'Marcar C — identificação, higienização mãos, material estéril descartável.',
          'Em similares: ESF biossegurança = C (igeduc g11/g12).',
        ],
        footer_rule: 'C = conduta segura ESF',
      },
      {
        type: 'golden_rule',
        slide_title: 'Referência — ESF sangue',
        meta: slideMeta,
        content: 'COLETA ESF',
        rows: [
          { label: 'Identificação', value: 'Pulseira + confirmar nome', badge: 'hot' },
          { label: 'HH', value: 'Antes e após procedimento', badge: 'hot' },
          { label: 'Material', value: 'Estéril descartável', badge: 'ok' },
        ],
        footer_rule: 'Nunca coletar sem identificar',
      },
      {
        type: 'danger_zone',
        bullet_style: 'x_icon',
        meta: slideMeta,
        content: 'PEGADINHAS — ESF IGEDUC',
        items: [
          { label: 'Letra A — sem ID', detail: 'Troca risco.', correct: 'Eliminar — C correto.' },
          { label: 'Letra B — garrote reutilizado', detail: 'Contaminação.', correct: 'Descartável — eliminar.' },
          { label: 'Letra D — lixo comum', detail: 'Agulha.', correct: 'Coletor perfuro — eliminar.' },
          { label: 'Letra E — recapear agulha', detail: 'Acidente.', correct: 'Descarte direto — C.' },
          { label: 'Em outra banca…', detail: 'Papel ESF preparar/orientar.', correct: 'Sangue ESF = C ID+HH+estéril.' },
        ],
        footer_rule: 'Biossegurança ESF = C',
      },
    ],
    cleanInstruction: cleanPdfNoise,
  },
};

runHandcraft(LOTE, SPECS, 'handcraft:coleta-g12', BRANCH_DEFAULT);
