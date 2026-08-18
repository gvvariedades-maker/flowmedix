import { formatExibindoQuestoes } from '@/components/dashboard/desempenho/desempenhoCopy';

type Props = {
  exibidas: number;
  universo: number;
  leituraTruncada: boolean;
};

export function DesempenhoUniversoLine({ exibidas, universo, leituraTruncada }: Props) {
  return (
    <p data-testid="desempenho-universo" className="text-sm font-medium text-slate-900">
      {formatExibindoQuestoes(exibidas, universo, leituraTruncada)}
    </p>
  );
}
