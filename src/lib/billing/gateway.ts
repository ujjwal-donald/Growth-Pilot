export type BillingGatewayId = "stripe" | "razorpay";

export interface BillingGateway {
  id: BillingGatewayId;
  label: string;
  isConfigured(): boolean;
  checkoutMessage(planName: string): string;
}

class StripeGateway implements BillingGateway {
  id = "stripe" as const;
  label = "Stripe";
  isConfigured() {
    return Boolean(process.env.STRIPE_SECRET_KEY);
  }
  checkoutMessage(planName: string) {
    return this.isConfigured()
      ? `Stripe is configured. Hosted checkout for ${planName} can be enabled once price IDs are set.`
      : "Stripe is in the architecture. Checkout stays off until STRIPE_SECRET_KEY is provided.";
  }
}

class RazorpayGateway implements BillingGateway {
  id = "razorpay" as const;
  label = "Razorpay";
  isConfigured() {
    return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);
  }
  checkoutMessage(planName: string) {
    return this.isConfigured()
      ? `Razorpay is configured. ${planName} subscriptions can be created once plan IDs are mapped.`
      : "Razorpay is in the architecture for INR billing. Checkout stays off until Razorpay keys are provided.";
  }
}

export function getBillingGateways(): BillingGateway[] {
  return [new RazorpayGateway(), new StripeGateway()];
}
