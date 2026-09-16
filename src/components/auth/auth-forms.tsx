import Link from "next/link";
import { loginAction, signupAction } from "@/server/actions/auth";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const loginErrors: Record<string, string> = {
  invalid: "Invalid email or password.",
  missing: "Enter your email and password.",
  created: "Account created. Please log in.",
  CredentialsSignin: "Invalid email or password.",
};

const signupErrors: Record<string, string> = {
  invalid: "Please check your details and try again.",
  exists: "An account with this email already exists.",
};

export function LoginForm({
  googleEnabled,
  errorCode,
}: {
  googleEnabled: boolean;
  errorCode?: string;
}) {
  const error = errorCode ? (loginErrors[errorCode] ?? "Could not sign in.") : null;

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">Log in to your UPDON workspace.</p>
      <form action={loginAction} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forgot-password" className="text-xs text-indigo-600">
              Forgot password?
            </Link>
          </div>
          <Input id="password" name="password" type="password" required autoComplete="current-password" />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button type="submit" className={cn(buttonVariants(), "w-full")}>
          Log in
        </button>
      </form>
      {googleEnabled ? (
        <Link href="/api/auth/signin/google" className={cn(buttonVariants({ variant: "outline" }), "mt-4 w-full")}>
          Continue with Google
        </Link>
      ) : null}
      <p className="mt-6 text-sm text-muted-foreground">
        New to UPDON?{" "}
        <Link href="/signup" className="text-indigo-600">
          Create an account
        </Link>
      </p>
    </div>
  );
}

export function SignupForm({
  googleEnabled,
  errorCode,
}: {
  googleEnabled: boolean;
  errorCode?: string;
}) {
  const error = errorCode ? (signupErrors[errorCode] ?? "Could not create the account.") : null;

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Start free</h1>
      <p className="mt-1 text-sm text-muted-foreground">Create your UPDON AI Marketing workspace.</p>
      <form action={signupAction} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="companyName">Company name</Label>
          <Input id="companyName" name="companyName" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required minLength={8} />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <button type="submit" className={cn(buttonVariants(), "w-full")}>
          Create account
        </button>
      </form>
      {googleEnabled ? (
        <Link href="/api/auth/signin/google" className={cn(buttonVariants({ variant: "outline" }), "mt-4 w-full")}>
          Continue with Google
        </Link>
      ) : null}
      <p className="mt-6 text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-600">
          Log in
        </Link>
      </p>
    </div>
  );
}
