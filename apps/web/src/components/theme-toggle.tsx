"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return (
    <button
      type="button"
      aria-label="Toggle color theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="grid size-8 place-items-center rounded-[7px] text-[var(--text-muted)] transition hover:bg-[var(--surface-strong)] hover:text-[var(--text)] active:scale-[0.97]"
    >
      {mounted && resolvedTheme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
    </button>
  );
}
