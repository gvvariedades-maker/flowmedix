import EstudarQuestaoPageContent, {
  type EstudarQuestaoPageContentProps,
} from '@/components/estudar/EstudarQuestaoPageContent';
import { EstudarQuestaoModalRoute } from '@/components/estudar/EstudarQuestaoModalRoute';

/** Intercepta soft navigation vitrine → questão (fase 11.2). */
export default async function EstudarQuestaoModalPage(props: EstudarQuestaoPageContentProps) {
  return (
    <EstudarQuestaoModalRoute>
      <EstudarQuestaoPageContent {...props} />
    </EstudarQuestaoModalRoute>
  );
}
