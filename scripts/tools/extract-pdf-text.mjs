#!/usr/bin/env node
import fs from 'node:fs';
import pdf from 'pdf-parse/lib/pdf-parse.js';

const file = process.argv[2];
if (!file) {
  console.error('Usage: node scripts/tools/extract-pdf-text.mjs <path.pdf>');
  process.exit(1);
}

const buf = fs.readFileSync(file);
const data = await pdf(buf);
const lines = data.text
  .split(/\n/)
  .map((l) => l.trim())
  .filter(Boolean);

console.log(JSON.stringify({ pages: data.numpages, lineCount: lines.length, lines }, null, 2));
