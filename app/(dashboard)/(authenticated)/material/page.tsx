import { redirect } from 'next/navigation';

/** Material de Apoio descontinuado — redireciona para a vitrine. */
export default function MaterialPage() {
  redirect('/estudar');
}
