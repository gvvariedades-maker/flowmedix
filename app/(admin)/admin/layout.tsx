import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin | AVANT',
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminSegmentLayout({ children }: { children: React.ReactNode }) {
  return children;
}
