import { GoogleGenerativeAI } from '@google/generative-ai'
import { DecisionFlowData } from '@/types/simulator'

const GEMINI_MODEL = 'gemini-1.5-flash'
const PROMPT_TEMPLATE = (content: string) =>
  `Retorne um objeto JSON exatamente neste formato: { "topics": [{ "title": "string", "description": "string" }] }. Use o conteúdo: ${content}`
const DECISION_FLOW_PROMPT = (content: string) =>
  `Transforme o conteúdo técnico de enfermagem fornecido em um simulador de decisão interativo. Crie cenários de acerto e erro, inclua dicas de prova e feedbacks pedagógicos no formato JSON compatível com o DecisionSimulator. Conteúdo de referência: ${content}`

let genAI: GoogleGenerativeAI | null = null

function getGenAI() {
  if (genAI) return genAI
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    throw new Error('Variável GOOGLE_API_KEY não configurada')
  }
  genAI = new GoogleGenerativeAI(apiKey)
  return genAI
}

export interface GeminiTopic {
  title: string
  description: string
}

export async function extractStudyTopicsFromText(text: string) {
  console.debug('GOOGLE_API_KEY presente:', !!process.env.GOOGLE_API_KEY)

  const model = getGenAI().getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  })

  const promptText = PROMPT_TEMPLATE(text.trim())
  const response = await model.generateContent({ text: promptText })
  const responseText = await response.text()

  if (typeof (response as Response).ok === 'boolean' && !(response as Response).ok) {
    throw new Error(
      `Gemini retornou erro ${(response as Response).status}: ${responseText}`
    )
  }

  if (!responseText) {
    throw new Error('Resposta do Gemini vazia')
  }

  return { content: responseText, raw: responseText }
}

export async function generateInteractiveFlow(content: string): Promise<DecisionFlowData> {
  const model = getGenAI().getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      responseMimeType: 'application/json',
    },
  })

  const promptText = DECISION_FLOW_PROMPT(content.trim())
  const response = await model.generateContent({ text: promptText })
  const responseText = await response.text()

  if (!responseText) {
    throw new Error('Resposta do Gemini vazia ao gerar flow interativo.')
  }

  try {
    const parsed = JSON.parse(responseText)
    if (!parsed?.steps?.length) {
      throw new Error('Flow interativo inválido: falta propriedade steps.')
    }
    return parsed as DecisionFlowData
  } catch (err: any) {
    throw new Error(`Falha ao interpretar o simulador gerado pela IA: ${err?.message ?? 'erro desconhecido'}`)
  }
}

// Alias para compatibilidade com imports existentes
export const extractTopicsFromText = extractStudyTopicsFromText

