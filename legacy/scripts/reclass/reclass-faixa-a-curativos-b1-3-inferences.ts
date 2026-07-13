#!/usr/bin/env tsx
/**
 * Onda 8 — Curativos e Manejo de Feridas faixa A, batches 01-03 (~150 questões).
 * Classificação agente por leitura de enunciado → batch-XX-inferred.json
 *
 *   npx tsx scripts/reclass-faixa-a-curativos-b1-3-inferences.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

type InferRow = {
  modulo_slug: string;
  suggested_subtopico: string;
  confidence: number;
  keep_current: boolean;
  rationale: string;
};

type BatchItem = {
  modulo_slug: string;
  instruction: string;
  textFragment?: string;
  optionsPreview?: string;
};

const BUCKET = 'Curativos e Manejo de Feridas';
const OUT = 'artifacts/reclass/faixa-a/curativos';

const FQ = 'Feridas e Queimaduras';
const MOB = 'Mobilização e Posicionamento do Paciente';
const URG = 'Urgências e Emergências';
const PERI = 'Assistência Perioperatória (Inclui SRPA)';
const CC = 'Enfermagem em Centro Cirúrgico';
const PUN = 'Punção Venosa e Cuidados com Cateteres';
const COL = 'Coleta de Exames Laboratoriais';
const PROC = 'Procedimentos Diversos';
const MED = 'Cuidados na Administração de Medicamentos';
const VIAS = 'Vias de Administração';
const DCNT = 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis';
const BACT = 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)';
const PARA = 'Doenças Parasitárias e Zoonoses';
const VIR = 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)';
const AGUDA = 'Questões Mescladas e Outras Doenças Agudas';
const ATB = 'Atenção Básica / Saúde da Família';
const IMUN = 'Imunização';
const SM = 'Saúde Mental';
const SCC = 'Saúde da Criança';
const PE = 'Processo de Enfermagem';
const AUDIT = 'Segurança do Paciente';
const PROMO = 'Promoção à Saúde e Prevenção de Agravos';
const HIST = 'História da Enfermagem';
const PROC_ART = 'Processamento de Artigos e Produtos de Saúde';
const BIOS = 'Infecções no Contexto da Biossegurança';
const PREC = 'Medidas de Prevenção e Precaução de Contato';

const CUR_CORE_RE =
  /curativ|ferida|desbridament|exsudat|alginato|hidrocoloid|hidrogel|hidropol[ií]mero|colagenase|bota de unna|úlcera venosa|ferida operat|ferida cir[uú]rgic|retirada de pontos|t[eé]cnica ass[eé]ptic.*ferida|limpeza da ferida|limpeza de ferida|troca de curativo|cobertura.*ferida|leito da ferida|cicatriza[cç][aã]o.*ferida|esfacelo|penrose|dreno de ferida|curativo da ferida|manejo de feridas|ostomia|periestomal|colostomia.*pele/i;

/** Overrides manuais pós-leitura (slug → row sem modulo_slug) */
const OVERRIDES: Record<string, Omit<InferRow, 'modulo_slug'>> = {
  // batch 01
  'adm-tec-enfermagem-curativos-e-manejo-de-feridas-1779344773456-1': {
    suggested_subtopico: PROC,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Termoterapia (calor úmido) em lesão musculoesquelética — não manejo de feridas.',
  },
  'ameosc-enfermagem-curativos-e-manejo-de-feridas-1779340191984-6': {
    suggested_subtopico: PUN,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Desinfecção do hub antes de infusão — cuidado com cateter venoso.',
  },
  'ameosc-enfermagem-curativos-e-manejo-de-feridas-1779344779828-6': {
    suggested_subtopico: VIAS,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Afirmativa II trata técnica de injeção intramuscular (vasto lateral).',
  },
  'ameosc-enfermagem-curativos-e-manejo-de-feridas-1779344813448-6': {
    suggested_subtopico: MOB,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Banho no leito com eritema sacral — prevenção de LPP.',
  },
  'ameosc-enfermagem-curativos-e-manejo-de-feridas-1779344813448-7': {
    suggested_subtopico: AUDIT,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Identificação segura do paciente durante procedimentos.',
  },
  'ameosc-enfermagem-curativos-e-manejo-de-feridas-1779562730776-2': {
    suggested_subtopico: COL,
    confidence: 0.96,
    keep_current: false,
    rationale: 'Coleta de sangue venoso — técnica laboratorial.',
  },
  'ameosc-enfermagem-curativos-e-manejo-de-feridas-1779563288910-9': {
    suggested_subtopico: COL,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Procedimento de coleta de sangue.',
  },
  'ameosc-enfermagem-curativos-e-manejo-de-feridas-1779563448133-7': {
    suggested_subtopico: PERI,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Tricotomia pré-operatória para prevenção de ISC.',
  },
  'ameosc-enfermagem-curativos-e-manejo-de-feridas-1779563512485-0': {
    suggested_subtopico: SCC,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Classificação da dor em criança no pronto-socorro.',
  },
  'ameosc-enfermagem-curativos-e-manejo-de-feridas-1779563517223-0': {
    suggested_subtopico: SM,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Escala de Depressão em Geriatria (GDS) — saúde mental.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780008225255-4': {
    suggested_subtopico: PREC,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Precauções em pacientes com doenças transmissíveis na UPA.',
  },
  'avancasp-enfermagem-curativos-e-manejo-de-feridas-1779269305691-9': {
    suggested_subtopico: PROC,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Tração cutânea e complicações — procedimento ortopédico.',
  },
  'avancasp-enfermagem-curativos-e-manejo-de-feridas-1779344826734-1': {
    suggested_subtopico: PROC,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Bandagem em oito para imobilização — não curativo de ferida.',
  },
  'avancasp-enfermagem-curativos-e-manejo-de-feridas-1779344826734-3': {
    suggested_subtopico: PROC,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Material de imobilização para fraturas com edema.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780003709908-2': {
    suggested_subtopico: URG,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Hemorragia externa em urgência — controle de sangramento.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780003793968-0': {
    suggested_subtopico: CC,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Preparo de campo cirúrgico estéril.',
  },
  // batch 02
  'cogeps-unioeste-geral-outras-doencas-e-questoes-mescladas-sobre-doencas-transmissiveis-1777103583552-0': {
    suggested_subtopico: VIR,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Dengue — febre, mialgia, exantema e dor retro-orbitária.',
  },
  'cotec-fadenor-enfermagem-processo-de-enfermagem-1780010579953-2': {
    suggested_subtopico: PARA,
    confidence: 0.96,
    keep_current: false,
    rationale: 'Doença de Chagas (Trypanosoma cruzi) — parasitária.',
  },
  'cpcon-uepb-enfermagem-curativos-e-manejo-de-feridas-1779269305691-1': {
    suggested_subtopico: FQ,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Queimadura doméstica em criança — primeiros socorros.',
  },
  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780003349182-1': {
    suggested_subtopico: ATB,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Visita domiciliar do ACS — orientação a acamado.',
  },
  'fcpc-enfermagem-processo-de-enfermagem-1780004906875-0': {
    suggested_subtopico: CC,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Placa dispersiva do bisturi elétrico — centro cirúrgico.',
  },
  'fcpc-enfermagem-processo-de-enfermagem-1780004906875-9': {
    suggested_subtopico: PREC,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Acidente com material perfurocortante — precauções.',
  },
  'facet-enfermagem-curativos-e-manejo-de-feridas-1779344786992-8': {
    suggested_subtopico: FQ,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Queimadura térmica 2º grau — classificação e primeiros cuidados.',
  },
  'fepese-enfermagem-seguranca-do-paciente-1777102678563-0': {
    suggested_subtopico: MOB,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Escala dos 5 Is para risco de LPP — prevenção por posicionamento.',
  },
  'fgv-enfermagem-curativos-e-manejo-de-feridas-1779344759089-2': {
    suggested_subtopico: BACT,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Ferimento com objeto enferrujado — profilaxia antitetânica.',
  },
  'fumarc-enfermagem-atencao-basica-saude-da-familia-1778968094018-5': {
    suggested_subtopico: ATB,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Objetivo da visita domiciliar na saúde coletiva.',
  },
  'funatec-enfermagem-curativos-e-manejo-de-feridas-1779269315587-8': {
    suggested_subtopico: PROC,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Compressa quente em membros — termoterapia, não curativo.',
  },
  'fundatec-enfermagem-curativos-e-manejo-de-feridas-1779344813448-1': {
    suggested_subtopico: FQ,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Definição e classificação de queimaduras.',
  },
  'fundatec-enfermagem-curativos-e-manejo-de-feridas-1779344813448-2': {
    suggested_subtopico: PERI,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Prevenção de infecção do sítio cirúrgico no perioperatório.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006976703-1': {
    suggested_subtopico: DCNT,
    confidence: 0.9,
    keep_current: false,
    rationale: 'CRRT vs hemodiálise em neurocrítico — DCNT/renal.',
  },
  'epl-concursos-enfermagem-auditoria-e-gestao-da-qualidade-enfermagem-1779563713110-6': {
    suggested_subtopico: PROMO,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Tipos de educação em saúde — promoção.',
  },
  // batch 03
  'fundatec-enfermagem-processo-de-enfermagem-1780006976703-3': {
    suggested_subtopico: URG,
    confidence: 0.96,
    keep_current: false,
    rationale: 'Fratura exposta com sangramento — atendimento de trauma.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006976703-6': {
    suggested_subtopico: FQ,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Dor no grande queimado — manejo em queimaduras extensas.',
  },
  'furb-enfermagem-urgencias-e-emergencias-1777104012755-5': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Curativo compressivo para hemostasia — técnica de curativo.',
  },
  'iaupe-enfermagem-curativos-e-manejo-de-feridas-1779269315587-9': {
    suggested_subtopico: PROC,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Crioterapia e termoterapia — agentes físicos, não curativo de ferida.',
  },
  'iaupe-enfermagem-seguranca-do-paciente-1777102861438-7': {
    suggested_subtopico: MOB,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Prevenção de LPP — cuidados de posicionamento (exceção na questão).',
  },
  'ibade-enfermagem-curativos-e-manejo-de-feridas-1779344819753-6': {
    suggested_subtopico: BUCKET,
    confidence: 0.9,
    keep_current: true,
    rationale: 'Mescla curativo simples e administração oral sem tema dominante único.',
  },
  'ibade-enfermagem-processo-de-enfermagem-1780005137458-7': {
    suggested_subtopico: PROC_ART,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Organização e monitorização de materiais hospitalares.',
  },
  'ibade-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563875555-4': {
    suggested_subtopico: HIST,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Definição clássica de enfermagem (Henderson/Nightingale).',
  },
  'ibam-enfermagem-curativos-e-manejo-de-feridas-1779344779828-0': {
    suggested_subtopico: FQ,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Atendimento inicial a vítimas de queimaduras.',
  },
  'ibfc-enfermagem-curativos-e-manejo-de-feridas-1779269228428-6': {
    suggested_subtopico: FQ,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Primeiros socorros em queimaduras.',
  },
  'ibfc-enfermagem-curativos-e-manejo-de-feridas-1779269228428-7': {
    suggested_subtopico: FQ,
    confidence: 0.96,
    keep_current: false,
    rationale: 'Assistência ao paciente queimado — resfriamento e condutas.',
  },
  'ibfc-enfermagem-curativos-e-manejo-de-feridas-1779269291153-0': {
    suggested_subtopico: FQ,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Queimaduras extensas/químicas/elétricas — urgência em queimados.',
  },
  'ibfc-enfermagem-curativos-e-manejo-de-feridas-1779269291153-2': {
    suggested_subtopico: PROC,
    confidence: 0.9,
    keep_current: false,
    rationale: 'Indicação de aplicação de calor — termoterapia.',
  },
  'idecan-enfermagem-doencas-cardiovasculares-e-metabolicas-cronicas-diabete-hipertensao-icc-etc-1778712315153-5': {
    suggested_subtopico: DCNT,
    confidence: 0.96,
    keep_current: false,
    rationale: 'Fisiopatologia do diabetes mellitus.',
  },
  'idecan-enfermagem-feridas-e-queimaduras-1778712409051-1': {
    suggested_subtopico: BUCKET,
    confidence: 0.91,
    keep_current: true,
    rationale: 'SF 0,9% no curativo — técnica de cobertura.',
  },
  'idecan-enfermagem-feridas-e-queimaduras-1778712409051-2': {
    suggested_subtopico: BUCKET,
    confidence: 0.9,
    keep_current: true,
    rationale: 'Curativo de carvão ativado com prata — escolha de cobertura.',
  },
  'idecan-enfermagem-feridas-e-queimaduras-1778712409051-3': {
    suggested_subtopico: BUCKET,
    confidence: 0.91,
    keep_current: true,
    rationale: 'Curativo de alginato — manejo de feridas com exsudato.',
  },
  'ieses-enfermagem-atencao-basica-saude-da-familia-1778968180610-3': {
    suggested_subtopico: ATB,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Atribuições do técnico na atenção básica (vacinas, etc.).',
  },
  'igeduc-enfermagem-curativos-e-manejo-de-feridas-1779344751294-8': {
    suggested_subtopico: BACT,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Bacterioses na atenção primária — vigilância epidemiológica.',
  },
  'igeduc-enfermagem-curativos-e-manejo-de-feridas-1779344773456-3': {
    suggested_subtopico: FQ,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Queimadura por água fervente em criança — primeiros socorros.',
  },
  'igeduc-enfermagem-processo-de-enfermagem-1780010559720-1': {
    suggested_subtopico: PE,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Classificação de risco e acolhimento na APS.',
  },
  'igeduc-enfermagem-processo-de-enfermagem-1780011879977-4': {
    suggested_subtopico: COL,
    confidence: 0.96,
    keep_current: false,
    rationale: 'Coleta de materiais biológicos para exames laboratoriais.',
  },
  'imparh-enfermagem-seguranca-do-paciente-1777102936764-7': {
    suggested_subtopico: AUDIT,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Objetivos essenciais para segurança cirúrgica (OMS).',
  },
  'inaz-do-para-enfermagem-curativos-e-manejo-de-feridas-1779269228428-2': {
    suggested_subtopico: PROC,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Restauração de cárie dentária — odontologia, fora de curativos.',
  },
  'educa-pb-enfermagem-curativos-e-manejo-de-feridas-1779269305691-7': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Contraindicações de produtos em feridas colonizadas/queimaduras — manejo de curativos.',
  },
  'educa-pb-enfermagem-curativos-e-manejo-de-feridas-1779344779828-1': {
    suggested_subtopico: ATB,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Visita domiciliar na atenção básica.',
  },
  'igeduc-enfermagem-processo-de-enfermagem-1780009392850-9': {
    suggested_subtopico: BUCKET,
    confidence: 0.95,
    keep_current: true,
    rationale: 'Técnicas de curativos na atenção básica — núcleo do subtópico.',
  },
};

const MOVE_RULES: { re: RegExp; label: string; conf: number; note: string }[] = [
  {
    re: /coleta de sangue|coleta sangu[ií]nea|pun[cç][aã]o venosa para coleta|materiais biol[oó]gicos.*exames laboratoriais/i,
    label: COL,
    conf: 0.94,
    note: 'coleta laboratorial',
  },
  {
    re: /desinfec[cç][aã]o do.?hub|hub.*infus[aã]o de medicamentos/i,
    label: PUN,
    conf: 0.94,
    note: 'hub de cateter',
  },
  {
    re: /primeiros socorros.*queimadura|atendimento inicial.*queimadura|v[ií]tima.*queimadura|queimadura.*(?:2[°º]|3[°º]|segundo|terceiro) grau|queimadura t[eé]rmica|queimadura dom[eé]stica|grande queimado|extens[aã]o corporal.*queimadura|regra dos 9|superf[ií]cie corporal queimada/i,
    label: FQ,
    conf: 0.93,
    note: 'queimaduras',
  },
  {
    re: /fratura exposta|hemorragia externa|politraumatiz|acidente automobil[ií]stico.*fratura|trauma.*sangramento ativo/i,
    label: URG,
    conf: 0.94,
    note: 'trauma/urgência',
  },
  {
    re: /tricotomia|infec[cç][aã]o do s[ií]tio cir[uú]rgico|cuidados perioperat|pr[eé]-operat[oó]rio.*cirurgia eletiva/i,
    label: PERI,
    conf: 0.92,
    note: 'perioperatório',
  },
  {
    re: /bisturi el[eé]trico|placa dispersiva|campo cir[uú]rgico/i,
    label: CC,
    conf: 0.93,
    note: 'centro cirúrgico',
  },
  {
    re: /perfuro.?cortante|descartex|acidente.*seringa/i,
    label: PREC,
    conf: 0.92,
    note: 'perfurocortante',
  },
  {
    re: /diabetes mellitus|insufici[eê]ncia de insulina|hiperglicemia|p[eé] diab[eé]tico/i,
    label: DCNT,
    conf: 0.93,
    note: 'diabetes/DCNT',
  },
  {
    re: /doen[cç]a de chagas|trypanosoma cruzi/i,
    label: PARA,
    conf: 0.95,
    note: 'Chagas',
  },
  {
    re: /dengue|manchas vermelhas no corpo.*febre/i,
    label: VIR,
    conf: 0.93,
    note: 'dengue',
  },
  {
    re: /bacterioses|hanseníase|t[eé]tano|antitet[aâ]nica|objeto enferrujado/i,
    label: BACT,
    conf: 0.91,
    note: 'infecção bacteriana',
  },
  {
    re: /administra[cç][aã]o de vacinas|programa de imuniza[cç][aã]o/i,
    label: IMUN,
    conf: 0.92,
    note: 'imunização',
  },
  {
    re: /escala de depress[aã]o|geriatr|esquizofrenia|sa[uú]de mental/i,
    label: SM,
    conf: 0.93,
    note: 'saúde mental',
  },
  {
    re: /crian[cç]a.*(?:anos|meses|lactente)|puericultura|pediatr/i,
    label: SCC,
    conf: 0.9,
    note: 'pediatria',
  },
  {
    re: /visita domiciliar.*(?:ESF|aten[cç][aã]o b[aá]sica|ACS|agente comunit[aá]rio)/i,
    label: ATB,
    conf: 0.91,
    note: 'atenção básica',
  },
  {
    re: /classifica[cç][aã]o de risco.*acolhimento|acolhimento.*gravidade cl[ií]nica/i,
    label: PE,
    conf: 0.9,
    note: 'acolhimento/risco',
  },
  {
    re: /seguran[cç]a cir[uú]rgica|objetivos essenciais.*cir[uú]rgic/i,
    label: AUDIT,
    conf: 0.93,
    note: 'segurança cirúrgica',
  },
  {
    re: /educa[cç][aã]o em sa[uú]de|promo[cç][aã]o da sa[uú]de(?!.*cicatriza)/i,
    label: PROMO,
    conf: 0.91,
    note: 'promoção/educação',
  },
  {
    re: /enfermagem [eé] a ci[eê]ncia e a arte|teoria de nightingale|henderson/i,
    label: HIST,
    conf: 0.93,
    note: 'história/teoria',
  },
  {
    re: /materiais.*equipamentos.*instrumentos hospitalares|esteriliza[cç][aã]o de materiais/i,
    label: PROC_ART,
    conf: 0.92,
    note: 'processamento',
  },
  {
    re: /crioterapia|termoterapia|compressa quente|aplica[cç][aã]o de calor [úu]mido|bolsa t[eé]rmica/i,
    label: PROC,
    conf: 0.9,
    note: 'agentes físicos',
  },
  {
    re: /tra[cç][aã]o cut[aâ]nea|bandagem.*em oito|imobiliza[cç][aã]o.*fratura|gesso sint[eé]tico/i,
    label: PROC,
    conf: 0.9,
    note: 'imobilização',
  },
  {
    re: /inje[cç][aã]o intramuscular|m[uú]sculo vasto lateral|via intramuscular/i,
    label: VIAS,
    conf: 0.92,
    note: 'via IM',
  },
  {
    re: /(?:preven[cç][aã]o|evitar).*(?:úlcera|les[aã]o) por press[aã]o|escala dos 5 [iI]s|troca de dec[uú]bito.*(?:2 horas|acamado)|calc[aâ]neo.*acamado/i,
    label: MOB,
    conf: 0.91,
    note: 'prevenção LPP',
  },
  {
    re: /c[aá]ries dent[aá]ria|restaura[cç][aã]o dent[aá]ria|dente permanente/i,
    label: PROC,
    conf: 0.94,
    note: 'odontologia',
  },
  {
    re: /crrt|hemodi[aá]lise|terapia renal substitutiva/i,
    label: DCNT,
    conf: 0.9,
    note: 'terapia renal',
  },
];

function classify(item: BatchItem): Omit<InferRow, 'modulo_slug'> {
  const override = OVERRIDES[item.modulo_slug];
  if (override) return override;

  const blob = `${item.instruction} ${item.textFragment ?? ''} ${item.optionsPreview ?? ''}`;

  // Curativo de LPP em estágio com escolha de cobertura → manter
  if (
    /les[aã]o por press[aã]o.*est[aá]gio|úlcera por press[aã]o.*est[aá]gio|lpp.*(?:hidrocoloid|alginato|espuma|curativo)/i.test(
      blob,
    )
  ) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Escolha de curativo em úlcera por pressão — manejo de feridas.',
    };
  }

  for (const rule of MOVE_RULES) {
    if (rule.re.test(blob) || rule.re.test(item.modulo_slug)) {
      return {
        suggested_subtopico: rule.label,
        confidence: rule.conf,
        keep_current: false,
        rationale: `${rule.note} — tema dominante fora de Curativos.`,
      };
    }
  }

  if (CUR_CORE_RE.test(blob) || item.modulo_slug.includes('curativos-e-manejo-de-feridas')) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Técnica, cobertura ou manejo de feridas/curativos.',
    };
  }

  return {
    suggested_subtopico: BUCKET,
    confidence: 0.88,
    keep_current: true,
    rationale: 'Sem tema dominante claro fora de Curativos — manter bucket.',
  };
}

function writeInferred(batch: string, rows: InferRow[]) {
  const rel = `${OUT}/batch-${batch}-inferred.json`;
  writeFileSync(
    resolve(process.cwd(), rel),
    JSON.stringify({ batch, bucket: BUCKET, inferences: rows }, null, 2) + '\n',
  );
  const moves = rows.filter((r) => !r.keep_current && r.confidence >= 0.9).length;
  console.log(`batch-${batch}: ${rows.length} scanned, ${moves} moves (>=0.90)`);
}

let totalMoves = 0;
let totalScanned = 0;

for (let i = 1; i <= 3; i++) {
  const batch = String(i).padStart(2, '0');
  const data = JSON.parse(
    readFileSync(resolve(process.cwd(), `${OUT}/batch-${batch}.json`), 'utf8'),
  ) as { items: BatchItem[] };

  const rows: InferRow[] = data.items.map((item) => ({
    modulo_slug: item.modulo_slug,
    ...classify(item),
  }));

  writeInferred(batch, rows);
  totalScanned += rows.length;
  totalMoves += rows.filter((r) => !r.keep_current && r.confidence >= 0.9).length;
}

console.log(`TOTAL: ${totalScanned} scanned, ${totalMoves} moves (>=0.90)`);
