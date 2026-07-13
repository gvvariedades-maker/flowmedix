#!/usr/bin/env tsx
/**
 * Onda 8 — Mobilização e Posicionamento do Paciente faixa B, batches 01-03 (129 questões).
 * Gera batch-01..03-inferred.json para catalog-merge-agent-infer.
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

const BUCKET = 'Mobilização e Posicionamento do Paciente';
const OUT = 'artifacts/reclass/faixa-b/mobilizacao';

const URG = 'Urgências e Emergências';
const CRIANCA = 'Saúde da Criança';
const MULHER = 'Saúde da Mulher';
const PERIOP = 'Assistência Perioperatória (Inclui SRPA)';
const BIOSSEG = 'Infecções no Contexto da Biossegurança';
const SEG = 'Segurança do Paciente';
const OXI = 'Oxigenoterapia e Cuidados Respiratórios';
const PROC = 'Procedimentos Diversos';
const PE = 'Processo de Enfermagem';
const PROMO = 'Promoção à Saúde e Prevenção de Agravos';
const APS = 'Atenção Básica / Saúde da Família';
const VIRAL = 'Doenças Virais de Interesse Epidemiológico (Covid, Influenza, Sarampo, Polio etc.)';
const AGUDA = 'Questões Mescladas e Outras Doenças Agudas';
const DCNT = 'Outras Questões e Questões Mescladas sobre Doenças Crônicas Não Transmissíveis';
const BACTER = 'Doenças Bacterianas e Fúngicas (Tuberculose, Tétano, Candidíase etc.)';
const PARASIT = 'Doenças Parasitárias e Zoonoses';
const EPI = 'Epidemiologia e Vigilância Epidemiológica';
const TRAB = 'Enfermagem do Trabalho';
const VIAS = 'Vias de Administração';
const SONDAS = 'Instalação e Manejo de Sondas';
const PREC = 'Medidas de Prevenção e Precaução de Contato';
const CURAT = 'Curativos e Manejo de Feridas';

const MOB_CORE_RE =
  /les[aã]o(?:es)? por press[aã]o|\bLPP\b|\bLTP\b|les[aã]o tissular profunda|escara(?:s)?(?:\s+de)?(?:\s+press[aã]o)?|cisalhamento|digitopress[aã]o|branqueamento|mudan[cç]a(?:s)? de dec[uú]bito|posi[cç][aã]o(?:es)?(?:\s+de)?\s+(?:dorsal|ventral|lateral|fowler|trendelenburg|sims|genu|jackson|kraske|litotomia|proclive|semi-fowler)|transfer[eê]ncia(?:\s+do)?(?:\s+leito)?|mobiliza[cç][aã]o(?:\s+do)?(?:\s+paciente)?|movimenta[cç][aã]o(?:\s+na)?(?:\s+cama)?|len[cç]ol m[oó]vel|travessa|colch[aã]o(?:\s+de)?(?:\s+ar|\s+caixa de ovo)|cadeira de rodas|transporte(?:\s+do)?(?:\s+paciente)?(?:\s+intra)?|arruma[cç][aã]o(?:\s+da)?(?:\s+cama|\s+do leito)|preparo do leito|banho(?:\s+no)?(?:\s+leito|\s+de leito|\s+de aspers[aã]o)|higiene corporal(?:\s+do)?(?:\s+paciente)?|higiene pessoal(?:\s+no)?(?:\s+leito)?|higiene bucal(?:\s+de)?(?:\s+pacientes)?(?:\s+acamados)?|imobiliza[cç][aã]o(?:\s+com)?(?:\s+gesso|\s+tala)|aparelho gessado|retirada do gesso|tala tipo goteira|proemin[eê]ncias [oó]sseas|coxins?(?:\s+e)?(?:\s+travesseiros)?|base de apoio|ergonomia(?:\s+na)?(?:\s+movimenta[cç][aã]o)?|paciente acamado|acamado(?:\s+e)?(?:\s+dependente)?|retossigmoidoscopia|pun[cç][aã]o lombar|posicionamento(?:\s+para)?(?:\s+exame|\s+cir[uú]rgico|\s+do paciente)?|dec[uú]bito elevado(?:\s+\(30)/i;

const OVERRIDES: Record<string, Omit<InferRow, 'modulo_slug'>> = {
  'amauc-enfermagem-processo-de-enfermagem-1780004982901-8': {
    suggested_subtopico: CRIANCA,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Banho do recém-nascido — cuidado neonatal/pediátrico.',
  },
  'amauc-enfermagem-processo-de-enfermagem-1780005128081-3': {
    suggested_subtopico: PROMO,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Poluição hídrica e saúde ambiental — promoção/prevenção de agravos.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780001673873-0': {
    suggested_subtopico: BIOSSEG,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Pneumonia relacionada à assistência à saúde (PAV) — IRAS/biossegurança.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780002934000-5': {
    suggested_subtopico: URG,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Atendimento pré-hospitalar ao trauma — urgência.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780003031246-5': {
    suggested_subtopico: PERIOP,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Preparo pré-operatório (jejum, tricotomia, banho) — perioperatório.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780005791580-2': {
    suggested_subtopico: SEG,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Segurança do paciente e cultura de segurança — NSP.',
  },
  'ameosc-enfermagem-processo-de-enfermagem-1780011961798-5': {
    suggested_subtopico: URG,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Procedimentos em trauma e estabilização — urgência.',
  },
  'ameosc-enfermagem-seguranca-do-paciente-1779563448133-8': {
    suggested_subtopico: BIOSSEG,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Prevenção de pneumonia hospitalar — IRAS, não mobilização.',
  },
  'avancasp-enfermagem-processo-de-enfermagem-1780006456417-7': {
    suggested_subtopico: BUCKET,
    confidence: 0.94,
    keep_current: true,
    rationale: 'Prevenção de LPP em paciente acamado — núcleo mobilização.',
  },
  'avancasp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563858390-7': {
    suggested_subtopico: PROMO,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Educação em saúde — promoção, não posicionamento.',
  },
  'cev-urca-enfermagem-processo-de-enfermagem-1780006494066-2': {
    suggested_subtopico: PROC,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Cuidados paliativos domiciliares — conforto terminal, não mobilização técnica.',
  },
  'cogeps-unioeste-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563946005-7': {
    suggested_subtopico: PARASIT,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Acidentes por animais peçonhentos — zoonoses/animais peçonhentos.',
  },
  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780003654722-5': {
    suggested_subtopico: APS,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Visita domiciliar e autonomia do idoso — atenção básica.',
  },
  'cpcon-uepb-enfermagem-processo-de-enfermagem-1780003654722-7': {
    suggested_subtopico: APS,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Visita domiciliar e queixa de desconforto — núcleo APS.',
  },
  'educa-pb-enfermagem-processo-de-enfermagem-1780007246385-4': {
    suggested_subtopico: PROC,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Paciente em fase agonizante — cuidados paliativos/terminal.',
  },
  'educa-pb-enfermagem-processo-de-enfermagem-1780007246385-8': {
    suggested_subtopico: URG,
    confidence: 0.94,
    keep_current: false,
    rationale: 'APH e transporte de vítima com trauma — urgência.',
  },
  'facet-enfermagem-processo-de-enfermagem-1776056129848-8': {
    suggested_subtopico: PROC,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Certificação ONA e sistema de apoio à decisão — gestão/qualidade.',
  },
  'fau-unicentro-enfermagem-processo-de-enfermagem-1780002704012-9': {
    suggested_subtopico: URG,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Situação clínica de emergência — urgências.',
  },
  'fau-unicentro-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563919067-6': {
    suggested_subtopico: PROMO,
    confidence: 0.92,
    keep_current: false,
    rationale: 'ACS e risco ambiental domiciliar — promoção à saúde.',
  },
  'fcm-geral-outras-doencas-e-questoes-mescladas-sobre-doencas-transmissiveis-1777103604185-6': {
    suggested_subtopico: VIRAL,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Manejo e classificação de risco na dengue — doença viral.',
  },
  'fenix-instituto-enfermagem-processo-de-enfermagem-1780001846202-7': {
    suggested_subtopico: AGUDA,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Pneumonia adquirida na comunidade — doença aguda, não mobilização.',
  },
  'fenix-instituto-enfermagem-processo-de-enfermagem-1780006471061-4': {
    suggested_subtopico: PROC,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Constipação intestinal e manejo evacuatório — procedimento geral.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1776056129848-2': {
    suggested_subtopico: PE,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Registros de enfermagem e comunicação — processo de enfermagem.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006969552-3': {
    suggested_subtopico: OXI,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Paciente intubado em VM — cuidados respiratórios, não mobilização.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006969552-4': {
    suggested_subtopico: URG,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Alta da UTI e critérios clínicos — cuidado crítico/urgência.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780006969552-8': {
    suggested_subtopico: URG,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Tipos de choque e intervenção imediata — urgência.',
  },
  'fundatec-enfermagem-processo-de-enfermagem-1780011956256-5': {
    suggested_subtopico: APS,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Organização de transporte na APS — atenção básica.',
  },
  'ibade-enfermagem-atencao-basica-saude-da-familia-1778968144588-5': {
    suggested_subtopico: APS,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Mobilização social da comunidade — ESF/APS.',
  },
  'idecan-enfermagem-cuidados-paliativos-1778712409051-4': {
    suggested_subtopico: PROC,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Cuidados paliativos com dispneia — conforto terminal.',
  },
  'idecan-enfermagem-mobilizacao-e-posicionamento-do-paciente-1778712184780-0': {
    suggested_subtopico: BUCKET,
    confidence: 0.93,
    keep_current: true,
    rationale: 'Nutrição enteral e posicionamento (decúbito elevado) — mobilização.',
  },
  'idecan-enfermagem-procedimentos-diversos-1778712203076-2': {
    suggested_subtopico: BACTER,
    confidence: 0.94,
    keep_current: false,
    rationale: 'TDO para tuberculose — doença bacteriana.',
  },
  'idecan-enfermagem-protocolos-e-diretrizes-do-ministerio-da-saude-1778712437306-8': {
    suggested_subtopico: EPI,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Emergências em saúde pública — vigilância epidemiológica.',
  },
  'idecan-enfermagem-saude-do-idoso-1778712437306-6': {
    suggested_subtopico: VIAS,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Administração de medicamento por via subcutânea — vias de administração.',
  },
  'instituto-consulpam-enfermagem-processo-de-enfermagem-1780005311822-7': {
    suggested_subtopico: OXI,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Nebulização — oxigenoterapia/cuidados respiratórios.',
  },
  'instituto-consulpam-enfermagem-processo-de-enfermagem-1780005320352-0': {
    suggested_subtopico: PE,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Registro de óbito no prontuário — documentação de enfermagem.',
  },
  'instituto-consulpam-enfermagem-processo-de-enfermagem-1780006486032-4': {
    suggested_subtopico: VIAS,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Administração intramuscular — vias de administração.',
  },
  'instituto-consulplan-enfermagem-processo-de-enfermagem-1776056021381-1': {
    suggested_subtopico: PE,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Registros de enfermagem no processo do cuidar — PE.',
  },
  'instituto-iacp-enfermagem-processo-de-enfermagem-1780004280851-2': {
    suggested_subtopico: DCNT,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Insuficiência cardíaca congestiva — doença crônica.',
  },
  'instituto-ibed-enfermagem-processo-de-enfermagem-1780004982901-1': {
    suggested_subtopico: URG,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Transporte com suspeita de lesão medular — imobilização em trauma/APH.',
  },
  'instituto-verbena-geral-outras-doencas-e-questoes-mescladas-sobre-doencas-transmissiveis-1777103583552-8': {
    suggested_subtopico: VIRAL,
    confidence: 0.96,
    keep_current: false,
    rationale: 'Dengue — doença viral epidemiológica.',
  },
  'ms-sarmento-enfermagem-processo-de-enfermagem-1780008210115-6': {
    suggested_subtopico: PREC,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Higiene pessoal e ambiental para eliminar microrganismos — precaução padrão.',
  },
  'nao-informado-geral-procedimentos-diversos-1776056493133-0': {
    suggested_subtopico: OXI,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Dreno de tórax pós-toracotomia — cuidado respiratório.',
  },
  'selecon-enfermagem-processo-de-enfermagem-1780009359555-0': {
    suggested_subtopico: PROC,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Paciente em fase terminal/paliativos — não mobilização técnica.',
  },
  'unesc-enfermagem-processo-de-enfermagem-1776056149404-5': {
    suggested_subtopico: PE,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Documentação de enfermagem — processo de enfermagem.',
  },
  'unifil-enfermagem-processo-de-enfermagem-1780003645544-4': {
    suggested_subtopico: SONDAS,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Enteroclisma retal — procedimento com sonda/instilação.',
  },
  'unifil-enfermagem-processo-de-enfermagem-1780004469060-1': {
    suggested_subtopico: URG,
    confidence: 0.96,
    keep_current: false,
    rationale: 'Diretrizes ILCOR de reanimação — urgências/RCP.',
  },
  'unifil-enfermagem-processo-de-enfermagem-1780004469060-7': {
    suggested_subtopico: PROC,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Cuidados com estomias — procedimento específico de ostomia.',
  },
  'unifil-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563868300-2': {
    suggested_subtopico: APS,
    confidence: 0.91,
    keep_current: false,
    rationale: 'Pacto em Defesa do SUS — política de saúde/APS.',
  },
  'univali-enfermagem-processo-de-enfermagem-1780010600919-1': {
    suggested_subtopico: PROC,
    confidence: 0.93,
    keep_current: false,
    rationale: 'Preparo do corpo pós-morte — procedimento de necropsia/óbito.',
  },
  'univali-enfermagem-processo-de-enfermagem-1780010600919-4': {
    suggested_subtopico: PROC,
    confidence: 0.92,
    keep_current: false,
    rationale: 'Assistência ao paciente em fase terminal — cuidados paliativos.',
  },
  'univali-enfermagem-processo-de-enfermagem-1780010600919-8': {
    suggested_subtopico: CRIANCA,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Assistência de enfermagem à criança — pediatria.',
  },
  'vunesp-enfermagem-promocao-a-saude-e-prevencao-de-agravos-1779563868300-7': {
    suggested_subtopico: TRAB,
    confidence: 0.94,
    keep_current: false,
    rationale: 'Mapa de riscos ocupacionais — enfermagem do trabalho.',
  },
  'vunesp-enfermagem-vias-de-administracao-1776056366158-5': {
    suggested_subtopico: VIAS,
    confidence: 0.95,
    keep_current: false,
    rationale: 'Prescrição e técnica de medicação por via subcutânea — vias.',
  },
};

const MOVE_RULES: { re: RegExp; label: string; conf: number; note: string }[] = [
  {
    re: /atendimento pr[eé]-hospitalar|\bAPH\b|pr[eé]-hospitalar|transporte de v[ií]timas? com (?:suspeita de )?trauma|imobiliza[cç][aã]o.*coluna vertebral|les[aã]o (?:na )?coluna/i,
    label: URG,
    conf: 0.94,
    note: 'APH/trauma',
  },
  {
    re: /parada cardiorrespirat|\bSBV\b|suporte b[aá]sico de vida|\bILCOR\b|reanima[cç][aã]o cardiopulmonar|\bRCP\b/i,
    label: URG,
    conf: 0.95,
    note: 'RCP/SBV',
  },
  {
    re: /tipos de choque|choque (?:hipovol[eê]mico|distributivo|cardiog[eê]nico)/i,
    label: URG,
    conf: 0.93,
    note: 'choque',
  },
  {
    re: /situa[cç][aã]o cl[ií]nica de emerg[eê]ncia|emerg[eê]ncias? em sa[uú]de/i,
    label: URG,
    conf: 0.92,
    note: 'emergência',
  },
  {
    re: /banho do rec[eé]m-nascido|rec[eé]m-nascido.*banho|assist[eê]ncia de enfermagem [àa] crian[cç]a/i,
    label: CRIANCA,
    conf: 0.94,
    note: 'neonatal/pediatria',
  },
  {
    re: /pr[eé]-operat[oó]rio|pr[eé]paro pr[eé]-operat[oó]rio|tricotomia|jejum pr[eé]-operat[oó]rio|banho pr[eé]-operat[oó]rio/i,
    label: PERIOP,
    conf: 0.93,
    note: 'perioperatório',
  },
  {
    re: /pneumonia (?:relacionada|hospitalar|adquirida)|\bPAV\b|\bPAVM\b|pneumonia associada [àa] ventila[cç][aã]o/i,
    label: BIOSSEG,
    conf: 0.92,
    note: 'pneumonia/IRAS',
  },
  {
    re: /seguran[cç]a do paciente.*direito de toda pessoa|notifica[cç][aã]o de incidentes|identifica[cç][aã]o do paciente/i,
    label: SEG,
    conf: 0.92,
    note: 'NSP',
  },
  {
    re: /transporte seguro de pacientes entre servi[cç]os/i,
    label: SEG,
    conf: 0.93,
    note: 'transporte seguro',
  },
  {
    re: /nebuliza[cç][aã]o|inaloterap|aerossolterap/i,
    label: OXI,
    conf: 0.94,
    note: 'nebulização',
  },
  {
    re: /intubad.*ventila[cç][aã]o mec[aâ]nica|ventila[cç][aã]o mec[aâ]nica invasiva/i,
    label: OXI,
    conf: 0.92,
    note: 'VM',
  },
  {
    re: /dreno de t[oó]rax|drenagem tor[aá]cica/i,
    label: OXI,
    conf: 0.91,
    note: 'dreno torácico',
  },
  {
    re: /dengue|dengue [eé] uma doen[cç]a febril/i,
    label: VIRAL,
    conf: 0.95,
    note: 'dengue',
  },
  {
    re: /animais pe[cç]onhentos|escorpi[oõ]es?.*serpentes?|acidente.*(?:serpente|escorpi[aã]o|aranha)/i,
    label: PARASIT,
    conf: 0.93,
    note: 'animais peçonhentos',
  },
  {
    re: /tuberculose|\bTDO\b|tratamento diretamente observado/i,
    label: BACTER,
    conf: 0.94,
    note: 'tuberculose',
  },
  {
    re: /registros? de enfermagem|documenta[cç][aã]o de enfermagem|anota[cç][oõ]es de enfermagem/i,
    label: PE,
    conf: 0.92,
    note: 'registros PE',
  },
  {
    re: /registro de [oó]bito|preparo do corpo p[oó]s-morte|p[oó]s-morte/i,
    label: PROC,
    conf: 0.92,
    note: 'óbito/pós-morte',
  },
  {
    re: /cuidados paliativos|fase (?:agonizante|terminal)|paciente terminal|sem possibilidade de cura/i,
    label: PROC,
    conf: 0.91,
    note: 'paliativos',
  },
  {
    re: /estomias?|ostomias?/i,
    label: PROC,
    conf: 0.93,
    note: 'estomia',
  },
  {
    re: /enteroclisma|clister/i,
    label: SONDAS,
    conf: 0.92,
    note: 'enteroclisma',
  },
  {
    re: /via (?:subcut[aâ]nea|intramuscular|\bIM\b|\bSC\b)|administra[cç][aã]o de (?:um )?medicamento por via/i,
    label: VIAS,
    conf: 0.93,
    note: 'vias de medicação',
  },
  {
    re: /insufici[eê]ncia card[ií]aca congestiva|\bICC\b/i,
    label: DCNT,
    conf: 0.92,
    note: 'ICC/DCNT',
  },
  {
    re: /visita domiciliar|aten[cç][aã]o prim[aá]ria|unidade b[aá]sica de sa[uú]de|\bESF\b|agente comunit[aá]rio/i,
    label: APS,
    conf: 0.91,
    note: 'APS/ESF',
  },
  {
    re: /educa[cç][aã]o em sa[uú]de|promo[cç][aã]o [àa] sa[uú]de|mapa de riscos|pacto em defesa do sus/i,
    label: PROMO,
    conf: 0.9,
    note: 'promoção/educação',
  },
  {
    re: /mapa de riscos.*institui[cç][aã]o|identifica[cç][aã]o e registro de riscos ocupacionais/i,
    label: TRAB,
    conf: 0.94,
    note: 'mapa de riscos',
  },
  {
    re: /emerg[eê]ncias em sa[uú]de p[uú]blica|vigil[aâ]ncia epidemiol[oó]gica|surto|notifica[cç][aã]o compuls[oó]ria/i,
    label: EPI,
    conf: 0.92,
    note: 'vigilância epidemiológica',
  },
  {
    re: /polui[cç][aã]o (?:da )?[aá]gua|polui[cç][aã]o h[ií]drica/i,
    label: PROMO,
    conf: 0.93,
    note: 'saúde ambiental',
  },
  {
    re: /pneumonia adquirida na comunidade|pneumonia.*febre.*tosse/i,
    label: AGUDA,
    conf: 0.91,
    note: 'pneumonia aguda',
  },
  {
    re: /constipa[cç][aã]o|obstipa[cç][aã]o intestinal|esfor[cç]o evacuat[oó]rio/i,
    label: PROC,
    conf: 0.9,
    note: 'constipação',
  },
  {
    re: /certifica[cç][aã]o ona|gest[aã]o da qualidade.*hospitalar/i,
    label: PROC,
    conf: 0.9,
    note: 'gestão/qualidade',
  },
  {
    re: /higiene pessoal e ambiental.*elimin(?:ar|ação) (?:de )?microrganismos/i,
    label: PREC,
    conf: 0.91,
    note: 'higiene/precaução',
  },
  {
    re: /alta da uti|unidade de terapia intensiva.*alta/i,
    label: URG,
    conf: 0.9,
    note: 'alta UTI',
  },
];

function slugHint(slug: string): Omit<InferRow, 'modulo_slug'> | null {
  if (/vias-de-administracao/.test(slug)) {
    return {
      suggested_subtopico: VIAS,
      confidence: 0.95,
      keep_current: false,
      rationale: 'Slug de vias de administração — reclassificar.',
    };
  }
  if (/oxigenoterapia-e-cuidados-respiratorios/.test(slug) && !/lpp|les[aã]o.*press/i.test(slug)) {
    return null; // content-based for LPP item from oxi slug
  }
  if (/cuidados-paliativos/.test(slug)) {
    return {
      suggested_subtopico: PROC,
      confidence: 0.93,
      keep_current: false,
      rationale: 'Slug de cuidados paliativos.',
    };
  }
  if (/atencao-basica-saude-da-familia/.test(slug)) {
    return {
      suggested_subtopico: APS,
      confidence: 0.93,
      keep_current: false,
      rationale: 'Slug de atenção básica/ESF.',
    };
  }
  if (/protocolos-e-diretrizes-do-ministerio/.test(slug)) {
    return {
      suggested_subtopico: EPI,
      confidence: 0.91,
      keep_current: false,
      rationale: 'Protocolos MS — vigilância/epidemiologia.',
    };
  }
  if (/doencas-transmissiveis|doencas-virais/.test(slug)) {
    return {
      suggested_subtopico: VIRAL,
      confidence: 0.94,
      keep_current: false,
      rationale: 'Slug de doenças transmissíveis/virais.',
    };
  }
  return null;
}

function classify(item: BatchItem): Omit<InferRow, 'modulo_slug'> {
  const override = OVERRIDES[item.modulo_slug];
  if (override) return override;

  const blob = `${item.instruction} ${item.textFragment ?? ''} ${item.optionsPreview ?? ''}`;

  const hint = slugHint(item.modulo_slug);
  if (hint && !MOB_CORE_RE.test(blob)) return hint;

  for (const rule of MOVE_RULES) {
    if (rule.re.test(blob)) {
      return {
        suggested_subtopico: rule.label,
        confidence: rule.conf,
        keep_current: false,
        rationale: `${rule.note} — tema dominante fora de Mobilização.`,
      };
    }
  }

  if (MOB_CORE_RE.test(blob)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Mobilização, posicionamento, LPP, transferência ou higiene no leito.',
    };
  }

  if (/mobilizacao-e-posicionamento/.test(item.modulo_slug)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.94,
      keep_current: true,
      rationale: 'Slug canônico de mobilização e posicionamento.',
    };
  }

  if (/cuidados-gerais-com-higiene/.test(item.modulo_slug)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.92,
      keep_current: true,
      rationale: 'Higiene e conforto do paciente acamado — mobilização/cuidados básicos.',
    };
  }

  if (/seguranca-do-paciente/.test(item.modulo_slug) && /les[aã]o.*press[aã]o|\bLPP\b/i.test(blob)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.93,
      keep_current: true,
      rationale: 'Prevenção de LPP — núcleo mobilização/posicionamento.',
    };
  }

  if (/promocao-a-saude/.test(item.modulo_slug) && /[uú]lceras? de press[aã]o|\bLPP\b/i.test(blob)) {
    return {
      suggested_subtopico: BUCKET,
      confidence: 0.92,
      keep_current: true,
      rationale: 'Úlceras de pressão em acamados — prevenção por mobilização.',
    };
  }

  return {
    suggested_subtopico: BUCKET,
    confidence: 0.9,
    keep_current: true,
    rationale: 'Conteúdo compatível com mobilização ou sem destino canônico claro ≥0,90.',
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
