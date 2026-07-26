import { ArrowDown, ArrowUp, Minus } from "lucide-react";

// Keys match the Report model's abnormal[].severity enum exactly: normal | borderline | high | low
// Split into `tint` (translucent fill) + `border` + `text` so the fill can be layered on top of
// an opaque bg-card backing (see below) instead of applied directly to the chip's own background
// — otherwise the alpha blends with whatever happens to be visually behind the chip, which is a
// problem once the chip can overlap another chip on hover (see AbnormalChip below).
const styles = {
  high: {
    tint: "bg-destructive/15",
    text: "text-destructive dark:text-destructive-foreground",
    border: "border-destructive/30 dark:border-destructive/40",
  },
  low: {
    tint: "bg-warning/15",
    text: "text-warning dark:text-yellow-300",
    border: "border-warning/30 dark:border-warning/40",
  },
  borderline: {
    tint: "bg-warning/15",
    text: "text-warning dark:text-yellow-300",
    border: "border-warning/30 dark:border-warning/40",
  },
  normal: {
    tint: "bg-success/15",
    text: "text-success dark:text-emerald-300",
    border: "border-success/30 dark:border-success/40",
  },
};
const fallbackStyle = { tint: "bg-muted", text: "text-muted-foreground", border: "border-border" };

export function AbnormalChip({ v }) {
  const Icon = v.severity === "high" ? ArrowUp : v.severity === "low" ? ArrowDown : Minus;
  const style = styles[v.severity] ?? fallbackStyle;

  return (
    <div className="relative h-12">
      <div
        className={`group absolute inset-x-0 top-0 z-0 max-h-12 overflow-hidden rounded-xl border bg-card ${style.border} ${style.text} text-sm shadow-sm transition-all duration-300 ease-out hover:z-20 hover:max-h-64 hover:shadow-xl`}
      >
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          <div className={`h-full w-full ${style.tint}`} />
        </div>

        <div className="relative flex flex-row items-center justify-between gap-3 px-3 py-2 group-hover:flex-col group-hover:items-stretch">
          <div className="flex min-w-0 items-center gap-2 group-hover:items-start">
            <Icon className="h-3.5 w-3.5 shrink-0 group-hover:mt-0.5" aria-hidden />
            <span className="min-w-0 truncate font-medium group-hover:whitespace-normal group-hover:break-words">
              {v.name}
            </span>
          </div>
          <div className="text-right shrink-0 group-hover:mt-1.5 group-hover:self-end">
            <div className="whitespace-nowrap font-semibold tabular-nums">
              {v.value}
              {v.unit ? <span className="ml-0.5 text-xs opacity-70">{v.unit}</span> : null}
            </div>
            {v.normalRange ? <div className="whitespace-nowrap text-[10px] opacity-70">ref {v.normalRange}</div> : null}
          </div>
        </div>
      </div>
    </div>
  );
}