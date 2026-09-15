import { SignupForm } from "@/components/auth/auth-forms";
import { isGoogleAuthEnabled } from "@/lib/env";

export default function SignupPage() {
  return <SignupForm googleEnabled={isGoogleAuthEnabled()} />;
}
