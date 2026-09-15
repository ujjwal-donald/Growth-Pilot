import { DemoAiProvider } from "./demo-provider";
import { OpenAiProvider } from "./openai-provider";
import type { AiProvider } from "./types";

let cached: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (cached) return cached;

  const requested = (process.env.AI_PROVIDER ?? "openai").toLowerCase();
  const openaiKey = process.env.OPENAI_API_KEY;

  if (requested === "openai" && openaiKey) {
    cached = new OpenAiProvider(openaiKey, process.env.OPENAI_MODEL || "gpt-4o-mini");
    return cached;
  }

  // Gemini / Claude adapters can be registered here without changing callers.
  cached = new DemoAiProvider();
  return cached;
}

export function resetAiProviderCache() {
  cached = null;
}
