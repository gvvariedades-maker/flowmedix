import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recuperar senha | AVANT enf',
  robots: {
    index: false,
    follow: false,
  },
};

export default function EsqueciSenhaLayout({ children }: { children: React.ReactNode }) {
  return children;
}
