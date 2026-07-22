import fs from 'node:fs';
import path from 'node:path';

import { patchPedagogicalMeta } from '@/lib/catalogMigration/patchPedagogicalMeta';

const funcampVf = JSON.parse(
  fs.readFileSync(
    path.join(process.cwd(), 'examples', 'questao-premium-funcamp-farmacodinamica-farmacocinetica-vf.json'),
    'utf8',
  ),
);

const farmacoSubtopico = 'Farmacodinâmica e Farmacocinética';

function omeprazolClinicalPayload() {
  return {
    meta: {
      banca: 'IDECAN',
      topico: 'Enfermagem',
      subtopico: farmacoSubtopico,
      content_standard: 'golden-v1',
      family: 'protocolo' as const,
    },
    question_data: {
      instruction:
        'Em um paciente hospitalizado por úlcera péptica grave, que recebe Omeprazol na forma endovenosa, avalie as condutas e marque a opção adequada.',
      options: [
        { id: 'A', text: 'Suspender IBP', is_correct: false },
        { id: 'B', text: 'Titular infusão com monitorização de pH', is_correct: true },
      ],
    },
    reverse_study_slides: [
      {
        type: 'concept_map',
        meta: { subtopico: farmacoSubtopico },
        items: [
          { label: 'Cenário', detail: 'Úlcera grave — IBP EV' },
          { label: 'Farmacodinâmica', detail: 'Inibe bomba de prótons' },
          { label: 'Monitorização', detail: 'pH gástrico guia infusão' },
        ],
      },
      {
        type: 'golden_rule',
        meta: { subtopico: farmacoSubtopico },
        rows: [{ label: 'Conduta', value: 'Titular infusão com pH' }],
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { subtopico: farmacoSubtopico },
        steps: ['Cenário clínico', 'IBP EV', 'Letra B'],
      },
      {
        type: 'danger_zone',
        meta: { subtopico: farmacoSubtopico },
        content: 'Pegadinhas',
        items: [{ label: 'Letra A', detail: 'Suspender', correct: 'Manter titulação' }],
      },
    ],
  };
}

describe('patchPedagogicalMeta', () => {
  it('FUNCAMP VF PK/PD → farmaco_pk_pd_vf + family vf', () => {
    const payload = JSON.parse(JSON.stringify(funcampVf)) as typeof funcampVf;
    delete payload.meta.pedagogical_branch;

    const result = patchPedagogicalMeta(payload, { slug: 'funcamp-vf' });

    expect(result.changed).toBe(true);
    expect(result.branchAfter).toBe('farmaco_pk_pd_vf');
    expect(result.familyAfter).toBe('vf');
    expect(payload.meta.pedagogical_branch).toBe('farmaco_pk_pd_vf');
  });

  it('omeprazol EV → farmaco_clinico_protocolo + family protocolo', () => {
    const payload = omeprazolClinicalPayload();
    const result = patchPedagogicalMeta(payload as Parameters<typeof patchPedagogicalMeta>[0], { slug: 'idecan-omeprazol' });

    expect(result.changed).toBe(true);
    expect(result.branchAfter).toBe('farmaco_clinico_protocolo');
    expect(result.familyAfter).toBe('protocolo');
    expect((payload.meta as { pedagogical_branch?: string }).pedagogical_branch).toBe('farmaco_clinico_protocolo');
  });

  it('perioperatória SRPA → perioperatorio_pos_operatorio', () => {
    const subtopico = 'Assistência Perioperatória (Inclui SRPA)';
    const payload = {
      meta: { banca: 'IDECAN', topico: 'Enfermagem', subtopico },
      question_data: {
        instruction: 'Sobre SRPA, assinale a correta.',
        options: [
          { id: 'A', text: 'Alta imediata', is_correct: false },
          { id: 'B', text: 'Monitorização contínua', is_correct: true },
        ],
      },
      reverse_study_slides: [
        {
          type: 'concept_map',
          meta: { subtopico },
          items: [
            { label: 'A', detail: 'x' },
            { label: 'B', detail: 'y' },
            { label: 'C', detail: 'z' },
          ],
        },
        {
          type: 'golden_rule',
          meta: { subtopico },
          rows: [{ label: 'X', value: 'Y' }],
        },
        {
          type: 'logic_flow',
          reveal_mode: 'tap',
          meta: { subtopico },
          steps: ['1'],
        },
        {
          type: 'danger_zone',
          meta: { subtopico },
          content: 'Pegadinhas',
          items: [{ label: 'A', detail: 'b', correct: 'c' }],
        },
      ],
    };

    const result = patchPedagogicalMeta(payload as Parameters<typeof patchPedagogicalMeta>[0]);

    expect(result.changed).toBe(true);
    expect(result.branchAfter).toBe('perioperatorio_pos_operatorio');
    expect((payload.meta as { pedagogical_branch?: string }).pedagogical_branch).toBe('perioperatorio_pos_operatorio');
  });

  it('puberdade adolescente → adolescente_desenvolvimento, não etica_sigilo', () => {
    const instruction =
      'Julgue o item. A adolescência é marcada por metamorfose física. Atraso na puberdade: mamas 12-13 anos.';
    const payload = JSON.parse(
      fs.readFileSync(
        path.join(process.cwd(), 'examples', 'questao-premium-cpcon-saude-adolescente-gravidez-vf.json'),
        'utf8',
      ),
    );
    payload.question_data.instruction = instruction;
    payload.question_data.options = [{ id: 'C', text: 'Certo', is_correct: true }];
    payload.meta.pedagogical_branch = 'adolescente_etica_sigilo';
    payload.meta.family = 'certo_errado';
    payload.reverse_study_slides = [
      {
        type: 'concept_map',
        meta: { topico: 'Enfermagem', subtopico: 'Saúde do Adolescente' },
        items: [
          { label: 'Puberdade', detail: 'Marcos 12–13 anos', icon: 'User' },
          { label: 'Meninos', detail: 'Testículos 13–14', icon: 'User' },
          { label: 'Atraso', detail: 'Ausência de sinais', icon: 'AlertTriangle' },
        ],
      },
      {
        type: 'golden_rule',
        meta: { topico: 'Enfermagem', subtopico: 'Saúde do Adolescente' },
        rows: [{ label: 'Marco', value: '12–13 anos' }],
      },
      {
        type: 'logic_flow',
        reveal_mode: 'tap',
        meta: { topico: 'Enfermagem', subtopico: 'Saúde do Adolescente' },
        steps: ['Puberdade', 'Certo'],
      },
      {
        type: 'danger_zone',
        meta: { topico: 'Enfermagem', subtopico: 'Saúde do Adolescente' },
        content: 'Pegadinhas',
        items: [{ label: 'A', detail: 'y', correct: 'z' }],
      },
    ];

    const result = patchPedagogicalMeta(payload, { forceBranch: true, slug: 'igeduc-puberdade' });

    expect(result.skippedReason).not.toBe('zod_invalid');
    expect(result.changed).toBe(true);
    expect(result.branchAfter).toBe('adolescente_desenvolvimento');
    expect(result.branchAfter).not.toBe('adolescente_etica_sigilo');
    expect(payload.meta.pedagogical_branch).toBe('adolescente_desenvolvimento');
  });

  it('reconcileBranch alinha declarado ao inferido (Imunização VF intervalos)', () => {
    const payload = {
      meta: {
        banca: 'CPCON',
        topico: 'Enfermagem',
        subtopico: 'Imunização',
        pedagogical_branch: 'imunizacao_generico',
        family: 'vf' as const,
        content_standard: 'golden-v1',
      },
      question_data: {
        instruction:
          'I - O intervalo mínimo entre doses de vacinas inativadas é de 15 dias. II - Reforço da tríplice viral pode ser feito a qualquer idade. III - BCG é contraindicada em gestantes. Quais estão corretas?',
        options: [{ id: 'A', text: 'Apenas I', is_correct: true }],
      },
      reverse_study_slides: [
        {
          type: 'concept_map',
          meta: { subtopico: 'Imunização' },
          items: [{ label: 'Intervalo', detail: 'PNI grace period' }],
        },
        { type: 'golden_rule', rows: [{ label: 'Grace', value: '4 dias' }] },
        { type: 'logic_flow', reveal_mode: 'tap', steps: ['Julgar I', 'Marcar A'] },
        {
          type: 'danger_zone',
          content: 'Pegadinhas',
          items: [{ label: 'Letra B', detail: 'x', correct: 'y' }],
        },
      ],
    };

    const result = patchPedagogicalMeta(payload, { reconcileBranch: true, slug: 'vf-intervalos' });

    expect(result.skippedReason).not.toBe('zod_invalid');
    expect(result.changed).toBe(true);
    expect(result.branchAfter).toBe('imunizacao_vf_intervalos');
    expect(payload.meta.pedagogical_branch).toBe('imunizacao_vf_intervalos');
  });
});
