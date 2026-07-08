import { AlertTriangle } from "lucide-react";
import { useApp } from "@/lib/app-context";

export function DisclaimerBanner({ subtle = false }) {
  const { t } = useApp();
  return (
    <div
      role="note"
      className={`flex items-start gap-3 rounded-xl border p-3 text-sm ${
        subtle
          ? "bg-muted/50 text-muted-foreground border-border"
          : "bg-warning/10 text-foreground border-warning/30 dark:border-warning/20"
      }`}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden />
      <p className="leading-relaxed text-inherit">{t("disclaimer.short")}</p>
    </div>
  );
}
