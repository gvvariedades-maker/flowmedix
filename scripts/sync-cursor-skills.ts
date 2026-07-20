#!/usr/bin/env tsx
/**
 * Sincroniza docs/skills/<nome>/ → .cursor/skills/<nome>/
 * - SKILL.md (sem header de governança no runtime)
 * - reference-*.md (complementos versionados)
 * Exceção: professor-elias-santana-metodo (versionado direto em .cursor/).
 *
 * Uso:
 *   npm run sync:skills
 *   npm run sync:skills -- --check
 *   npm run sync:skills -- --bootstrap-from-cursor   # uma vez: runtime para docs (UTF-8)
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(__dirname, '..');
const DOCS_SKILLS = path.join(ROOT, 'docs', 'skills');
const CURSOR_SKILLS = path.join(ROOT, '.cursor', 'skills');
const ELIAS = 'professor-elias-santana-metodo';

const GOVERNANCE_HEADER = `> **Cópia versionada (fonte Git).** Edite aqui; sincronize o runtime com \`npm run sync:skills\`. Exceção Elias: versionada direto em \`.cursor/skills/professor-elias-santana-metodo/\`. Ver \`docs/SKILLS_GOVERNANCE.md\`.

`;

const checkOnly = process.argv.includes('--check');
const bootstrapFromCursor = process.argv.includes('--bootstrap-from-cursor');

function listDocSkills(): string[] {
  if (!existsSync(DOCS_SKILLS)) return [];
  return readdirSync(DOCS_SKILLS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== ELIAS)
    .map((d) => d.name)
    .sort();
}

function listCursorSkills(): string[] {
  if (!existsSync(CURSOR_SKILLS)) return [];
  return readdirSync(CURSOR_SKILLS, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== ELIAS)
    .map((d) => d.name)
    .sort();
}

function listSyncFiles(skillDir: string): string[] {
  if (!existsSync(skillDir)) return [];
  return readdirSync(skillDir)
    .filter((f) => f === 'SKILL.md' || /^reference-.*\.md$/.test(f))
    .sort();
}

function stripGovernanceHeader(body: string): string {
  const marker = '> **Cópia versionada (fonte Git).**';
  if (!body.includes(marker)) return body;
  const afterFrontmatter = body.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
  if (!afterFrontmatter) return body;
  const rest = afterFrontmatter[1];
  const lines = rest.split(/\r?\n/);
  if (lines[0]?.startsWith(marker)) {
    let i = 0;
    while (i < lines.length && (lines[i].startsWith('>') || lines[i].trim() === '')) i++;
    return body.slice(0, body.length - rest.length) + lines.slice(i).join('\n');
  }
  return body;
}

function withGovernanceHeader(body: string): string {
  const stripped = stripGovernanceHeader(body);
  const match = stripped.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n/);
  if (!match) return GOVERNANCE_HEADER + stripped;
  const end = match[0].length;
  return stripped.slice(0, end) + GOVERNANCE_HEADER + stripped.slice(end);
}

function prepareRuntimeContent(filename: string, srcBody: string): string {
  if (filename === 'SKILL.md') return stripGovernanceHeader(srcBody);
  return srcBody;
}

function bootstrapSkill(name: string): void {
  const srcDir = path.join(CURSOR_SKILLS, name);
  const destDir = path.join(DOCS_SKILLS, name);
  if (!existsSync(srcDir)) {
    console.warn(`skip bootstrap (sem runtime): ${name}`);
    return;
  }

  mkdirSync(destDir, { recursive: true });
  for (const filename of listSyncFiles(srcDir)) {
    const src = path.join(srcDir, filename);
    const dest = path.join(destDir, filename);
    const raw = readFileSync(src, 'utf8');
    writeFileSync(dest, filename === 'SKILL.md' ? withGovernanceHeader(raw) : raw, 'utf8');
  }
  console.log(`bootstrap: ${name}`);
}

function syncSkill(name: string): 'ok' | 'missing' | 'drift' {
  const srcDir = path.join(DOCS_SKILLS, name);
  const destDir = path.join(CURSOR_SKILLS, name);
  const files = listSyncFiles(srcDir);

  if (!files.includes('SKILL.md')) return 'missing';

  for (const filename of files) {
    const src = path.join(srcDir, filename);
    const dest = path.join(destDir, filename);

    if (!existsSync(src)) return 'missing';

    const runtimeBody = prepareRuntimeContent(filename, readFileSync(src, 'utf8'));

    if (checkOnly) {
      if (!existsSync(dest)) return 'drift';
      const destBody = readFileSync(dest, 'utf8');
      if (destBody !== runtimeBody) return 'drift';
      continue;
    }

    mkdirSync(destDir, { recursive: true });
    writeFileSync(dest, runtimeBody, 'utf8');
  }

  return 'ok';
}

function main(): void {
  if (bootstrapFromCursor) {
    const names = listCursorSkills();
    mkdirSync(DOCS_SKILLS, { recursive: true });
    for (const name of names) bootstrapSkill(name);
    console.log(`\n${names.length} skills copiadas para docs/skills/ (UTF-8)`);
    return;
  }

  const names = listDocSkills();
  if (names.length === 0) {
    console.error('Nenhuma skill em docs/skills/');
    process.exit(1);
  }

  const drift: string[] = [];
  const missing: string[] = [];

  for (const name of names) {
    const result = syncSkill(name);
    if (result === 'missing') missing.push(name);
    else if (result === 'drift') drift.push(name);
    else if (!checkOnly) console.log(`sync: ${name}`);
  }

  if (missing.length) {
    console.error('Arquivos ausentes em docs/skills/:', missing.join(', '));
    process.exit(1);
  }

  if (drift.length) {
    console.error(
      checkOnly
        ? `Runtime desatualizado (rode npm run sync:skills): ${drift.join(', ')}`
        : `Falha inesperada: ${drift.join(', ')}`,
    );
    process.exit(1);
  }

  if (checkOnly) {
    console.log(`OK — ${names.length} skills em paridade docs ↔ .cursor`);
  } else {
    console.log(`\n${names.length} skills sincronizadas para .cursor/skills/`);
    console.log(`(exceção: ${ELIAS} permanece só em .cursor/, versionado no Git)`);
  }
}

main();
