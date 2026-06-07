/** Monta query de `GET /api/vitrine/questao` preservando filtros de banca da vitrine. */
export function buildVitrineResolveQuestaoSearchParams(input: {
  assunto: string;
  alvo: string;
  estudarQuery?: string;
}): URLSearchParams {
  const params = new URLSearchParams();
  params.set('assunto', input.assunto);
  params.set('alvo', input.alvo.trim());

  const raw = input.estudarQuery?.startsWith('?')
    ? input.estudarQuery.slice(1)
    : (input.estudarQuery ?? '');
  if (raw) {
    const vitrineParams = new URLSearchParams(raw);
    vitrineParams.getAll('banca').forEach((b) => params.append('banca', b));
  }

  return params;
}
