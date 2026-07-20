export function PageHeader({ title, description, actions }: { title: string; description: string; actions?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div><h1 className="text-2xl font-semibold tracking-[-0.035em]">{title}</h1><p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--text-muted)]">{description}</p></div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}
