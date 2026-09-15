import { ModulePage } from "@/components/layout/module-page";

export default function Page() {
  return (
    <ModulePage
      title="Analytics overview"
      description="Traffic, engagement, followers, reach, clicks, conversions, leads, ROI."
      bullets={['Filters: 7, 30, 90 days, custom.']}
    />
  );
}
