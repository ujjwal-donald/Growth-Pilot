"use client";

import { useState } from "react";
import Link from "next/link";
import { requestPasswordResetAction } from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [message, setMessage] = useState<string | null>(null);
  const [devUrl, setDevUrl] = useState<string | null>(null);

  return (
    <div>
      <h1 className="font-heading text-2xl font-semibold">Reset password</h1>
      <p className="mt-1 text-sm text-muted-foreground">We will send a reset link if the account exists.</p>
      <form
        className="mt-8 space-y-4"
        action={async (formData) => {
          const result = await requestPasswordResetAction(formData);
          if ("error" in result && result.error) setMessage(result.error);
          else {
            setMessage("If that email exists, a reset link is ready.");
            if ("devResetUrl" in result) setDevUrl(result.devResetUrl ?? null);
          }
        }}
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <Button type="submit" className="w-full">Send reset link</Button>
      </form>
      {message ? <p className="mt-4 text-sm">{message}</p> : null}
      {devUrl ? (
        <p className="mt-2 break-all text-xs text-muted-foreground">
          Development link: <Link href={devUrl}>{devUrl}</Link>
        </p>
      ) : null}
      <Link href="/login" className="mt-6 inline-block text-sm text-indigo-600">
        Back to login
      </Link>
    </div>
  );
}
