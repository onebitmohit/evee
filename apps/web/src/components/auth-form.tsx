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
    <form onSubmit={submit} className="auth-form">
      {mode === "sign-up" ? (
        <label className="auth-field">
          <span>Name</span>
          <input name="name" required autoComplete="name" placeholder="Your name" />
        </label>
      ) : null}
      <label className="auth-field">
        <span>Work email</span>
        <input name="email" type="email" required autoComplete="email" placeholder="you@company.com" />
      </label>
      <label className="auth-field">
        <span>Password</span>
        <input name="password" type="password" minLength={8} required autoComplete={mode === "sign-in" ? "current-password" : "new-password"} placeholder="At least 8 characters" />
      </label>
      {error ? <p role="alert" className="auth-form-error">{error}</p> : null}
      <div className="auth-form-actions">
        <p>Protected by your workspace credentials.</p>
        <button disabled={pending} className="auth-submit-button">
          {pending ? <CircleNotch className="animate-spin" size={20} /> : <><span>{mode === "sign-in" ? "Sign in" : "Create"}</span><ArrowRight size={19} /></>}
        </button>
      </div>
      <p className="auth-form-switch">
        {mode === "sign-in" ? "New to Evee?" : "Already have an account?"}{" "}
        <Link href={mode === "sign-in" ? "/sign-up" : "/sign-in"}>
          {mode === "sign-in" ? "Create a workspace" : "Sign in"}
        </Link>
      </p>
    </form>
  );
}
