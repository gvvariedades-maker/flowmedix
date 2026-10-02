export type SimuladoSessionSetupPayload = {
  success?: boolean;
  resumed?: boolean;
  session?: { id?: string };
  questoes?: Array<{ modulo_slug?: string; ordem?: number }>;
};

export class SimuladoSetupParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SimuladoSetupParseError';
  }
}

export function parseSimuladoSessionSetupResponse(json: SimuladoSessionSetupPayload): {
  session_id: string;
  modulo_slug: string;
} {
  if (!json.success) {
    throw new SimuladoSetupParseError('Resposta de setup sem success: true');
  }
  const sessionId = json.session?.id?.trim();
  if (!sessionId) {
    throw new SimuladoSetupParseError('Resposta de setup sem session.id');
  }
  const first = json.questoes?.[0];
  const moduloSlug = first?.modulo_slug?.trim();
  if (!moduloSlug) {
    throw new SimuladoSetupParseError(
      'Resposta de setup sem questoes[0].modulo_slug (sessão resumed sem questões exige outro fluxo)',
    );
  }
  return { session_id: sessionId, modulo_slug: moduloSlug };
}
