/**
 * Declaração mínima para compilar o orquestrador sem @cursor/sdk instalado.
 * Com o pacote real instalado, o módulo npm tem precedência.
 */
declare module '@cursor/sdk' {
  export class CursorAgentError extends Error {
    isRetryable?: boolean;
  }

  export type AgentPromptResult = {
    status?: string;
    result?: unknown;
    id?: string;
    runId?: string;
    agentId?: string;
    agent_id?: string;
  };

  export const Agent: {
    prompt(
      prompt: string,
      options: {
        apiKey: string;
        model: { id: string };
        local?: { cwd: string; settingSources?: string[] };
      },
    ): Promise<AgentPromptResult>;
  };
}
