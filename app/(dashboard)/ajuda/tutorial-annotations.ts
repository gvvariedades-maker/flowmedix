/**
 * Posições em % (top/left) sobre a captura, relativas ao canto superior esquerdo
 * do bloco da imagem (centrado no ponto de clique aproximado).
 */
export type TutorialCallout = {
  /** Número exibido no selo (1, 2, 3…). */
  n: number;
  top: string;
  left: string;
  /** Texto curto do selo. */
  text: string;
};

export const TUTORIAL_ANNOTATIONS: Record<string, TutorialCallout[]> = {
  'seq-01.png': [
    { n: 1, top: '18%', left: '14%', text: 'Menu: Vitrine de Aulas' },
    { n: 2, top: '10%', left: '58%', text: 'Busca: assunto, tópico, banca, Q-…' },
    { n: 3, top: '26%', left: '32%', text: 'Filtro: Todas as bancas' },
    { n: 4, top: '26%', left: '52%', text: 'Filtro: Todos os assuntos' },
    { n: 5, top: '48%', left: '50%', text: 'Card do assunto: clique na seta para expandir' },
    { n: 6, top: '88%', left: '78%', text: 'Paginação: Próxima / Anterior' },
  ],
  'seq-02.png': [
    { n: 1, top: '42%', left: '38%', text: 'Entrar no assunto' },
    { n: 2, top: '55%', left: '38%', text: 'Ver / ocultar lista de questões' },
    { n: 3, top: '68%', left: '72%', text: 'Iniciar em uma questão (Q-…)' },
    { n: 4, top: '11%', left: '62%', text: 'Busca rápida no topo' },
  ],
  'seq-03.png': [
    { n: 1, top: '16%', left: '82%', text: 'Ir à vitrine' },
    { n: 2, top: '34%', left: '28%', text: 'Meta do dia (0/10, …)' },
    { n: 3, top: '34%', left: '52%', text: 'Dias seguidos' },
    { n: 4, top: '34%', left: '75%', text: 'Questões (30 dias)' },
    { n: 5, top: '78%', left: '50%', text: 'Atividade: 7 / 15 / 30 dias' },
  ],
  'seq-04.png': [
    { n: 1, top: '58%', left: '50%', text: 'Ir à vitrine' },
    { n: 2, top: '20%', left: '14%', text: 'Menu: Plano de Estudo Diário' },
  ],
  'seq-05.png': [
    { n: 1, top: '48%', left: '50%', text: 'Nome do caderno (obrigatório)' },
    { n: 2, top: '58%', left: '50%', text: 'Descrição (opcional)' },
    { n: 3, top: '78%', left: '78%', text: '+ Criar caderno' },
    { n: 4, top: '18%', left: '14%', text: 'Menu: Cadernos de Estudo' },
  ],
  'seq-06.png': [
    { n: 1, top: '38%', left: '50%', text: 'Alternativas: clique A–E' },
    { n: 2, top: '58%', left: '50%', text: 'Confirmar resposta' },
    { n: 3, top: '88%', left: '18%', text: 'Anterior' },
    { n: 4, top: '88%', left: '82%', text: 'Próxima questão' },
    { n: 5, top: '80%', left: '50%', text: 'Círculos: pular para outra posição' },
  ],
  'seq-07.png': [
    { n: 1, top: '42%', left: '50%', text: 'Alternativas (certo/erro após enviar)' },
    { n: 2, top: '58%', left: '72%', text: 'Ativar estudo reverso' },
    { n: 3, top: '86%', left: '82%', text: 'Próxima questão' },
  ],
  'seq-08.png': [
    { n: 1, top: '45%', left: '22%', text: 'Módulo: toque no tema (círculo)' },
    { n: 2, top: '45%', left: '50%', text: 'Navegação no mapa' },
    { n: 3, top: '90%', left: '85%', text: 'Próximo' },
    { n: 4, top: '8%', left: '92%', text: 'Fechar (X)' },
  ],
  'seq-09.png': [
    { n: 1, top: '40%', left: '50%', text: 'Ler os pontos (erros comuns / síntese)' },
    { n: 2, top: '90%', left: '82%', text: 'Marcar como estudado' },
    { n: 3, top: '90%', left: '15%', text: 'Voltar' },
  ],
  'seq-10.png': [
    { n: 1, top: '12%', left: '78%', text: 'Estudar caderno' },
    { n: 2, top: '32%', left: '88%', text: 'Adicionar: filtro de assunto' },
    { n: 3, top: '50%', left: '92%', text: 'Adicionar: + na questão' },
    { n: 4, top: '48%', left: '40%', text: 'Lista do caderno: play / excluir' },
  ],
};
