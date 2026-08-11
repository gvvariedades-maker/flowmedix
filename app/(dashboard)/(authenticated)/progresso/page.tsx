import { redirect } from 'next/navigation';

/** Compatibilidade: Progresso unificado no hub Desempenho. */
export default function ProgressoRedirectPage() {
  redirect('/desempenho');
}
