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
    <form onSubmit={submit} className="mt-7 grid gap-4">
      {mode === "sign-up" && (
        <label className="grid gap-1.5 text-[10px] font-semibold">
          Name
          <input name="name" required autoComplete="name" className="h-10 rounded-[8px] border bg-[var(--surface)] px-3 text-xs font-normal placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]" placeholder="Your name" />
        </label>
      )}
      <label className="grid gap-1.5 text-[10px] font-semibold">
        Work email
        <input name="email" type="email" required autoComplete="email" className="h-10 rounded-[8px] border bg-[var(--surface)] px-3 text-xs font-normal placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]" placeholder="you@company.com" />
      </label>
      <label className="grid gap-1.5 text-[10px] font-semibold">
        Password
        <input name="password" type="password" minLength={8} required autoComplete={mode === "sign-in" ? "current-password" : "new-password"} className="h-10 rounded-[8px] border bg-[var(--surface)] px-3 text-xs font-normal placeholder:text-[var(--text-faint)] focus:border-[var(--accent)]" placeholder="At least 8 characters" />
      </label>
      {error && <p role="alert" className="rounded-[8px] border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] px-3 py-2.5 text-xs text-[var(--danger)]">{error}</p>}
      <button disabled={pending} className="flex h-10 items-center justify-center gap-2 rounded-[8px] bg-[var(--accent)] px-4 text-xs font-semibold text-[var(--accent-foreground)] transition hover:bg-[var(--accent-hover)] active:translate-y-px disabled:cursor-not-allowed disabled:opacity-60">
        {pending ? <CircleNotch className="animate-spin" size={17} /> : <>{mode === "sign-in" ? "Sign in" : "Create workspace"}<ArrowRight size={16} /></>}
      </button>
      <p className="text-center text-[11px] text-[var(--text-muted)]">
        {mode === "sign-in" ? "New to Evee?" : "Already have an account?"}{" "}
        <Link className="font-medium text-[var(--text)] underline decoration-[var(--border-strong)] underline-offset-4 hover:decoration-[var(--text)]" href={mode === "sign-in" ? "/sign-up" : "/sign-in"}>
          {mode === "sign-in" ? "Create a workspace" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
