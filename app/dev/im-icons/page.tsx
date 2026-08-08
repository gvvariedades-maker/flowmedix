import { notFound } from 'next/navigation';
import { ImIconsPreviewClient } from './ImIconsPreviewClient';

/** Dev-only — preview do kit SVG IM (mapa mental / NeuroSlides). */
export default function ImIconsPreviewPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  return <ImIconsPreviewClient />;
}
