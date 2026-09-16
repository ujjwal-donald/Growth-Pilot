const globalForScheduler = globalThis as unknown as { socialPublisher?: NodeJS.Timeout };

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.ENABLE_IN_PROCESS_SCHEDULER === "false") return;
  const enabled =
    process.env.ENABLE_IN_PROCESS_SCHEDULER === "true" || process.env.NODE_ENV !== "production";
  if (!enabled) return;
  if (globalForScheduler.socialPublisher) return;

  const { runPublishDuePosts } = await import("@/server/jobs/publish-scheduled-posts");
  globalForScheduler.socialPublisher = setInterval(() => {
    void runPublishDuePosts().catch((error) => {
      console.error("Scheduled publish worker failed", error);
    });
  }, 60_000);
  globalForScheduler.socialPublisher.unref?.();
}
