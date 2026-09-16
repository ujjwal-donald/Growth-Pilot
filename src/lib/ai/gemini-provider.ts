import type { AiProvider, GenerateTextInput, GenerateTextResult } from "./types";

export class GeminiProvider implements AiProvider {
  readonly name = "gemini";

  constructor(
    private readonly apiKey: string,
    private readonly model = process.env.GEMINI_MODEL || "gemini-2.0-flash",
  ) {}

  async generateText(input: GenerateTextInput): Promise<GenerateTextResult> {
    const contents = input.messages
      .filter((m) => m.role !== "system")
      .map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));
    const system = input.messages.find((m) => m.role === "system")?.content;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        systemInstruction: system ? { parts: [{ text: system }] } : undefined,
        contents,
        generationConfig: {
          temperature: input.temperature ?? 0.7,
          maxOutputTokens: input.maxTokens ?? 1200,
          responseMimeType: input.json ? "application/json" : "text/plain",
        },
      }),
    });
    if (!response.ok) {
      throw new Error(`Gemini request failed (${response.status})`);
    }
    const json = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      usageMetadata?: { promptTokenCount?: number; candidatesTokenCount?: number };
    };
    const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("\n") ?? "";
    return {
      text,
      model: this.model,
      promptTokens: json.usageMetadata?.promptTokenCount ?? 0,
      completionTokens: json.usageMetadata?.candidatesTokenCount ?? 0,
      estimatedCostUsd: 0,
      provider: this.name,
    };
  }
}
