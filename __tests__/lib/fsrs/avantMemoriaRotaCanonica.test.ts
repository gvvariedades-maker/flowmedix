/**
 * R6.1 — rota canônica do AVANT Memória.
 * Invariantes de roteamento (asserção sobre o código-fonte das páginas RSC):
 * uma única fila por usuário, SM-2 invisível quando ativo e redirects sem loop.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const root = process.cwd();
const planoDiarioPath = join(root, 'app/(dashboard)/(authenticated)/plano-diario/page.tsx');
const revisoesHojePath = join(root, 'app/(dashboard)/(authenticated)/revisoes-hoje/page.tsx');
const layoutPath = join(root, 'app/(dashboard)/layout.tsx');

const planoDiario = readFileSync(planoDiarioPath, 'utf8');
const revisoesHoje = readFileSync(revisoesHojePath, 'utf8');
const dashboardLayout = readFileSync(layoutPath, 'utf8');

describe('AVANT Memória — rota canônica atrás da flag', () => {
  it('/plano-diario redireciona para /revisoes-hoje somente com a coorte ativa', () => {
    expect(planoDiario).toContain('shouldUseFsrsTodayQueue(session.user.email)');
    expect(planoDiario).toContain("redirect('/revisoes-hoje')");
  });

  it('/plano-diario não alimenta mais o CTA de segunda fila', () => {
    expect(planoDiario).not.toContain('showFsrsRevisoesCta');
  });

  it('/revisoes-hoje só volta ao SM-2 para quem está fora da coorte', () => {
    expect(revisoesHoje).toContain('if (!shouldUseFsrsTodayQueue(session.user.email))');
  });

  it('fallback SM-2 dentro da coorte ativa não redireciona (sem loop de redirect)', () => {
    const afterQueue = revisoesHoje.slice(revisoesHoje.indexOf('await getReviewsToday('));
    expect(afterQueue).not.toContain("redirect('/plano-diario')");
    expect(afterQueue).toContain('<RevisoesIndisponivel />');
    expect(revisoesHoje).toContain('Revisões temporariamente indisponíveis');
  });

  it('menu recebe a condição resolvida no servidor (fail-closed no default)', () => {
    expect(dashboardLayout).toContain('shouldUseFsrsTodayQueue(email)');
    expect(dashboardLayout).toContain('avantMemoriaAtivo={avantMemoriaAtivo}');
  });
});
