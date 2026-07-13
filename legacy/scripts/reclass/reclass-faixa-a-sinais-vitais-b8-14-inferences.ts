#!/usr/bin/env tsx
/** Classificações agente — Verificação de Sinais Vitais (faixa A, onda 5, lotes 08–14). */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type InferRow = {
  modulo_slug: string;
  suggested_subtopico: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
};

const BUCKET = 'Verificação de Sinais Vitais';
const OUT = 'artifacts/reclass/faixa-a/sinais-vitais';
const DCNT = 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis';

type ClassResult = { suggested: string; confidence: number; keep_current: boolean; rationale: string };

function getTopic(slug: string): string {
  const m = slug.match(/enfermagem-(.+)-\d{13}-\d$/);
  return m ? m[1]! : slug;
}

/** Overrides por leitura real de enunciados ambíguos ou semiologia. */
const OVERRIDES: Record<string, Omit<ClassResult, 'keep_current'> & { keep_current?: boolean }> = {
  'idecan-enfermagem-saude-do-idoso-1778712437306-5': {
    suggested: 'Processo de Enfermagem',
    confidence: 0.91,
    rationale: 'Exame físico do idoso — adaptações da avaliação, não técnica isolada de SV.',
  },
  'isba-enfermagem-semiologia-em-enfermagem-1779563542813-4': {
    suggested: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Via de temperatura mais próxima da central — aferição de SV.',
  },
  'instituto-verbena-enfermagem-semiologia-em-enfermagem-1779563531989-6': {
    suggested: BUCKET,
    confidence: 0.92,
    keep_current: true,
    rationale: 'Localização da artéria radial para verificação do pulso.',
  },
  'selecon-enfermagem-semiologia-em-enfermagem-1779563505333-2': {
    suggested: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Interpretação de valores de SV em pneumonia.',
  },
  'vunesp-enfermagem-semiologia-em-enfermagem-1779563531989-0': {
    suggested: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Classificação de padrões respiratórios a partir de FR/FC/PA.',
  },
  'unesc-enfermagem-semiologia-em-enfermagem-1779563549311-0': {
    suggested: BUCKET,
    confidence: 0.91,
    keep_current: true,
    rationale: 'Hipotensão ortostática — alteração de pressão arterial.',
  },
  'igeduc-enfermagem-semiologia-em-enfermagem-1779563486900-7': {
    suggested: DCNT,
    confidence: 0.92,
    rationale: 'Sinais de hipoglicemia no diabetes tipo 1 — DCNT.',
  },
  'igeduc-enfermagem-semiologia-em-enfermagem-1779563491765-5': {
    suggested: 'Saúde da Mulher',
    confidence: 0.93,
    rationale: 'Sinais de alerta para câncer de mama — saúde da mulher.',
  },
  'instituto-verbena-enfermagem-semiologia-em-enfermagem-1779563505333-8': {
    suggested: 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
    confidence: 0.93,
    rationale: 'Sintomas gerais da tuberculose — doença bacteriana.',
  },
  'vunesp-enfermagem-semiologia-em-enfermagem-1779563495719-2': {
    suggested: 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
    confidence: 0.93,
    rationale: 'Busca ativa de sintomático respiratório — tuberculose.',
  },
  'instituto-seletiva-enfermagem-semiologia-em-enfermagem-1779563517223-8': {
    suggested: 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    confidence: 0.94,
    rationale: 'Dengue com sinais de alarme — arbovirose viral.',
  },
  'selecon-enfermagem-semiologia-em-enfermagem-1779563537258-6': {
    suggested: 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
    confidence: 0.93,
    rationale: 'Prova do laço na triagem de dengue.',
  },
  'lj-assessoria-enfermagem-semiologia-em-enfermagem-1779563542813-6': {
    suggested: 'Doenças Respiratórias Crônicas (Asma, DPOC)',
    confidence: 0.92,
    rationale: 'Semiologia da asma na criança — DRC.',
  },
  'lj-assessoria-enfermagem-semiologia-em-enfermagem-1779563542813-5': {
    suggested: 'Oxigenoterapia e Cuidados Respiratórios',
    confidence: 0.91,
    rationale: 'Sinais de gravidade na insuficiência respiratória aguda.',
  },
  'ivin-enfermagem-semiologia-em-enfermagem-1779563531989-8': {
    suggested: 'Feridas e Queimaduras',
    confidence: 0.94,
    rationale: 'Classificação de queimadura em criança.',
  },
  'reis-e-reis-enfermagem-semiologia-em-enfermagem-1779563521756-7': {
    suggested: 'Saúde da Mulher',
    confidence: 0.91,
    rationale: 'Cefalohematoma do recém-nascido — puerpério/neonatal.',
  },
  'vunesp-enfermagem-semiologia-em-enfermagem-1779563527042-7': {
    suggested: 'Saúde da Mulher',
    confidence: 0.94,
    rationale: 'Consulta de pré-natal e exame obstétrico.',
  },
  'vunesp-enfermagem-semiologia-em-enfermagem-1779563467322-8': {
    suggested: 'Saúde da Mulher',
    confidence: 0.93,
    rationale: 'Sinais de presunção de gestação.',
  },
  'selecon-enfermagem-semiologia-em-enfermagem-1779563500147-1': {
    suggested: 'Processo de Enfermagem',
    confidence: 0.91,
    rationale: 'Avaliação de dor em cuidados paliativos — processo de enfermagem.',
  },
  'instituto-verbena-enfermagem-semiologia-em-enfermagem-1779563531989-5': {
    suggested: 'Urgências e Emergências',
    confidence: 0.93,
    rationale: 'Intoxicação por organofosforado — urgência toxicológica.',
  },
  'selecon-enfermagem-semiologia-em-enfermagem-1779563467322-6': {
    suggested: 'Instalação e Manejo de Sondas',
    confidence: 0.91,
    rationale: 'Monitorização de débito urinário com SVD — manejo de sonda.',
  },
  'unesc-enfermagem-semiologia-em-enfermagem-1779563486900-4': {
    suggested: 'Saúde Mental',
    confidence: 0.94,
    rationale: 'Sinais clínicos da depressão — saúde mental.',
  },
  'vunesp-enfermagem-semiologia-em-enfermagem-1779563491765-3': {
    suggested: 'Urgências e Emergências',
    confidence: 0.92,
    rationale: 'Sinal sugestivo de choque hipovolêmico.',
  },
  'quadrix-enfermagem-semiologia-em-enfermagem-1779563537258-8': {
    suggested: 'Urgências e Emergências',
    confidence: 0.92,
    rationale: 'Sinais de hemorragia com PA e pulso — urgência.',
  },
  'ibade-enfermagem-verificacao-de-sinais-vitais-1779343856589-1': {
    suggested: DCNT,
    confidence: 0.93,
    rationale: 'Classificação SBC de hipertensão — DCNT, não técnica de aferição.',
  },
};

function classify(slug: string, instruction: string, optionsPreview = ''): ClassResult {
  const override = OVERRIDES[slug];
  if (override) {
    const keep = override.keep_current ?? override.suggested === BUCKET;
    return {
      suggested: override.suggested,
      confidence: override.confidence,
      keep_current: keep,
      rationale: override.rationale,
    };
  }

  const t = `${instruction} ${optionsPreview}`.toLowerCase();
  const topic = getTopic(slug);

  if (topic.includes('doencas-cardiovasculares') || topic.includes('diabete-hipertensao')) {
    return { suggested: DCNT, confidence: 0.96, keep_current: false, rationale: 'Doença cardiovascular/metabólica crônica.' };
  }
  if (topic === 'atencao-basica-saude-da-familia') {
    return { suggested: 'Atenção Básica / Saúde da Família', confidence: 0.94, keep_current: false, rationale: 'Atenção primária/ESF.' };
  }
  if (topic.includes('auditoria-e-gestao')) {
    return { suggested: 'Segurança do Paciente', confidence: 0.9, keep_current: false, rationale: 'Gestão da qualidade — segurança do paciente.' };
  }

  if (topic === 'semiologia-em-enfermagem') {
    if (/sepse|qsofa|sirs/.test(t) && /febre|hipotermia|frequência cardíaca|frequência respiratória|temperatura/.test(t)) {
      return { suggested: BUCKET, confidence: 0.92, keep_current: true, rationale: 'Critérios de sepse com parâmetros de SV.' };
    }
    if (/acidente vascular|avc|escala de cincinnati|assimetria facial/.test(t)) {
      return { suggested: 'Urgências e Emergências', confidence: 0.95, keep_current: false, rationale: 'Reconhecimento de AVC.' };
    }
    if (/trauma cran|tce|equimose.*orelha|pupilas assimétricas/.test(t)) {
      return { suggested: 'Urgências e Emergências', confidence: 0.94, keep_current: false, rationale: 'Trauma cranioencefálico.' };
    }
    if (/meningite|brudzinski|rigidez de nuca/.test(t)) {
      return { suggested: 'Questões Mescladas e Outras Doenças Agudas', confidence: 0.93, keep_current: false, rationale: 'Meningite — doença aguda.' };
    }
    if (/insuficiência cardíaca|icc\b/.test(t) && !/aferição|frequência respiratória normal/.test(t)) {
      return { suggested: DCNT, confidence: 0.92, keep_current: false, rationale: 'Semiologia cardiovascular/ICC.' };
    }
    if (/abdome agudo/.test(t)) {
      return { suggested: 'Questões Mescladas e Outras Doenças Agudas', confidence: 0.91, keep_current: false, rationale: 'Abdome agudo.' };
    }
    if (/fratura|ortopédic|colo de fêmur|síndrome compartimental/.test(t)) {
      return { suggested: 'Urgências e Emergências', confidence: 0.91, keep_current: false, rationale: 'Trauma/ortopedia.' };
    }
    if (/aranha|phoneutria|escorpião/.test(t)) {
      return { suggested: 'Questões Mescladas e Outras Doenças Agudas', confidence: 0.92, keep_current: false, rationale: 'Acidente por animal peçonhento.' };
    }
    if (/pupila|isocoria|anisocoria/.test(t) && !/frequência cardíaca|pressão arterial/.test(t)) {
      return { suggested: 'Urgências e Emergências', confidence: 0.9, keep_current: false, rationale: 'Avaliação pupilar neurológica.' };
    }
    if (/febre|intermitente|remitente|padrão.*febre|bradisfigmia|taquicardia|bradicardia|taquipneia|bradipneia|eupneia|frequência respiratória|padrões respiratórios|cheyne-stokes/.test(t)) {
      return { suggested: BUCKET, confidence: 0.93, keep_current: true, rationale: 'Padrões de SV ou terminologia de FC/FR/temperatura.' };
    }
    if (/aferição|sinais vitais|pressão arterial|pulso radial|temperatura axilar/.test(t)) {
      return { suggested: BUCKET, confidence: 0.93, keep_current: true, rationale: 'Aferição ou interpretação de sinais vitais.' };
    }
    if (/sofrimento fetal|cardiotocografia/.test(t)) {
      return { suggested: 'Saúde da Mulher', confidence: 0.94, keep_current: false, rationale: 'Obstetrícia/sofrimento fetal.' };
    }
    if (/dengue|prova do laço/.test(t)) {
      return { suggested: 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)', confidence: 0.93, keep_current: false, rationale: 'Dengue — arbovirose.' };
    }
    if (/gestação|pré-natal|obstétric|gravidez/.test(t)) {
      return { suggested: 'Saúde da Mulher', confidence: 0.93, keep_current: false, rationale: 'Gestação/pré-natal.' };
    }
    if (/depressão|psiqui/.test(t)) {
      return { suggested: 'Saúde Mental', confidence: 0.94, keep_current: false, rationale: 'Saúde mental.' };
    }
    if (/queimadura/.test(t)) {
      return { suggested: 'Feridas e Queimaduras', confidence: 0.94, keep_current: false, rationale: 'Queimaduras.' };
    }
    if (/asma|dpoc/.test(t)) {
      return { suggested: 'Doenças Respiratórias Crônicas (Asma, DPOC)', confidence: 0.92, keep_current: false, rationale: 'Doença respiratória crônica.' };
    }
    if (/tuberculose|sintomático respiratório/.test(t)) {
      return { suggested: 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)', confidence: 0.93, keep_current: false, rationale: 'Tuberculose.' };
    }
    if (/choque|hemorragia|hipotensão/.test(t)) {
      return { suggested: 'Urgências e Emergências', confidence: 0.91, keep_current: false, rationale: 'Instabilidade hemodinâmica/urgência.' };
    }
    if (/hipoglicemia|diabetes/.test(t)) {
      return { suggested: DCNT, confidence: 0.92, keep_current: false, rationale: 'Diabetes/hiperglicemia — DCNT.' };
    }
    if (/câncer de mama|mama/.test(t)) {
      return { suggested: 'Saúde da Mulher', confidence: 0.93, keep_current: false, rationale: 'Saúde da mulher.' };
    }
    if (/paliiativ|dor/.test(t) && /não verbal|desconforto/.test(t)) {
      return { suggested: 'Processo de Enfermagem', confidence: 0.91, keep_current: false, rationale: 'Avaliação de dor — processo de enfermagem.' };
    }
    if (/sonda vesical|débito urinário|oligúria/.test(t)) {
      return { suggested: 'Instalação e Manejo de Sondas', confidence: 0.91, keep_current: false, rationale: 'Monitorização com SVD.' };
    }
    if (/insuficiência respiratória/.test(t)) {
      return { suggested: 'Oxigenoterapia e Cuidados Respiratórios', confidence: 0.91, keep_current: false, rationale: 'Insuficiência respiratória aguda.' };
    }
    if (/intoxicação|organofosforado/.test(t)) {
      return { suggested: 'Urgências e Emergências', confidence: 0.93, keep_current: false, rationale: 'Intoxicação — urgência.' };
    }
    return { suggested: BUCKET, confidence: 0.9, keep_current: true, rationale: 'Semiologia com foco em sinais vitais ou achado clínico sem destino mais específico ≥0,90.' };
  }

  if (topic === 'processo-de-enfermagem') {
    if (/paliativ|limitação de suporte/.test(t) && /alívio da dor|dignidade/.test(t)) {
      return { suggested: 'Processo de Enfermagem', confidence: 0.94, keep_current: false, rationale: 'Cuidados paliativos — processo de enfermagem.' };
    }
    if (/precauç|biossegur|clostridioides|tuberculose pulmonar|multirresistente|n95|pff2|higienização das mãos/.test(t)) {
      return { suggested: 'Medidas de Prevenção e Precaução de Contato', confidence: 0.95, keep_current: false, rationale: 'Precauções de biossegurança.' };
    }
    if (/classificaç|triagem|prioriz|instabilidade clínica|sala de classificação/.test(t)) {
      return { suggested: 'Urgências e Emergências', confidence: 0.95, keep_current: false, rationale: 'Triagem em urgência.' };
    }
    if (/perioperat|cirurgi|colectomia|colecistectomia/.test(t) && !/sinais vitais|aferição|pressão arterial/.test(t)) {
      return { suggested: 'Assistência Perioperatória (Inclui SRPA)', confidence: 0.93, keep_current: false, rationale: 'Assistência perioperatória.' };
    }
    if (/recém.?nascido|parto vaginal|apgar/.test(t)) {
      return { suggested: 'Saúde da Mulher', confidence: 0.94, keep_current: false, rationale: 'RN/puerpério.' };
    }
    if (/gestante|idade gestacional|pré.?natal/.test(t)) {
      return { suggested: 'Saúde da Mulher', confidence: 0.94, keep_current: false, rationale: 'Gestação.' };
    }
    if (/oxigenoterapia|máscara de oxigênio|dpoc/.test(t) && !/aferição|frequência respiratória normal/.test(t)) {
      return { suggested: 'Oxigenoterapia e Cuidados Respiratórios', confidence: 0.93, keep_current: false, rationale: 'Oxigenoterapia.' };
    }
    if (/emergência|urgência|trauma/.test(t) && !/aferição|verificação dos sinais vitais/.test(t)) {
      return { suggested: 'Urgências e Emergências', confidence: 0.92, keep_current: false, rationale: 'Urgência/emergência.' };
    }
    if (/registro|prontuário|documenta|anotação|passagem de plantão|atribuições legais/.test(t) && !/técnica de aferição|manguito/.test(t)) {
      return { suggested: 'Processo de Enfermagem', confidence: 0.92, keep_current: false, rationale: 'Documentação de enfermagem.' };
    }
    if (/hipertensão arterial|has\b|diabetes mellitus|doenças crônicas/.test(t) && !/aferição|manguito|técnica/.test(t)) {
      return { suggested: DCNT, confidence: 0.93, keep_current: false, rationale: 'Doença crônica — DCNT.' };
    }
    if (/criança|pediatr|lactente|infantil/.test(t) && !/frequência (cardíaca|respiratória)|temperatura|pressão arterial|sinais vitais/.test(t)) {
      return { suggested: 'Saúde da Criança', confidence: 0.91, keep_current: false, rationale: 'Assistência pediátrica.' };
    }
    if (/acolhimento|humanização|pnh/.test(t)) {
      return { suggested: 'Processo de Enfermagem', confidence: 0.91, keep_current: false, rationale: 'Acolhimento — processo de enfermagem.' };
    }
    if (/segurança do paciente|queda/.test(t)) {
      return { suggested: 'Segurança do Paciente', confidence: 0.93, keep_current: false, rationale: 'Segurança do paciente.' };
    }
    if (/curativo|ferida/.test(t)) {
      return { suggested: 'Curativos e Manejo de Feridas', confidence: 0.92, keep_current: false, rationale: 'Curativos.' };
    }
    if (/sinais vitais|aferição|aferir|pressão arterial|frequência cardíaca|frequência respiratória|temperatura|pulso|oximetria|spo2|manguito|esfigmomanômetro|eupneia/.test(t)) {
      return { suggested: BUCKET, confidence: 0.94, keep_current: true, rationale: 'Técnica ou interpretação de sinais vitais.' };
    }
    return { suggested: 'Processo de Enfermagem', confidence: 0.9, keep_current: false, rationale: 'Assistência de enfermagem geral.' };
  }

  if (topic === 'promocao-a-saude-e-prevencao-de-agravos') {
    return { suggested: 'Promoção à Saúde e Prevenção de Agravos', confidence: 0.93, keep_current: false, rationale: 'Promoção/prevenção.' };
  }

  if (topic === 'procedimentos-diversos') {
    return { suggested: 'Procedimentos Diversos', confidence: 0.92, keep_current: false, rationale: 'Procedimentos mistos (glicemia, antropometria, SV).' };
  }

  if (topic === 'verificacao-de-sinais-vitais') {
    if (/eletrodo|ecg|5 canais|derivação|monitor cardíaco/.test(t)) {
      return { suggested: 'Urgências e Emergências', confidence: 0.92, keep_current: false, rationale: 'Monitorização/ECG — urgência.' };
    }
    if (/classificação.*hipertens|estágio [123]|normal limítrofe|sociedade brasileira de cardiologia/.test(t) && /hipertens|pressão alta/.test(t) && !/técnica de aferição|manguito|braçadeira/.test(t)) {
      return { suggested: DCNT, confidence: 0.93, keep_current: false, rationale: 'Classificação de HAS — DCNT.' };
    }
    return { suggested: BUCKET, confidence: 0.96, keep_current: true, rationale: 'Técnica ou interpretação de sinais vitais.' };
  }

  return { suggested: BUCKET, confidence: 0.95, keep_current: true, rationale: 'Conteúdo central de verificação de sinais vitais.' };
}

function writeInferred(batch: string, rows: InferRow[]) {
  const rel = `${OUT}/batch-${batch}-inferred.json`;
  writeFileSync(
    resolve(process.cwd(), rel),
    `${JSON.stringify({ batch, bucket: BUCKET, inferences: rows }, null, 2)}\n`,
  );
  const moves = rows.filter((r) => !r.keep_current && r.confidence >= 0.9).length;
  console.log(`batch-${batch}: ${rows.length} scanned, ${moves} moves (>=0.90)`);
}

type BatchFile = {
  batch: string;
  items: { modulo_slug: string; instruction?: string; optionsPreview?: string }[];
};

let allRows: InferRow[] = [];

for (let b = 8; b <= 14; b++) {
  const n = String(b).padStart(2, '0');
  const path = resolve(process.cwd(), `${OUT}/batch-${n}.json`);
  const batch = JSON.parse(readFileSync(path, 'utf8')) as BatchFile;
  const rows: InferRow[] = batch.items.map((it) => {
    const c = classify(it.modulo_slug, it.instruction ?? '', it.optionsPreview ?? '');
    return {
      modulo_slug: it.modulo_slug,
      suggested_subtopico: c.suggested,
      confidence: c.confidence,
      keep_current: c.keep_current,
      rationale: c.rationale,
    };
  });
  writeInferred(n, rows);
  allRows = allRows.concat(rows);
}

const moves = allRows.filter((r) => !r.keep_current && r.confidence >= 0.9);
console.log(`TOTAL: ${allRows.length} scanned, ${moves.length} moves (>=0.90)`);
