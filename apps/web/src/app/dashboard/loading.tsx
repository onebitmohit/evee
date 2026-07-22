export default function DashboardLoading() {
  return (
    <div className="grid gap-6" aria-busy="true" aria-label="Loading workspace">
      <div className="border-b pb-5">
        <div className="h-8 w-40 rounded-[8px] bg-[var(--surface-strong)]" />
        <div className="mt-3 h-5 w-full max-w-xl rounded-[6px] bg-[var(--surface-strong)]" />
      </div>
      <section className="grid overflow-hidden rounded-[10px] border bg-[var(--surface)] md:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="min-h-32 border-r px-4 py-4 last:border-r-0 max-md:border-b max-md:border-r-0">
            <div className="h-4 w-24 rounded-[5px] bg-[var(--surface-strong)]" />
            <div className="mt-7 h-9 w-16 rounded-[6px] bg-[var(--surface-strong)]" />
          </div>
        ))}
      </section>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.65fr)]">
        <div className="h-72 rounded-[10px] border bg-[var(--surface)]" />
        <div className="h-72 rounded-[10px] border bg-[var(--surface)]" />
      </div>
    </div>
  );
}
