import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="SEO dashboard"
      description="Score, issues, tracked keywords, and content opportunities."
      bullets={['Audits and keyword providers are abstracted for DataForSEO, Semrush, and Ahrefs.']}
    />
  );
}
