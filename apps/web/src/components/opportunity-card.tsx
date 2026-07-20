"use client";

import type { StoredOpportunity } from "@evee/platform/domain/types";
import { ArrowSquareOut, Check, Copy, ThumbsDown, ThumbsUp } from "@phosphor-icons/react";
import { useState } from "react";

export function OpportunityCard({ opportunity }: { opportunity: StoredOpportunity }) {
  const [status, setStatus] = useState(opportunity.status);
  const [copied, setCopied] = useState(false);

  async function feedback(value: "good" | "bad" | "replied") {
    const response = await fetch("/api/feedback", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ opportunityId: opportunity.id, value }) });
    if (!response.ok) return;
    setStatus(value === "good" ? "saved" : value === "bad" ? "dismissed" : "replied");
  }

  async function copyDraft() {
    await navigator.clipboard.writeText(opportunity.replyDraft);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_500);
  }

  return (
    <article className="rounded-[14px] border bg-[var(--surface)] p-5 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[10px] uppercase text-[var(--accent)]">{opportunity.candidate.source}</span><span className="text-[10px] text-[var(--text-faint)]">{new Date(opportunity.createdAt).toLocaleString()}</span><span className="rounded-[7px] bg-[var(--surface-subtle)] px-2 py-1 text-[9px] font-semibold uppercase text-[var(--text-muted)]">{status}</span></div><h2 className="mt-2 text-base font-semibold tracking-[-0.02em]">{opportunity.candidate.title}</h2>{opportunity.candidate.author && <p className="mt-1 text-xs text-[var(--text-faint)]">By {opportunity.candidate.author}</p>}</div>
        <div className="flex items-end gap-1"><span className="font-mono text-3xl font-semibold tracking-[-0.06em] text-[var(--accent)]">{opportunity.score}</span><span className="mb-1 text-[10px] text-[var(--text-faint)]">/100</span></div>
      </div>
      <p className="mt-5 text-sm leading-6 text-[var(--text-muted)]">{opportunity.reason}</p>
      {opportunity.signals.length > 0 && <div className="mt-4 flex flex-wrap gap-2">{opportunity.signals.map((signal) => <span key={signal} className="rounded-[8px] border bg-[var(--background)] px-2.5 py-1.5 text-[10px] text-[var(--text-muted)]">{signal}</span>)}</div>}
      <div className="mt-5 rounded-[11px] bg-[var(--surface-subtle)] p-4"><div className="flex items-center justify-between gap-3"><p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--text-faint)]">Reply draft</p><button onClick={copyDraft} className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--accent)]">{copied ? <Check size={13} /> : <Copy size={13} />}{copied ? "Copied" : "Copy"}</button></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6">{opportunity.replyDraft || "No reply was drafted because the opportunity did not pass the safety threshold."}</p></div>
      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button onClick={() => feedback("good")} className="flex h-8 items-center gap-1.5 rounded-[8px] border px-2.5 text-[10px] font-semibold hover:bg-[var(--surface-subtle)]"><ThumbsUp size={13} />Useful</button>
        <button onClick={() => feedback("bad")} className="flex h-8 items-center gap-1.5 rounded-[8px] border px-2.5 text-[10px] font-semibold hover:bg-[var(--surface-subtle)]"><ThumbsDown size={13} />Not a fit</button>
        <button onClick={() => feedback("replied")} className="flex h-8 items-center gap-1.5 rounded-[8px] border px-2.5 text-[10px] font-semibold hover:bg-[var(--surface-subtle)]"><Check size={13} />Mark replied</button>
        <a href={opportunity.candidate.url} target="_blank" rel="noreferrer" className="ml-auto flex h-8 items-center gap-1.5 text-[10px] font-semibold text-[var(--accent)] hover:underline">Open conversation <ArrowSquareOut size={13} /></a>
      </div>
    </article>
  );
}
