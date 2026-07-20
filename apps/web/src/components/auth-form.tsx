"use client";

import { ArrowRight, CircleNotch } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setPending(true);
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "");
    const password = String(data.get("password") ?? "");
    const result = mode === "sign-up"
      ? await authClient.signUp.email({ email, password, name: String(data.get("name") ?? "") })
      : await authClient.signIn.email({ email, password });
    setPending(false);
    if (result.error) {
      setError(result.error.message ?? "Could not continue. Check your details and try again.");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-5">
      {mode === "sign-up" && (
        <label className="grid gap-2 text-sm font-medium">
          Name
          <input name="name" required autoComplete="name" className="h-11 rounded-[10px] border bg-[var(--surface)] px-3.5 text-sm font-normal placeholder:text-[var(--text-faint)] focus:border-[var(--accent)] focus:outline-2 focus:outline-offset-2" placeholder="Your name" />
        </label>
      )}
      <label className="grid gap-2 text-sm font-medium">
        Work email
        <input name="email" type="email" required autoComplete="email" className="h-11 rounded-[10px] border bg-[var(--surface)] px-3.5 text-sm font-normal placeholder:text-[var(--text-faint)] focus:border-[var(--accent)] focus:outline-2 focus:outline-offset-2" placeholder="you@company.com" />
      </label>
      <label className="grid gap-2 text-sm font-medium">
        Password
        <input name="password" type="password" minLength={8} required autoComplete={mode === "sign-in" ? "current-password" : "new-password"} className="h-11 rounded-[10px] border bg-[var(--surface)] px-3.5 text-sm font-normal placeholder:text-[var(--text-faint)] focus:border-[var(--accent)] focus:outline-2 focus:outline-offset-2" placeholder="At least 8 characters" />
      </label>
      {error && <p role="alert" className="rounded-[10px] border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] px-3.5 py-3 text-sm text-[var(--danger)]">{error}</p>}
      <button disabled={pending} className="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[var(--accent)] px-4 text-sm font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? <CircleNotch className="animate-spin" size={17} /> : <>{mode === "sign-in" ? "Sign in" : "Create workspace"}<ArrowRight size={16} /></>}
      </button>
      <p className="text-center text-sm text-[var(--text-muted)]">
        {mode === "sign-in" ? "New to Evee?" : "Already have an account?"}{" "}
        <Link className="font-medium text-[var(--text)] underline decoration-[var(--border-strong)] underline-offset-4 hover:decoration-[var(--text)]" href={mode === "sign-in" ? "/sign-up" : "/sign-in"}>
          {mode === "sign-in" ? "Create a workspace" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
