#!/usr/bin/env tsx
/**
 * Upload de figura raster para bucket questao-figures (WebP).
 *
 * Uso:
 *   npm run figures:upload -- --tec-id=3839425 --file=./crop.webp --alt="Sentença O essencial..."
 *   npm run figures:upload -- --slug=avancasp-acs-classes-... --file=./crop.webp --alt="..."
 *
 * Requer: SUPABASE_SERVICE_ROLE_KEY + NEXT_PUBLIC_SUPABASE_URL
 * Saída: URL pública para colar em question_data.figures[]
 */
import { loadEnvConfig } from '@next/env';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';

loadEnvConfig(process.cwd());

import { parseArg, requireArg } from '@/lib/catalogMigration/cliArgs';
import { buildPublicQuestaoFigureUrl, QUESTAO_FIGURES_BUCKET } from '@/lib/questaoFiguresStorage';
import { createServerSupabase } from '@/lib/supabase/server';

function resolveTecId(): string {
  const tecId = parseArg('tec-id')?.trim();
  if (tecId) return tecId;

  const slug = parseArg('slug')?.trim();
  if (!slug) {
    throw new Error('Informe --tec-id= ou --slug= (slug deve terminar com tec id numérico)');
  }
  const match = slug.match(/(\d{5,})$/);
  if (!match) {
    throw new Error(`Não foi possível extrair tec_id do slug: ${slug}`);
  }
  return match[1];
}

async function main(): Promise<void> {
  const filePath = resolve(requireArg('file'));
  const alt = requireArg('alt');
  const figureId = parseArg('id')?.trim() || 'f1';
  const tecId = resolveTecId();

  if (!existsSync(filePath)) {
    throw new Error(`Arquivo não encontrado: ${filePath}`);
  }

  const ext = extname(filePath).toLowerCase();
  if (ext !== '.webp') {
    throw new Error('Apenas WebP é aceito. Converta a imagem antes do upload (extensão .webp).');
  }

  const size = statSync(filePath).size;
  if (size > 512 * 1024) {
    throw new Error(`Arquivo muito grande (${size} bytes). Máximo 512 KB.`);
  }

  const storagePath = `${tecId}/${figureId}.webp`;
  const supabase = await createServerSupabase();
  const buffer = readFileSync(filePath);

  const { error } = await supabase.storage.from(QUESTAO_FIGURES_BUCKET).upload(storagePath, buffer, {
    contentType: 'image/webp',
    upsert: true,
  });

  if (error) {
    throw new Error(`Upload falhou: ${error.message}`);
  }

  const publicUrl = buildPublicQuestaoFigureUrl(tecId, figureId);
  const snippet = {
    id: figureId,
    url: publicUrl,
    alt,
    kind: 'crop',
  };

  console.log('OK upload', storagePath);
  console.log('URL pública:', publicUrl);
  console.log('Cole em question_data.figures[]:');
  console.log(JSON.stringify(snippet, null, 2));
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
