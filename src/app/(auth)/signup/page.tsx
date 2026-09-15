import { SignupForm } from "@/components/auth/auth-forms";
import { isGoogleAuthEnabled } from "@/lib/env";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <SignupForm googleEnabled={isGoogleAuthEnabled()} errorCode={error} />;
}
