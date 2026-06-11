import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  CANONICAL_SUBTOPICOS,
  DCNT_MESCLADAS_LABEL,
  isCanonicalSubtopico,
} from '@/lib/catalogMigration/canonicalSubtopicos';

export const SubtopicoInferenceSchema = z.object({
  suggested_subtopico: z.string().min(1),
  confidence: z.number().min(0).max(1),
  rationale: z.string().max(500),
  keep_current: z.boolean(),
});

export type SubtopicoInference = z.infer<typeof SubtopicoInferenceSchema>;

export type InferSubtopicoInput = {
  instruction: string;
  textFragment?: string;
  currentSubtopico: string;
  optionsPreview?: string;
};

const SUBTOPICO_HINTS: Record<string, string> = {
  'História da Enfermagem': 'Evolução da profissão, teorias, marcos históricos',
  'Noções de Anatomia': 'Estruturas corporais, sistemas, localização anatômica',
  'Noções de Fisiologia': 'Funções orgânicas, homeostase, fisiologia aplicada',
  'Processo de Enfermagem': 'SAE, diagnósticos NANDA, planificação, etapas do PE',
  'Farmacodinâmica e Farmacocinética': 'Mecanismo de ação, absorção, metabolismo, efeitos',
  'Cálculo de Administração de Medicamentos e Infusões': 'Dose, gts/min, regra de três, diluição',
  'Vias de Administração': 'VO, IM, IV, SC, tópica, inalação',
  'Cuidados na Administração de Medicamentos': '6 certos, interações, preparo, vigilância',
  'Verificação de Sinais Vitais': 'PA, FC, FR, temperatura, SpO2, aferição',
  'Instalação e Manejo de Sondas': 'SNG, SVD, sondas digestivas/urinárias',
  'Oxigenoterapia e Cuidados Respiratórios': 'O2, inalação, vias aéreas, dispneia',
  'Curativos e Manejo de Feridas': 'Tipos de curativo, limpeza, cobertura de feridas',
  'Punção Venosa e Cuidados com Cateteres': 'Acesso venoso, PVC, infusão, flebite',
  'Coleta de Exames Laboratoriais': 'Coleta sanguínea, urina, fezes, preservação de amostras',
  'Mobilização e Posicionamento do Paciente': 'Decúbito, transferência, prevenção de LPP',
  'Procedimentos Diversos': 'Procedimentos gerais que não cabem em outro subtópico específico',
  'Feridas e Queimaduras': 'Queimaduras, escaras, classificação de feridas complexas',
  'Processamento de Artigos e Produtos de Saúde': 'Limpeza, desinfecção, esterilização de materiais',
  'Enfermagem em Central de Material e Esterilização (CME)': 'CME, esterilização, rastreabilidade',
  'Medidas de Prevenção e Precaução de Contato': 'Precauções padrão e por transmissão',
  'Infecções no Contexto da Biossegurança': 'IRAS, profilaxia, isolamento infeccioso',
  'Segurança do Paciente': 'Identificação, notificação de incidentes, NSP, qualidade',
  'Epidemiologia e Vigilância Epidemiológica': 'Indicadores, surtos, vigilância, notificação compulsória',
  'Promoção à Saúde e Prevenção de Agravos': 'Prevenção, educação em saúde, rastreamento',
  Imunização: 'Vacinas, calendário, técnicas e conservação de imunobiológicos',
  'Atenção Básica / Saúde da Família': 'ESF, NASF, territorialização, cuidado na APS',
  'Infecções Sexualmente Transmissíveis (ISTs)': 'HIV, sífilis, hepatites, profilaxia IST',
  'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)':
    'Covid, influenza, sarampo, polio, arboviroses virais',
  'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)':
    'TB, tétano, candidíase, infecções bacterianas/fúngicas',
  'Doenças Parasitárias e Zoonoses': 'Parasitas, zoonoses, dengue (contexto parasitário)',
  'Outras Doenças e Questões Mescladas sobre Doenças Transmissíveis':
    'Doenças transmissíveis mescladas ou múltiplas',
  'Questões Mescladas e Outras Doenças Agudas': 'Doenças agudas diversas em um enunciado',
  'Doenças Respiratórias Crônicas (Asma, DPOC)': 'Asma, DPOC, doenças respiratórias crônicas',
  'Assistência Perioperatória (Inclui SRPA)': 'Pré/intra/pós-operatório, SRPA',
  'Enfermagem em Centro Cirúrgico': 'CC, campo estéril, instrumentação cirúrgica',
  'Urgências e Emergências': 'RCP, trauma, choque, emergências, AVC agudo',
  'Enfermagem do Trabalho': 'Saúde ocupacional, acidentes de trabalho, NR-32',
  'Saúde Mental': 'Psiquiatria, dependência química, crise, saúde mental',
  'Saúde da Criança': 'Pediatria, puericultura, crescimento infantil',
  'Saúde do Adolescente': 'Adolescente, puberdade, vulnerabilidades',
  'Saúde da Mulher': 'Gestação, parto, puerpério, ginecologia',
  [DCNT_MESCLADAS_LABEL]: 'DCNT mescladas: diabetes, HAS, ICC, neoplasias, renais',
};

const ALLOWED_LABELS = [...CANONICAL_SUBTOPICOS, DCNT_MESCLADAS_LABEL] as readonly string[];

function buildCatalogBlock(): string {
  return ALLOWED_LABELS.map((label) => `- "${label}": ${SUBTOPICO_HINTS[label] ?? 'Enfermagem técnica'}`).join(
    '\n',
  );
}

function truncate(text: string, max: number): string {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

export function buildInferSubtopicoPrompt(input: InferSubtopicoInput): string {
  const optionsBlock = input.optionsPreview
    ? `\nAlternativas (resumo): ${truncate(input.optionsPreview, 400)}`
    : '';
  const fragmentBlock = input.textFragment?.trim()
    ? `\nTexto base: ${truncate(input.textFragment, 600)}`
    : '';

  return `Você classifica questões de TÉCNICO DE ENFERMAGEM para concursos públicos.

Escolha o subtópico que MELHOR representa o CONTEÚDO CENTRAL cobrado no enunciado (não só palavras soltas).
Use EXATAMENTE um nome da lista abaixo — copie o texto literal incluindo pontuação.

Subtópico atual no catálogo: "${input.currentSubtopico}"

CATÁLOGO (nome exato → dica):
${buildCatalogBlock()}

Regras:
- Se o enunciado mescla assuntos equivalentes (I/II/III) sem tema dominante claro, use keep_current=true e suggested_subtopico="${input.currentSubtopico}".
- Se houver tema dominante claro, keep_current=false e suggested_subtopico= o melhor da lista.
- confidence: 0.0–1.0 (quão certo você está).
- rationale: uma frase curta em português.

Enunciado:
${truncate(input.instruction, 1800)}${fragmentBlock}${optionsBlock}

Responda SOMENTE JSON válido:
{"suggested_subtopico":"...","confidence":0.0,"rationale":"...","keep_current":false}`;
}

export function parseSubtopicoInference(raw: string): SubtopicoInference | null {
  const trimmed = raw.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    const parsed = SubtopicoInferenceSchema.safeParse(JSON.parse(jsonMatch[0]));
    if (!parsed.success) return null;
    if (!isCanonicalSubtopico(parsed.data.suggested_subtopico)) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

export function getGoogleApiKey(): string | undefined {
  return process.env.GOOGLE_API_KEY?.trim() || undefined;
}

/** Modelo Gemini para catalog:infer-subtopico. Padrão: Gemini 2.5 Flash-Lite. */
export function getGeminiModelId(): string {
  return process.env.GOOGLE_GEMINI_MODEL?.trim() || 'gemini-2.5-flash-lite';
}

function sleepMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseRetryDelayMs(message: string): number | null {
  const match = message.match(/retry in ([\d.]+)s/i);
  if (!match) return null;
  const seconds = Number(match[1]);
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  return Math.ceil(seconds * 1000) + 1000;
}

function isRateLimitError(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return msg.includes('429') || msg.toLowerCase().includes('quota');
}

function isHardQuotaBlock(err: unknown): boolean {
  const msg = err instanceof Error ? err.message : String(err);
  return /limit:\s*0\b/i.test(msg);
}

async function generateGeminiContentWithRetry(
  model: ReturnType<GoogleGenerativeAI['getGenerativeModel']>,
  prompt: string,
  maxRetries = 3,
) {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await model.generateContent(prompt);
    } catch (err) {
      lastErr = err;
      if (isHardQuotaBlock(err)) throw err;
      if (!isRateLimitError(err) || attempt >= maxRetries) throw err;
      const msg = err instanceof Error ? err.message : String(err);
      const delay = parseRetryDelayMs(msg) ?? Math.min(90_000, 8000 * 2 ** attempt);
      await sleepMs(delay);
    }
  }
  throw lastErr;
}

const THEMATIC_BUCKET_GUARDS: { buckets: readonly string[]; re: RegExp; note: string }[] = [
  {
    buckets: ['Epidemiologia e Vigilância Epidemiológica'],
    re: /vigil[aâ]ncia epidemiol|notifica[cç][aã]o compuls[oó]ria|surto|endemia|epidemia|preval[eê]ncia|incid[eê]ncia|sinan|agravo|indicador de sa[uú]de|boletim epidemiol/i,
    note: 'epidemiologia',
  },
  {
    buckets: ['Promoção à Saúde e Prevenção de Agravos'],
    re: /promo[cç][aã]o da sa[uú]de|preven[cç][aã]o de agravos|estilo de vida|tabagismo|atividade f[ií]sica|rastreamento populacional|determinantes sociais/i,
    note: 'promoção',
  },
  {
    buckets: ['Atenção Básica / Saúde da Família'],
    re: /aten[cç][aã]o b[aá]sica|sa[uú]de da fam[ií]lia|esf|nasf|territorializa|acs\b|agente comunit[aá]rio|estrat[eé]gia sa[uú]de da fam[ií]lia/i,
    note: 'APS',
  },
  {
    buckets: ['Segurança do Paciente'],
    re: /seguran[cç]a do paciente|evento adverso|incidente com paciente|near miss|identifica[cç][aã]o do paciente|notifica[cç][aã]o de incidente|prescri[cç][aã]o segura|checagem de seguran/i,
    note: 'NSP',
  },
];

function matchThematicGuard(currentSubtopico: string, blob: string): string | null {
  const current = currentSubtopico.trim();
  for (const guard of THEMATIC_BUCKET_GUARDS) {
    if (!guard.buckets.includes(current)) continue;
    if (guard.re.test(blob)) return guard.note;
  }
  return null;
}

export function inferSubtopicoHeuristic(input: InferSubtopicoInput): SubtopicoInference {
  const blob = `${input.instruction} ${input.textFragment ?? ''} ${input.optionsPreview ?? ''}`.toLowerCase();

  const thematicNote = matchThematicGuard(input.currentSubtopico, blob);
  if (thematicNote) {
    return {
      suggested_subtopico: input.currentSubtopico,
      confidence: 0.94,
      rationale: `Heurística (${thematicNote}): tema central compatível com bucket atual`,
      keep_current: true,
    };
  }

  const rules: { re: RegExp; label: string; conf: number; note: string }[] = [
    {
      re: /sonda|gavagem|svd|sng|levine|salem|sondagem/i,
      label: 'Instalação e Manejo de Sondas',
      conf: 0.9,
      note: 'sondas',
    },
    {
      re: /punção venosa|acesso venoso|cateter venoso|flebite|jelco|scalp/i,
      label: 'Punção Venosa e Cuidados com Cateteres',
      conf: 0.9,
      note: 'acesso venoso',
    },
    {
      re: /sinais vitais|pressão arterial|aferição|aferir|temperatura axilar|oximetria|spo2|frequência cardíaca|frequência respiratória/i,
      label: 'Verificação de Sinais Vitais',
      conf: 0.92,
      note: 'SV',
    },
    {
      re: /oxigenoterapia|oxigênio|inalação|máscara de o2|cateter nasal|aspiração orofaringe|vias aéreas/i,
      label: 'Oxigenoterapia e Cuidados Respiratórios',
      conf: 0.88,
      note: 'O2',
    },
    {
      re: /curativo|curativos|ferida|lesão cutânea|pele integra/i,
      label: 'Curativos e Manejo de Feridas',
      conf: 0.87,
      note: 'curativos',
    },
    {
      re: /banho|higiene corporal|conforto|lençol|decúbito|mobilização|posicionamento|transferência/i,
      label: 'Mobilização e Posicionamento do Paciente',
      conf: 0.86,
      note: 'higiene/mobilização',
    },
    {
      re: /coleta de sangue|coleta sangu|material biológico|tubo de coleta|tampa de coleta|exame laboratorial/i,
      label: 'Coleta de Exames Laboratoriais',
      conf: 0.9,
      note: 'coleta lab',
    },
    {
      re: /\bhiv\b|aids|s[ií]filis|gonorreia|clam[ií]dia|herpes genital|ist\b|dst\b|hepatite [abc]\b/i,
      label: 'Infecções Sexualmente Transmissíveis (ISTs)',
      conf: 0.91,
      note: 'IST',
    },
    {
      re: /covid|influenza|sarampo|poliomielite|\bpolio\b|rubeola|varicela|monkeypox|mpox|dengue|zika|chikungunya|arbovirose/i,
      label: 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)',
      conf: 0.9,
      note: 'viral',
    },
    {
      re: /tuberculose|t[eé]tano|meningite meningoc|candid[ií]ase|infec[cç][aã]o bacter|estreptoc|staphyloc/i,
      label: 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)',
      conf: 0.9,
      note: 'bacteriana',
    },
    {
      re: /mal[aá]ria|esquistossomose|leishmaniose|chagas|helmint|parasit|zoonose|leptospirose/i,
      label: 'Doenças Parasitárias e Zoonoses',
      conf: 0.88,
      note: 'parasitária',
    },
    {
      re: /\basma\b|dpoc|doen[cç]a pulmonar obstrutiva|bronquite cr[oô]nica/i,
      label: 'Doenças Respiratórias Crônicas (Asma, DPOC)',
      conf: 0.9,
      note: 'respiratória crônica',
    },
    {
      re: /diabetes mellitus|hipertens[aã]o arterial|\bhas\b|insufici[eê]ncia card[ií]aca|\bicc\b|doen[cç]a renal cr[oô]nica|\bdrc\b|neoplasia|c[aâ]ncer|obesidade/i,
      label: DCNT_MESCLADAS_LABEL,
      conf: 0.88,
      note: 'DCNT',
    },
    {
      re: /vacina|imuniza|imunobiol|calend[aá]rio vacinal|bcg|hepatite b/i,
      label: 'Imunização',
      conf: 0.92,
      note: 'imunização',
    },
    {
      re: /rcp|reanimação cardiopulmonar|parada card|desfibril/i,
      label: 'Urgências e Emergências',
      conf: 0.93,
      note: 'urgência',
    },
    {
      re: /medicação|medicamento|administração de medic|6 certos|via oral|intravenos/i,
      label: 'Cuidados na Administração de Medicamentos',
      conf: 0.86,
      note: 'medicação',
    },
    {
      re: /cálcul|dose|gotas|gts|ml\/h|regra de três|diluição/i,
      label: 'Cálculo de Administração de Medicamentos e Infusões',
      conf: 0.9,
      note: 'cálculo',
    },
    {
      re: /cme|esterilização|material cirúrgico|central de material/i,
      label: 'Enfermagem em Central de Material e Esterilização (CME)',
      conf: 0.88,
      note: 'CME',
    },
    {
      re: /precaução|isolamento|epi|luvas|mascara cirurgica|biossegur/i,
      label: 'Medidas de Prevenção e Precaução de Contato',
      conf: 0.85,
      note: 'precaução',
    },
    {
      re: /processo de enfermagem|nanda|diagnóstico de enfermagem|plano de cuidados|sae/i,
      label: 'Processo de Enfermagem',
      conf: 0.88,
      note: 'SAE',
    },
    {
      re: /gestante|parto|puerpério|pré-natal|ginecol/i,
      label: 'Saúde da Mulher',
      conf: 0.88,
      note: 'mulher',
    },
    {
      re: /criança|pediatr|puericultura|vacinação infantil/i,
      label: 'Saúde da Criança',
      conf: 0.87,
      note: 'criança',
    },
  ];

  for (const rule of rules) {
    if (!rule.re.test(blob)) continue;
    if (rule.label.trim() === input.currentSubtopico.trim()) {
      return {
        suggested_subtopico: input.currentSubtopico,
        confidence: 0.95,
        rationale: `Heurística (${rule.note}): tema compatível com bucket atual`,
        keep_current: true,
      };
    }
    return {
      suggested_subtopico: rule.label,
      confidence: rule.conf,
      rationale: `Heurística (${rule.note}): enunciado indica ${rule.label}`,
      keep_current: false,
    };
  }

  return {
    suggested_subtopico: input.currentSubtopico,
    confidence: 0.55,
    rationale: 'Heurística: sem padrão dominante — manter bucket',
    keep_current: true,
  };
}

export type InferSubtopicoOptions = {
  apiKey?: string;
  /** Ignora Gemini mesmo com GOOGLE_API_KEY configurada. */
  heuristicOnly?: boolean;
};

export async function inferSubtopicoFromEnunciado(
  input: InferSubtopicoInput,
  options: InferSubtopicoOptions = {},
): Promise<SubtopicoInference & { source: 'gemini' | 'heuristic' }> {
  const key = options.heuristicOnly ? undefined : (options.apiKey ?? getGoogleApiKey());
  if (!key) {
    return { ...inferSubtopicoHeuristic(input), source: 'heuristic' };
  }

  const genAI = new GoogleGenerativeAI(key);
  const modelId = getGeminiModelId();
  const model = genAI.getGenerativeModel({
    model: modelId,
    generationConfig: {
      responseMimeType: 'application/json',
      temperature: 0.2,
    },
  });

  const result = await generateGeminiContentWithRetry(model, buildInferSubtopicoPrompt(input));
  const text = result.response.text();
  const parsed = parseSubtopicoInference(text);

  if (!parsed) {
    throw new Error(`Resposta Gemini inválida: ${truncate(text, 200)}`);
  }

  return { ...parsed, source: 'gemini' as const };
}

export function isInferenceApplicable(
  inference: SubtopicoInference,
  currentSubtopico: string,
  minConfidence: number,
): boolean {
  if (inference.keep_current) return false;
  if (inference.confidence < minConfidence) return false;
  if (inference.suggested_subtopico.trim() === currentSubtopico.trim()) return false;
  return true;
}
