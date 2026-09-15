import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Scheduler"
      description="Queue work for a cron/queue worker."
      bullets={['A worker should pick SCHEDULED posts whose scheduledAt <= now.', 'Failed publishes store lastError.']}
    />
  );
}
