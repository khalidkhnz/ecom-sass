"use client";

import React from "react";
import { useThemeContext, THEMES } from "@/lib/theme-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";

export function CssThemeToggle() {
  const { currentTheme, setTheme } = useThemeContext();

  // Find the current theme name to display
  const getCurrentThemeName = () => {
    const theme = THEMES.find((t) => t.file === currentTheme);
    return theme ? theme.name : "Default";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          title={`Current theme: ${getCurrentThemeName()}`}
        >
          <Palette className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">Toggle CSS Theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {THEMES.map((theme) => (
          <DropdownMenuItem
            key={theme.file}
            onClick={() => setTheme(theme.file)}
            className={currentTheme === theme.file ? "bg-accent" : ""}
          >
            {theme.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
