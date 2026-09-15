import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Ad analytics"
      description="Spend, clicks, conversions, and ROAS filters: 7 / 30 / 90 / custom."
      bullets={['Needs ad-network webhooks.']}
    />
  );
}
