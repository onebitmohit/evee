"use client";

import { ArrowUp, CircleNotch, Robot, Stop } from "@phosphor-icons/react";
import { useEveAgent } from "eve/react";
import { useState } from "react";

const prompts = [
  "Build a Reddit monitor for teams looking to replace manual lead research",
  "Which recent opportunities have the clearest buying intent?",
  "How should we improve our reply style based on feedback?",
];

export function AgentChat() {
  const [draft, setDraft] = useState("");
  const agent = useEveAgent({ prepareSend: (input) => ({ ...input, clientContext: { route: "/dashboard/agents", surface: "gtm-copilot" } }) });
  const busy = agent.status === "submitted" || agent.status === "streaming";

  function send(message = draft) {
    const text = message.trim();
    if (!text || busy) return;
    setDraft("");
    void agent.send({ message: text });
  }

  return (
    <section className="flex min-h-[620px] flex-col overflow-hidden rounded-[14px] border bg-[var(--surface)]">
      <div className="flex items-center gap-3 border-b px-5 py-4"><span className="grid size-9 place-items-center rounded-[10px] bg-[var(--accent-soft)] text-[var(--accent)]"><Robot size={19} weight="fill" /></span><div><h2 className="text-sm font-semibold">GTM Copilot</h2><p className="text-[10px] text-[var(--text-faint)]">Durable workspace agent powered by Eve</p></div></div>
      <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6">
        {agent.data.messages.length === 0 ? (
          <div className="mx-auto flex h-full max-w-xl flex-col justify-center py-12"><h3 className="text-xl font-semibold tracking-[-0.03em]">What should we investigate?</h3><p className="mt-2 text-sm leading-6 text-[var(--text-muted)]">Ask about demand, monitor strategy, opportunity evidence, or reply positioning. The copilot uses your saved workspace context.</p><div className="mt-6 grid gap-2">{prompts.map((prompt) => <button key={prompt} onClick={() => send(prompt)} className="rounded-[10px] border bg-[var(--background)] px-3.5 py-3 text-left text-xs leading-5 text-[var(--text-muted)] transition hover:border-[var(--border-strong)] hover:text-[var(--text)]">{prompt}</button>)}</div></div>
        ) : (
          <div className="mx-auto grid max-w-2xl gap-5">{agent.data.messages.map((message) => (
            <div key={message.id} className={message.role === "user" ? "ml-auto max-w-[82%] rounded-[12px] bg-[var(--accent)] px-4 py-3 text-sm leading-6 text-[var(--accent-foreground)]" : "max-w-[92%] text-sm leading-7 text-[var(--text)]"}>
              {message.parts.map((part, index) => part.type === "text" ? <p className="whitespace-pre-wrap" key={index}>{part.text}</p> : null)}
            </div>
          ))}{busy && <div className="flex items-center gap-2 text-xs text-[var(--text-faint)]"><CircleNotch className="animate-spin" size={14} />Researching your workspace...</div>}</div>
        )}
      </div>
      {agent.error && <p className="mx-4 mb-2 rounded-[9px] bg-[color-mix(in_srgb,var(--danger)_8%,transparent)] px-3 py-2 text-xs text-[var(--danger)] sm:mx-6">{agent.error.message}</p>}
      <div className="border-t p-3 sm:p-4"><div className="mx-auto flex max-w-2xl items-end gap-2 rounded-[12px] border bg-[var(--background)] p-2 focus-within:border-[var(--accent)]"><textarea value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); send(); } }} rows={2} className="max-h-36 min-h-11 flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-[var(--text-faint)]" placeholder="Ask about your GTM signals..." />{busy ? <button onClick={agent.stop} aria-label="Stop streaming" className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-[var(--surface-strong)]"><Stop size={14} weight="fill" /></button> : <button onClick={() => send()} disabled={!draft.trim()} aria-label="Send message" className="grid size-9 shrink-0 place-items-center rounded-[9px] bg-[var(--accent)] text-[var(--accent-foreground)] disabled:opacity-40"><ArrowUp size={16} weight="bold" /></button>}</div></div>
    </section>
  );
}
