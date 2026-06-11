export type QuestaoPanelModulo = {
  modulo_slug: string;
  modulo_nome?: string | null;
  titulo_aula?: string | null;
  banca?: string | null;
  avant_codigo?: number | null;
};

export type QuestaoPanelFilterParams = {
  bancas?: string[];
  assuntos?: string[];
  q?: string;
};

function resolveBancas(filters: QuestaoPanelFilterParams): string[] {
  return filters.bancas?.map((b) => b.trim()).filter(Boolean) ?? [];
}

function resolveAssuntos(filters: QuestaoPanelFilterParams): string[] {
  return filters.assuntos?.map((a) => a.trim()).filter(Boolean) ?? [];
}

/**
 * Filtra módulos do painel de questões (caderno) com paridade à vitrine:
 * match ANY banca/assunto selecionado + busca Q-/slug/banca/assunto.
 */
export function filterModulosForQuestaoPanel<T extends QuestaoPanelModulo>(
  modulos: T[],
  filters: QuestaoPanelFilterParams,
): T[] {
  const bancas = resolveBancas(filters);
  const assuntos = resolveAssuntos(filters);
  const qRaw = filters.q?.trim();
  let result = modulos;

  if (bancas.length) {
    result = result.filter((m) => bancas.includes(m.banca ?? ''));
  }
  if (assuntos.length) {
    result = result.filter((m) => assuntos.includes(m.titulo_aula ?? ''));
  }
  if (qRaw) {
    const q = qRaw.toLowerCase();
    const soNumero = q.replace(/^q-?/, '');
    result = result.filter((m) => {
      if (m.titulo_aula?.toLowerCase().includes(q)) return true;
      if (m.modulo_nome?.toLowerCase().includes(q)) return true;
      if (m.banca?.toLowerCase().includes(q)) return true;
      if (m.modulo_slug.toLowerCase().includes(q)) return true;
      if (m.avant_codigo != null) {
        if (String(m.avant_codigo) === soNumero) return true;
        if (`q-${m.avant_codigo}`.includes(q)) return true;
      }
      return false;
    });
  }

  return result;
}

export function hasQuestaoPanelFilterCriteria(filters: QuestaoPanelFilterParams): boolean {
  return (
    resolveBancas(filters).length > 0 ||
    resolveAssuntos(filters).length > 0 ||
    Boolean(filters.q?.trim())
  );
}
