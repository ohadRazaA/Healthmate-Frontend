import { CheckCircle2, Clock, AlertCircle, Upload, XCircle } from "lucide-react";

const map = {
  uploaded: {
    label: "Uploaded",
    Icon: Upload,
    cls: "bg-muted text-muted-foreground border-border",
  },
  processing: {
    label: "Processing",
    Icon: Clock,
    cls: "bg-primary/15 text-primary border-primary/30",
  },
  analyzed: {
    label: "Analyzed",
    Icon: CheckCircle2,
    cls: "bg-success/15 text-success border-success/30",
  },
  review: {
    label: "Needs review",
    Icon: AlertCircle,
    cls: "bg-warning/15 text-warning-foreground border-warning/30",
  },
  failed: {
    label: "Failed",
    Icon: XCircle,
    cls: "bg-destructive/15 text-destructive border-destructive/30",
  },
};

// Fallback for any status the backend sends that isn't one of the above, so an
// unexpected value degrades gracefully instead of crashing the page.
const fallback = {
  label: "Unknown",
  Icon: AlertCircle,
  cls: "bg-muted text-muted-foreground border-border",
};

export function StatusBadge({ status }) {
  const { label, Icon, cls } = map[status] ?? fallback;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${cls}`}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {label}
    </span>
  );
}