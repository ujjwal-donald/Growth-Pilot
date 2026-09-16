import { PageHeader } from "@/components/layout/page-header";
import { PLANS, formatInr, getPlan } from "@/lib/billing/plans";
import { requireWorkspace } from "@/server/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getBillingGateways } from "@/lib/billing/gateway";

export default async function BillingPage() {
  const ctx = await requireWorkspace();
  const current = getPlan(ctx.subscription?.plan ?? "FREE");
  const gateways = getBillingGateways();

  return (
    <div>
      <PageHeader
        title="Billing"
        description="Razorpay (India) and Stripe (international) adapters are in the architecture. Payments stay disconnected until credentials are supplied."
      />
      <p className="mb-6 text-sm text-muted-foreground">
        Current plan: <strong>{current.name}</strong> · AI usage {ctx.subscription?.aiGenerationsUsed ?? 0}/
        {current.aiGenerationsPerMonth}. {gateways.map((g) => g.checkoutMessage(current.name)).join(" ")}
      </p>
      <div className="grid gap-4 md:grid-cols-4">
        {PLANS.map((plan) => (
          <Card key={plan.id} className={plan.id === current.id ? "ring-2 ring-indigo-500" : ""}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-heading text-2xl">
                {plan.monthlyPriceInr ? formatInr(plan.monthlyPriceInr) : "Free"}
              </p>
              <ul className="mt-3 space-y-1 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <span className={`${buttonVariants({ variant: "outline" })} mt-4`}>Checkout coming soon</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
