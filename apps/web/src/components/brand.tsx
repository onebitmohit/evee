import Image from "next/image";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <Image
        alt={compact ? "Evee" : ""}
        className="size-8 shrink-0"
        height={32}
        priority
        src="/brand/evee-logo.png"
        width={32}
      />
      {!compact && <span className="text-[15px] font-semibold tracking-[-0.02em]">Evee</span>}
    </div>
  );
}
