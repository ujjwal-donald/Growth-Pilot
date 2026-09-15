import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Hashtag generator"
      description="Cluster hashtags by reach and relevance for each platform."
      bullets={['Hashtags are returned with every AI post.', 'Phase 3 will add trend providers.']}
    />
  );
}
