import type { Metadata } from 'next';

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/** Tema editorial no `<html>` antes do paint — evita vazar fundo cyber (#010409) do body. */
const editorialThemeScript = `
  (function () {
    document.documentElement.dataset.theme = 'editorial';
  })();
`;

export default function NeuroslideOpcaoBPreviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: editorialThemeScript }} />
      {children}
    </>
  );
}
