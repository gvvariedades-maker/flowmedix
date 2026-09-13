/**
 * Adaptadores Supabase para RC-004 binding-only.
 */
import type { createServerSupabase } from '@/lib/supabase/server';
import type {
  BindingOnlyApplySink,
  BindingOnlyDataSource,
  ModuloEstudoBindingRow,
} from '@/lib/catalogMigration/rc004BindingOnly';

type SupabaseClient = Awaited<ReturnType<typeof createServerSupabase>>;

export function createBindingOnlySupabaseDataSource(
  supabase: SupabaseClient,
): BindingOnlyDataSource {
  return {
    async fetchRowBySlug(slug: string): Promise<ModuloEstudoBindingRow | null> {
      const { data, error } = await supabase
        .from('modulos_estudo')
        .select('id, modulo_slug, titulo_aula, conteudo_json')
        .eq('modulo_slug', slug)
        .maybeSingle();
      if (error) throw new Error(`SELECT falhou (${slug}): ${error.message}`);
      if (!data) return null;
      return data as ModuloEstudoBindingRow;
    },
  };
}

function postgrestJsonbEqFilter(value: unknown): string {
  if (typeof value === 'string') return value;
  return JSON.stringify(value);
}

export function createBindingOnlySupabaseApplySink(
  supabase: SupabaseClient,
): BindingOnlyApplySink {
  return {
    async updateConteudoJsonCas(args) {
      const { data, error } = await supabase
        .from('modulos_estudo')
        .update({ conteudo_json: args.nextConteudoJson })
        .eq('id', args.id)
        .eq('conteudo_json', postgrestJsonbEqFilter(args.expectedConteudoJson))
        .select('id');
      if (error) {
        return { updated: false, error: error.message };
      }
      const updated = Array.isArray(data) && data.length === 1;
      return { updated };
    },
    async reReadRowBySlug(slug: string) {
      const { data, error } = await supabase
        .from('modulos_estudo')
        .select('id, modulo_slug, titulo_aula, conteudo_json')
        .eq('modulo_slug', slug)
        .maybeSingle();
      if (error) throw new Error(`re-read falhou (${slug}): ${error.message}`);
      return (data as ModuloEstudoBindingRow | null) ?? null;
    },
  };
}

/** Fixture local: lê JSON por slug (dry-run / testes sem DB). */
export function createBindingOnlyFixtureDataSource(
  fixtureDir: string,
  readFile: (path: string) => string,
  resolvePath: (dir: string, file: string) => string,
): BindingOnlyDataSource {
  return {
    async fetchRowBySlug(slug: string): Promise<ModuloEstudoBindingRow | null> {
      const filePath = resolvePath(fixtureDir, `${slug}.json`);
      try {
        const conteudo_json = JSON.parse(readFile(filePath)) as unknown;
        return {
          id: `fixture-${slug}`,
          modulo_slug: slug,
          titulo_aula: 'Epidemiologia e Vigilância Epidemiológica',
          conteudo_json,
        };
      } catch {
        return null;
      }
    },
  };
}
