import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin | AVANT enf',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminSegmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
