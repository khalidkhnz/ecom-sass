"use client";

import Loader from "@/components/loader";
import React, { createContext, useContext, useState, useEffect } from "react";

// Available themes
export const THEMES = [
  { name: "Retro", file: "globals_retro.css" },
  { name: "Ghibli", file: "globals_ghibli.css" },
  { name: "Roundy Pink", file: "globals_pink.css" },
  { name: "Orange", file: "globals_sharpe_orange.css" },
  { name: "Violet", file: "globals_roundy_violet.css" },
  { name: "Neon", file: "globals_neon.css" },
  { name: "Pastel", file: "globals_pastel.css" },
  { name: "Midnight", file: "globals_midnight.css" },
  { name: "Forest", file: "globals_forest.css" },
  { name: "Ocean", file: "globals_ocean.css" },
  { name: "Desert", file: "globals_desert.css" },
  { name: "Cyberpunk", file: "globals_cyberpunk.css" },
  { name: "Monochrome", file: "globals_monochrome.css" },
  { name: "Sunset", file: "globals_sunset.css" },
  { name: "Mint", file: "globals_mint.css" },
  { name: "Lavender", file: "globals_lavender.css" },
  { name: "Cosmic", file: "globals_cosmic.css" },
];

type ThemeContextType = {
  currentTheme: string;
  setTheme: (theme: string) => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isThemeLoading, setIsThemeLoading] = useState(false);
  const [currentTheme, setCurrentTheme] = useState("globals_retro.css");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Load theme from localStorage on initial render
    const savedTheme = localStorage.getItem("cssTheme") || "globals_retro.css";
    setCurrentTheme(savedTheme);
    loadTheme(savedTheme);
  }, []);

  // Function to load a theme CSS file
  const loadTheme = (themeName: string) => {
    if (!isClient) return;

    setIsThemeLoading(true);
    // Create a link element for the CSS
    let link = document.getElementById("css-theme") as HTMLLinkElement;

    // If the link doesn't exist, create it
    if (!link) {
      link = document.createElement("link");
      link.id = "css-theme";
      link.rel = "stylesheet";
      document.head.appendChild(link);
    }

    // Set the href to the theme CSS file
    link.href = `/${themeName}`;
    setIsThemeLoading(false);
  };

  // Function to change theme
  const setTheme = (theme: string) => {
    if (!isClient) return;

    // Save to localStorage
    localStorage.setItem("cssTheme", theme);
    setCurrentTheme(theme);

    // Load the theme
    loadTheme(theme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme }}>
      {isThemeLoading ? <Loader /> : children}
      {isClient && (
        <link id="css-theme" rel="stylesheet" href={`/${currentTheme}`} />
      )}
    </ThemeContext.Provider>
  );
}

// Hook to use the theme context
export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error(
      "useThemeContext must be used within a ThemeContextProvider"
    );
  }
  return context;
}
