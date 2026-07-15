import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Entrar | AVANT enf',
  robots: {
    index: false,
    follow: true,
  },
};

/** Tema editorial antes do paint — autofill e tokens claros no primeiro frame */
const editorialThemeScript = `
  (function () {
    document.documentElement.dataset.theme = 'editorial';
  })();
`;

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: editorialThemeScript }} />
      {children}
    </>
  );
}
