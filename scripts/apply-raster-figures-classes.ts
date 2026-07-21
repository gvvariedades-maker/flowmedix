#!/usr/bin/env tsx
/**
 * Após figures:extract-from-pdf — upload WebP + patch JSON com figure_policy required.
 *
 * Uso: npm run figures:apply-raster-classes
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { execSync } from 'node:child_process';

loadEnvConfig(process.cwd());

import { buildPublicQuestaoFigureUrl } from '@/lib/questaoFiguresStorage';
import { detectMissingFigure } from '@/lib/catalogMigration/figureContract';

const ROOT = process.cwd();
const FIG_DIR = resolve(ROOT, 'artifacts/questao-figures/classes-de-palavras');

type RasterSpec = {
  slug: string;
  alt: string;
  instruction?: string;
};

const RASTER: Record<string, RasterSpec> = {
  '3739268': {
    slug: 'avancasp-mon-classes-schulz-charles-m-snoopy-jornal-da-ta-3739268',
    alt: 'Tirinha Snoopy: diálogo com troca de artigo indefinido «um» para definido «o» antes de cachorro',
    instruction:
      'SCHULZ, Charles M. Snoopy. Jornal da Tarde. São Paulo, 29 ago. 2003.\n\nNa tirinha abaixo, a mudança de «um» para «o» pode ser descrita corretamente como:',
  },
  '3665303': {
    slug: 'avancasp-fon-classes-cartazes-publicitarios-disponivel-em-3665303',
    alt: 'Cartaz publicitário de segurança com pé descalço e mensagem de prevenção',
    instruction:
      'CARTAZES PUBLICITÁRIOS.\n\nNo cartaz publicitário abaixo, é correto afirmar que:',
  },
  '3793476': {
    slug: 'apice-ag-adm-classes-leia-a-charge-abaixo-e-responda-a-qu-3793476',
    alt: 'Charge Enem: estudante quer acordar cedo para se atrasar calmamente à prova',
    instruction:
      'Leia a charge abaixo e responda à questão.\n\nEm «é que o Enem é uma data muito especial, quero acordar bem cedo para me atrasar calmamente para a prova!», considerando o contexto em que ocorre, os vocábulos «muito», «especial» e «calmamente», do ponto de vista morfológico, classificam-se, respectivamente, como:',
  },
  '3835993': {
    slug: 'avancasp-tec-classes-cazo-presenca-de-animais-selvagens-b-3835993',
    alt: 'Charge CAZO sobre presença de animais selvagens à noite',
    instruction:
      'CAZO. Presença de animais selvagens. Blog do AFTM.\n\nA conjunção «como», empregada na fala da charge abaixo, possui o sentido de:',
  },
  '3352957': {
    slug: 'avancasp-acs-classes-leia-a-tirinha-a-seguir-para-respond-3352957',
    alt: 'Tirinha com diálogo sobre livro de história e fixador de impressão',
    instruction:
      'Leia a tirinha abaixo para responder à questão.\n\nEm relação aos trechos a seguir, retirados da tirinha, analise as afirmativas e classifique-as em verdadeiro (V) ou falso (F). Em seguida, marque a alternativa correta.\n\n( ) «Você ao menos leu o capítulo do livro de história que eu mandei?» – «ler» está conjugado no pretérito perfeito do indicativo.\n\n( ) «Eu tentei, mas a editora do livro não usou um bom fixador de impressão.» – «mas» é uma conjunção adversativa.\n\n( ) «Não preciso nem dizer que quando eu peguei o livro, todas as letras caíram das páginas e ficaram espalhadas no chão.» – «Não» e «nem» são advérbios de modo.\n\n( ) «Acho que minhas desculpas precisam ser menos elaboradas» – «minhas» é uma preposição.',
  },
};

function findQuestionPath(slug: string): string | null {
  const root = resolve(ROOT, 'data/catalog-migration');
  for (const dir of readdirSync(root)) {
    const path = join(root, dir, 'questions', `${slug}.json`);
    if (existsSync(path)) return path;
  }
  return null;
}

function main(): void {
  let uploaded = 0;
  let patched = 0;

  for (const [tecId, spec] of Object.entries(RASTER)) {
    const webp = join(FIG_DIR, `${tecId}.webp`);
    if (!existsSync(webp)) {
      console.warn(`SKIP upload ${tecId}: ${webp} ausente — rode npm run figures:extract-from-pdf`);
      continue;
    }

    execSync(
      `npm run figures:upload -- --tec-id=${tecId} --file="${webp}" --alt="${spec.alt.replace(/"/g, '\\"')}"`,
      { stdio: 'inherit', cwd: ROOT },
    );
    uploaded += 1;

    const path = findQuestionPath(spec.slug);
    if (!path) {
      console.warn(`SKIP patch ${spec.slug}: JSON não encontrado`);
      continue;
    }

    const payload = JSON.parse(readFileSync(path, 'utf8')) as {
      question_data?: Record<string, unknown>;
    };
    if (!payload.question_data) payload.question_data = {};

    const url = buildPublicQuestaoFigureUrl(tecId, 'f1');
    payload.question_data.figure_policy = 'required';
    payload.question_data.figures = [
      { id: 'f1', url, alt: spec.alt, kind: 'crop', source_page: undefined },
    ];
    delete payload.question_data.text_fragment;
    if (spec.instruction) {
      payload.question_data.instruction = spec.instruction;
    }

    const missing = detectMissingFigure(payload);
    if (missing) {
      console.warn(`STILL MISSING ${spec.slug}: ${missing.message}`);
      continue;
    }

    writeFileSync(path, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
    console.log(`PATCHED ${path}`);
    patched += 1;
  }

  console.log(`\nResumo: uploaded=${uploaded} patched=${patched}`);
}

main();
