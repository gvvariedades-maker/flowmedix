import { notFound } from 'next/navigation';
import { CalcIconsPreviewClient } from './CalcIconsPreviewClient';

/** Dev-only — preview kit SVG cálculo (nível B/C). */
export default function CalcIconsPreviewPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <CalcIconsPreviewClient />;
}
