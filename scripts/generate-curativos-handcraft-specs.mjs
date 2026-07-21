#!/usr/bin/env node
/**
 * Gera scripts/curativos-handcraft-specs.generated.ts a partir do dump de questões.
 * Uso: node scripts/generate-curativos-handcraft-specs.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const { SLUG_BRANCH } = await import('../scripts/curativos-handcraft-config.ts');

const COMPLETO = join(process.cwd(), 'data/catalog-migration/curativos-e-manejo-de-feridas-completo/questions');
const G01 = JSON.parse(
  readFileSync('data/catalog-migration/curativos-e-manejo-de-feridas-g01/manifest.json', 'utf8'),
).slugs;

const dump = Object.keys(SLUG_BRANCH)
  .filter((slug) => !G01.includes(slug))
  .sort()
  .map((slug) => {
    const j = JSON.parse(readFileSync(join(COMPLETO, `${slug}.json`), 'utf8'));
    return {
      slug,
      meta: j.meta,
      instruction: j.question_data.instruction,
      options: j.question_data.options,
    };
  });

const SUBTOPICO = 'Curativos e Manejo de Feridas';
const slideMeta = { topico: 'Enfermagem', subtopico: SUBTOPICO };

function firstSentence(text) {
  const t = text.replace(/\s+/g, ' ').trim();
  const m = t.match(/^[^.?!]{20,200}[.?!]/);
  return m ? m[0].trim() : t.slice(0, 120);
}

function paraphraseOption(text, max = 72) {
  const t = text.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function isExceto(instruction) {
  return /exceto|incorreta|afirmativa falsa|não corresponde|incorreto/i.test(instruction);
}

function isRomanVf(instruction) {
  return /I\s*[-–.]/.test(instruction) && /II\s*[-–.]/.test(instruction) && /(III|IV)\s*[-–.]/.test(instruction);
}

function isNumberedVf(instruction) {
  return /afirmativas?\s*1|características de um curativo/i.test(instruction) && /\n\s*1\s*[.\-–]/.test(instruction);
}

function parseRomanItems(instruction) {
  const items = [];
  const re = /(?:^|\n)\s*(I{1,3}|IV)\s*[-–.]\s*([^\n]+)/gi;
  let m;
  while ((m = re.exec(instruction)) !== null) {
    items.push({ roman: m[1].toUpperCase(), text: m[2].replace(/\s+/g, ' ').trim() });
  }
  return items;
}

function parseNumberedItems(instruction) {
  const items = [];
  const re = /(?:^|\n)\s*(\d)\s*[.\-–]\s*([^\n]+)/g;
  let m;
  while ((m = re.exec(instruction)) !== null) {
    items.push({ num: m[1], text: m[2].replace(/\s+/g, ' ').trim() });
  }
  return items.slice(0, 8);
}

function judgeCurativosStatement(text) {
  const t = text.toLowerCase();
  if (/álcool\s*70|iodopovidon|peróxido|antisséptico.*rotina|povidona/i.test(t)) return false;
  if (/sf\s*0[,.]9|solu[cç][aã]o fisiol[oó]gica|soro fisiol[oó]gico/i.test(t)) return true;
  if (/meio [uú]mido|ambiente [uú]mido|umidade controlada/i.test(t)) return true;
  if (/pele.*[uú]mida|manter.*[uú]mida/i.test(t) && /prevenc|lpp|press[aã]o/i.test(t)) return false;
  if (/pele.*seca|limpa e seca/i.test(t)) return true;
  if (/massagear|massagem.*proemin|hiperem/i.test(t)) return false;
  if (/calcanhar.*livre|al[ií]vio de press[aã]o|suspens[aã]o/i.test(t)) return true;
  if (/sabonete.*alcalin|ph alcalin/i.test(t)) return true;
  if (/expor.*ar|deixar aberta|secar ao ar/i.test(t)) return false;
  if (/gaze seca.*desbrid|desbridamento mec[aâ]nico.*gaze/i.test(t)) return false;
  if (/filme transparente.*infect|pel[ií]cula.*infect/i.test(t)) return false;
  if (/espuma.*contraindicad.*exsudat/i.test(t)) return false;
  if (/alginat.*contraindicad.*exsudat|cavit[aá]ri.*contraindicad/i.test(t)) return false;
  if (/hidrogel.*desvitaliz|autol[ií]tic/i.test(t)) return true;
  if (/carv[aã]o.*pouco exsudat|carv[aã]o.*osso/i.test(t)) return false;
  if (/t[eé]cnica ass[eé]ptica|menos contaminad.*mais contaminad/i.test(t)) return true;
  if (/trocar curativo.*necessidade|quando necess[aá]rio/i.test(t)) return true;
  if (/manipular diariamente|abrir ferida todo dia/i.test(t)) return false;
  if (/exsudato purulento.*comunic|odor f[eé]tido.*comunic/i.test(t)) return true;
  if (/ass[eé]ptica|t[eé]cnica ass[eé]ptica/i.test(t) && /troca do curativo/i.test(t)) return true;
  if (/protege de trocas gasosas|impede troca gasosa/i.test(t)) return false;
  if (/mant[eé]m o excesso de exsudato|acumular exsudato/i.test(t)) return false;
  if (/isolamento t[eé]rmico|protege.*infec/i.test(t)) return true;
  if (/perme[aá]vel|permite troca gasosa/i.test(t)) return true;
  if (/est[aá]gio\s*i\b|eritema n[aã]o branque/i.test(t)) return true;
  if (/est[aá]gio\s*ii\b|perda parcial.*derme/i.test(t)) return true;
  if (/est[aá]gio\s*iii\b|perda total.*espessura|subcut[aâ]neo/i.test(t)) return true;
  if (/est[aá]gio\s*iv\b|osso|tend[aã]o|m[uú]sculo/i.test(t)) return true;
  if (/segurar.*fio.*tesoura|pin[cç]a.*tesoura.*fio/i.test(t)) return false;
  if (/gaze.*depositar.*pontos/i.test(t)) return true;
  if (/limpeza.*ass[eé]ptica|t[eé]cnica ass[eé]ptica/i.test(t)) return true;
  if (/remover curativo|pin[cç]a dent/i.test(t)) return true;
  return null;
}

function shortReasonForWrong(o, correctId, exceto) {
  const t = o.text.toLowerCase();
  if (/álcool\s*70|iodopovidon|peróxido/i.test(t)) return 'antisséptico citotóxico não é limpeza de rotina no leito — SF 0,9%';
  if (/expor.*ar|deixar aberta|secar ao ar/i.test(t)) return 'ferida não cicatriza melhor exposta — ambiente úmido controlado';
  if (/antisséptico|iodo/i.test(t) && /rotina|di[aá]ria/i.test(t)) return 'limpeza padrão é SF 0,9% — antisséptico não é rotina no leito';
  if (/gaze seca.*desbrid|desbridamento mec[aâ]nico.*gaze/i.test(t)) return 'desbridamento mecânico com gaze seca é traumático e inadequado';
  if (/filme|pel[ií]cula transparente/i.test(t) && /infect/i.test(t)) return 'filme transparente é para ferida superficial não infectada';
  if (/espuma.*contraindicad/i.test(t)) return 'espuma absorve exsudato — indicada em exsudação moderada/alta';
  if (/alginat.*contraindicad/i.test(t)) return 'alginato absorve exsudato — indicado em feridas cavitárias exsudativas';
  if (/carv[aã]o/i.test(t) && /pouco exsudat|osso/i.test(t)) return 'carvão ativado não é primeira escolha para exposição óssea sem exsudato';
  if (/est[aá]gio\s*i\b/i.test(t) && /est[aá]gio\s*iii|subcut/i.test(t)) return 'perda total da espessura cutânea = estágio III, não I';
  if (/est[aá]gio\s*iv/i.test(t) && /subcut/i.test(t)) return 'exposição de subcutâneo sem osso = estágio III';
  if (/est[aá]gio\s*ii/i.test(t) && /subcut|espessura total/i.test(t)) return 'perda total da derme/espessura = estágio III';
  if (/pomada antib[ií]otica/i.test(t)) return 'antibiótico tópico não substitui limpeza e cobertura adequada';
  if (/segurar.*fio.*tesoura|tesoura.*extremidade do fio/i.test(t)) return 'retirada de pontos: pinça anatômica segura o fio — tesoura corta, não segura';
  if (/manipular diariamente/i.test(t)) return 'ferida cirúrgica não deve ser manipulada sem indicação — risco de contaminação';
  if (/protege de trocas gasosas/i.test(t)) return 'curativo ideal é permeável — permite troca gasosa controlada';
  if (/mant[eé]m o excesso de exsudato/i.test(t)) return 'curativo absorve exsudato — não deve mantê-lo no leito';
  if (/pele.*[uú]mida/i.test(t) && /lpp|press[aã]o/i.test(t)) return 'prevenção LPP exige pele limpa e seca — não úmida';
  if (/massagear|massagem/i.test(t)) return 'não massagear proeminências ósseas ou áreas hiperemiadas';
  if (exceto) return `conduta correta em curativos — não é a exceção pedida`;
  return `critério da letra ${o.id} não fecha com manejo de feridas atual`;
}

function buildMcLogic(instruction, options, correct, exceto) {
  const steps = [
    exceto
      ? 'Comando EXCETO/INCORRETA: três alternativas descrevem conduta correta; uma é a exceção.'
      : 'Ler o comando e fixar o eixo (cobertura, LPP, técnica ou pós-op) antes de testar letras.',
    `Enquadramento: ${firstSentence(instruction)}`,
  ];
  for (const o of options.filter((x) => !x.is_correct)) {
    if (exceto) {
      steps.push(`Letra ${o.id}: ${shortReasonForWrong(o, correct.id, true)} — distrator válido em EXCETO.`);
    } else {
      steps.push(`Eliminar ${o.id}: ${shortReasonForWrong(o, correct.id, false)}.`);
    }
  }
  if (exceto) {
    steps.push(`Letra ${correct.id}: única exceção — viola técnica asséptica ou indicação de cobertura.`);
  } else {
    steps.push(`Letra ${correct.id}: única alternativa alinhada ao leito, exsudato e guideline.`);
  }
  steps.push(`Marcar letra ${correct.id}.`);
  steps.push('Fixação: em curativos — classifique leito e exsudato; limpeza padrão com soro fisiológico.');
  return steps;
}

function buildRomanVfLogic(instruction, options, correct) {
  const items = parseRomanItems(instruction);
  const steps = [
    'Comando V/F: julgar afirmativas I, II, III e IV antes de montar a combinação.',
    `Tema: ${firstSentence(instruction)}`,
  ];
  const verdicts = [];
  for (const item of items) {
    const j = judgeCurativosStatement(item.text);
    const v = j === true ? 'V' : j === false ? 'F' : '?';
    verdicts.push(j === true);
    const short = item.text.length > 70 ? `${item.text.slice(0, 67)}…` : item.text;
    steps.push(`${item.roman}: “${short}” → ${v}.`);
  }
  for (const o of options.filter((x) => !x.is_correct)) {
    steps.push(`Eliminar letra ${o.id}: combinação não reflete o julgamento item a item.`);
  }
  steps.push(`Marcar letra ${correct.id}: combinação coerente com NPUAP/COFEN e meio úmido.`);
  steps.push('Fixação: em V/F de curativo — teste assépsia, exsudato e indicação de cobertura por item.');
  return steps;
}

function buildNumberedVfLogic(instruction, options, correct) {
  const items = parseNumberedItems(instruction);
  const steps = [
    'Julgar cada afirmativa numerada sobre o curativo ideal.',
    `Tema: ${firstSentence(instruction)}`,
  ];
  for (const item of items) {
    const j = judgeCurativosStatement(item.text);
    const v = j === true ? 'V' : j === false ? 'F' : '?';
    steps.push(`${item.num}: “${paraphraseOption(item.text, 60)}” → ${v}.`);
  }
  for (const o of options.filter((x) => !x.is_correct)) {
    steps.push(`Eliminar ${o.id}: combinação de afirmativas incorreta.`);
  }
  steps.push(`Marcar letra ${correct.id}.`);
  steps.push('Fixação: curativo ideal = permeável, absorve exsudato, protege de infecção e mantém umidade controlada.');
  return steps;
}

function buildDanger(instruction, options, correct, exceto) {
  const items = [];
  for (const o of options) {
    if (o.id === correct.id) {
      if (exceto) {
        items.push({
          label: `Letra ${o.id} — exceção (gabarito)`,
          detail: paraphraseOption(o.text, 80),
          correct: `INCORRETA nesta prova: ${shortReasonForWrong(o, correct.id, true)} — única exceção pedida no enunciado.`,
        });
      }
      continue;
    }
    const reason = shortReasonForWrong(o, correct.id, exceto);
    if (exceto) {
      items.push({
        label: `Letra ${o.id} — conduta correta`,
        detail: paraphraseOption(o.text, 80),
        correct: `Em EXCETO, ${o.id} descreve conduta adequada: ${reason}.`,
      });
    } else {
      items.push({
        label: `Letra ${o.id}`,
        detail: paraphraseOption(o.text, 80),
        correct: `${reason} — distrator ${o.id}; gabarito é letra ${correct.id}.`,
      });
    }
  }
  const transfer = [
    {
      label: 'Transferência — exsudato × cobertura',
      detail: 'Escolher filme transparente em ferida exsudativa infectada.',
      correct: 'Alinhar exsudato ao tipo de cobertura: alginato/espuma para alto; hidrogel para necrose seca.',
    },
    {
      label: 'Transferência — limpeza do leito',
      detail: 'Usar álcool 70% ou iodo de rotina no leito granulante.',
      correct: 'Limpeza padrão é soro fisiológico — antissépticos citotóxicos não são rotina no leito.',
    },
    {
      label: 'Transferência — LPP prevenção',
      detail: 'Manter pele úmida ou massagear proeminências.',
      correct: 'Pele limpa e seca; nunca massagear áreas hiperemiadas — aliviar pressão.',
    },
  ];
  let ti = 0;
  while (items.length < Math.max(3, options.length - 1) && ti < transfer.length) {
    items.push(transfer[ti++]);
  }
  return items;
}

function branchConcept(branch, instruction) {
  const base = slideMeta;
  const enq = { label: 'Enquadramento', detail: firstSentence(instruction), icon: 'Target' };
  const maps = {
    curativos_cobertura_selecao: {
      slide_title: 'Seleção de cobertura',
      chip_label: 'COBERTURA',
      items: [
        enq,
        { label: 'Exsudato', detail: 'Baixo → hidrocoloide/filme; moderado/alto → espuma/alginato.', icon: 'Droplets' },
        { label: 'Leito', detail: 'Necrose → hidrogel/autólise; granulação → espuma/hidrofibra.', icon: 'Layers' },
        { label: 'Meio úmido', detail: 'Ambiente úmido controlado acelera cicatrização — não expor ao ar.', icon: 'CloudRain' },
        { label: 'Pegadinha', detail: 'Inverter indicação de espuma/alginato ou usar antisséptico de rotina.', icon: 'AlertTriangle' },
        { label: 'SF no leito', detail: 'Limpeza padrão com soro fisiológico — evitar álcool rotineiro.', icon: 'FlaskConical' },
      ],
      footer_rule: 'Leito + exsudato → cobertura; limpeza = SF',
    },
    curativos_ferida_cirurgica: {
      slide_title: 'Ferida cirúrgica / pós-op',
      chip_label: 'PÓS-OP',
      items: [
        enq,
        { label: 'Ferida operatória', detail: 'Curativo em ferida cirúrgica — técnica asséptica na troca.', icon: 'Bandage' },
        { label: 'Pós-operatório', detail: 'Observar exsudato, bordas e sinais de deiscência.', icon: 'Activity' },
        { label: 'Retirada de pontos', detail: 'Pinça anatômica no fio; campo estéril; comunicar alterações.', icon: 'Scissors' },
        { label: 'Sinais de alerta', detail: 'Exsudato purulento, odor fétido — comunicar equipe.', icon: 'AlertTriangle' },
        { label: 'Pegadinha', detail: 'Manipulação diária ou técnica invertida na retirada de pontos.', icon: 'XCircle' },
      ],
      footer_rule: 'Assépsia + observação na ferida cirúrgica',
    },
    curativos_lpp: {
      slide_title: 'LPP — prevenção e estágios',
      chip_label: 'LPP',
      items: [
        enq,
        { label: 'Prevenção', detail: 'Pele limpa e seca; alívio de pressão; não massagear proeminências.', icon: 'Bed' },
        { label: 'Estágios', detail: 'I eritema; II derme; III subcutâneo; IV osso/tendão.', icon: 'Layers' },
        { label: 'Braden', detail: 'Escore de risco — reavaliar e intervir quando indicado.', icon: 'Calculator' },
        { label: 'Pegadinha', detail: 'Trocar seco por úmido ou confundir estágio III com IV.', icon: 'AlertTriangle' },
      ],
      footer_rule: 'Prevenir > tratar — classificar estágio antes da cobertura',
    },
    curativos_tecnica_assepsia: {
      slide_title: 'Técnica asséptica no curativo',
      chip_label: 'ASSÉPSIA',
      items: [
        enq,
        { label: 'Sequência', detail: 'Da área menos contaminada para a mais contaminada.', icon: 'ArrowDown' },
        { label: 'Limpeza', detail: 'Soro fisiológico — movimentos do centro para periferia do leito.', icon: 'Droplets' },
        { label: 'Troca', detail: 'Material estéril; lavar mãos; campo limpo.', icon: 'ShieldCheck' },
        { label: 'Pegadinha', detail: 'Ordem invertida ou antisséptico de rotina no leito.', icon: 'XCircle' },
      ],
      footer_rule: 'Menos → mais contaminado; SF no leito',
    },
    curativos_desbridamento: {
      slide_title: 'Desbridamento',
      chip_label: 'DESBRIDAMENTO',
      items: [
        enq,
        { label: 'Objetivo', detail: 'Remover tecido necrótico/não viável — preparar granulação.', icon: 'Scissors' },
        { label: 'Autolítico', detail: 'Hidrogel/hidrocoloide — lento, indolor.', icon: 'Clock' },
        { label: 'Mecânico', detail: 'Gaze úmida ou instrumental — risco de trauma se inadequado.', icon: 'AlertTriangle' },
        { label: 'Pegadinha', detail: 'Gaze seca agressiva ou confundir com limpeza simples.', icon: 'XCircle' },
      ],
      footer_rule: 'Tipo de desbridamento conforme leito e dor',
    },
    curativos_exceto_incorreta: {
      slide_title: 'EXCETO em curativo',
      chip_label: 'EXCETO',
      items: [
        enq,
        { label: 'Lógica', detail: 'Três condutas corretas + uma exceção — não inverta.', icon: 'AlertTriangle' },
        { label: 'Assépsia', detail: 'SF, técnica, comunicação de sinais de infecção.', icon: 'ShieldCheck' },
        { label: 'Cobertura', detail: 'Escolha por exsudato e leito — não antisséptico rotineiro.', icon: 'Bandage' },
      ],
      footer_rule: 'Valide cada letra como correta antes de achar a exceção',
    },
  };
  const m = maps[branch] ?? {
    slide_title: 'Manejo de feridas',
    chip_label: 'CURATIVO',
    items: [
      enq,
      { label: 'Cicatrização', detail: 'Ambiente úmido controlado e proteção do leito.', icon: 'Heart' },
      { label: 'Infecção', detail: 'Purulência, odor, eritema — avaliar e comunicar.', icon: 'Bug' },
      { label: 'Técnica', detail: 'Assépsia e material adequado por fase da ferida.', icon: 'ShieldCheck' },
      { label: 'Pegadinha', detail: 'Expor ao ar ou antisséptico de rotina no leito.', icon: 'XCircle' },
    ],
    footer_rule: 'Leito + exsudato + técnica asséptica',
  };
  return { ...m, meta: base };
}

function branchGolden(branch) {
  const base = { meta: slideMeta };
  const tables = {
    curativos_cobertura_selecao: {
      slide_title: 'Coberturas — referência',
      content: 'SELEÇÃO DE COBERTURA',
      rows: [
        { label: 'Exsudato baixo', value: 'Hidrocoloide ou filme transparente', badge: 'info' },
        { label: 'Exsudato alto', value: 'Espuma ou alginato de cálcio', badge: 'hot' },
        { label: 'Necrose no leito', value: 'Hidrogel — desbridamento autolítico', badge: 'ok' },
        { label: 'Limpeza padrão', value: 'Soro fisiológico isotônico no leito', badge: 'warn' },
        { label: 'Evitar rotina', value: 'Álcool e iodo citotóxicos no leito', badge: 'hot' },
      ],
      footer_rule: 'Exsudato e leito definem a cobertura',
    },
    curativos_lpp: {
      slide_title: 'LPP — estágios',
      content: 'ÚLCERA POR PRESSÃO',
      rows: [
        { label: 'Estágio I', value: 'Eritema não branqueável — pele íntegra', badge: 'info' },
        { label: 'Estágio II', value: 'Perda parcial da derme', badge: 'ok' },
        { label: 'Estágio III', value: 'Perda total da espessura cutânea', badge: 'hot' },
        { label: 'Estágio IV', value: 'Osso, tendão ou músculo exposto', badge: 'hot' },
        { label: 'Prevenção', value: 'Pele limpa e seca; alívio de pressão', badge: 'warn' },
      ],
      footer_rule: 'Classificar estágio antes da cobertura',
    },
    curativos_ferida_cirurgica: {
      slide_title: 'Ferida operatória',
      content: 'PÓS-OPERATÓRIO',
      rows: [
        { label: 'Curativo', value: 'Troca asséptica conforme prescrição/protocolo', badge: 'ok' },
        { label: 'Observar', value: 'Exsudato, odor, bordas, deiscência', badge: 'info' },
        { label: 'Comunicar', value: 'Purulência ou odor fétido à equipe', badge: 'hot' },
        { label: 'Pontos', value: 'Pinça anatômica no fio; tesoura corta', badge: 'warn' },
      ],
      footer_rule: 'Não manipular sem indicação',
    },
    curativos_tecnica_assepsia: {
      slide_title: 'Sequência asséptica',
      content: 'TÉCNICA DE CURATIVO',
      rows: [
        { label: 'Limpeza', value: 'Soro fisiológico — centro para periferia', badge: 'ok' },
        { label: 'Ordem', value: 'Menos contaminado para mais contaminado', badge: 'hot' },
        { label: 'Material', value: 'Estéril e único uso quando indicado', badge: 'info' },
      ],
      footer_rule: 'Assépsia protege leito e perilesional',
    },
    curativos_desbridamento: {
      slide_title: 'Tipos de desbridamento',
      content: 'DESBRIDAMENTO',
      rows: [
        { label: 'Autolítico', value: 'Hidrogel/hidrocoloide — lento, indolor', badge: 'ok' },
        { label: 'Enzimático', value: 'Colagenase — necrose devitalizada', badge: 'info' },
        { label: 'Instrumental', value: 'Cirúrgico/afiado — tecido viável preservado', badge: 'hot' },
        { label: 'Mecânico', value: 'Gaze úmida — evitar trauma com gaze seca', badge: 'warn' },
      ],
      footer_rule: 'Remover não viável — preparar granulação',
    },
  };
  const t = tables[branch] ?? tables.curativos_cobertura_selecao;
  return { ...base, ...t, chip_label: 'REFERÊNCIA' };
}

const specs = {};
for (const q of dump) {
  const branch = SLUG_BRANCH[q.slug] ?? 'curativos_generico';
  const correct = q.options.find((o) => o.is_correct);
  const exceto = isExceto(q.instruction);
  const roman = isRomanVf(q.instruction);
  const numbered = isNumberedVf(q.instruction);

  let family = 'conceito';
  if (roman && /correto|julgue|verifica/i.test(q.instruction)) family = 'vf';
  else if (numbered) family = 'vf';
  else if (exceto) family = 'certo_errado';

  let logic_steps;
  if (roman) logic_steps = buildRomanVfLogic(q.instruction, q.options, correct);
  else if (numbered) logic_steps = buildNumberedVfLogic(q.instruction, q.options, correct);
  else logic_steps = buildMcLogic(q.instruction, q.options, correct, exceto);

  const concept = branchConcept(branch, q.instruction);
  if (family === 'vf' && roman) {
    const items = parseRomanItems(q.instruction);
    for (const item of items.slice(0, 2)) {
      concept.items.push({
        label: `Afirmativa ${item.roman}`,
        detail: item.text.length > 80 ? `${item.text.slice(0, 77)}…` : item.text,
        icon: 'ListChecks',
      });
    }
    concept.slide_title = `${concept.slide_title} — itens I–IV`;
  }

  specs[q.slug] = {
    branch,
    family,
    guideline: buildGuidelineLabel(branch),
    concept_map: concept,
    golden_rule: branchGolden(branch),
    logic_flow: {
      slide_title: 'Raciocínio — passo a passo',
      chip_label: 'DECISÃO',
      meta: slideMeta,
      reveal_mode: 'tap',
      steps: logic_steps,
      footer_rule: 'NPUAP/COFEN — leito, exsudato, assépsia',
    },
    danger_zone: {
      slide_title: 'Armadilhas desta questão',
      chip_label: 'PEGADINHAS',
      meta: slideMeta,
      content: `PEGADINHAS — ${branch.replace('curativos_', '').toUpperCase()}`,
      bullet_style: 'x_icon',
      items: buildDanger(q.instruction, q.options, correct, exceto),
      footer_rule: 'Cada distrator com justificativa única',
    },
  };
}

function buildGuidelineLabel(branch) {
  const labels = {
    curativos_cobertura_selecao: 'Seleção de cobertura — exsudato e leito (NPUAP/COFEN)',
    curativos_ferida_cirurgica: 'Ferida cirúrgica — técnica e sinais de complicação',
    curativos_lpp: 'LPP — prevenção e estágios NPUAP',
    curativos_tecnica_assepsia: 'Técnica asséptica e limpeza com SF 0,9%',
    curativos_desbridamento: 'Desbridamento — tipos e indicações',
    curativos_exceto_incorreta: 'EXCETO — conduta em curativo',
  };
  return labels[branch] ?? 'Manejo de feridas — COFEN/NPUAP';
}

const out = `/** AUTO-GENERATED — node scripts/generate-curativos-handcraft-specs.mjs */\nexport const CURATIVOS_HANDCRAFT_SPECS = ${JSON.stringify(specs, null, 2)} as const;\n`;
writeFileSync(join(process.cwd(), 'scripts/curativos-handcraft-specs.generated.ts'), out, 'utf8');
console.log('Generated', Object.keys(specs).length, 'curativos specs');
