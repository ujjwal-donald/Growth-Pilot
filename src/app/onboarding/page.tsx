import { OnboardingWizard } from "@/components/onboarding/onboarding-wizard";
import { requireUser } from "@/server/auth-context";

export default async function OnboardingPage() {
  await requireUser();
  return (
    <div className="min-h-screen bg-[#F8FAFC] px-4 py-12">
      <OnboardingWizard />
    </div>
  );
}
