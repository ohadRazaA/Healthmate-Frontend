import { useApp } from "@/lib/app-context";
import { Languages } from "lucide-react";

export function LanguageToggle({ compact = false }) {
  const { lang, setLang } = useApp();
  const opt = (val, label) => (
    <button
      key={val}
      onClick={() => setLang(val)}
      aria-pressed={lang === val}
      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors ${
        lang === val
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
  return (
    <div
      role="group"
      aria-label="Language"
      className="inline-flex items-center gap-1 rounded-lg border bg-muted/60 p-1"
    >
      {!compact && <Languages className="ml-1 h-3.5 w-3.5 text-muted-foreground" aria-hidden />}
      {opt("en", "EN")}
      {opt("ur", "اردو")}
    </div>
  );
}
