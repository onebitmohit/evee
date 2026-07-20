"use client";

import {
  ChartLineUp, CirclesThreePlus, CreditCard, Crosshair, GearSix, House, IdentificationCard,
  PlugsConnected, Robot, SignOut, SlidersHorizontal, Sparkle, Target, X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";

const navigation = [
  { href: "/dashboard", label: "Overview", icon: House, exact: true },
  { href: "/dashboard/opportunities", label: "Opportunities", icon: Target },
  { href: "/dashboard/monitors", label: "Monitors", icon: Crosshair },
  { href: "/dashboard/business", label: "Business profile", icon: IdentificationCard },
  { href: "/dashboard/agents", label: "AI agents", icon: Robot },
  { href: "/dashboard/integrations", label: "Integrations", icon: PlugsConnected },
  { href: "/dashboard/analytics", label: "Analytics", icon: ChartLineUp },
];

const secondary = [
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: GearSix },
];

export function AppShell({ children, workspaceName, userName, userEmail }: {
  children: React.ReactNode;
  workspaceName: string;
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = userName.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();

  const items = (links: typeof navigation) => links.map((item) => {
    const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
    return (
      <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`group flex h-9 items-center gap-3 rounded-[9px] px-2.5 text-[13px] font-medium transition ${active ? "bg-[var(--surface-strong)] text-[var(--text)]" : "text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text)]"}`}>
        <item.icon size={17} weight={active ? "fill" : "regular"} className={active ? "text-[var(--accent)]" : ""} />
        {item.label}
      </Link>
    );
  });

  const sidebar = (
    <aside className="flex h-full w-[248px] shrink-0 flex-col border-r bg-[var(--surface)] px-3 py-3.5">
      <div className="flex h-10 items-center justify-between px-1.5"><Brand /><button className="lg:hidden" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={18} /></button></div>
      <button className="mt-4 flex h-10 items-center gap-2.5 rounded-[10px] border bg-[var(--background)] px-2.5 text-left transition hover:border-[var(--border-strong)] active:translate-y-px">
        <span className="grid size-6 place-items-center rounded-[7px] bg-[var(--accent-soft)] text-xs font-semibold text-[var(--accent)]">{workspaceName[0]?.toUpperCase()}</span>
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{workspaceName}</span>
        <SlidersHorizontal size={15} className="text-[var(--text-faint)]" />
      </button>
      <nav className="mt-5 grid gap-1">{items(navigation)}</nav>
      <div className="mt-auto">
        <Link href="/dashboard/agents" className="mb-3 block rounded-[12px] border bg-[var(--accent-soft)] p-3 transition hover:border-[var(--accent)]">
          <div className="flex items-center gap-2 text-xs font-semibold text-[var(--accent)]"><Sparkle size={15} weight="fill" />Ask GTM Copilot</div>
          <p className="mt-1.5 text-[11px] leading-4 text-[var(--text-muted)]">Build a monitor or research an opportunity.</p>
        </Link>
        <nav className="grid gap-1">{items(secondary)}</nav>
        <div className="mt-3 flex items-center gap-2 border-t pt-3">
          <span className="grid size-8 shrink-0 place-items-center rounded-[9px] bg-[var(--surface-strong)] text-[11px] font-semibold">{initials}</span>
          <div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{userName}</p><p className="truncate text-[10px] text-[var(--text-faint)]">{userEmail}</p></div>
          <button aria-label="Sign out" onClick={async () => { await authClient.signOut(); router.push("/sign-in"); router.refresh(); }} className="grid size-8 place-items-center rounded-[9px] text-[var(--text-faint)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text)]"><SignOut size={16} /></button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-[100dvh] bg-[var(--background)]">
      <div className="hidden lg:block lg:fixed lg:inset-y-0 lg:left-0">{sidebar}</div>
      {mobileOpen && <div className="fixed inset-0 z-30 bg-[rgb(5_5_6/0.72)] lg:hidden" onClick={() => setMobileOpen(false)}><div className="h-full w-[248px]" onClick={(event) => event.stopPropagation()}>{sidebar}</div></div>}
      <div className="min-w-0 flex-1 lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b bg-[color-mix(in_srgb,var(--background)_88%,transparent)] px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <button onClick={() => setMobileOpen(true)} className="grid size-8 place-items-center rounded-[9px] border bg-[var(--surface)] lg:hidden" aria-label="Open navigation"><CirclesThreePlus size={17} /></button>
          <p className="hidden text-xs text-[var(--text-faint)] sm:block">Workspace synced across web and Telegram</p>
          <ThemeToggle />
        </header>
        <main className="mx-auto w-full max-w-[1480px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
