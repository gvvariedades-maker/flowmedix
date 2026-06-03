import { redirect } from 'next/navigation';

/** NeuroSlides do Material de Apoio descontinuado — redireciona para a vitrine. */
export default function MaterialNeuroslidesPage() {
  redirect('/estudar');
}
