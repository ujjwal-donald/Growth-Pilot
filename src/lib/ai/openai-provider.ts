import OpenAI from "openai";
import type { AiProvider, GenerateTextInput, GenerateTextResult } from "./types";

const USD_PER_MILLION_PROMPT = 0.15;
const USD_PER_MILLION_COMPLETION = 0.6;

export class OpenAiProvider implements AiProvider {
  readonly name = "openai";
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model = "gpt-4o-mini") {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
    const completion = await this.client.chat.completions.create({
      model: this.model,
      temperature: input.temperature ?? 0.7,
      max_tokens: input.maxTokens ?? 1200,
      response_format: input.json ? { type: "json_object" } : undefined,
      messages: input.messages,
    });

    const text = completion.choices[0]?.message?.content ?? "";
    const promptTokens = completion.usage?.prompt_tokens ?? 0;
    const completionTokens = completion.usage?.completion_tokens ?? 0;
    const estimatedCostUsd =
      (promptTokens / 1_000_000) * USD_PER_MILLION_PROMPT +
      (completionTokens / 1_000_000) * USD_PER_MILLION_COMPLETION;

    return {
      text,
      model: completion.model ?? this.model,
      promptTokens,
      completionTokens,
      estimatedCostUsd,
      provider: this.name,
    };
  }
}
