/**
 * Scan de filesystem — só para scripts/CI (não importar de app/ RSC).
 * Runtime do app usa `declaredVariants.snapshot.json`.
 */
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { GENERIC_LAYOUT_VARIANTS } from '@/lib/slides/moldAffinity';

import {
  GENERIC_BY_SLIDE_TYPE,
  VARIANT_REGISTRY_FILES,
  VARIANT_ROUTER_FILES,
  type DeclaredVariantEntry,
  type SlideTypeKey,
} from './declaredVariantsShared';

const VARIANT_LITERAL_RE =
  /(?:layoutVariant|variant|explicitVariant)\s*===\s*['"]([a-z0-9_-]+)['"]/g;

const REGISTRY_KEY_RE = /['"]([a-z0-9_-]+)['"]\s*:\s*\{\s*Component\s*:/g;

function entryKey(slideType: SlideTypeKey, id: string): string {
  return `${slideType}__${id}`;
}

function inferSlideTypeFromHub(id: string): SlideTypeKey {
  if (GENERIC_BY_SLIDE_TYPE.concept_map.includes(id)) return 'concept_map';
  if (GENERIC_BY_SLIDE_TYPE.golden_rule.includes(id)) return 'golden_rule';
  if (GENERIC_BY_SLIDE_TYPE.logic_flow.includes(id)) return 'logic_flow';
  if (GENERIC_BY_SLIDE_TYPE.danger_zone.includes(id)) return 'danger_zone';
  return 'concept_map';
}

/** Lista variantes declaradas via leitura de routers/registries no disco. */
export function listDeclaredVariantsByScan(cwd = process.cwd()): DeclaredVariantEntry[] {
  const byKey = new Map<string, DeclaredVariantEntry>();

  const upsert = (id: string, slideType: SlideTypeKey, router: string) => {
    const key = entryKey(slideType, id);
    const existing = byKey.get(key);
    if (existing) {
      if (!existing.routers.includes(router)) existing.routers.push(router);
      return;
    }
    byKey.set(key, {
      id,
      slideType,
      generic: GENERIC_LAYOUT_VARIANTS.has(id),
      routers: [router],
      key,
    });
  };

  for (const { rel, slideType } of VARIANT_ROUTER_FILES) {
    const full = resolve(cwd, rel);
    if (!existsSync(full)) continue;
    const corpus = readFileSync(full, 'utf8');
    const fileName = rel.split('/').pop() ?? rel;

    for (const match of corpus.matchAll(VARIANT_LITERAL_RE)) {
      const id = match[1];
      if (!id) continue;
      const inferred =
        slideType === 'hub' ? inferSlideTypeFromHub(id) : slideType;
      upsert(id, inferred, fileName);
    }
  }

  for (const { rel, slideType } of VARIANT_REGISTRY_FILES) {
    const full = resolve(cwd, rel);
    if (!existsSync(full)) continue;
    const corpus = readFileSync(full, 'utf8');
    const fileName = rel.split('/').pop() ?? rel;
    for (const match of corpus.matchAll(REGISTRY_KEY_RE)) {
      const id = match[1];
      if (!id) continue;
      upsert(id, slideType, fileName);
    }
  }

  for (const [slideType, ids] of Object.entries(GENERIC_BY_SLIDE_TYPE) as [
    SlideTypeKey,
    readonly string[],
  ][]) {
    for (const id of ids) {
      upsert(id, slideType, 'GENERIC_BY_SLIDE_TYPE');
    }
  }

  return [...byKey.values()].sort((a, b) => a.key.localeCompare(b.key));
}
