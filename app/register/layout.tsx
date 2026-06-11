import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Criar conta grátis | AVANT',
  robots: {
    index: false,
    follow: true,
  },
};

const editorialThemeScript = `
  (function () {
    document.documentElement.dataset.theme = 'editorial';
  })();
`;

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: editorialThemeScript }} />
      {children}
    </>
  );
}
