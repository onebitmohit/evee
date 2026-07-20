"use client";

import { Check, Copy, TelegramLogo } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

type LinkState = { code: string; expiresAt: number } | null;

export function TelegramLink({ initiallyConnected, username }: { initiallyConnected: boolean; username?: string | null | undefined }) {
  const [connected, setConnected] = useState(initiallyConnected);
  const [link, setLink] = useState<LinkState>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!link || connected) return;
    const timer = window.setInterval(async () => {
      const response = await fetch("/api/telegram/link", { cache: "no-store" });
      if (response.ok && (await response.json()).connected) { setConnected(true); setLink(null); }
    }, 2_000);
    return () => window.clearInterval(timer);
  }, [link, connected]);

  async function createCode() {
    setError("");
    const response = await fetch("/api/telegram/link", { method: "POST" });
    const body = await response.json();
    if (!response.ok) { setError(body.error ?? "Could not create a link code."); return; }
    setLink(body);
  }

  if (connected) return <div className="flex items-center gap-3 rounded-[10px] bg-[color-mix(in_srgb,var(--success)_9%,transparent)] px-3.5 py-3 text-xs text-[var(--success)]"><Check size={16} weight="bold" />Connected{username ? ` as @${username}` : ""}. Alerts and actions are synced.</div>;

  return (
    <div className="grid gap-3">
      {!link ? <button onClick={createCode} className="flex h-9 items-center justify-center gap-2 rounded-[9px] bg-[var(--accent)] px-3 text-xs font-semibold text-[var(--accent-foreground)] hover:bg-[var(--accent-hover)]"><TelegramLogo size={15} weight="fill" />Generate link code</button> : <div className="rounded-[10px] bg-[var(--surface-subtle)] p-3.5"><p className="text-[10px] text-[var(--text-faint)]">Send this command to your Evee Telegram bot within 10 minutes:</p><div className="mt-2 flex items-center justify-between gap-2 rounded-[8px] border bg-[var(--surface)] px-3 py-2"><code className="font-mono text-sm font-semibold">/link {link.code}</code><button aria-label="Copy link command" onClick={async () => { await navigator.clipboard.writeText(`/link ${link.code}`); setCopied(true); }} className="text-[var(--accent)]">{copied ? <Check size={15} /> : <Copy size={15} />}</button></div><p className="mt-2 text-[10px] text-[var(--text-faint)]">The code is single-use. This page will update when Telegram confirms it.</p></div>}
      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}
