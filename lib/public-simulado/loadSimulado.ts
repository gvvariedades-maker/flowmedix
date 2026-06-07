import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { QuestaoCompletaSchema } from '@/lib/validations';
import { normalizeQuestaoSlideArrays } from '@/lib/reverseStudySlidesNormalize';
import type { LessonData } from '@/types/lesson';
import type { PublicSimuladoBundle, PublicSimuladoManifest } from '@/lib/public-simulado/types';

const MANIFESTS_DIR = resolve(process.cwd(), 'data/simulados/manifests');
const QUESTIONS_DIR = resolve(process.cwd(), 'data/simulados/idecan/questions');

const PublicSimuladoManifestSchema = z.object({
  id: z.string().min(1),
  titulo: z.string().min(1),
  subtitulo: z.string().min(1),
  descricao: z.string().min(1),
  cidade: z.string().min(1),
  uf: z.string().min(1),
  banca: z.string().min(1),
  dataProva: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  dataProvaFormatada: z.string().min(1),
  quantidade: z.number().int().positive(),
  ctaLpPath: z.string().min(1),
  utmCampaign: z.string().min(1),
  questoes: z.array(z.string().min(1)).min(1),
});

function lessonFromJsonFile(slug: string): LessonData {
  const path = resolve(QUESTIONS_DIR, `${slug}.json`);
  if (!existsSync(path)) {
    throw new Error(`Questão exportada ausente: ${slug} (rode npm run export:simulado-pool -- --manifest=...)`);
  }
  const raw = JSON.parse(readFileSync(path, 'utf8')) as unknown;
  const normalized = normalizeQuestaoSlideArrays(
    typeof raw === 'object' && raw !== null ? { ...(raw as object) } : raw,
  );
  const parsed = QuestaoCompletaSchema.safeParse(normalized);
  if (!parsed.success) {
    throw new Error(`Questão inválida (${slug}): ${parsed.error.message}`);
  }
  const { question_data, ...rest } = parsed.data;
  return {
    ...rest,
    question_data: {
      ...question_data,
      text_fragment: question_data.text_fragment ?? undefined,
    },
    modulo_slug: slug,
  };
}

export function loadPublicSimuladoManifest(simuladoId: string): PublicSimuladoManifest {
  const path = resolve(MANIFESTS_DIR, `${simuladoId}.json`);
  if (!existsSync(path)) {
    throw new Error(`Simulado não encontrado: ${simuladoId}`);
  }
  const raw = JSON.parse(readFileSync(path, 'utf8')) as unknown;
  const parsed = PublicSimuladoManifestSchema.safeParse(raw);
  if (!parsed.success) {
    throw new Error(`Manifest inválido (${simuladoId}): ${parsed.error.message}`);
  }
  return parsed.data;
}

export function loadPublicSimuladoBundle(simuladoId: string): PublicSimuladoBundle {
  const manifest = loadPublicSimuladoManifest(simuladoId);
  const questoes = manifest.questoes.map((slug) => ({
    slug,
    dados: lessonFromJsonFile(slug),
  }));

  if (questoes.length !== manifest.quantidade) {
    throw new Error(
      `Manifest ${simuladoId}: quantidade=${manifest.quantidade} mas ${questoes.length} questões carregadas`,
    );
  }

  return { manifest, questoes };
}

export const PUBLIC_SIMULADO_IDS = ['cg-01'] as const;

export type PublicSimuladoId = (typeof PUBLIC_SIMULADO_IDS)[number];

export function isPublicSimuladoId(id: string): id is PublicSimuladoId {
  return (PUBLIC_SIMULADO_IDS as readonly string[]).includes(id);
}
