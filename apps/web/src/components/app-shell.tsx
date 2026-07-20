"use client";

import {
  CaretRight, ChartLineUp, CirclesThreePlus, CreditCard, Crosshair, GearSix, House,
  IdentificationCard, PlugsConnected, Robot, SignOut, Target, X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Brand } from "@/components/brand";
import { ThemeToggle } from "@/components/theme-toggle";
import { authClient } from "@/lib/auth-client";

type NavItem = { href: string; label: string; icon: typeof House; exact?: boolean };

const sections: Array<{ label: string; links: NavItem[] }> = [
  {
    label: "Workspace",
    links: [
      { href: "/dashboard", label: "Overview", icon: House, exact: true },
      { href: "/dashboard/opportunities", label: "Opportunities", icon: Target },
      { href: "/dashboard/monitors", label: "Monitors", icon: Crosshair },
    ],
  },
  {
    label: "Intelligence",
    links: [
      { href: "/dashboard/business", label: "Business profile", icon: IdentificationCard },
      { href: "/dashboard/agents", label: "AI agents", icon: Robot },
      { href: "/dashboard/analytics", label: "Analytics", icon: ChartLineUp },
    ],
  },
  {
    label: "System",
    links: [
      { href: "/dashboard/integrations", label: "Integrations", icon: PlugsConnected },
      { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
      { href: "/dashboard/settings", label: "Settings", icon: GearSix },
    ],
  },
];

const allLinks = sections.flatMap((section) => section.links);

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
  const current = allLinks.find((item) => item.exact ? pathname === item.href : pathname.startsWith(item.href));

  const sidebar = (
    <aside className="flex h-full w-[228px] shrink-0 flex-col bg-[var(--background)] px-2.5 py-3">
      <div className="flex h-9 items-center justify-between px-1.5">
        <Brand />
        <button className="grid size-7 place-items-center rounded-[7px] text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] lg:hidden" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={16} /></button>
      </div>
      <div className="mt-3 flex h-9 items-center gap-2 rounded-[8px] border border-transparent px-2 hover:border-[var(--border)] hover:bg-[var(--surface)]">
        <span className="grid size-5 shrink-0 place-items-center rounded-[5px] bg-[var(--surface-strong)] text-[10px] font-semibold">{workspaceName[0]?.toUpperCase()}</span>
        <span className="min-w-0 flex-1 truncate text-xs font-medium">{workspaceName}</span>
      </div>
      <nav className="mt-4 grid gap-5">
        {sections.map((section) => (
          <div key={section.label}>
            <p className="px-2 pb-1.5 text-[10px] font-medium text-[var(--text-faint)]">{section.label}</p>
            <div className="grid gap-0.5">
              {section.links.map((item) => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                  <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)} className={`group flex h-8 items-center gap-2.5 rounded-[7px] px-2 text-xs font-medium transition-colors ${active ? "bg-[var(--surface-strong)] text-[var(--text)]" : "text-[var(--text-muted)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text)]"}`}>
                    <item.icon size={15} weight={active ? "fill" : "regular"} className={active ? "text-[var(--text)]" : "text-[var(--text-faint)] group-hover:text-[var(--text-muted)]"} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-auto">
        <Link href="/dashboard/agents" className="mb-2 flex items-center justify-between rounded-[8px] border border-transparent px-2 py-2 text-xs text-[var(--text-muted)] hover:border-[var(--border)] hover:bg-[var(--surface)] hover:text-[var(--text)]">
          <span>Ask GTM Copilot</span><CaretRight size={13} />
        </Link>
        <div className="flex items-center gap-2 border-t px-1 pt-3">
          <span className="grid size-7 shrink-0 place-items-center rounded-[7px] bg-[var(--surface-strong)] font-mono text-[10px] font-semibold">{initials}</span>
          <div className="min-w-0 flex-1"><p className="truncate text-[11px] font-medium">{userName}</p><p className="truncate text-[9px] text-[var(--text-faint)]">{userEmail}</p></div>
          <button aria-label="Sign out" onClick={async () => { await authClient.signOut(); router.push("/sign-in"); router.refresh(); }} className="grid size-7 place-items-center rounded-[7px] text-[var(--text-faint)] hover:bg-[var(--surface-subtle)] hover:text-[var(--text)]"><SignOut size={14} /></button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-[100dvh] bg-[var(--background)]">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
      {mobileOpen ? <div className="fixed inset-0 z-40 bg-black/75 lg:hidden" onClick={() => setMobileOpen(false)}><div className="h-full w-[228px]" onClick={(event) => event.stopPropagation()}>{sidebar}</div></div> : null}
      <div className="min-w-0 flex-1 lg:pl-[228px] lg:py-1.5 lg:pr-1.5">
        <div className="min-h-[100dvh] overflow-hidden bg-[var(--surface)] lg:min-h-[calc(100dvh-12px)] lg:rounded-[12px] lg:border">
          <header className="sticky top-0 z-20 flex h-12 items-center justify-between border-b bg-[color-mix(in_srgb,var(--surface)_90%,transparent)] px-4 backdrop-blur-xl sm:px-5">
            <div className="flex min-w-0 items-center gap-2">
              <button onClick={() => setMobileOpen(true)} className="grid size-7 shrink-0 place-items-center rounded-[7px] border bg-[var(--surface)] lg:hidden" aria-label="Open navigation"><CirclesThreePlus size={15} /></button>
              <span className="hidden truncate text-xs font-medium text-[var(--text-muted)] sm:block">{workspaceName}</span>
              <CaretRight size={12} className="hidden shrink-0 text-[var(--text-faint)] sm:block" />
              <span className="truncate text-xs font-medium">{current?.label ?? "Workspace"}</span>
            </div>
            <ThemeToggle />
          </header>
          <main className="mx-auto w-full max-w-[1540px] px-4 py-5 sm:px-5 lg:px-6 lg:py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
