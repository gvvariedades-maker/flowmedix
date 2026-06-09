import {
  classifyFamily,
  type FamilyId,
  type QuestionOption,
} from '@/lib/catalogMigration/classifyFamily';

export type { FamilyId };

export type QuestionFamilyInput = {
  instruction?: string;
  subtopico?: string;
  options?: QuestionOption[];
  textFragment?: string;
};

/** Classifica a família pedagógica da questão (7 goldens) para âncora visual no player. */
export function resolveQuestionFamilyId(input: QuestionFamilyInput): FamilyId {
  return classifyFamily(
    input.instruction ?? '',
    input.subtopico ?? '',
    input.options ?? [],
    input.textFragment ?? '',
  );
}
