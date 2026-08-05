import type { GuidelineTable } from '@/lib/guidelines/types';

/**
 * Mobilização e posicionamento do paciente.
 * Fontes: Anvisa NT GVIMS 05/2023 (LPP) · Protocolo PNSP Lesão por Pressão · NPIAP
 * (reposicionamento individualizado; clássico 2/2 h ainda cobrado em provas).
 */
export const MOBILIZACAO_POSICIONAMENTO: GuidelineTable = {
  id: 'mobilizacao-posicionamento',
  snapshot: 'Reposicionamento + prevenção LPP (Anvisa/PNSP)',
  issuer: 'Anvisa / MS / NPIAP',
  title: 'Mobilização e posicionamento do paciente',
  year: 2023,
  url: 'https://www.gov.br/anvisa/pt-br/centraisdeconteudo/publicacoes/servicosdesaude/notas-tecnicas',
  entries: [
    {
      id: 'decubito-2h',
      label: 'Mudança de decúbito',
      value: 'reposicionar com frequência — referência clássica a cada 2 horas se risco de LPP',
      detail:
        'Anvisa NT 05/2023 / NPIAP: intervalo individualizado pela tolerância tecidual e superfície de suporte. exam_vs_current: bancas fixam 2/2 h.',
      sourceId: 'mobilizacao-posicionamento',
    },
    {
      id: 'posicao-lateral-30',
      label: 'Posição lateral — 30°',
      value: 'inclinação lateral ~30° (não 90°) para redistribuir pressão',
      detail:
        'Protocolos PNSP/NPIAP: evitar decúbito lateral a 90° sobre trocânter; alternar D/E/dorsal.',
      sourceId: 'mobilizacao-posicionamento',
    },
    {
      id: 'cabaceira-max-30-lpp',
      label: 'Cabeceira — cisalhamento',
      value: 'elevar cabeceira no máximo ~30° quando possível (prevenção LPP)',
      detail:
        'Cabeceira alta aumenta cisalhamento sacro; equilibrar com necessidade respiratória (Fowler).',
      sourceId: 'mobilizacao-posicionamento',
    },
    {
      id: 'transferencia-segura',
      label: 'Transferência cama-maça',
      value: 'segurança da equipe e do paciente',
      detail: 'Alinhamento corporal, comunicação em equipe, faixas quando indicado.',
      sourceId: 'mobilizacao-posicionamento',
    },
    {
      id: 'trendelenburg',
      label: 'Trendelenburg',
      value: 'cabeça mais baixa que os pés',
      detail: 'Indicações específicas (ex.: choque) — não rotina pós-op abdominal.',
      sourceId: 'mobilizacao-posicionamento',
    },
    {
      id: 'fowler',
      label: 'Fowler',
      value: 'cabeceira elevada — conforto respiratório e procedimentos',
      sourceId: 'mobilizacao-posicionamento',
    },
    {
      id: 'pegadinha-trendelenburg',
      label: 'Pegadinha Trendelenburg',
      value: 'não é indicado rotineiramente para todo pós-operatório abdominal',
      sourceId: 'mobilizacao-posicionamento',
    },
    {
      id: 'prevencao-lpp-mobilizacao',
      label: 'Prevenção LPP',
      value: 'mobilização, alívio de pressão e superfície de redistribuição',
      detail:
        'Anvisa NT 05/2023: nomenclatura lesão por pressão (não “úlcera”); proteger calcâneos; não arrastar — levantar com lençol móvel.',
      sourceId: 'mobilizacao-posicionamento',
    },
    {
      id: 'decubito-sims',
      label: 'Decúbito de Sims',
      value: 'Lateral esquerdo com perna direita flexionada à frente',
      detail: 'Exames ginecológicos, retal e procedimentos perineais; facilita acesso ao períneo.',
      sourceId: 'mobilizacao-posicionamento',
    },
    {
      id: 'lateral-seguranca',
      label: 'Decúbito lateral de segurança',
      value: 'Paciente inconsciente ou com risco de aspiração — via aérea protegida',
      detail: 'Cabeça estendida, braço superior à frente; uso em emergência e transferência.',
      sourceId: 'mobilizacao-posicionamento',
    },
    {
      id: 'elevacao-mmii',
      label: 'Elevação de MMII',
      value: 'Membros inferiores elevados 15–30° acima do nível do coração',
      detail: 'Edema, insuficiência venosa e retorno venoso; contraindicado em trauma de membro sem avaliação.',
      sourceId: 'mobilizacao-posicionamento',
    },
    {
      id: 'fowler-alto-contraindicacao',
      label: 'Fowler alto — contraindicações',
      value: 'Risco de hipotensão ortostática, dispneia grave ou aspiração',
      detail: 'Cabeceira >60° pode comprimir diafragma; cautela em DPOC, pós-AVC e pacientes instáveis.',
      sourceId: 'mobilizacao-posicionamento',
    },
    {
      id: 'cinto-seguranca-leito',
      label: 'Cinto de segurança no leito',
      value: 'Prevenir queda em paciente agitado ou com risco de queda',
      detail: 'Fixar conforme protocolo institucional; não substituir vigilância; documentar indicação.',
      sourceId: 'mobilizacao-posicionamento',
    },
    {
      id: 'decubito-dorsal',
      label: 'Decúbito dorsal',
      value: 'Paciente em costas — posição basal para avaliação e procedimentos',
      detail: 'Almofadas sob joelhos aliviam lombar; evitar pressão em calcanhares.',
      sourceId: 'mobilizacao-posicionamento',
    },
    {
      id: 'decubito-ventral',
      label: 'Decúbito ventral (prono)',
      value: 'Paciente de bruços — SDRA grave e certas cirurgias',
      detail: 'Contraindicado em trauma abdominal instável e vias aéreas não protegidas.',
      sourceId: 'mobilizacao-posicionamento',
    },
    {
      id: 'pegadinha-trendelenburg-choque',
      label: 'Pegadinha Trendelenburg',
      value: 'Posição de Trendelenburg não é rotina em todo choque — avaliar indicação',
      sourceId: 'mobilizacao-posicionamento',
    },
  ],
};
