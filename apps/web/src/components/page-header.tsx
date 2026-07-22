export function PageHeader({ title, description, actions }: { title: string; description: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 border-b border-[color-mix(in_srgb,var(--border)_72%,transparent)] pb-5 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
      <div className="max-w-3xl">
        <h1 className="text-2xl font-semibold tracking-[-0.045em] sm:text-[28px]">{title}</h1>
        <p className="mt-2 max-w-2xl text-[13px] leading-5 text-[var(--text-muted)]">{description}</p>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  );
}
