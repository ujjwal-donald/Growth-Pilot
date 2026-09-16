import { AnthropicProvider } from "./anthropic-provider";
import { DemoAiProvider } from "./demo-provider";
import { GeminiProvider } from "./gemini-provider";
import { OpenAiProvider } from "./openai-provider";
import type { AiProvider } from "./types";

let cached: AiProvider | null = null;

export function getAiProvider(): AiProvider {
  if (cached) return cached;

  const requested = (process.env.AI_PROVIDER ?? "openai").toLowerCase();
  const openaiKey = process.env.OPENAI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const geminiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (requested === "anthropic" || requested === "claude") {
    if (!anthropicKey) {
      cached = new DemoAiProvider();
      return cached;
    }
    cached = new AnthropicProvider(anthropicKey);
    return cached;
  }
  if (requested === "gemini" || requested === "google") {
    if (!geminiKey) {
      cached = new DemoAiProvider();
      return cached;
    }
    cached = new GeminiProvider(geminiKey);
    return cached;
  }
  if (openaiKey && (requested === "openai" || requested === "auto")) {
    cached = new OpenAiProvider(openaiKey, process.env.OPENAI_MODEL || "gpt-4o-mini");
    return cached;
  }
  if (anthropicKey && requested === "auto") {
    cached = new AnthropicProvider(anthropicKey);
    return cached;
  }
  if (geminiKey && requested === "auto") {
    cached = new GeminiProvider(geminiKey);
    return cached;
  }

  cached = new DemoAiProvider();
  return cached;
}

export function resetAiProviderCache() {
  cached = null;
}
