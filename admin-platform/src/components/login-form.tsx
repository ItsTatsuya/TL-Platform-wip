"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ApiError, authApi } from "@/lib/curriculum/api";

export function LoginForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useSearchParams();

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      await authApi.login(String(data.get("email")), String(data.get("password")));
      router.replace(params.get("next") || "/courses");
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Unable to reach the platform.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f3f5f1] lg:grid-cols-[.9fr_1.1fr]">
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <p className="mb-12 flex items-center gap-3 text-lg font-semibold"><span className="grid size-9 place-items-center rounded-lg bg-emerald-800 text-white">T</span>Tella Admin</p>
          <p className="text-xs font-semibold uppercase tracking-[.18em] text-emerald-700">Curriculum workspace</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-.04em]">Welcome back.</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Sign in with your Tella administrator account.</p>
          <form className="mt-9 space-y-5" onSubmit={submit}>
            <div className="space-y-2"><Label htmlFor="email">Email address</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div>
            <div className="space-y-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" autoComplete="current-password" required /></div>
            {error && <Alert variant="destructive" role="alert"><AlertDescription>{error}</AlertDescription></Alert>}
            <Button type="submit" className="w-full bg-emerald-800 hover:bg-emerald-900" disabled={busy}>{busy ? "Signing in…" : "Sign in"}<ArrowRight /></Button>
          </form>
        </div>
      </section>
      <aside className="relative hidden overflow-hidden bg-[#163c2c] p-14 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute -right-28 top-24 size-96 rounded-full border border-white/10" />
        <LockKeyhole className="size-7 text-emerald-300" />
        <div><p className="max-w-md text-4xl font-medium leading-tight tracking-[-.04em]">Build learning that stays clear at every level.</p><p className="mt-5 max-w-sm text-sm leading-6 text-emerald-100/70">Manage versions, chapters, activities, and publication from one focused workspace.</p></div>
        <p className="text-xs text-emerald-100/50">Tella Learning Platform · Internal administration</p>
      </aside>
    </main>
  );
}
