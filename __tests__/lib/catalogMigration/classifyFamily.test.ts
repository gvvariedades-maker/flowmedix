import {
  classifyFamily,
  hasLongTextFragment,
  inferFamilyMismatch,
  isLegisFamily,
  isProtocoloFamily,
  isVfFamily,
  TEXT_FRAGMENT_MIN_CHARS,
} from '@/lib/catalogMigration/classifyFamily';

const opts = (texts: string[]) =>
  texts.map((text, i) => ({ id: String.fromCharCode(65 + i), text, is_correct: i === 0 }));

describe('classifyFamily', () => {
  it('classifica text_fragment quando o caso clínico é longo', () => {
    const fragment = 'Paciente de 72 anos, hipertenso, admitido na emergência com dispneia intensa.'.repeat(
      2,
    );
    expect(classifyFamily('Assinale a alternativa correta.', 'Urgências', opts(['A', 'B']), fragment)).toBe(
      'text_fragment',
    );
  });

  it('não classifica text_fragment no limiar de 80 caracteres', () => {
    const fragment = 'x'.repeat(TEXT_FRAGMENT_MIN_CHARS);
    expect(hasLongTextFragment(fragment)).toBe(false);
    expect(
      classifyFamily('Assinale a alternativa correta.', 'Urgências', opts(['A', 'B']), fragment),
    ).toBe('conceito');
  });

  it('classifica vf com afirmativas I–III e comando de combinação', () => {
    const instruction =
      'I - A via IM absorve rápido.\nII - A via oral é sempre a primeira escolha.\nIII - A via retal é parenteral.\nÉ correto o que se afirma em';
    expect(classifyFamily(instruction, 'Vias', opts(['A', 'B', 'C', 'D', 'E']), '')).toBe('vf');
  });

  it('mantém I–III sem comando V/F em conceito', () => {
    const instruction =
      'I - A flebite é inflamação venosa.\nII - O curativo deve ser estéril.\nIII - A punção exige assepsia.\nAssinale a alternativa correta.';
    expect(isVfFamily(instruction)).toBe(false);
    expect(classifyFamily(instruction, 'Punção Venosa', opts(['A', 'B', 'C', 'D', 'E']), '')).toBe(
      'conceito',
    );
  });

  it('classifica certo_errado com duas opções', () => {
    expect(classifyFamily('Julgue o item.', 'Imunização', opts(['Certo', 'Errado']), '')).toBe(
      'certo_errado',
    );
  });

  it('classifica certo_errado em EXCETO com múltiplas letras', () => {
    const instruction =
      'Assinale a alternativa INCORRETA quanto à técnica de punção venosa periférica.';
    expect(classifyFamily(instruction, 'Punção Venosa', opts(['A', 'B', 'C', 'D', 'E']), '')).toBe(
      'certo_errado',
    );
  });

  it('prioriza certo_errado em EXCETO mesmo com lei no enunciado', () => {
    const instruction =
      'De acordo com a Lei nº 8.080, assinale a alternativa INCORRETA sobre o SUS.';
    expect(classifyFamily(instruction, 'Promoção à Saúde', opts(['A', 'B', 'C', 'D', 'E']), '')).toBe(
      'certo_errado',
    );
  });

  it('classifica calc quando pede conta', () => {
    const instruction = 'Calcule quantos mL devem ser administrados na dose prescrita.';
    expect(
      classifyFamily(instruction, 'Cálculo de Administração de Medicamentos e Infusões', opts(['A', 'B']), ''),
    ).toBe('calc');
  });

  it('classifica calc antes de protocolo quando pede conta em contexto de urgência', () => {
    const instruction =
      'Na urgência, calcule quantos mL de soro devem ser administrados conforme a prescrição.';
    expect(classifyFamily(instruction, 'Urgências e Emergências', opts(['A', 'B', 'C', 'D', 'E']), '')).toBe(
      'calc',
    );
  });

  it('classifica legis quando cita lei no enunciado', () => {
    const instruction = 'De acordo com a Lei nº 8.080, assinale a alternativa correta.';
    expect(classifyFamily(instruction, 'Promoção à Saúde', opts(['A', 'B', 'C', 'D', 'E']), '')).toBe('legis');
  });

  it('classifica vf com colunas ( ) V/F e sequência correta', () => {
    const instruction =
      'Sobre imunização, analise as assertivas e registre V ou F:\n( ) A vacina BCG é intradérmica.\n( ) Vacinas fora da cadeia de frio podem ser usadas se agitadas.\n( ) A pentavalente cobre difteria.\n( ) O técnico pode prescrever vacinas.\nAssinale a alternativa que apresenta a sequência CORRETA, de cima para baixo.';
    expect(classifyFamily(instruction, 'Imunização', opts(['A', 'B', 'C', 'D', 'E']), '')).toBe('vf');
  });

  it('não classifica associação com colunas ( ) como vf', () => {
    const instruction =
      'Associe as colunas.\n( ) Presença de sinal de alarme.\n( ) Choque.\n( ) Sangramento de pele.\n( ) Sem alarme.\nA sequência correta dessa associação é';
    expect(classifyFamily(instruction, 'Doenças Transmissíveis', opts(['A', 'B', 'C', 'D']), '')).toBe(
      'conceito',
    );
  });

  it('classifica legis com RDC e Anvisa', () => {
    expect(
      classifyFamily(
        'Conforme a RDC da Anvisa, assinale a alternativa correta.',
        'CME',
        opts(['A', 'B', 'C']),
        '',
      ),
    ).toBe('legis');
    expect(isLegisFamily('Segundo a Anvisa, a esterilização exige rastreabilidade.')).toBe(true);
  });

  it('classifica protocolo sem pedido de conta', () => {
    const instruction = 'Na parada cardiorrespiratória, a relação compressão-ventilação no adulto é 30:2.';
    expect(classifyFamily(instruction, 'Urgências', opts(['A', 'B', 'C', 'D', 'E']), '')).toBe('protocolo');
  });

  it('classifica protocolo com parâmetro de sinais vitais', () => {
    const instruction = 'A frequência cardíaca alvo no adulto em ritmo sinusal é medida em bpm.';
    expect(isProtocoloFamily(instruction)).toBe(true);
    expect(classifyFamily(instruction, 'Sinais Vitais', opts(['A', 'B', 'C']), '')).toBe('protocolo');
  });

  it('não classifica urgência genérica como protocolo', () => {
    const instruction = 'Na urgência hospitalar, assinale a alternativa correta sobre acolhimento.';
    expect(isProtocoloFamily(instruction)).toBe(false);
    expect(classifyFamily(instruction, 'Urgências e Emergências', opts(['A', 'B', 'C', 'D', 'E']), '')).toBe(
      'conceito',
    );
  });

  it('não usa subtopico para inferir família', () => {
    const instruction = 'Assinale a alternativa correta sobre o tema.';
    expect(
      classifyFamily(instruction, 'Cálculo de Administração de Medicamentos e Infusões', opts(['A', 'B', 'C']), ''),
    ).toBe('conceito');
  });

  it('cai em conceito para MCQ genérica', () => {
    expect(classifyFamily('Assinale a alternativa correta sobre flebite.', 'Punção', opts(['A', 'B', 'C']), '')).toBe(
      'conceito',
    );
  });

  it('inferFamilyMismatch retorna null quando alinhado', () => {
    const instruction = 'Calcule quantos mL devem ser administrados.';
    expect(
      inferFamilyMismatch('calc', instruction, opts(['A', 'B']), ''),
    ).toBeNull();
  });

  it('inferFamilyMismatch sinaliza divergência', () => {
    const instruction = 'Assinale a alternativa correta sobre flebite.';
    expect(
      inferFamilyMismatch('protocolo', instruction, opts(['A', 'B', 'C']), ''),
    ).toBe('conceito');
  });
});
