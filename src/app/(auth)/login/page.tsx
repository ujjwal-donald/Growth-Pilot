import { LoginForm } from "@/components/auth/auth-forms";
import { isGoogleAuthEnabled } from "@/lib/env";
import { redirectIfAuthenticated } from "@/server/auth-context";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await redirectIfAuthenticated();
  const { error } = await searchParams;
  return <LoginForm googleEnabled={isGoogleAuthEnabled()} errorCode={error} />;
}
