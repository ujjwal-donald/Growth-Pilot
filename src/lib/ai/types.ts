export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type GenerateTextInput = {
  messages: ChatMessage[];
  json?: boolean;
  temperature?: number;
  maxTokens?: number;
};

export type GenerateTextResult = {
  text: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  estimatedCostUsd: number;
  provider: string;
};

export interface AiProvider {
  readonly name: string;
  generateText(input: GenerateTextInput): Promise<GenerateTextResult>;
}
