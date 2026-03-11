"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();

  // Cycle: light → dark → system (auto)
  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      aria-label="Alternar tema"
      title={theme === "system" ? "Tema: Automático" : theme === "dark" ? "Tema: Escuro" : "Tema: Claro"}
    >
      <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      {theme === "system" && (
        <Monitor className="absolute h-5 w-5 text-primary" />
      )}
      <span className="sr-only">Alternar tema</span>
    </Button>
  );
}
