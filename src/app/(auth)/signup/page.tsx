import { SignupForm } from "@/components/auth/auth-forms";
import { isGoogleAuthEnabled } from "@/lib/env";
import { redirectIfAuthenticated } from "@/server/auth-context";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await redirectIfAuthenticated();
  const { error } = await searchParams;
  return <SignupForm googleEnabled={isGoogleAuthEnabled()} errorCode={error} />;
}
