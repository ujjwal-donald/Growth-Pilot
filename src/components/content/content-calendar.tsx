"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { generateCalendarAction, reschedulePostAction } from "@/server/actions/ai";
import type { SocialPlatform } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type CalendarPost = {
  id: string;
  copy: string;
  status: string;
  scheduledAt: string | null;
  platform: string;
};

function DayCell({
  iso,
  label,
  children,
}: {
  iso: string;
  label: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: iso });
  return (
    <div
      ref={setNodeRef}
      className={`min-h-28 rounded-lg border bg-white p-2 ${isOver ? "ring-2 ring-indigo-500" : ""}`}
    >
      <p className="mb-2 text-xs text-muted-foreground">{label}</p>
      {children}
    </div>
  );
}

function PostChip({ post }: { post: CalendarPost }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: post.id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;
  return (
    <button
      ref={setNodeRef}
      style={style}
      className="mb-1 w-full truncate rounded-md bg-slate-950 px-2 py-1 text-left text-[11px] text-white"
      {...listeners}
      {...attributes}
    >
      {post.platform} · {post.status}
    </button>
  );
}

export function ContentCalendarBoard({
  posts,
}: {
  posts: CalendarPost[];
}) {
  const [items, setItems] = useState(posts);
  const [goal, setGoal] = useState("Grow Social Media");
  const [frequency, setFrequency] = useState("5 posts per week");
  const sensors = useSensors(useSensor(PointerSensor));
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarPost[]>();
    for (const post of items) {
      if (!post.scheduledAt) continue;
      const key = post.scheduledAt.slice(0, 10);
      map.set(key, [...(map.get(key) ?? []), post]);
    }
    return map;
  }, [items]);

  async function onDragEnd(event: DragEndEvent) {
    if (!event.over) return;
    const iso = String(event.over.id);
    const postId = String(event.active.id);
    setItems((current) =>
      current.map((post) => (post.id === postId ? { ...post, scheduledAt: `${iso}T09:00:00.000Z`, status: "SCHEDULED" } : post)),
    );
    await reschedulePostAction(postId, `${iso}T09:00:00.000Z`);
    toast.success("Post rescheduled");
  }

  async function generate() {
    const result = await generateCalendarAction({
      goal,
      platforms: ["INSTAGRAM", "LINKEDIN"] as SocialPlatform[],
      frequency,
    });
    if (result.error) {
      toast.error(result.error);
      return;
    }
    toast.success("30-day calendar generated. Open drafts to refine copy.");
  }

  return (
    <div>
      <PageHeader
        title="Content calendar"
        description="Draft, scheduled, and published posts on a monthly grid. Drag a post onto a new day to reschedule."
        actions={
          <div className="flex flex-wrap gap-2">
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} className="w-48" />
            <Input value={frequency} onChange={(e) => setFrequency(e.target.value)} className="w-48" />
            <Button onClick={generate}>Generate monthly calendar</Button>
          </div>
        }
      />
      <div className="mb-4 flex gap-2 text-xs">
        <Badge>Draft</Badge>
        <Badge variant="secondary">Scheduled</Badge>
        <Badge variant="outline">Published</Badge>
      </div>
      <DndContext sensors={sensors} onDragEnd={onDragEnd}>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-7">
          {Array.from({ length: daysInMonth }, (_, index) => {
            const date = new Date(year, month, index + 1);
            const iso = date.toISOString().slice(0, 10);
            return (
              <DayCell key={iso} iso={iso} label={date.getDate().toString()}>
                {(byDay.get(iso) ?? []).map((post) => (
                  <PostChip key={post.id} post={post} />
                ))}
              </DayCell>
            );
          })}
        </div>
      </DndContext>
      <div className="mt-6">
        <h2 className="mb-2 text-sm font-medium">Unscheduled drafts</h2>
        <div className="flex flex-wrap gap-2">
          {items
            .filter((post) => !post.scheduledAt)
            .map((post) => (
              <PostChip key={post.id} post={post} />
            ))}
        </div>
      </div>
    </div>
  );
}
