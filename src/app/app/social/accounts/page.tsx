import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Social accounts"
      description="Connect Instagram, Facebook, LinkedIn, X, YouTube, and Google Business."
      bullets={['Tokens are encrypted at rest and never sent to the browser.', 'Adapters are ready; OAuth connect lands in Phase 2.']}
    />
  );
}
