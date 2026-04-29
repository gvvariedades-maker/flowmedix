import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Criar conta grátis | AVANT',
  robots: {
    index: false,
    follow: true,
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
