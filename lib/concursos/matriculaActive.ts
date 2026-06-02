/** Regra de matrícula ativa — sem dependências de servidor (safe para import leve). */
export function isActiveMatriculaRow(matricula: {
  status?: string | null;
  expires_at?: string | null;
}): boolean {
  if (matricula.status && matricula.status !== 'ativo') return false;
  if (!matricula.expires_at) return true;
  return new Date(matricula.expires_at).getTime() > Date.now();
}
