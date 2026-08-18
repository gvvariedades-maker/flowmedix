import Link from 'next/link';
import { BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

/** Copy do hub Estudo — compartilhado entre `page.tsx` e `loading.tsx` para o header não mudar de tamanho. */
export const DESEMPENHO_ESTUDO_HUB_DESCRIPTION =
  'Onde você está errando, o quanto isso é confiável e qual é a próxima questão para testar.';

export function DesempenhoEstudoHubAction() {
  return (
    <Button asChild className="btn-editorial-primary h-11 w-full sm:w-auto">
      <Link
        href="/estudar"
        className="inline-flex w-full items-center justify-center sm:w-auto"
      >
        <BookOpen className="h-4 w-4" aria-hidden />
        Praticar na vitrine
      </Link>
    </Button>
  );
}
