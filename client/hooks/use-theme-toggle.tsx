import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return { theme: "light", toggleTheme: () => {}, mounted: false };
  }

  return { theme, toggleTheme, mounted };
}
