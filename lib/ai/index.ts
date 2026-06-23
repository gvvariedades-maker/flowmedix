export {
  DEFAULT_GEMINI_SLIDES_MODEL,
  generateStructuredJson,
  getGeminiSlidesModelId,
  type GeminiStructuredResult,
  type GeminiUsage,
} from './geminiClient';
export { scoreConfidence, type ConfidenceInput } from './confidenceScore';
export { runFactCheck } from './factCheck';
export { enrichQuestaoGoldenMeta, type EnrichGoldenMetaOptions } from './enrichGoldenMeta';
export {
  buildCorrectionAppendix,
  buildSystemPrompt,
  buildUserPrompt,
  type PromptQuestaoInput,
} from './promptBuilder';
export { extractSlidesFromModelJson } from './responseSchema';
export {
  getExemplar,
  getExemplarSlides,
  getGuidelineForSubtopico,
  getMoldeSummary,
} from './retrieval';
export {
  generateSlidesForQuestao,
  type GenerateSlidesOptions,
  type GenerationOutcome,
  type GenerationStatus,
} from './slideGenerator';
