import { useState, useEffect } from "react";

export function useThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem("ops-theme") as "dark" | "light") || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    localStorage.setItem("ops-theme", theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return { theme, toggle, isDark: theme === "dark" };
}
