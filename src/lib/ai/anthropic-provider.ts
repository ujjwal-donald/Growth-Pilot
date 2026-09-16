import type { AiProvider, GenerateTextInput, GenerateTextResult } from "./types";

export class AnthropicProvider implements AiProvider {
  readonly name = "anthropic";

  constructor(
    private readonly apiKey: string,
    private readonly model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-0",
  ) {}

  async generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
    const system = input.messages.filter((m) => m.role === "system").map((m) => m.content).join("\n");
    const messages = input.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.content }));

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.model,
        max_tokens: input.maxTokens ?? 1200,
        system: system || undefined,
        messages,
      }),
    });
    if (!response.ok) {
      throw new Error(`Anthropic request failed (${response.status})`);
    }
    const json = (await response.json()) as {
      content?: Array<{ text?: string }>;
      usage?: { input_tokens?: number; output_tokens?: number };
      model?: string;
    };
    const text = json.content?.map((block) => block.text ?? "").join("\n") ?? "";
    const promptTokens = json.usage?.input_tokens ?? 0;
    const completionTokens = json.usage?.output_tokens ?? 0;
    return {
      text,
      model: json.model ?? this.model,
      promptTokens,
      completionTokens,
      estimatedCostUsd: (promptTokens / 1_000_000) * 3 + (completionTokens / 1_000_000) * 15,
      provider: this.name,
    };
  }
}
