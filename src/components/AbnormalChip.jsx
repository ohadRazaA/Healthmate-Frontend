import { ArrowDown, ArrowUp, Minus } from "lucide-react";

// Keys match the Report model's abnormal[].severity enum exactly: normal | borderline | high | low
const styles = {
  high: "bg-destructive/15 text-destructive dark:text-destructive-foreground border-destructive/30 dark:border-destructive/40",
  low: "bg-warning/15 text-warning dark:text-yellow-300 border-warning/30 dark:border-warning/40",
  borderline: "bg-warning/15 text-warning dark:text-yellow-300 border-warning/30 dark:border-warning/40",
  normal: "bg-success/15 text-success dark:text-emerald-300 border-success/30 dark:border-success/40",
};
const fallbackStyle = "bg-muted text-muted-foreground border-border";

export function AbnormalChip({ v }) {
  const Icon = v.severity === "high" ? ArrowUp : v.severity === "low" ? ArrowDown : Minus;
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-xl border px-3 py-2 text-sm ${
        styles[v.severity] ?? fallbackStyle
      }`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
        <span className="font-medium truncate">{v.name}</span>
      </div>
      <div className="text-right shrink-0">
        <div className="font-semibold tabular-nums">
          {v.value}
          {v.unit ? <span className="ml-0.5 text-xs opacity-70">{v.unit}</span> : null}
        </div>
        {v.normalRange ? <div className="text-[10px] opacity-70">ref {v.normalRange}</div> : null}
      </div>
    </div>
  );
}