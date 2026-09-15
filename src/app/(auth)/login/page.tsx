import { LoginForm } from "@/components/auth/auth-forms";
import { isGoogleAuthEnabled } from "@/lib/env";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <LoginForm googleEnabled={isGoogleAuthEnabled()} errorCode={error} />;
}
