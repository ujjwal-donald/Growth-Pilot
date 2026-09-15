"use client";

import { useState } from "react";
import { askAssistantAction } from "@/server/actions/ai";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/layout/page-header";

const starters = [
  "Create a 30 day Instagram strategy",
  "Write a Facebook post for my company",
  "Audit my website SEO",
  "Give me marketing ideas",
  "Create an ad campaign",
  "Create a marketing plan for next month",
];

export function AssistantChat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [pending, setPending] = useState(false);

  async function send(value = question) {
    if (!value.trim()) return;
    setPending(true);
    setMessages((current) => [...current, { role: "user", content: value }]);
    setQuestion("");
    const result = await askAssistantAction(value);
    setMessages((current) => [
      ...current,
      { role: "assistant", content: result.error ?? result.text ?? "No response" },
    ]);
    setPending(false);
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col">
      <PageHeader
        title="AI Marketing Assistant"
        description="Uses your business profile, audience, brand voice, and goals."
      />
      <div className="mb-4 flex flex-wrap gap-2">
        {starters.map((item) => (
          <button
            key={item}
            className="rounded-full border bg-white px-3 py-1 text-xs hover:bg-muted"
            onClick={() => send(item)}
          >
            {item}
          </button>
        ))}
      </div>
      <div className="flex-1 space-y-3 overflow-auto rounded-xl border bg-white p-4">
        {messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">Ask for a strategy, post, SEO audit, or campaign plan.</p>
        ) : null}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`max-w-3xl whitespace-pre-wrap rounded-xl px-3 py-2 text-sm ${
              message.role === "user" ? "ml-auto bg-indigo-600 text-white" : "bg-muted"
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>
      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask UPDON…"
          rows={2}
        />
        <Button type="submit" disabled={pending}>{pending ? "Thinking" : "Send"}</Button>
      </form>
    </div>
  );
}
