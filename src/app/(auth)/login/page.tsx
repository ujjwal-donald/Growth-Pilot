import { LoginForm } from "@/components/auth/auth-forms";
import { isGoogleAuthEnabled } from "@/lib/env";

export default function LoginPage() {
  return <LoginForm googleEnabled={isGoogleAuthEnabled()} />;
}
