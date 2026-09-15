import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Website audit"
      description="Titles, meta, headings, broken links, alt text, canonicals, robots, sitemap, HTTPS."
      bullets={['Phase 3 crawler. Priorities: Critical, High, Medium, Low.']}
    />
  );
}
