import { QuestaoNavigationProvider } from '@/components/lesson/QuestaoNavigationProvider';

export default function EstudarLayout({ children }: { children: React.ReactNode }) {
  return <QuestaoNavigationProvider>{children}</QuestaoNavigationProvider>;
}
