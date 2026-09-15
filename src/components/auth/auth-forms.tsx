"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { loginAction, signupAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Welcome back</h1>
      <p className="mt-1 text-sm text-muted-foreground">Log in to your UPDON workspace.</p>
      <form
        className="mt-8 space-y-4"
        action={async (formData) => {
          setPending(true);
          setError(null);
          const result = await loginAction(formData);
          if (result?.error) setError(result.error);
          setPending(false);
        }}
      >
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
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Signing in…" : "Log in"}
        </Button>
      </form>
      {googleEnabled ? (
        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full"
          onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
        >
          Continue with Google
        </Button>
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

export function SignupForm({ googleEnabled }: { googleEnabled: boolean }) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Start free</h1>
      <p className="mt-1 text-sm text-muted-foreground">Create your UPDON AI Marketing workspace.</p>
      <form
        className="mt-8 space-y-4"
        action={async (formData) => {
          setPending(true);
          setError(null);
          const result = await signupAction(formData);
          if (result?.error) setError(result.error);
          setPending(false);
        }}
      >
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
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? "Creating account…" : "Create account"}
        </Button>
      </form>
      {googleEnabled ? (
        <Button
          type="button"
          variant="outline"
          className="mt-4 w-full"
          onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
        >
          Continue with Google
        </Button>
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
