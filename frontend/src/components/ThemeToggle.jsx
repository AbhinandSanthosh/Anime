import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

const getTheme = () => {
  try {
    if (localStorage.getItem("theme") === "light") return "light";
  } catch {
    // storage can be blocked; fall through to the page's current setting
  }
  return document.documentElement.dataset.theme === "light" ? "light" : "dark";
};

export default function ThemeToggle({ className = "" }) {
  const [theme, setTheme] = useState(getTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // the toggle still works for this visit
    }
  }, [theme]);

  const isLight = theme === "light";

  return (
    <button
      type="button"
      onClick={() => setTheme(isLight ? "dark" : "light")}
      aria-label={isLight ? "Switch to dark mode" : "Switch to light mode"}
      title={isLight ? "Dark mode" : "Light mode"}
      className={`flex h-10 w-10 items-center justify-center rounded-full text-zinc-400 transition hover:bg-white/[0.06] hover:text-white ${className}`}
    >
      {isLight ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}