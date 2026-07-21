process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://testproject.supabase.co';

import { QuestaoDataSchema, QuestaoFigureSchema } from '@/lib/validations';

describe('QuestaoFigureSchema', () => {
  const validFigure = {
    id: 'f1',
    url: 'https://testproject.supabase.co/storage/v1/object/public/questao-figures/3839425/f1.webp',
    alt: 'Sentença O essencial é invisível aos olhos — cartaz tipográfico',
    kind: 'crop' as const,
  };

  it('aceita figura com URL Supabase HTTPS', () => {
    const parsed = QuestaoFigureSchema.safeParse(validFigure);
    expect(parsed.success).toBe(true);
  });

  it('rejeita URL http fora de localhost', () => {
    const parsed = QuestaoFigureSchema.safeParse({
      ...validFigure,
      url: 'http://evil.example/fig.webp',
    });
    expect(parsed.success).toBe(false);
  });

  it('rejeita alt curto demais', () => {
    const parsed = QuestaoFigureSchema.safeParse({
      ...validFigure,
      alt: 'curto',
    });
    expect(parsed.success).toBe(false);
  });
});

describe('QuestaoDataSchema figures', () => {
  const base = {
    instruction: 'Na figura acima, assinale a alternativa correta.',
    options: [{ id: 'A', text: 'Opção A', is_correct: true }],
  };

  const validFigure = {
    id: 'f1',
    url: 'https://testproject.supabase.co/storage/v1/object/public/questao-figures/1/f1.webp',
    alt: 'Charge sobre Enem com fala do estudante atrasado',
  };

  it('figure_policy required sem figures falha', () => {
    const parsed = QuestaoDataSchema.safeParse({
      ...base,
      figure_policy: 'required',
    });
    expect(parsed.success).toBe(false);
  });

  it('figure_policy required com figures passa', () => {
    const parsed = QuestaoDataSchema.safeParse({
      ...base,
      figure_policy: 'required',
      figures: [validFigure],
    });
    expect(parsed.success).toBe(true);
  });

  it('figure_policy transcribed sem text_fragment falha', () => {
    const parsed = QuestaoDataSchema.safeParse({
      ...base,
      figure_policy: 'transcribed',
    });
    expect(parsed.success).toBe(false);
  });

  it('figure_policy transcribed com text_fragment útil passa', () => {
    const parsed = QuestaoDataSchema.safeParse({
      ...base,
      figure_policy: 'transcribed',
      text_fragment: '<p>O essencial é invisível aos olhos.</p>',
    });
    expect(parsed.success).toBe(true);
  });
});
