"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Sun, Moon, Monitor } from "lucide-react";

const THEMES = ["system", "light", "dark"] as const;

const ICONS = {
  system: Monitor,
  light: Sun,
  dark: Moon,
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="size-7" />;
  }

  const current = (theme ?? "system") as (typeof THEMES)[number];
  const Icon = ICONS[current];
  const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];

  return (
    <button
      onClick={() => setTheme(next)}
      className="flex items-center justify-center size-7 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
      title={`Theme: ${current}`}
    >
      <Icon className="size-3.5" />
    </button>
  );
}
