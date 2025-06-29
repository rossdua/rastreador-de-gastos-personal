import { useThemeToggle } from "@/hooks/use-theme-toggle";

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useThemeToggle();

  if (!mounted) {
    return <div className="h-10 w-10 rounded-lg bg-muted animate-pulse"></div>;
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-background border border-border hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
      aria-label={
        theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
      }
    >
      {theme === "dark" ? (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
