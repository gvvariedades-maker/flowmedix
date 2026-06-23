import type { QuestionOption } from '@/lib/catalogMigration/classifyFamily';
import type { GoldenRuleRow } from '@/components/slides/variants/GoldenRule';
import { formatGabaritoCorrect } from '@/lib/catalogMigration/slideContract';
import {
  extractCurativosAssertives,
  normalizeCurativosInstruction,
  resolveCurativosAssertives,
  type CurativosAssertive,
} from '@/lib/catalogMigration/upgradePremiumCurativos';

export const PUNCAO_GOLDEN_FILE = 'questao-premium-admtec-puncao-venosa-cateteres.json';
export const PUNCAO_EXCETO_GOLDEN_FILE =
  'questao-premium-cev-urca-puncao-exceto-med-endovenosa.json';
export const PUNCAO_FLEBITE_GOLDEN_FILE =
  'questao-premium-avancasp-puncao-infiltracao-flebite.json';
export const PUNCAO_DISPOSITIVO_GOLDEN_FILE =
  'questao-premium-gama-puncao-scalp-jelco-calibre.json';
export const PUNCAO_TEMPO_GOLDEN_FILE =
  'questao-premium-cpcon-puncao-troca-equipos-intervalos.json';
export const PUNCAO_PERIFERICA_GOLDEN_FILE =
  'questao-premium-funpar-puncao-tecnica-periferica.json';

type SlideRecord = Record<string, unknown>;
type DangerZoneItem = { label: string; detail: string; correct: string };

export type BuildPuncaoSlidesInput = {
  instruction: string;
  options: QuestionOption[];
  topico: string;
  subtopico: string;
};

function truncate(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function slideMeta(topico: string, subtopico: string): { topico: string; subtopico: string } {
  return { topico, subtopico };
}

export function isPuncaoSubtopico(subtopico: string): boolean {
  const n = subtopico.trim().toLowerCase();
  return (
    n === 'punção venosa e cuidados com cateteres' ||
    n === 'punção venosa' ||
    n === 'cateteres'
  );
}

export function normalizePuncaoInstruction(instruction: string): string {
  return normalizeCurativosInstruction(instruction)
    .replace(/\n?\d{3,4}\)\s*(\d{3,4}\)\s*)*/g, '')
    .replace(/\(\s*\d{3,4}\s*\)/g, '')
    .trim();
}

function isExcetoCommand(instruction: string): boolean {
  const blob = instruction.toLowerCase();
  return (
    /\bexceto\b/.test(blob) ||
    /\bincorreta\b/.test(blob) ||
    /\bincorreto\b/.test(blob) ||
    /\bnão (se aplica|constitui)\b/.test(blob) ||
    /\bnao (se aplica|constitui)\b/.test(blob)
  );
}

export function puncaoGoldenReferenceForInput(instruction: string, options: QuestionOption[]): string {
  const topic = inferPuncaoTopic(instruction, options);
  if (topic === 'EXCETO — técnica / conduta') return PUNCAO_EXCETO_GOLDEN_FILE;
  if (topic === 'Flebite e complicações') return PUNCAO_FLEBITE_GOLDEN_FILE;
  if (topic === 'Dispositivo / calibre / jelco') return PUNCAO_DISPOSITIVO_GOLDEN_FILE;
  if (topic === 'Tempo / observação pós-procedimento') return PUNCAO_TEMPO_GOLDEN_FILE;
  if (topic === 'Punção venosa periférica') return PUNCAO_PERIFERICA_GOLDEN_FILE;
  if (topic === 'Prevenção de IPCS no CVC') return PUNCAO_GOLDEN_FILE;
  if (topic === 'Manutenção de cateter') return PUNCAO_PERIFERICA_GOLDEN_FILE;
  if (topic === 'Antissepsia na punção') return PUNCAO_PERIFERICA_GOLDEN_FILE;
  return PUNCAO_PERIFERICA_GOLDEN_FILE;
}

export function inferPuncaoTopic(instruction: string, options: QuestionOption[]): string {
  const instr = instruction.toLowerCase();
  const blob = `${instruction} ${options.map((o) => o.text).join(' ')}`.toLowerCase();
  if (
    /ipcs|corrente sanguínea|corrente sanguinea|cateter venoso central|\bcvc\b|barreira estéril máxima|barreira esteril maxima|infecção.*(central|cvc)|infeccao.*(central|cvc)|iras.*(cvc|cateter venoso central)|infecção relacionada.*cateter venoso central/.test(
      instr,
    )
  ) {
    return 'Prevenção de IPCS no CVC';
  }
  if (/flebite|extravasação|extravasacao|flebitis|endoflebite|infiltra/.test(blob)) {
    return 'Flebite e complicações';
  }
  if (isExcetoCommand(instruction)) {
    return 'EXCETO — técnica / conduta';
  }
  if (
    /\bbundle\b/.test(instr) &&
    /manuten[cç][ãa]o|cateter venoso|canh[oõ]o|d[aâ]nula|torneirinha|conector|álcool 70|alcool 70/.test(blob)
  ) {
    return 'Manutenção de cateter';
  }
  if (
    /escolha do cateter|cateter recomendado|qual.*cateter|decurta perman[eê]ncia|perman[eê]ncia em torno de/i.test(
      instr,
    ) &&
    /dispositivo|cateter|jelco|scalp|escalpe|agulhado|flexível|flexivel/i.test(blob)
  ) {
    return 'Dispositivo / calibre / jelco';
  }
  if (
    /\d+\s*(horas?|h\b|minutos?|segundos?|dias?)|tempo de (observa|aplica)|intervalo|a cada \d|observar diariamente|permanência|96\s*h|48\s*a\s*72|troca.*equipo|frequência.*(troca|infus)|inferior a 72|tão logo quanto possível|préestabelecidos/.test(
      blob,
    )
  ) {
    return 'Tempo / observação pós-procedimento';
  }
  if (
    /jelco|scalp|butterfly|cateter agulhado|escalpe|calibre|\b\d{1,2}\s*g\b|gauge|french|charri[eè]re|\bch\b|unidade dimensional.*di[aâ]metro|di[aâ]metro.*cateter|equipo macro|equipo micro|macro gota|micro gota|equipo.*filtro|filtro.*equipo|transfus[aã]o.*sangue|hemocomponente.*filtro|filtro.*hemocomponente|dispositivo.*(apresentado|imagem|acesso intravenoso)/.test(
      blob,
    )
  ) {
    return 'Dispositivo / calibre / jelco';
  }
  if (/jugular interna|veia jugular|subcl[aá]via|pun[cç][ãa]o.*jugular/.test(blob)) {
    return 'Acesso venoso central';
  }
  if (/cateteriza[cç][ãa]o.*art[eé]ria|press[aã]o arterial invasiva|\bpam\b|art[eé]ria radial.*femoral/.test(blob)) {
    return 'Acesso arterial / PAM';
  }
  if (/di[aá]lise peritoneal|hemodi[aá]lise|fal[eê]ncia renal/.test(blob)) {
    return 'Acesso venoso e cateteres';
  }
  if (/cateterismo card[ií]aco|irriga[cç][ãa]o coronar/.test(blob)) {
    return 'Acesso venoso central';
  }
  if (/venóclise|venoclise/.test(blob)) {
    return 'Punção venosa periférica';
  }
  if (
    /antissepsia|clorexidina|assepsia|pvpi|povidona|álcool 70|alcool 70|fricção das mãos|friccao das maos|degermação|degermacao|higienização das mãos|higienizacao das maos/.test(
      blob,
    ) &&
    /pun[cç][ãa]o|venopun|acesso venoso|cateter|inserção|insercao/.test(blob)
  ) {
    return 'Antissepsia na punção';
  }
  if (
    /venopun[cç][ãa]o|pun[cç][ãa]o venosa perif|puncao venosa perif|t[eé]cnica de pun[cç][ãa]o|garrote.*(pun[cç]|dist[aâ]ncia|local)|bisel|fossa antecubital|antecubital|venas? cef[aá]lic|sele[cç][ãa]o do vaso|material indispens[aá]vel.*pun[cç]|ângulo.*cateter|introduz.*agulha.*veia|acesso venoso perif|periféric|periferic|coleta de sangue|sem refluxo|queima[cç][ãa]o.*local|pun[cç][ãa]o.*endovenosa|preparo.*medicamento|distal-proximal|distal.*proximal/.test(
      blob,
    )
  ) {
    return 'Punção venosa periférica';
  }
  if (/dispositivo.*infusão|dispositivo.*infusao/.test(blob)) {
    return 'Punção venosa periférica';
  }
  if (/punção venosa|puncao venosa/.test(blob)) {
    return 'Punção venosa periférica';
  }
  if (/curativo.*cateter|manutenção.*cateter|manutencao.*cateter|lúmen|lumen|obstrução|obstrucao|flushing|heparinização/.test(
      blob,
    )
  ) {
    return 'Manutenção de cateter';
  }
  return 'Acesso venoso e cateteres';
}

type TopicProfile = {
  conceptFooter: string;
  goldenContent: string;
  goldenFooter: string;
  logicFooter: string;
  logicFix: string;
  dangerContent: string;
  dangerFooter: (correctId: string) => string;
  chipLabel: string;
};

const TOPIC_PROFILES: Record<string, TopicProfile> = {
  'Prevenção de IPCS no CVC': {
    conceptFooter: 'IPCS no CVC = bundle completo — uma medida isolada não substitui o pacote.',
    goldenContent: 'BUNDLE DO CVC: ASSEPSIA + BARREIRA MÁXIMA + CURATIVO CERTO + REMOÇÃO PRECOCE',
    goldenFooter: 'Gabarito resume o bundle: assepsia + barreira máxima + curativo adequado + remoção precoce.',
    logicFooter: 'Estratégia: enunciado → bundle → gabarito → eliminar distratoras',
    logicFix: 'IPCS no CVC — bundle integrado vence “uma medida só”.',
    dangerContent: 'PEGADINHAS — IPCS NO CATETER VENOSO CENTRAL',
    dangerFooter: (id) => `Interrogue cada letra: armadilha × bundle completo (letra ${id}) antes de marcar.`,
    chipLabel: 'IPCS — CVC',
  },
  'Flebite e complicações': {
    conceptFooter: 'Flebite = dor, calor, rubor no trajeto venoso — retire o dispositivo.',
    goldenContent: 'FLEBITE: RETIRAR DISPOSITIVO + AVALIAR EXTENSÃO + NÃO REUTILIZAR O MESMO ACESSO',
    goldenFooter: 'A banca confunde sinais locais com extravasação e conduta de manutenção.',
    logicFooter: 'Identifique sinais locais → retire cateter → documente e reavalie acesso.',
    logicFix: 'flebite exige retirada do dispositivo, não “observar e manter”.',
    dangerContent: 'PEGADINHAS — FLEBITE E ACESSO VENOSO',
    dangerFooter: (id) => `Sinais de flebite fecham letra ${id} — não mantenha o cateter inflamado.`,
    chipLabel: 'FLEBITE',
  },
  'Dispositivo / calibre / jelco': {
    conceptFooter: 'Scalp = curto/coleta; jelco = infusão prolongada — calibre segue vaso e terapia.',
    goldenContent: 'DISPOSITIVO: CALIBRE + INDICAÇÃO CLÍNICA — NÃO INVERTA SCALP × JELCO',
    goldenFooter: 'A banca troca calibres e indicações entre scalp, jelco e equipos.',
    logicFooter: 'Dispositivo → calibre → indicação → eliminar inversões da banca.',
    logicFix: 'scalp não é calibre maior nem infusão prolongada — jelco cobre terapia IV contínua.',
    dangerContent: 'PEGADINHAS — DISPOSITIVO E CALIBRE',
    dangerFooter: (id) => `Calibre e indicação corretos fecham letra ${id} — não inverta scalp × jelco.`,
    chipLabel: 'DISPOSITIVO',
  },
  'Tempo / observação pós-procedimento': {
    conceptFooter: 'Intervalo de troca segue tipo de infusão/solução — não generalize 24 h ou 48 h.',
    goldenContent: 'TEMPO: TIPO DE INFUSÃO DEFINE O INTERVALO — NÃO GENERALIZE HORAS SEM CONTEXTO',
    goldenFooter: 'A banca inverte intervalos entre contínua, intermitente, NPP e hemocomponente.',
    logicFooter: 'Tipo de infusão → intervalo ANVISA → eliminar números trocados.',
    logicFix: 'infusão contínua = mínimo 96 h entre trocas de equipo (salvo contaminação).',
    dangerContent: 'PEGADINHAS — TEMPO E TROCA',
    dangerFooter: (id) => `Intervalo correto para o tipo de infusão fecha letra ${id}.`,
    chipLabel: 'TEMPO',
  },
  'Punção venosa periférica': {
    conceptFooter: 'Punção periférica = técnica asséptica + ordem correta + fixação e observação pós-punção.',
    goldenContent: 'PUNÇÃO SEGURA: ASSEPSIA + SELEÇÃO DO VASO + ÂNGULO/PROFUNDIDADE + FIXAÇÃO',
    goldenFooter: 'A banca testa sequência, contraindicações locais e cuidados pós-punção.',
    logicFooter: 'Sequência: preparo → punção → confirmação → fixação → documentação.',
    logicFix: 'técnica asséptica e seleção do vaso vencem atalhos de punção.',
    dangerContent: 'PEGADINHAS — PUNÇÃO VENOSA PERIFÉRICA',
    dangerFooter: (id) => `Técnica e sequência corretas fecham letra ${id}.`,
    chipLabel: 'PUNÇÃO',
  },
  'Manutenção de cateter': {
    conceptFooter: 'Manutenção = assepsia na manipulação + curativo íntegro + flushing conforme protocolo.',
    goldenContent: 'MANUTENÇÃO: HIGIENE DAS MÃOS + CURATIVO ÍNTEGRO + TÉCNICA ASSÉPTICA NO LÚMEN',
    goldenFooter: 'A banca troca frequência de curativo e técnica de desinfecção do conector.',
    logicFooter: 'Cada manipulação exige assepsia — curativo úmido ou solto troca na hora.',
    logicFix: 'manutenção asséptica contínua previne infecção associada ao cateter e obstrução.',
    dangerContent: 'PEGADINHAS — MANUTENÇÃO DE CATETER',
    dangerFooter: (id) => `Protocolo de manutenção correto fecha letra ${id}.`,
    chipLabel: 'CATETER',
  },
  'Antissepsia na punção': {
    conceptFooter: 'Antissepsia = higiene das mãos + antissepsia cutânea antes da punção — técnica sem toque após preparo.',
    goldenContent: 'ASSEPSIA: HIGIENE DAS MÃOS + ANTISSEPSIA CUTÂNEA + NÃO REPASSE NA PELE PREPARADA',
    goldenFooter: 'A banca troca concentração de clorexidina, tempo de fricção e sequência do preparo.',
    logicFooter: 'Preparo do sítio → punção sem recontaminação → fixação asséptica.',
    logicFix: 'clorexidina alcoólica 0,5% e fricção no sítio antes da inserção do cateter.',
    dangerContent: 'PEGADINHAS — ANTISSEPSIA NA PUNÇÃO',
    dangerFooter: (id) => `Técnica asséptica correta fecha letra ${id}.`,
    chipLabel: 'ASSEPSIA',
  },
  'Acesso venoso e cateteres': {
    conceptFooter: 'Julgue técnica asséptica, indicação e cuidados do dispositivo antes de marcar.',
    goldenContent: 'ACESSO VENOSO: ASSEPSIA + INDICAÇÃO + MANUTENÇÃO + RETIRADA OPORTUNA',
    goldenFooter: 'Em cateteres, conduta isolada raramente é a resposta da banca.',
    logicFooter: 'Enunciado → tema do acesso → gabarito → eliminar distratoras.',
    logicFix: 'elimine alternativas que quebrem técnica asséptica ou indicação do procedimento.',
    dangerContent: 'PEGADINHAS — ACESSO VENOSO',
    dangerFooter: (id) => `Compare cada alternativa com a letra ${id} antes de marcar.`,
    chipLabel: 'ACESSO IV',
  },
  'Acesso venoso central': {
    conceptFooter: 'Acesso central (jugular/subclávia) exige técnica rigorosa — riscos: pneumotórax, hematoma, lesão arterial.',
    goldenContent: 'ACESSO CENTRAL: ANATOMIA + TÉCNICA ASSÉPTICA + RISCOS (PNEUMOTÓRAX, HEMATOMA)',
    goldenFooter: 'A banca troca riscos da jugular (lesão arterial, nervo laríngeo) com complicações inexistentes.',
    logicFooter: 'Identifique o sítio → riscos reais → eliminar distratoras anatômicas.',
    logicFix: 'jugular interna: punção arterial acidental e lesão nervosa são riscos clássicos.',
    dangerContent: 'PEGADINHAS — ACESSO VENOSO CENTRAL',
    dangerFooter: (id) => `Riscos e técnica corretos fecham letra ${id}.`,
    chipLabel: 'CENTRAL',
  },
  'Acesso arterial / PAM': {
    conceptFooter: 'PAM invasiva usa artérias radial ou femoral — não confunda com acesso venoso.',
    goldenContent: 'PAM: RADIAL OU FEMORAL — TÉCNICA ASSÉPTICA + FIXAÇÃO DO CATETER',
    goldenFooter: 'A banca mistura artérias acessíveis para monitorização invasiva.',
    logicFooter: 'Indicação PAM → artéria correta → eliminar pares anatômicos errados.',
    logicFix: 'radial e femoral são as principais para cateterização arterial na PAM.',
    dangerContent: 'PEGADINHAS — PAM / ACESSO ARTERIAL',
    dangerFooter: (id) => `Par arterial correto fecha letra ${id}.`,
    chipLabel: 'PAM',
  },
  'EXCETO — técnica / conduta': {
    conceptFooter: 'EXCETO = a única alternativa falsa entre condutas que parecem corretas.',
    goldenContent: 'COMANDO EXCETO: ENCONTRE A FALSA — NÃO A MAIS “CLÍNICA” À PRIMEIRA VISTA',
    goldenFooter: 'A banca mistura condutas corretas com uma exceção técnica sutil.',
    logicFooter: 'Estratégia: comando EXCETO → julgar cada alternativa → marcar a falsa.',
    logicFix: 'no EXCETO, as alternativas “certinhas” são distratoras — sobra a exceção.',
    dangerContent: 'PEGADINHAS — COMANDO EXCETO EM ACESSO VENOSO',
    dangerFooter: (id) => `Letra ${id} é a exceção — as demais descrevem conduta correta.`,
    chipLabel: 'EXCETO',
  },
};

function topicProfile(topic: string): TopicProfile {
  return TOPIC_PROFILES[topic] ?? TOPIC_PROFILES['Acesso venoso e cateteres'];
}

const IPCS_SLIDE_FRAGMENT =
  /\b(bundle|ipcs|cvc|cateter venoso central|barreira estéril máxima|barreira esteril maxima|remoção precoce)\b/i;

function isIpcsTopic(topic: string): boolean {
  return topic === 'Prevenção de IPCS no CVC';
}

function slideDetailForTopic(text: string, topic: string): string {
  const detail = truncate(text, 500);
  if (isIpcsTopic(topic) || !IPCS_SLIDE_FRAGMENT.test(detail)) return detail;
  return truncate(text.split(/[,.;]/)[0] ?? text, 500);
}

function inferOptionTrapForTopic(text: string, topic: string): string {
  const trap = inferOptionTrap(text);
  if (isIpcsTopic(topic) || !IPCS_SLIDE_FRAGMENT.test(trap)) return trap;
  return truncate(text, 500);
}

function inferOptionCorrectionForTopic(
  wrongText: string,
  correctText: string,
  correctId: string,
  topic: string,
): string {
  const trap = inferOptionTrapForTopic(wrongText, topic);
  if (trap !== truncate(wrongText, 500)) {
    return formatGabaritoCorrect(correctId, trap);
  }
  return formatGabaritoCorrect(correctId, truncate(correctText, 500));
}

function inferAcessoDefinition(text: string): string {
  const lower = text.toLowerCase();
  if (/jugular|subcl[aá]via/.test(lower)) {
    return 'Acesso central: riscos de punção arterial, hematoma, lesão nervosa e pneumotórax.';
  }
  if (/radial|femoral/.test(lower) && /art[eé]ria|pam/.test(lower)) {
    return 'Cateterização arterial para PAM — radial ou femoral.';
  }
  if (/di[aá]lise|hemodi[aá]lise/.test(lower)) {
    return 'Terapia renal substitutiva — diálise peritoneal ou hemodiálise.';
  }
  if (/infiltra/.test(lower)) {
    return 'Infiltração: interromper infusão e remover cateter.';
  }
  if (/venóclise|venoclise|fluido.*veia/.test(lower)) {
    return 'Venóclise: infusão de fluidos/medicamentos por veia periférica.';
  }
  return truncate(text, 500);
}

function inferAcessoTrap(wrongText: string, correctText: string, correctId: string, topic: string): string {
  const wrong = wrongText.toLowerCase();
  if (topic === 'Acesso venoso central') {
    if (/vago|temporal|raqu[ií]deo|atrofia muscular/.test(wrong)) {
      return formatGabaritoCorrect(
        correctId,
        'Riscos da jugular: punção arterial, lesão nervosa (laríngeo), hematoma — não vago/temporal.',
      );
    }
  }
  if (topic === 'Acesso arterial / PAM') {
    if (/braquial|aorta|popl[ií]tea/.test(wrong)) {
      return formatGabaritoCorrect(correctId, 'PAM invasiva: artérias radial e femoral são as principais.');
    }
  }
  return formatGabaritoCorrect(correctId, inferAcessoDefinition(correctText));
}

function inferManutencaoDefinition(text: string): string {
  const lower = text.toLowerCase();
  if (/d[aâ]nula|torneirinha/.test(lower)) {
    return 'Dânula (torneirinha): conector com válvula — desinfetar com álcool 70% antes de acessar.';
  }
  if (/hub/.test(lower)) {
    return 'Hub: conector sem torneirinha — desinfecção obrigatória do canhão.';
  }
  if (/extensor/.test(lower)) {
    return 'Extensor: prolonga o sistema — não é sinônimo de dânula/torneirinha.';
  }
  if (/jelco/.test(lower)) {
    return 'Jelco é o cateter de punção, não o conector do equipo.';
  }
  return slideDetailForTopic(text, 'Manutenção de cateter');
}

function inferManutencaoTrap(wrongText: string, correctText: string, correctId: string): string {
  return formatGabaritoCorrect(correctId, inferManutencaoDefinition(correctText));
}

function buildManutencaoConceptItems(
  input: BuildPuncaoSlidesInput,
  correct: QuestionOption,
): { label: string; detail: string; icon: string }[] {
  const preview = truncate(normalizePuncaoInstruction(input.instruction).replace(/\s+/g, ' '), 500);
  const items: { label: string; detail: string; icon: string }[] = [
    { label: 'Contexto', detail: preview, icon: 'Gauge' },
  ];
  for (const opt of input.options.slice(0, 4)) {
    items.push({
      label: `Letra ${opt.id}`,
      detail: inferManutencaoDefinition(opt.text),
      icon: opt.is_correct ? 'CheckCircle' : 'XCircle',
    });
  }
  items.push({
    label: 'Gabarito',
    detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
    icon: 'Target',
  });
  return items.slice(0, 20);
}

function inferOptionTrap(text: string): string {
  const lower = text.toLowerCase();
  if (/0,5%|0\.5%/.test(lower) && /clorexidina/.test(lower)) {
    return 'Concentração ou uso isolado de clorexidina sem bundle completo.';
  }
  if (/72 horas|72 h/.test(lower) && /independente|independentemente/.test(lower)) {
    return 'Curativo não se troca em cronograma fixo — troca quando sujo, solto ou úmido.';
  }
  if (/femoral/.test(lower) && /rotina|preferir|instável|instavel/.test(lower)) {
    return 'Femoral não é preferência de rotina — maior risco de infecção.';
  }
  if (/antibiótico|antibiotico|profilátic|profilatic/.test(lower)) {
    return 'Antibiótico profilático não faz parte do bundle de prevenção de IPCS.';
  }
  if (/vigilância microbiológica|vigilancia microbiologica|cultura rotineira/.test(lower)) {
    return 'Cultura rotineira do cateter não substitui bundle de inserção/manutenção.';
  }
  if (/iodo-povidona|iodopovidona|povidona/.test(lower) && /lúmen|lumen/.test(lower)) {
    return 'Desinfecção rotineira do lúmen com iodo não é conduta padrão do bundle.';
  }
  if (/reutiliz|reaproveit/.test(lower)) {
    return 'Dispositivo ou material de punção não se reutiliza.';
  }
  if (/álcool 70|alcool 70/.test(lower) && /punção|puncao/.test(lower)) {
    return 'Antissepsia antes da punção exige clorexidina alcoólica, não só álcool 70%.';
  }
  return truncate(text, 500);
}

function inferOptionCorrection(wrongText: string, correctText: string, correctId: string): string {
  const trap = inferOptionTrap(wrongText);
  if (trap !== truncate(wrongText, 500)) {
    return formatGabaritoCorrect(correctId, trap);
  }
  return formatGabaritoCorrect(correctId, truncate(correctText, 500));
}

function inferComplicationDefinition(text: string): string {
  const lower = text.toLowerCase();
  if (/infiltra/.test(lower)) {
    return 'Solução medicamentosa fora do vaso, no tecido subcutâneo.';
  }
  if (/flebite|flebitis|endoflebite/.test(lower)) {
    return 'Inflamação da veia: dor, calor, rubor no trajeto venoso.';
  }
  if (/hematoma/.test(lower)) {
    return 'Extravasamento de sangue no tecido por punção — equimose local.';
  }
  if (/esclerose/.test(lower)) {
    return 'Endurecimento/irritação química crônica da veia.';
  }
  if (/abscesso/.test(lower)) {
    return 'Coleção purulenta por complicação infecciosa.';
  }
  if (/extravasa/.test(lower)) {
    return 'Medicamento vesicante ou irritante fora do vaso — risco de necrose.';
  }
  return truncate(text, 500);
}

function inferComplicationTrap(wrongText: string, correctText: string, correctId: string): string {
  const wrong = wrongText.toLowerCase();
  const correct = correctText.toLowerCase();
  if (/flebite|flebitis/.test(wrong) && /infiltra/.test(correct)) {
    return formatGabaritoCorrect(
      correctId,
      'Flebite é inflamação do trajeto venoso — o enunciado descreve líquido no subcutâneo (infiltração).',
    );
  }
  if (/infiltra/.test(wrong) && /flebite|flebitis/.test(correct)) {
    return formatGabaritoCorrect(
      correctId,
      'Infiltração é solução fora do vaso — flebite apresenta dor/calor/rubor no trajeto da veia.',
    );
  }
  if (/hematoma/.test(wrong)) {
    return formatGabaritoCorrect(correctId, 'Hematoma é sangue no tecido — não líquido da infusão medicamentosa.');
  }
  if (/esclerose/.test(wrong)) {
    return formatGabaritoCorrect(correctId, 'Esclerose é evolução por irritantes — não o mecanismo agudo do enunciado.');
  }
  if (/abscesso/.test(wrong)) {
    return formatGabaritoCorrect(correctId, 'Abscesso é infecção com pus — não passagem imediata de infusato ao subcutâneo.');
  }
  return formatGabaritoCorrect(correctId, inferComplicationDefinition(correctText));
}

function inferDeviceDefinition(text: string): string {
  const lower = text.toLowerCase();
  if (/scalp|butterfly|cateter agulhado|escalpe/.test(lower)) {
    return 'Scalp: curta duração/coleta — calibres menores (ex.: 21G, 23G).';
  }
  if (/jelco|periférico|periferico/.test(lower)) {
    return 'Jelco: infusão prolongada e medicamentos IV — calibres 14G a 24G.';
  }
  if (/\b25\s*g\b|\b24\s*g\b|\b23\s*g\b|\b22\s*g\b|\b21\s*g\b|\b20\s*g\b|\bcalibre\b|\bgauge\b/.test(lower)) {
    return 'Calibre (G): número maior = diâmetro menor — ajuste ao vaso e à infusão.';
  }
  if (/macro gota|equipo macro|macrogotas/.test(lower)) {
    return 'Equipo macro gotas: infusão de grande volume (≈20 gotas/mL).';
  }
  if (/micro gota|equipo micro|microgotas/.test(lower)) {
    return 'Equipo micro gotas: infusão lenta/precisa (≈60 gotas/mL).';
  }
  if (/intracath|central/.test(lower)) {
    return 'Cateter central ≠ dispositivo periférico — indicação e calibre distintos.';
  }
  return truncate(text, 500);
}

function inferDeviceTrap(wrongText: string, correctText: string, correctId: string): string {
  const wrong = wrongText.toLowerCase();
  if (/scalp/.test(wrong) && /maior|grande volume|irritante|14g|16g|18g/.test(wrong)) {
    return formatGabaritoCorrect(
      correctId,
      'Scalp não é calibre maior nem infusão de grande volume — é curto prazo/coleta.',
    );
  }
  if (/jelco/.test(wrong) && /exclusiv.*neonat|contraste|radiol/.test(wrong)) {
    return formatGabaritoCorrect(
      correctId,
      'Jelco não é exclusivo de neonato; indicação principal é infusão IV prolongada.',
    );
  }
  if (/\b25\s*g\b/.test(wrong) && /infus[aã]o r[aá]pida/.test(wrong)) {
    return formatGabaritoCorrect(
      correctId,
      '25G é calibre fino — veias pequenas/crianças, não infusão rápida de grande volume.',
    );
  }
  return formatGabaritoCorrect(correctId, inferDeviceDefinition(correctText));
}

function inferTempoDefinition(text: string): string {
  const lower = text.toLowerCase();
  if (/96\s*h|infus[aã]o cont[ií]nua/.test(lower)) {
    return 'Infusão contínua: não trocar equipos antes de 96 horas (salvo contaminação/dano).';
  }
  if (/24\s*h|24 horas/.test(lower)) {
    return 'Intervalo de 24 h — verificar se é monitorização invasiva ou outro contexto específico.';
  }
  if (/48\s*h|48 horas|48\s*a\s*72/.test(lower)) {
    return '48–72 h — observação/troca em contexto periférico ou intermitente, não regra universal.';
  }
  if (/12\s*h|6-12|6 a 12/.test(lower)) {
    return 'Janela curta (6–12 h ou 12 h) — NPP ou hemocomponente, não infusão contínua.';
  }
  if (/72\s*h|inferior a 72/.test(lower)) {
    return 'Cateter periférico: não há rotina fixa de troca a cada 72 h — troque por indicação clínica.';
  }
  if (/20\s*segundos|1[,.]5.*minut|fricção.*minut/.test(lower)) {
    return 'Tempo de antissepsia: clorexidina com fricção adequada; PVPI requer tempo de contato maior.';
  }
  if (/tão logo quanto possível|emergência/.test(lower)) {
    return 'Acesso em emergência sem assepsia ideal: trocar cateter assim que possível.';
  }
  if (/observar diariamente|a cada 24 horas.*rubor|edema/.test(lower)) {
    return 'Observação diária do sítio: rubor, edema, dor, secreção — trocar se sinais de complicação.';
  }
  if (/novo cateter.*tentativa|a cada tentativa/.test(lower)) {
    return 'Nova punção = novo cateter — não reutilizar dispositivo entre tentativas.';
  }
  return truncate(text, 500);
}

function inferTempoTrap(wrongText: string, correctText: string, correctId: string): string {
  const wrong = wrongText.toLowerCase();
  if (/48\s*h.*trocar.*cateter|trocar.*cateter.*48/.test(wrong)) {
    return formatGabaritoCorrect(
      correctId,
      'Não se troca cateter periférico rotineiramente a cada 48 h — avalie indicação e sinais locais.',
    );
  }
  if (/72\s*h|inferior a 72/.test(wrong) && /rotineir|periódic|préestabelecid/.test(wrong)) {
    return formatGabaritoCorrect(
      correctId,
      'Troca de cateter/curativo não segue cronograma fixo cego — integridade e indicação clínica mandam.',
    );
  }
  if (/24\s*h/.test(wrong) && /96|contínua|continua/.test(correctText.toLowerCase())) {
    return formatGabaritoCorrect(correctId, 'Infusão contínua exige intervalo mínimo de 96 h — não 24 h genérico.');
  }
  return formatGabaritoCorrect(correctId, inferTempoDefinition(correctText));
}

function inferPuncaoTechniqueDefinition(text: string): string {
  const lower = text.toLowerCase();
  if (/garrote/.test(lower) && /5|15|articula/.test(lower)) {
    return 'Garrote 5–15 cm acima do sítio, fora de articulação.';
  }
  if (/garrote/.test(lower) && /minuto|segundo/.test(lower)) {
    return 'Tempo de garrote limitado em coleta — não exceder ~1 minuto.';
  }
  if (/60°|60\s*graus/.test(lower)) {
    return 'Ângulo de 60° é excessivo — inserção em ≈15–30°.';
  }
  if (/bisel.*baixo|voltado para baixo/.test(lower)) {
    return 'Bisel voltado para baixo — correto é bisel para cima (fluxo venoso).';
  }
  if (/barbear|lâmina/.test(lower)) {
    return 'Barbear rotineiro não é padrão — risco de microtrauma.';
  }
  if (/flexionar.*braço|flexão.*cotovelo/.test(lower)) {
    return 'Não flexionar cotovelo após punção na fossa — risco de hematoma.';
  }
  if (/técnica asséptica|assepsia|materiais estéreis/.test(lower)) {
    return 'Punção exige técnica asséptica e materiais estéreis.';
  }
  if (/cefálic|basílic|metacárp|anticubital|antecubital/.test(lower)) {
    return 'Seleção de veia: calibre, acesso e conforto — evite articulações quando possível.';
  }
  if (/membros inferiores|pernas/.test(lower)) {
    return 'Membros superiores são preferência — inferiores só exceção.';
  }
  if (/álcool.*opcional|assepsia.*opcional/.test(lower)) {
    return 'Antissepsia não é opcional na punção venosa.';
  }
  return truncate(text, 500);
}

function inferPuncaoTechniqueTrap(wrongText: string, correctText: string, correctId: string): string {
  const wrong = wrongText.toLowerCase();
  if (/60°|60\s*graus/.test(wrong)) {
    return formatGabaritoCorrect(correctId, 'Ângulo de inserção baixo (≈15–30°), não 60°.');
  }
  if (/bisel.*baixo|voltado para baixo/.test(wrong)) {
    return formatGabaritoCorrect(correctId, 'Bisel voltado para cima, no sentido do retorno venoso.');
  }
  if (/barbear|lâmina/.test(wrong)) {
    return formatGabaritoCorrect(correctId, 'Remoção rotineira de pelos com lâmina não é conduta padrão.');
  }
  if (/flexionar|flexão/.test(wrong)) {
    return formatGabaritoCorrect(correctId, 'Manter extensão do membro após punção na fossa antecubital.');
  }
  if (/membros inferiores/.test(wrong)) {
    return formatGabaritoCorrect(correctId, 'Preferir membros superiores — inferiores são exceção.');
  }
  return formatGabaritoCorrect(correctId, inferPuncaoTechniqueDefinition(correctText));
}

function inferExcetoDistractorNote(optText: string, correctText: string, correctId: string): string {
  const lower = optText.toLowerCase();
  if (/álcool\s*a?\s*70|alcool\s*a?\s*70|antissepsia/.test(lower)) {
    return 'Antissepsia com álcool 70% em sentido proximal→distal e com secagem espontânea está correta.';
  }
  if (/data|horário|horario|número do dispositivo|numero do dispositivo|nome do profissional/.test(lower)) {
    return 'Identificar o acesso com data, horário, dispositivo e profissional está correto.';
  }
  if (/novo cateter|a cada tentativa/.test(lower)) {
    return 'Usar um novo cateter a cada tentativa de punção é a conduta correta.';
  }
  if (/menos proeminentes|menos proeminent/.test(lower)) {
    return 'Essa é a exceção: deve-se priorizar veias calibrosas e acessíveis, não as menos proeminentes.';
  }
  if (/bisel|punção|puncao|retorno venoso|introduzi-lo/.test(lower)) {
    return 'A técnica de punção descrita está adequada: bisel para cima e introdução delicada no sentido do retorno venoso.';
  }
  return truncate(
    `A alternativa descreve uma conduta correta; a exceção é a letra ${correctId}. ${correctText.split(/[,.;]/)[0] ?? correctText}`,
    500,
  );
}

function inferOptionTheme(
  text: string,
  isCorrect: boolean,
  topic = 'Acesso venoso e cateteres',
): { label: string; icon: string; detail: string } {
  const lower = text.toLowerCase();
  const ipcs = isIpcsTopic(topic);
  if (/barreira estéril|barreira esteril|técnica asséptica|tecnica asséptica|asseptica/.test(lower)) {
    return {
      label: 'Barreira estéril',
      icon: 'Shield',
      detail: ipcs
        ? 'Técnica asséptica rigorosa com barreira estéril máxima na inserção e manutenção.'
        : 'Técnica asséptica rigorosa na inserção e manipulação do acesso.',
    };
  }
  if (/clorexidina|antissepsia|higienização|higienizacao/.test(lower)) {
    return {
      label: 'Antissepsia',
      icon: 'Droplets',
      detail: isCorrect
        ? 'Higienização das mãos e antissepsia cutânea antes da inserção.'
        : inferOptionTrapForTopic(text, topic),
    };
  }
  if (/curativo|semipermeável|semipermeavel/.test(lower)) {
    return {
      label: 'Curativo',
      icon: 'Bandage',
      detail: isCorrect
        ? 'Curativo trocado quando sujo, solto ou úmido.'
        : inferOptionTrapForTopic(text, topic),
    };
  }
  if (/remover|remoção|remocao|retirar|interrupção|interrupcao/.test(lower)) {
    return {
      label: ipcs ? 'Remoção precoce' : 'Retirada do dispositivo',
      icon: 'CircleX',
      detail: ipcs
        ? 'Retirar o cateter assim que não houver indicação clínica.'
        : 'Retirar ou interromper o acesso quando indicado clinicamente.',
    };
  }
  if (/flebite|extravasação|extravasacao/.test(lower)) {
    return { label: 'Flebite / extravasação', icon: 'AlertTriangle', detail: truncate(text, 500) };
  }
  if (/punção|puncao|acesso venoso|jelco|scalp/.test(lower)) {
    return { label: 'Punção / acesso', icon: 'Syringe', detail: truncate(text, 500) };
  }
  return {
    label: truncate(text.split(/[,.;]/)[0] ?? text, 40),
    icon: isCorrect ? 'CheckCircle' : 'XCircle',
    detail: truncate(text, 500),
  };
}

function choiceGoldenSlideTitle(topic: string): string {
  if (topic === 'Prevenção de IPCS no CVC') {
    return 'Bundle de prevenção — IPCS';
  }
  if (topic === 'EXCETO — técnica / conduta') {
    return 'Regra do EXCETO — acesso venoso';
  }
  if (topic === 'Flebite e complicações') {
    return 'Tabela — complicações do acesso venoso';
  }
  if (topic === 'Dispositivo / calibre / jelco') {
    return 'Tabela — scalp × jelco × calibre';
  }
  if (topic === 'Tempo / observação pós-procedimento') {
    return 'Tabela — intervalos de troca';
  }
  if (topic === 'Antissepsia na punção') {
    return 'Antissepsia — preparo do sítio';
  }
  if (topic === 'Punção venosa periférica') {
    return 'Técnica — punção venosa periférica';
  }
  if (topic === 'Acesso venoso central') {
    return 'Acesso venoso central — riscos e técnica';
  }
  if (topic === 'Acesso arterial / PAM') {
    return 'PAM — acesso arterial';
  }
  return `Regra de ouro — ${topic.toLowerCase()}`;
}

function buildFlebiteConceptItems(
  input: BuildPuncaoSlidesInput,
  correct: QuestionOption,
): { label: string; detail: string; icon: string }[] {
  const preview = truncate(normalizePuncaoInstruction(input.instruction).replace(/\s+/g, ' '), 500);
  const complicationOptions = input.options.filter((o) =>
    /flebite|infiltra|hematoma|esclerose|abscesso|extravasa/i.test(o.text),
  );
  const useComplicationLabels = complicationOptions.length >= 2;
  const conceptSource = useComplicationLabels ? complicationOptions.slice(0, 4) : input.options.slice(0, 4);
  const items: { label: string; detail: string; icon: string }[] = [
    { label: 'Contexto', detail: preview, icon: 'Gauge' },
  ];
  for (const opt of conceptSource) {
    const theme = inferOptionTheme(opt.text, opt.is_correct, 'Flebite e complicações');
    items.push({
      label: useComplicationLabels ? theme.label : `Letra ${opt.id}`,
      detail: useComplicationLabels ? inferComplicationDefinition(opt.text) : slideDetailForTopic(opt.text, 'Flebite e complicações'),
      icon: theme.icon,
    });
  }
  items.push({
    label: 'Gabarito',
    detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
    icon: 'Target',
  });
  return items.slice(0, 20);
}

function buildDispositivoConceptItems(
  input: BuildPuncaoSlidesInput,
  correct: QuestionOption,
): { label: string; detail: string; icon: string }[] {
  const preview = truncate(normalizePuncaoInstruction(input.instruction).replace(/\s+/g, ' '), 500);
  const deviceOptions = input.options.filter((o) =>
    /jelco|scalp|butterfly|calibre|\bg\b|gauge|equipo|dispositivo|cateter/i.test(o.text),
  );
  const useDeviceLabels = deviceOptions.length >= 2;
  const conceptSource = useDeviceLabels ? deviceOptions.slice(0, 4) : input.options.slice(0, 4);
  const items: { label: string; detail: string; icon: string }[] = [
    { label: 'Contexto', detail: preview, icon: 'Gauge' },
  ];
  for (const opt of conceptSource) {
    const theme = inferOptionTheme(opt.text, opt.is_correct, 'Dispositivo / calibre / jelco');
    items.push({
      label: `Letra ${opt.id}`,
      detail: inferDeviceDefinition(opt.text),
      icon: theme.icon,
    });
  }
  items.push({
    label: 'Gabarito',
    detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
    icon: 'Target',
  });
  return items.slice(0, 20);
}

function buildTempoConceptItems(
  input: BuildPuncaoSlidesInput,
  correct: QuestionOption,
): { label: string; detail: string; icon: string }[] {
  const preview = truncate(normalizePuncaoInstruction(input.instruction).replace(/\s+/g, ' '), 500);
  const tempoOptions = input.options.filter((o) =>
    /\d+\s*(horas?|h\b|minutos?|segundos?|dias?)|intervalo|observar|trocar|a cada/i.test(o.text),
  );
  const useTempoLabels = tempoOptions.length >= 2;
  const conceptSource = useTempoLabels ? tempoOptions.slice(0, 4) : input.options.slice(0, 4);
  const items: { label: string; detail: string; icon: string }[] = [
    { label: 'Contexto', detail: preview, icon: 'Gauge' },
  ];
  for (const opt of conceptSource) {
    items.push({
      label: useTempoLabels ? `Letra ${opt.id}` : `Letra ${opt.id}`,
      detail: inferTempoDefinition(opt.text),
      icon: /observar|edema|rubor/i.test(opt.text) ? 'Eye' : 'Clock',
    });
  }
  items.push({
    label: 'Gabarito',
    detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
    icon: 'Target',
  });
  return items.slice(0, 20);
}

function buildPuncaoPerifericaConceptItems(
  input: BuildPuncaoSlidesInput,
  correct: QuestionOption,
): { label: string; detail: string; icon: string }[] {
  const preview = truncate(normalizePuncaoInstruction(input.instruction).replace(/\s+/g, ' '), 500);
  const techniqueOptions = input.options.filter((o) =>
    /garrote|bisel|ângulo|angulo|antiss|asseps|cefálic|basílic|cateter|veia|punção|puncao|material/i.test(o.text),
  );
  const useTechniqueLabels = techniqueOptions.length >= 2;
  const conceptSource = useTechniqueLabels ? techniqueOptions.slice(0, 4) : input.options.slice(0, 4);
  const items: { label: string; detail: string; icon: string }[] = [
    { label: 'Contexto', detail: preview, icon: 'Gauge' },
  ];
  for (const opt of conceptSource) {
    items.push({
      label: `Letra ${opt.id}`,
      detail: inferPuncaoTechniqueDefinition(opt.text),
      icon: /garrote/i.test(opt.text) ? 'Circle' : 'Syringe',
    });
  }
  items.push({
    label: 'Gabarito',
    detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
    icon: 'Target',
  });
  return items.slice(0, 20);
}

function buildAcessoConceptItems(
  input: BuildPuncaoSlidesInput,
  correct: QuestionOption,
  topic: string,
): { label: string; detail: string; icon: string }[] {
  const preview = truncate(normalizePuncaoInstruction(input.instruction).replace(/\s+/g, ' '), 500);
  const items: { label: string; detail: string; icon: string }[] = [
    { label: 'Contexto', detail: preview, icon: 'Gauge' },
  ];
  for (const opt of input.options.slice(0, 4)) {
    items.push({
      label: `Letra ${opt.id}`,
      detail: inferAcessoDefinition(opt.text),
      icon: 'Syringe',
    });
  }
  items.push({
    label: 'Gabarito',
    detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
    icon: 'Target',
  });
  return items.slice(0, 20);
}

function buildIpCsConceptItems(
  input: BuildPuncaoSlidesInput,
  correct: QuestionOption,
): { label: string; detail: string; icon: string }[] {
  const preview = truncate(input.instruction.replace(/\s+/g, ' '), 120);
  return [
    {
      label: 'Contexto',
      detail: truncate(`${preview}`, 500),
      icon: 'Gauge',
    },
    {
      label: 'Antissepsia',
      detail:
        'Higienização das mãos e antissepsia cutânea antes da inserção — clorexidina alcoólica na concentração correta.',
      icon: 'Droplets',
    },
    {
      label: 'Barreira estéril',
      detail: 'Técnica asséptica rigorosa + barreira estéril máxima na inserção e manutenção do CVC.',
      icon: 'Shield',
    },
    {
      label: 'Curativo',
      detail: 'Curativo semipermeável trocado quando sujo, solto ou úmido — não em cronograma fixo cego.',
      icon: 'Bandage',
    },
    {
      label: 'Remoção precoce',
      detail: 'Retirar o CVC assim que não houver mais indicação clínica.',
      icon: 'CircleX',
    },
    {
      label: 'Gabarito',
      detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
      icon: 'Target',
    },
  ];
}

function buildChoiceGoldenRows(
  topic: string,
  options: QuestionOption[],
  correct: QuestionOption,
): GoldenRuleRow[] {
  if (topic === 'Prevenção de IPCS no CVC') {
    return [
      {
        label: 'Contexto UTI',
        value: 'Aumento de IPCS no CVC exige bundle de prevenção, não conduta isolada.',
        emphasis: 'highlight',
        badge: 'hot',
      },
      {
        label: 'Higienização',
        value: 'Mãos e antissepsia cutânea sempre antes e após manipular o acesso venoso.',
        emphasis: 'default',
        badge: 'ok',
      },
      {
        label: 'Barreira',
        value: 'Barreira estéril máxima na inserção e manutenção.',
        emphasis: 'success',
        badge: 'ok',
      },
      {
        label: 'Curativo',
        value: 'Trocar quando sujo, solto ou úmido — não a cada 72 h “independente da integridade”.',
        emphasis: 'alert',
        badge: 'warn',
      },
      {
        label: 'Remoção',
        value: 'Retirar o CVC assim que não for mais necessário.',
        emphasis: 'success',
        badge: 'ok',
      },
      {
        label: 'Gabarito',
        value: `Letra ${correct.id}`,
        emphasis: 'highlight',
        badge: 'hot',
      },
    ];
  }

  if (topic === 'EXCETO — técnica / conduta') {
    return [
      {
        label: 'Comando',
        value: 'EXCETO — marque a única alternativa falsa entre condutas corretas.',
        emphasis: 'highlight',
        badge: 'hot',
      },
      ...options.map((opt) => ({
        label: `Letra ${opt.id}`,
        value: opt.is_correct
          ? truncate(`EXCETO: ${inferExcetoDistractorNote(opt.text, opt.text, opt.id)}`, 500)
          : truncate(`Correta no enunciado: ${opt.text}`, 500),
        ...(opt.is_correct
          ? { badge: 'hot' as const, emphasis: 'highlight' as const }
          : { emphasis: 'default' as const, badge: 'ok' as const }),
      })),
      {
        label: 'Gabarito',
        value: `Letra ${correct.id}`,
        emphasis: 'highlight',
        badge: 'hot',
      },
    ];
  }

  if (topic === 'Flebite e complicações') {
    const rows: GoldenRuleRow[] = options.map((opt) => ({
      label: `Letra ${opt.id}`,
      value: inferComplicationDefinition(opt.text),
      ...(opt.is_correct
        ? { badge: 'hot' as const, emphasis: 'highlight' as const }
        : { emphasis: 'default' as const, badge: 'info' as const }),
    }));
    rows.push({
      label: 'Gabarito',
      value: `Letra ${correct.id}`,
      emphasis: 'highlight',
      badge: 'hot',
    });
    return rows;
  }

  if (topic === 'Dispositivo / calibre / jelco') {
    const rows: GoldenRuleRow[] = options.map((opt) => ({
      label: `Letra ${opt.id}`,
      value: inferDeviceDefinition(opt.text),
      ...(opt.is_correct
        ? { badge: 'hot' as const, emphasis: 'highlight' as const }
        : { emphasis: 'default' as const, badge: 'info' as const }),
    }));
    rows.push({
      label: 'Gabarito',
      value: `Letra ${correct.id}`,
      emphasis: 'highlight',
      badge: 'hot',
    });
    return rows;
  }

  if (topic === 'Tempo / observação pós-procedimento') {
    const rows: GoldenRuleRow[] = options.map((opt) => ({
      label: `Letra ${opt.id}`,
      value: inferTempoDefinition(opt.text),
      ...(opt.is_correct
        ? { badge: 'hot' as const, emphasis: 'highlight' as const }
        : { emphasis: 'default' as const, badge: 'info' as const }),
    }));
    rows.push({
      label: 'Gabarito',
      value: `Letra ${correct.id}`,
      emphasis: 'highlight',
      badge: 'hot',
    });
    return rows;
  }

  if (topic === 'Punção venosa periférica' || topic === 'Antissepsia na punção') {
    const rows: GoldenRuleRow[] = [
      {
        label: 'Garrote',
        value: '5–15 cm acima do sítio; não sobre articulação.',
        emphasis: 'highlight',
        badge: 'hot',
      },
      {
        label: 'Ângulo / bisel',
        value: 'Inserção ≈15–30°; bisel voltado para cima.',
        emphasis: 'success',
        badge: 'ok',
      },
      {
        label: 'Antissepsia',
        value: 'Técnica asséptica + materiais estéreis — obrigatório.',
        emphasis: 'default',
        badge: 'info',
      },
      ...options.map((opt) => ({
        label: `Letra ${opt.id}`,
        value: inferPuncaoTechniqueDefinition(opt.text),
        ...(opt.is_correct
          ? { badge: 'hot' as const, emphasis: 'highlight' as const }
          : { emphasis: 'alert' as const, badge: 'warn' as const }),
      })),
      {
        label: 'Gabarito',
        value: `Letra ${correct.id}`,
        emphasis: 'highlight',
        badge: 'hot',
      },
    ];
    return rows.slice(0, 12);
  }

  if (topic === 'Manutenção de cateter') {
    const rows: GoldenRuleRow[] = options.map((opt) => ({
      label: `Letra ${opt.id}`,
      value: inferManutencaoDefinition(opt.text),
      ...(opt.is_correct
        ? { badge: 'hot' as const, emphasis: 'highlight' as const }
        : { emphasis: 'default' as const, badge: 'info' as const }),
    }));
    rows.push({
      label: 'Gabarito',
      value: `Letra ${correct.id}`,
      emphasis: 'highlight',
      badge: 'hot',
    });
    return rows;
  }

  if (
    topic === 'Acesso venoso central' ||
    topic === 'Acesso arterial / PAM' ||
    topic === 'Acesso venoso e cateteres'
  ) {
    return options.map((opt) => ({
      label: `Letra ${opt.id}`,
      value: opt.is_correct
        ? truncate(`Correta: ${slideDetailForTopic(opt.text, topic)}`, 500)
        : truncate(`Incorreta: ${slideDetailForTopic(inferAcessoDefinition(opt.text), topic)}`, 500),
      ...(opt.is_correct
        ? { badge: 'ok' as const, emphasis: 'highlight' as const }
        : { emphasis: 'alert' as const, badge: 'warn' as const }),
    }));
  }

  return options.map((opt) => ({
    label: `Letra ${opt.id}`,
    value: opt.is_correct
      ? truncate(`Verdadeira: ${opt.text}`, 500)
      : truncate(`Falsa: ${inferOptionTrapForTopic(opt.text, topic)}`, 500),
    ...(opt.is_correct
      ? { badge: 'ok' as const, emphasis: 'highlight' as const }
      : { emphasis: 'alert' as const, badge: 'warn' as const }),
  }));
}

function buildChoiceLogicSteps(
  input: BuildPuncaoSlidesInput,
  topic: string,
  correct: QuestionOption,
): string[] {
  const wrong = input.options.filter((o) => !o.is_correct);
  const instruction = normalizePuncaoInstruction(input.instruction);
  const preview = truncate(instruction.replace(/\s+/g, ' '), 120);
  const prof = topicProfile(topic);

  const steps = [
    topic === 'EXCETO — técnica / conduta'
      ? `Ler o comando EXCETO: ${preview}.`
      : `Ler o comando: ${preview}.`,
    topic === 'Prevenção de IPCS no CVC'
      ? 'Fixar o bundle: antissepsia + barreira estéril máxima + curativo adequado + remoção precoce.'
      : topic === 'EXCETO — técnica / conduta'
        ? 'Regra: a maioria das alternativas descreve conduta correta — uma é a exceção (falsa).'
        : topic === 'Flebite e complicações'
          ? 'Fixar o mecanismo: infiltração = solução fora do vaso; flebite = inflamação do trajeto venoso.'
          : topic === 'Dispositivo / calibre / jelco'
            ? 'Fixar dispositivo: scalp = curto/coleta; jelco = infusão prolongada — calibre segue vaso e terapia.'
            : topic === 'Tempo / observação pós-procedimento'
              ? 'Fixar tempo: tipo de infusão/procedimento define o intervalo — não generalize 24 h ou 48 h.'
              : topic === 'Punção venosa periférica'
                ? 'Fixar técnica: garrote 5–15 cm + ângulo baixo + bisel para cima + assepsia obrigatória.'
                : topic === 'Antissepsia na punção'
                  ? 'Fixar antissepsia: higiene das mãos + antissepsia cutânea + não recontaminar o sítio.'
                  : topic === 'Manutenção de cateter'
                    ? 'Fixar manutenção: curativo íntegro + técnica asséptica em cada manipulação.'
                    : topic === 'Acesso venoso central'
                  ? 'Fixar riscos do acesso central: punção arterial, hematoma, lesão nervosa, pneumotórax.'
                  : topic === 'Acesso arterial / PAM'
                    ? 'Fixar PAM: artérias radial e femoral para monitorização invasiva.'
                    : `Fixar o tema: ${topic.toLowerCase()}.`,
    `Identificar gabarito: letra ${correct.id} — ${truncate(correct.text, 100)}.`,
  ];

  for (const opt of wrong) {
    if (topic === 'EXCETO — técnica / conduta') {
      steps.push(
        `Letra ${opt.id}: ${truncate(inferExcetoDistractorNote(opt.text, correct.text, correct.id), 80)}.`,
      );
    } else if (topic === 'Flebite e complicações') {
      steps.push(
        `Testar letra ${opt.id} (${truncate(opt.text, 40)}): ${truncate(inferComplicationDefinition(opt.text), 80)} → eliminar.`,
      );
    } else if (topic === 'Dispositivo / calibre / jelco') {
      steps.push(
        `Testar letra ${opt.id} (${truncate(opt.text, 40)}): ${truncate(inferDeviceDefinition(opt.text), 80)} → eliminar.`,
      );
    } else if (topic === 'Tempo / observação pós-procedimento') {
      steps.push(
        `Testar letra ${opt.id} (${truncate(opt.text, 40)}): ${truncate(inferTempoDefinition(opt.text), 80)} → eliminar.`,
      );
    } else if (topic === 'Manutenção de cateter') {
      steps.push(
        `Testar letra ${opt.id}: ${truncate(inferManutencaoDefinition(opt.text), 80)} → eliminar.`,
      );
    } else if (topic === 'Punção venosa periférica' || topic === 'Antissepsia na punção') {
      steps.push(
        `Testar letra ${opt.id} (${truncate(opt.text, 40)}): ${truncate(inferPuncaoTechniqueDefinition(opt.text), 80)} → eliminar.`,
      );
    } else if (
      topic === 'Acesso venoso central' ||
      topic === 'Acesso arterial / PAM' ||
      topic === 'Acesso venoso e cateteres'
    ) {
      steps.push(
        `Testar letra ${opt.id}: ${truncate(inferAcessoDefinition(opt.text), 80)} → eliminar.`,
      );
    } else {
      const trap = inferOptionTrapForTopic(opt.text, topic);
      steps.push(`Testar letra ${opt.id}: ${truncate(opt.text, 90)} → eliminar (${truncate(trap, 80)}).`);
    }
  }

  steps.push(`Marcar letra ${correct.id}.`);
  steps.push(`Fixação: ${prof.logicFix}`);
  return steps.slice(0, 15);
}

function buildChoiceDangerItems(
  options: QuestionOption[],
  correct: QuestionOption,
  topic: string,
): DangerZoneItem[] {
  if (topic === 'EXCETO — técnica / conduta') {
    return options
      .filter((o) => !o.is_correct)
      .map((opt) => ({
        label: truncate(`Letra ${opt.id} — ${opt.text.split(/[,.;]/)[0] ?? opt.text}`, 200),
        detail: truncate(opt.text, 500),
        correct: formatGabaritoCorrect(
          correct.id,
          inferExcetoDistractorNote(opt.text, correct.text, correct.id),
        ),
      }));
  }

  if (topic === 'Flebite e complicações') {
    return options
      .filter((o) => !o.is_correct)
      .map((opt) => ({
        label: truncate(`Letra ${opt.id} — ${opt.text.split(/[,.;]/)[0] ?? opt.text}`, 200),
        detail: truncate(opt.text, 500),
        correct: inferComplicationTrap(opt.text, correct.text, correct.id),
      }));
  }

  if (topic === 'Dispositivo / calibre / jelco') {
    return options
      .filter((o) => !o.is_correct)
      .map((opt) => ({
        label: truncate(`Letra ${opt.id} — ${opt.text.split(/[,.;]/)[0] ?? opt.text}`, 200),
        detail: truncate(opt.text, 500),
        correct: inferDeviceTrap(opt.text, correct.text, correct.id),
      }));
  }

  if (topic === 'Tempo / observação pós-procedimento') {
    return options
      .filter((o) => !o.is_correct)
      .map((opt) => ({
        label: truncate(`Letra ${opt.id} — ${opt.text.split(/[,.;]/)[0] ?? opt.text}`, 200),
        detail: truncate(opt.text, 500),
        correct: inferTempoTrap(opt.text, correct.text, correct.id),
      }));
  }

  if (topic === 'Punção venosa periférica' || topic === 'Antissepsia na punção') {
    return options
      .filter((o) => !o.is_correct)
      .map((opt) => ({
        label: truncate(`Letra ${opt.id} — ${opt.text.split(/[,.;]/)[0] ?? opt.text}`, 200),
        detail: slideDetailForTopic(opt.text, topic),
        correct: inferPuncaoTechniqueTrap(opt.text, correct.text, correct.id),
      }));
  }

  if (topic === 'Manutenção de cateter') {
    return options
      .filter((o) => !o.is_correct)
      .map((opt) => ({
        label: truncate(`Letra ${opt.id} — ${opt.text.split(/[,.;]/)[0] ?? opt.text}`, 200),
        detail: inferManutencaoDefinition(opt.text),
        correct: inferManutencaoTrap(opt.text, correct.text, correct.id),
      }));
  }

  if (
    topic === 'Acesso venoso central' ||
    topic === 'Acesso arterial / PAM' ||
    topic === 'Acesso venoso e cateteres'
  ) {
    return options
      .filter((o) => !o.is_correct)
      .map((opt) => ({
        label: truncate(`Letra ${opt.id} — ${opt.text.split(/[,.;]/)[0] ?? opt.text}`, 200),
        detail: slideDetailForTopic(opt.text, topic),
        correct: inferAcessoTrap(opt.text, correct.text, correct.id, topic),
      }));
  }

  return options
    .filter((o) => !o.is_correct)
    .map((opt) => ({
      label: truncate(`Letra ${opt.id} — ${opt.text.split(/[,.;]/)[0] ?? opt.text}`, 200),
      detail: inferOptionTrapForTopic(opt.text, topic),
      correct: inferOptionCorrectionForTopic(opt.text, correct.text, correct.id, topic),
    }));
}

/** Múltipla escolha — padrão golden Adm&Tec IPCS/CVC e temas de acesso venoso. */
export function buildPuncaoChoiceSlides(input: BuildPuncaoSlidesInput): SlideRecord[] {
  const correct = input.options.find((o) => o.is_correct);
  if (!correct) throw new Error('Punção choice: gabarito ausente');

  const instruction = normalizePuncaoInstruction(input.instruction);
  const topic = inferPuncaoTopic(instruction, input.options);
  const prof = topicProfile(topic);
  const meta = slideMeta(input.topico, input.subtopico);

  const conceptItems =
    topic === 'Prevenção de IPCS no CVC'
      ? buildIpCsConceptItems(input, correct)
      : topic === 'Flebite e complicações'
        ? buildFlebiteConceptItems({ ...input, instruction }, correct)
        : topic === 'Dispositivo / calibre / jelco'
          ? buildDispositivoConceptItems({ ...input, instruction }, correct)
          : topic === 'Tempo / observação pós-procedimento'
            ? buildTempoConceptItems({ ...input, instruction }, correct)
              : topic === 'Punção venosa periférica'
              ? buildPuncaoPerifericaConceptItems({ ...input, instruction }, correct)
              : topic === 'Antissepsia na punção'
                ? buildPuncaoPerifericaConceptItems({ ...input, instruction }, correct)
                : topic === 'Manutenção de cateter'
                  ? buildManutencaoConceptItems({ ...input, instruction }, correct)
                  : topic === 'Acesso venoso central' ||
                  topic === 'Acesso arterial / PAM' ||
                  topic === 'Acesso venoso e cateteres'
                ? buildAcessoConceptItems({ ...input, instruction }, correct, topic)
                : [
          {
            label: 'Contexto',
            detail: truncate(instruction.replace(/\s+/g, ' '), 500),
            icon: 'Gauge',
          },
          ...input.options.slice(0, 4).map((opt) => {
            const theme = inferOptionTheme(opt.text, opt.is_correct, topic);
            return { label: theme.label, detail: theme.detail, icon: theme.icon };
          }),
          {
            label: 'Gabarito',
            detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
            icon: 'Target',
          },
        ].slice(0, 20);

  const rows = buildChoiceGoldenRows(topic, input.options, correct);
  const steps = buildChoiceLogicSteps({ ...input, instruction }, topic, correct);
  const dangerItems = buildChoiceDangerItems(input.options, correct, topic);

  return [
    {
      type: 'concept_map',
      slide_title: truncate(`${topic} — mapa da prova`, 120),
      chip_label: prof.chipLabel,
      meta,
      items: conceptItems,
      footer_rule: truncate(prof.conceptFooter, 500),
    },
    {
      type: 'golden_rule',
      slide_title: truncate(choiceGoldenSlideTitle(topic), 120),
      chip_label: 'REGRA DE OURO',
      meta,
      content: truncate(prof.goldenContent, 1000),
      rows: rows.slice(0, 12),
      footer_rule: truncate(prof.goldenFooter, 500),
    },
    {
      type: 'logic_flow',
      slide_title: truncate(`Como resolver — ${topic.toLowerCase()}`, 120),
      chip_label: 'PASSO A PASSO',
      meta,
      reveal_mode: 'tap',
      steps,
      footer_rule: truncate(prof.logicFooter, 500),
    },
    {
      type: 'danger_zone',
      slide_title: 'Armadilhas que a banca monta',
      chip_label: 'ARMADILHAS DE PROVA',
      meta,
      content: truncate(prof.dangerContent, 1000),
      bullet_style: 'x_icon',
      items: dangerItems.slice(0, 10),
      footer_rule: truncate(prof.dangerFooter(correct.id), 500),
    },
  ];
}

function inferVfConceptLabel(text: string, isTrue: boolean): { label: string; icon: string } {
  const lower = text.toLowerCase();
  if (/assepsia|asséptica|esteril|clorexidina|higieniza/.test(lower)) {
    return { label: 'Técnica asséptica', icon: 'Shield' };
  }
  if (/curativo|semipermeável|semipermeavel/.test(lower)) {
    return { label: 'Curativo', icon: 'Bandage' };
  }
  if (/flebite|extravasação|extravasacao/.test(lower)) {
    return { label: 'Flebite', icon: 'AlertTriangle' };
  }
  if (/punção|puncao|angulação|angulacao|bevel|bisel/.test(lower)) {
    return { label: 'Técnica de punção', icon: 'Syringe' };
  }
  if (/remoção|remocao|retirar|interrupção|interrupcao/.test(lower)) {
    return { label: 'Remoção do cateter', icon: 'CircleX' };
  }
  return {
    label: truncate(text.split(/[,.;]/)[0] ?? text, 40),
    icon: isTrue ? 'CheckCircle' : 'XCircle',
  };
}

function buildVfConceptMap(input: BuildPuncaoSlidesInput, assertives: CurativosAssertive[]): SlideRecord {
  const correct = input.options.find((o) => o.is_correct);
  const topic = inferPuncaoTopic(input.instruction, input.options);
  const prof = topicProfile(topic);

  const items = assertives.slice(0, 4).map((a) => {
    const { label, icon } = inferVfConceptLabel(a.text, a.isTrue);
    return {
      label,
      detail: truncate(a.isTrue ? `Verdadeira: ${a.text}` : `Falsa: ${a.text}`, 500),
      icon,
    };
  });

  items.push({
    label: 'Gabarito',
    detail: truncate(`Letra ${correct?.id ?? '?'} — ${correct?.text ?? ''}`, 500),
    icon: 'Target',
  });

  return {
    type: 'concept_map',
    slide_title: truncate(`${topic} — mapa V/F`, 120),
    chip_label: prof.chipLabel,
    meta: slideMeta(input.topico, input.subtopico),
    items: items.slice(0, 20),
    footer_rule: truncate(prof.conceptFooter, 500),
  };
}

function buildVfGoldenRule(input: BuildPuncaoSlidesInput, assertives: CurativosAssertive[]): SlideRecord {
  const topic = inferPuncaoTopic(input.instruction, input.options);
  const prof = topicProfile(topic);
  const correct = input.options.find((o) => o.is_correct);

  const rows: GoldenRuleRow[] = assertives.map((a) => ({
    label: `${a.roman} — ${truncate(a.text.split(/[,.;]/)[0] ?? a.text, 60)}`,
    value: a.isTrue ? truncate(`Verdadeira: ${a.text}`, 500) : truncate(`Falsa: ${a.text}`, 500),
    ...(a.isTrue
      ? { badge: 'ok' as const }
      : { emphasis: 'alert' as const, badge: 'warn' as const }),
  }));

  rows.push({
    label: 'Resposta final',
    value: truncate(correct?.text ?? '', 500),
    emphasis: 'highlight',
    badge: 'hot',
  });

  return {
    type: 'golden_rule',
    slide_title: truncate(`Regra de ouro — ${topic.toLowerCase()}`, 120),
    chip_label: 'REGRA DE OURO',
    meta: slideMeta(input.topico, input.subtopico),
    content: truncate(prof.goldenContent, 1000),
    rows: rows.slice(0, 12),
    footer_rule: truncate(prof.goldenFooter, 500),
  };
}

function buildVfLogicFlow(input: BuildPuncaoSlidesInput, assertives: CurativosAssertive[]): SlideRecord {
  const correct = input.options.find((o) => o.is_correct);
  const topic = inferPuncaoTopic(input.instruction, input.options);
  const prof = topicProfile(topic);

  const steps = [
    `Ler a questão como combinação V/F sobre ${topic.toLowerCase()}.`,
    ...assertives.map((a) =>
      `Julgar ${a.roman}: ${truncate(a.text, 80)}? → ${a.isTrue ? 'verdadeiro' : 'falso'}.`,
    ),
    `Montar o conjunto correto conforme alternativas.`,
    `Marcar ${correct?.id ?? '?'}.`,
    `Fixação: ${prof.logicFix}.`,
  ];

  return {
    type: 'logic_flow',
    slide_title: truncate(`Como resolver — ${topic.toLowerCase()}`, 120),
    chip_label: 'PASSO A PASSO',
    meta: slideMeta(input.topico, input.subtopico),
    reveal_mode: 'tap',
    steps: steps.slice(0, 15),
    footer_rule: truncate(prof.logicFooter, 500),
  };
}

function buildVfDangerZone(input: BuildPuncaoSlidesInput, assertives: CurativosAssertive[]): SlideRecord {
  const correct = input.options.find((o) => o.is_correct);
  const topic = inferPuncaoTopic(input.instruction, input.options);
  const prof = topicProfile(topic);

  const items: DangerZoneItem[] = assertives
    .filter((a) => !a.isTrue)
    .map((a) => ({
      label: truncate(`Aceitar ${a.roman} como verdadeira`, 200),
      detail: truncate(a.text, 500),
      correct: truncate(`Afirmativa ${a.roman} é falsa — gabarito ${correct?.id ?? '?'}.`, 500),
    }));

  if (items.length < 3) {
    items.push({
      label: 'Marcar sem julgar todas as afirmativas',
      detail: 'Combinar letras sem V/F item a item leva a gabarito errado.',
      correct: 'Julgue I, II, III… antes de olhar as combinações A–E.',
    });
  }

  return {
    type: 'danger_zone',
    slide_title: 'Armadilhas que a banca monta',
    chip_label: 'ARMADILHAS DE PROVA',
    meta: slideMeta(input.topico, input.subtopico),
    content: truncate(prof.dangerContent, 1000),
    bullet_style: 'x_icon',
    items: items.slice(0, 10),
    footer_rule: truncate(prof.dangerFooter(correct?.id ?? '?'), 500),
  };
}

export function buildPuncaoVfSlides(input: BuildPuncaoSlidesInput): SlideRecord[] {
  const correct = input.options.find((o) => o.is_correct);
  const assertives = resolveCurativosAssertives(input.instruction, correct);
  if (assertives.length < 2) {
    throw new Error('Punção VF: enunciado sem afirmativas I/II/III suficientes');
  }

  return [
    buildVfConceptMap(input, assertives),
    buildVfGoldenRule(input, assertives),
    buildVfLogicFlow(input, assertives),
    buildVfDangerZone(input, assertives),
  ];
}

function buildCertoErradoSlides(input: BuildPuncaoSlidesInput): SlideRecord[] {
  const correct = input.options.find((o) => o.is_correct);
  if (!correct) throw new Error('Punção CE: gabarito ausente');

  const topic = inferPuncaoTopic(input.instruction, input.options);
  const prof = topicProfile(topic);
  const meta = slideMeta(input.topico, input.subtopico);
  const statement = truncate(input.instruction.replace(/\s+/g, ' '), 500);
  const isStatementTrue = /certo/i.test(correct.text ?? '');

  return [
    {
      type: 'concept_map',
      slide_title: truncate(`${topic} — certo ou errado`, 120),
      chip_label: prof.chipLabel,
      meta,
      items: [
        { label: 'Afirmativa', detail: statement, icon: 'FileText' },
        {
          label: isStatementTrue ? 'Verdadeira' : 'Falsa',
          detail: isStatementTrue
            ? 'A afirmativa está correta segundo protocolo de acesso venoso.'
            : 'A afirmativa contém erro técnico ou conduta inadequada.',
          icon: isStatementTrue ? 'CheckCircle' : 'XCircle',
        },
        {
          label: 'Gabarito',
          detail: truncate(`Letra ${correct.id} — ${correct.text}`, 500),
          icon: 'Target',
        },
      ],
      footer_rule: truncate(prof.conceptFooter, 500),
    },
    {
      type: 'golden_rule',
      slide_title: 'Julgamento da afirmativa',
      chip_label: 'REGRA DE OURO',
      meta,
      content: truncate(prof.goldenContent, 1000),
      rows: [
        {
          label: 'Afirmativa',
          value: statement,
          emphasis: 'default',
          badge: 'info',
        },
        {
          label: 'Julgamento',
          value: isStatementTrue ? 'Certo — conduta/protocolo adequado' : 'Errado — conduta/protocolo inadequado',
          emphasis: isStatementTrue ? 'success' : 'alert',
          badge: isStatementTrue ? 'ok' : 'warn',
        },
        {
          label: 'Gabarito',
          value: `Letra ${correct.id}`,
          emphasis: 'highlight',
          badge: 'hot',
        },
      ],
      footer_rule: truncate(prof.goldenFooter, 500),
    },
    {
      type: 'logic_flow',
      slide_title: truncate(`Como resolver — ${topic.toLowerCase()}`, 120),
      chip_label: 'PASSO A PASSO',
      meta,
      reveal_mode: 'tap',
      steps: [
        `Ler a afirmativa: ${truncate(statement, 120)}.`,
        `Confrontar com protocolo de ${topic.toLowerCase()}.`,
        `Decidir: ${isStatementTrue ? 'certo' : 'errado'}.`,
        `Marcar letra ${correct.id}.`,
        `Fixação: ${prof.logicFix}.`,
      ],
      footer_rule: truncate(prof.logicFooter, 500),
    },
    {
      type: 'danger_zone',
      slide_title: 'Armadilhas que a banca monta',
      chip_label: 'ARMADILHAS DE PROVA',
      meta,
      content: truncate(prof.dangerContent, 1000),
      bullet_style: 'x_icon',
      items: [
        {
          label: 'Confundir detalhe técnico com exceção',
          detail: 'A banca altera concentração, sequência ou indicação do procedimento.',
          correct: formatGabaritoCorrect(correct.id, correct.text),
        },
        {
          label: 'Marcar pelo “parece correto”',
          detail: 'Sem protocolo claro, a pegadinha parece plausível.',
          correct: formatGabaritoCorrect(
            correct.id,
            `Confronte com protocolo de ${topic.toLowerCase()} antes de marcar.`,
          ),
        },
      ],
      footer_rule: truncate(prof.dangerFooter(correct.id), 500),
    },
  ];
}

export function canBuildPuncaoVfSlides(instruction: string): boolean {
  return extractCurativosAssertives(normalizePuncaoInstruction(instruction)).length >= 2;
}

export function canBuildPuncaoPremiumSlides(instruction: string, family: string): boolean {
  if (canBuildPuncaoVfSlides(instruction)) return true;
  if (family === 'certo_errado') return true;
  return ['conceito', 'protocolo', 'text_fragment', 'calc'].includes(family);
}

export function buildPuncaoPremiumSlidesForFamily(
  input: BuildPuncaoSlidesInput,
  family: string,
): SlideRecord[] {
  if (canBuildPuncaoVfSlides(input.instruction)) {
    return buildPuncaoVfSlides(input);
  }
  if (family === 'certo_errado') {
    return buildCertoErradoSlides(input);
  }
  return buildPuncaoChoiceSlides(input);
}

export function buildPuncaoPremiumSlides(input: BuildPuncaoSlidesInput): SlideRecord[] {
  return buildPuncaoChoiceSlides(input);
}
