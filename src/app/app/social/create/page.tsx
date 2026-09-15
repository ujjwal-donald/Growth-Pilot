import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Create post"
      description="Compose or generate a post, choose an account, then save or schedule."
      bullets={['Use AI Post Generator for copy.', 'Scheduler statuses: DRAFT, SCHEDULED, PUBLISHING, PUBLISHED, FAILED.']}
    />
  );
}
