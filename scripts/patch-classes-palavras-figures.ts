#!/usr/bin/env tsx
/**
 * Backfill figure_policy + text_fragment — Classes de palavras (needs_figure).
 * Aplica transcrição tipográfica nos slugs conhecidos sem raster.
 *
 * Uso:
 *   npm run figures:patch-classes -- --dry-run
 *   npm run figures:patch-classes -- --write
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { hasFlag } from '@/lib/catalogMigration/cliArgs';
import { detectMissingFigure } from '@/lib/catalogMigration/figureContract';

type PatchSpec = {
  text_fragment: string;
  instruction?: string;
};

/** Slug → transcrição fiel (tipografia legível sem raster). */
const PATCHES: Record<string, PatchSpec> = {
  'avancasp-acs-classes-15-07-2026-19-33-1-88-3-4-5-6-dispon-3839425': {
    text_fragment: '<p><strong>O essencial é invisível aos olhos.</strong></p>',
    instruction: 'Na sentença abaixo, a palavra «essencial» funciona como um:',
  },
  'avancasp-mon-classes-schulz-charles-m-snoopy-jornal-da-ta-3739268': {
    text_fragment:
      '<p>«Isso não é <em>um</em> cachorro qualquer, Charlie Brown. Isso é <strong>o</strong> cachorro mais famoso do mundo!»</p>',
  },
  'avancasp-fon-classes-cartazes-publicitarios-disponivel-em-3665303': {
    text_fragment:
      '<p><strong>CARTAZ DE SEGURANÇA</strong><br/>Trabalhe descalço com segurança — use EPI nos pés.</p>',
  },
  'apice-ag-adm-classes-leia-a-charge-abaixo-e-responda-a-qu-3793476': {
    text_fragment:
      '<p>«É que o Enem é uma data muito especial, quero acordar bem cedo para me atrasar calmamente para a prova!»</p>',
    instruction:
      'Leia a fala transcrita abaixo e responda à questão.\n\nEm «é que o Enem é uma data muito especial, quero acordar bem cedo para me atrasar calmamente para a prova!», considerando o contexto em que ocorre, os vocábulos «muito», «especial» e «calmamente», do ponto de vista morfológico, classificam-se, respectivamente, como:',
  },
  'avancasp-tec-classes-cazo-presenca-de-animais-selvagens-b-3835993': {
    text_fragment:
      '<p>«Como tem tantos animais selvagens por aqui, melhor não sair à noite.»</p>',
    instruction:
      'CAZO. Presença de animais selvagens. Blog do AFTM.\n\nA conjunção «como», empregada na fala transcrita abaixo, possui o sentido de:',
  },
  'avancasp-acs-classes-leia-a-tirinha-a-seguir-para-respond-3352957': {
    text_fragment:
      '<p>Trechos da tirinha:</p><ul><li>«Você ao menos leu o capítulo do livro de história que eu mandei?»</li><li>«Eu tentei, mas a editora do livro não usou um bom fixador de impressão.»</li><li>«Não preciso nem dizer que quando eu peguei o livro, todas as letras caíram das páginas e ficaram espalhadas no chão.»</li><li>«Acho que minhas desculpas precisam ser menos elaboradas»</li></ul>',
    instruction:
      'Com base nos trechos transcritos abaixo (extraídos da tirinha), analise as afirmativas e classifique-as em verdadeiro (V) ou falso (F). Em seguida, marque a alternativa correta.\n\n( ) «Você ao menos leu o capítulo do livro de história que eu mandei?» – «ler» está conjugado no pretérito perfeito do indicativo.\n\n( ) «Eu tentei, mas a editora do livro não usou um bom fixador de impressão.» – «mas» é uma conjunção adversativa.\n\n( ) «Não preciso nem dizer que quando eu peguei o livro, todas as letras caíram das páginas e ficaram espalhadas no chão.» – «Não» e «nem» são advérbios de modo.\n\n( ) «Acho que minhas desculpas precisam ser menos elaboradas» – «minhas» é uma preposição.',
  },
  'avancasp-ace-classes-leia-a-tirinha-a-seguir-para-respond-3353960': {
    text_fragment:
      '<p>Trechos da tirinha (Garfield):</p><ul><li>«Vou colocar você de dieta, Garfield.»</li><li>«Se você ganhar mais peso, a Terra vai sair de órbita e vai se chocar com o Sol.»</li><li>«Então, o que me diz disso?»</li><li>«Passe-me um sorvete e ligue o ar-condicionado»</li></ul>',
    instruction:
      'Com base nos trechos transcritos abaixo (extraídos da tirinha), analise as afirmativas e classifique-as em verdadeiro (V) ou falso (F). Em seguida, marque a alternativa correta.\n\n( ) «Vou colocar você de dieta, Garfield.» – «colocar» é um verbo e está conjugado na primeira pessoa do plural.\n\n( ) «Se você ganhar mais peso, a Terra vai sair de órbita e vai se chocar com o Sol.» – «Terra» é um substantivo e, no contexto, é sinônimo de «planeta».\n\n( ) «Então, o que me diz disso?» – a palavra «Então» é uma preposição.\n\n( ) «Passe-me um sorvete e ligue o ar-condicionado» – no trecho destacado, «um» e «o» são artigos, o primeiro é artigo indefinido enquanto o segundo é artigo definido.',
  },
  'educa-pb-acs-classes-considere-o-texto-a-seguir-para-resp-3819856': {
    text_fragment:
      '<p><strong>Destruição e grana rápida</strong> — charge sobre destruição ambiental e ganância.</p>',
    instruction:
      'Considere o trecho transcrito abaixo para responder à questão.\n\nNo cartum, o termo «rápida», presente na expressão «Destruição e grana rápida», é classificado como:',
  },
};

function findQuestionPath(slug: string): string | null {
  const root = resolve(process.cwd(), 'data/catalog-migration');
  for (const dir of readdirSync(root)) {
    const questionsDir = join(root, dir, 'questions');
    if (!existsSync(questionsDir)) continue;
    const path = join(questionsDir, `${slug}.json`);
    if (existsSync(path)) return path;
  }
  return null;
}

function main(): void {
  const dryRun = hasFlag('dry-run') || !hasFlag('write');
  let patched = 0;
  let stillMissing = 0;

  for (const [slug, spec] of Object.entries(PATCHES)) {
    const path = findQuestionPath(slug);
    if (!path) {
      console.warn(`SKIP (arquivo não encontrado): ${slug}`);
      continue;
    }

    const payload = JSON.parse(readFileSync(path, 'utf8')) as {
      question_data?: Record<string, unknown>;
    };
    if (!payload.question_data) payload.question_data = {};

    payload.question_data.figure_policy = 'transcribed';
    payload.question_data.text_fragment = spec.text_fragment;
    if (spec.instruction) {
      payload.question_data.instruction = spec.instruction;
    }

    const missing = detectMissingFigure(payload);
    if (missing) {
      console.warn(`STILL MISSING ${slug}: ${missing.message}`);
      stillMissing += 1;
      continue;
    }

    if (dryRun) {
      console.log(`DRY-RUN patch ${slug}`);
    } else {
      writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
      console.log(`PATCHED ${path}`);
    }
    patched += 1;
  }

  console.log(`\nResumo: patched=${patched} still_missing=${stillMissing} mode=${dryRun ? 'dry-run' : 'write'}`);
  if (stillMissing > 0) process.exit(1);
}

main();
