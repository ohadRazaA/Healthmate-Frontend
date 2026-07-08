import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { StatusBadge } from "@/components/StatusBadge";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/lib/app-context";
import { format, parseISO, isValid } from "date-fns";
import { useMemo, useState } from "react";
import { Activity, FileText, Filter as FilterIcon, Heart, ListOrdered } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useFetchData } from "../../hooks/useFetchData";
import apiEndPoints, { BASE_URL } from "../../constants/apiEndpoints";

// Parses a date value defensively — real records may not always have a valid/parseable
// date field. Returns null instead of throwing so one bad record can't crash the page.
function safeParseISO(value) {
  if (!value) return null;
  try {
    const d = typeof value === "string" ? parseISO(value) : new Date(value);
    return isValid(d) ? d : null;
  } catch {
    return null;
  }
}

export default function Timeline() {
  const { t } = useApp();
  const [filter, setFilter] = useState("all");
  const token = Cookies.get("token");

  // NOTE: /health/timeline is declared in apiEndpoints.js but not yet implemented on the
  // backend. Wired here instead of mock data. Expected shape: { data: { reports: [...], vitals: [...] } }
  const { data, isLoading, isError } = useFetchData(
    "timeline",
    `${BASE_URL}${apiEndPoints.getTimeline}`,
    {},
    { Authorization: `Bearer ${token}` }
  );

  const reports = data?.data?.reports ?? [];
  const vitals = data?.data?.vitals ?? [];

  const trend = useMemo(
    () =>
      [...vitals]
        .reverse()
        .map((v) => {
          const d = safeParseISO(v.when ?? v.date);
          return {
            date: d ? format(d, "MMM d") : "—",
            systolic: v.systolic,
            diastolic: v.diastolic,
            sugar: v.sugar,
            weight: v.weight,
          };
        }),
    [vitals]
  );

  const entries = useMemo(() => {
    const r = reports.map((x) => ({ kind: "report", id: x.id ?? x._id, date: x.date, data: x }));
    const v = vitals.map((x) => ({ kind: "vital", id: x.id ?? x._id, date: x.when ?? x.date, data: x }));
    return [...r, ...v]
      .filter((e) => {
        if (filter === "all") return true;
        if (filter === "reports") return e.kind === "report";
        if (filter === "vitals") return e.kind === "vital";
        if (filter === "abnormal") {
          if (e.kind === "report") return e.data.abnormal?.some((a) => a.severity !== "normal");
          return (e.data.systolic ?? 0) >= 135 || (e.data.sugar ?? 0) >= 115;
        }
        return true;
      })
      .sort((a, b) => {
        const da = safeParseISO(a.date);
        const db = safeParseISO(b.date);
        if (!da && !db) return 0;
        if (!da) return 1;
        if (!db) return -1;
        return db - da;
      });
  }, [filter, reports, vitals]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (isError || (!isLoading && !data)) {
    return (
      <EmptyState
        icon={<ListOrdered className="h-6 w-6" />}
        title="Couldn't load your timeline"
        description="This screen needs the /health/timeline backend endpoint, which isn't live yet."
      />
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold">{t("timeline.title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">Reports and vitals, together in one place.</p>
        </div>
      </header>

      {reports.length === 0 && vitals.length === 0 ? (
        <EmptyState
          icon={<ListOrdered className="h-6 w-6" />}
          title="Nothing here yet"
          description="Upload a report or add vitals to start building your timeline."
        />
      ) : (
        <>
          <div className="grid gap-6 lg:grid-cols-3">
            <Chart title="Blood pressure" data={trend} keys={["systolic", "diastolic"]} colors={["var(--color-primary)", "var(--color-accent-foreground)"]} />
            <Chart title="Blood sugar" data={trend} keys={["sugar"]} colors={["var(--color-warning)"]} />
            <Chart title="Weight" data={trend} keys={["weight"]} colors={["var(--color-success)"]} />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <FilterIcon className="h-4 w-4 text-muted-foreground" />
            {[["all", "All"], ["reports", "Reports"], ["vitals", "Vitals"], ["abnormal", "Abnormal only"]].map(([k, l]) => (
              <button
                key={k}
                onClick={() => setFilter(k)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                  filter === k ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          <ol className="relative border-l pl-6 ml-3 space-y-6">
            {entries.length === 0 ? (
              <li className="rounded-2xl border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
                {filter === "vitals"
                  ? "No vitals logged yet. Add a reading from \"Add vitals\"."
                  : filter === "abnormal"
                  ? "No abnormal values found — nothing to flag right now."
                  : filter === "reports"
                  ? "No reports uploaded yet."
                  : "Nothing matches this filter yet."}
              </li>
            ) : (
              entries.map((e) => (
              <li key={`${e.kind}-${e.id}`} className="relative">
                <span className={`absolute -left-[33px] top-2 grid h-6 w-6 place-items-center rounded-full ring-4 ring-background ${
                  e.kind === "report" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"
                }`}>
                  {e.kind === "report" ? <FileText className="h-3 w-3" /> : <Heart className="h-3 w-3" />}
                </span>
                <div className="text-xs text-muted-foreground">
                  {safeParseISO(e.date) ? format(safeParseISO(e.date), "EEE, MMM d, yyyy · h:mm a") : "Date unknown"}
                </div>
                {e.kind === "report" ? (
                  <Link to={`/reports/${e.data.id ?? e.data._id}`} className="mt-1 block rounded-2xl border bg-card p-4 hover:bg-muted/40 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="font-medium">{e.data.title}</div>
                      <StatusBadge status={e.data.status} />
                    </div>
                    {e.data.summaryEn ? (
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{e.data.summaryEn}</p>
                    ) : null}
                  </Link>
                ) : (
                  <div className="mt-1 rounded-2xl border bg-card p-4">
                    <div className="text-sm font-medium">Vitals recorded</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs">
                      {e.data.systolic ? <Chip>BP {e.data.systolic}/{e.data.diastolic}</Chip> : null}
                      {e.data.sugar ? <Chip>Sugar {e.data.sugar} mg/dL</Chip> : null}
                      {e.data.weight ? <Chip>Weight {e.data.weight} kg</Chip> : null}
                    </div>
                    {e.data.note ? <p className="mt-2 text-xs text-muted-foreground">{e.data.note}</p> : null}
                  </div>
                )}
              </li>
              ))
            )}
          </ol>
        </>
      )}
    </div>
  );
}

function Chip({ children }) {
  return <span className="rounded-full border bg-muted/60 px-2.5 py-1 font-medium">{children}</span>;
}

function Chart({ title, data, keys, colors }) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm font-medium">{title}</div>
        <Activity className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis dataKey="date" fontSize={10} stroke="var(--color-muted-foreground)" />
            <YAxis fontSize={10} stroke="var(--color-muted-foreground)" domain={["auto", "auto"]} />
            <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)", borderRadius: 12, fontSize: 12 }} />
            {keys.map((k, i) => (
              <Line key={k} type="monotone" dataKey={k} stroke={colors[i]} strokeWidth={2} dot={{ r: 2.5 }} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}