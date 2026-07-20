import { Broadcast } from "@phosphor-icons/react/dist/ssr";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid size-8 place-items-center rounded-[10px] bg-[var(--text)] text-[var(--surface)]">
        <Broadcast size={18} weight="bold" />
      </span>
      {!compact && <span className="text-[15px] font-semibold tracking-[-0.02em]">Evee</span>}
    </div>
  );
}
