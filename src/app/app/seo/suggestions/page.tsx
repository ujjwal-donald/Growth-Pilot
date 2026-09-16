import { requireWorkspace } from "@/server/auth-context";
import { prisma } from "@/lib/db";
import { generateContentSuggestionsAction } from "@/server/actions/ai";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function SuggestionsPage() {
  const ctx = await requireWorkspace();
  const calendar = await prisma.contentCalendar.findFirst({
    where: { workspaceId: ctx.workspace.id, name: "SEO content suggestions" },
    orderBy: { createdAt: "desc" },
  });
  const ideas = Array.isArray((calendar?.generatedPlan as { ideas?: unknown[] } | null)?.ideas)
    ? ((calendar?.generatedPlan as { ideas: Array<Record<string, string>> }).ideas ?? [])
    : [];

  return (
    <div>
      <PageHeader
        title="Content suggestions"
        description="Turns tracked keywords and SEO issues into briefs you can send to the content studio."
      />
      <form
        action={async () => {
          "use server";
          await generateContentSuggestionsAction();
        }}
        className="mb-6"
      >
        <Button type="submit">Generate suggestions</Button>
      </form>
      <div className="grid gap-4 md:grid-cols-2">
        {ideas.map((idea, index) => (
          <Card key={`${idea.title}-${index}`}>
            <CardHeader>
              <CardTitle>{idea.title ?? `Idea ${index + 1}`}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>{idea.format}</p>
              <p>{idea.keyword}</p>
              <p>{idea.outline}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
