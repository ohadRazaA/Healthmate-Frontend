import { Link } from "react-router-dom";
import Cookies from "js-cookie";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  Droplets,
  FileText,
  Plus,
  Sparkles,
  Upload,
  Heart,
} from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { format, formatDistanceToNow, parseISO, isValid } from "date-fns";
import { motion } from "framer-motion";
import { useFetchData } from "../../hooks/useFetchData";
import apiEndPoints, { BASE_URL } from "../../constants/apiEndpoints";

// Parses a date value defensively. Real backend records may use a different field name
// or format than the mock data did (e.g. `createdAt` instead of `date`, or already a
// Date-parsable string). Returns null instead of throwing so one bad record can't crash
// the whole dashboard.
function safeParseISO(value) {
  if (!value) return null;
  try {
    const d = typeof value === "string" ? parseISO(value) : new Date(value);
    return isValid(d) ? d : null;
  } catch {
    return null;
  }
}

export default function Dashboard() {
  const { t } = useApp();
  const token = Cookies.get("token");

  const { data, isLoading, isError } = useFetchData(
    "dashboard",
    `${BASE_URL}${apiEndPoints.getDashboard}`,
    {},
    { Authorization: `Bearer ${token}` }
  );

  const reports = data?.data?.reports ?? [];
  const vitals = data?.data?.vitals ?? [];
  const user = data?.data;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  if (isError || (!isLoading && !data)) {
    return (
      <EmptyState
        icon={<Sparkles className="h-6 w-6" />}
        title="Couldn't load your dashboard"
        description="This screen needs the /health/dashboard backend endpoint, which isn't live yet. Try again once it's deployed."
      />
    );
  }

  const latest = vitals[0];
  const analyzed = reports.filter((r) => r.status === "analyzed");
  const lastAnalyzed = analyzed[0];
  const trend = [...vitals].reverse().map((v) => ({
    date: safeParseISO(v.when ?? v.date) ? format(safeParseISO(v.when ?? v.date), "MMM d") : "—",
    systolic: v.systolic,
    sugar: v.sugar,
  }));

  return (
    <div className="space-y-8">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="text-sm text-muted-foreground">{t("dashboard.greeting")},</p>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">
            {(user?.firstName || "there")} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Here's a snapshot of your health.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/vitals"><Plus className="mr-1 h-4 w-4" /> Add vitals</Link>
          </Button>
          <Button asChild>
            <Link to="/upload"><Upload className="mr-1 h-4 w-4" /> Upload report</Link>
          </Button>
        </div>
      </motion.header>

      {reports.length === 0 && vitals.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-6 w-6" />}
          title="No health data yet"
          description="Upload a report or log your vitals to see your dashboard come to life."
          action={{ label: "Upload a report", onClick: () => (window.location.href = "/upload") }}
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat icon={FileText} label={t("dashboard.reports")} value={String(reports.length)} sub={`${analyzed.length} analyzed`} />
            {latest ? (
              <>
                <Stat
                  icon={Heart}
                  label={t("dashboard.latestBp")}
                  value={`${latest.systolic}/${latest.diastolic}`}
                  sub={`mmHg${safeParseISO(latest.when ?? latest.date) ? " · " + formatDistanceToNow(safeParseISO(latest.when ?? latest.date), { addSuffix: true }) : ""}`}
                  tone="primary"
                />
                <Stat icon={Droplets} label={t("dashboard.latestSugar")} value={`${latest.sugar}`} sub="mg/dL · fasting" tone="warn" />
              </>
            ) : null}
            <Stat
              icon={Sparkles}
              label={t("dashboard.lastSummary")}
              value={lastAnalyzed && safeParseISO(lastAnalyzed.date) ? formatDistanceToNow(safeParseISO(lastAnalyzed.date), { addSuffix: true }) : "—"}
              sub={lastAnalyzed?.title ?? ""}
              tone="success"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <section className="lg:col-span-2 rounded-2xl border bg-card p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">{t("dashboard.recent")}</h2>
                <Link to="/timeline" className="text-xs font-medium text-primary hover:underline">
                  View all →
                </Link>
              </div>
              <ul className="divide-y">
                {reports.slice(0, 4).map((r) => (
                  <li key={r.id}>
                    {console.log(r)}
                    <Link
                      to={`/reports/${r._id}`}
                      className="flex items-center gap-4 py-3 hover:bg-muted/40 rounded-lg px-2 -mx-2 transition-colors"
                    >
                      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{r.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.type} · {safeParseISO(r.date) ? format(safeParseISO(r.date), "MMM d, yyyy") : "date unknown"}
                        </div>
                      </div>
                      <StatusBadge status={r.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            </section>

            {trend.length > 0 ? (
              <section className="rounded-2xl border bg-card p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-display text-lg font-semibold">{t("dashboard.trend")}</h2>
                  <Activity className="h-4 w-4 text-primary" />
                </div>
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trend} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                      <XAxis dataKey="date" fontSize={10} stroke="var(--color-muted-foreground)" />
                      <YAxis fontSize={10} stroke="var(--color-muted-foreground)" />
                      <Tooltip
                        contentStyle={{
                          background: "var(--color-card)",
                          border: "1px solid var(--color-border)",
                          borderRadius: 12,
                          fontSize: 12,
                        }}
                      />
                      <Line type="monotone" dataKey="systolic" stroke="var(--color-primary)" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="sugar" stroke="var(--color-warning)" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" />Systolic</span>
                  <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-warning" />Sugar</span>
                </div>
              </section>
            ) : null}
          </div>
        </>
      )}

      <DisclaimerBanner subtle />
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub, tone = "muted" }) {
  const iconCls = {
    muted: "bg-muted text-muted-foreground",
    primary: "bg-primary/10 text-primary",
    warn: "bg-warning/15 text-warning-foreground",
    success: "bg-success/15 text-success",
  }[tone];
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className={`grid h-8 w-8 place-items-center rounded-lg ${iconCls}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-2 font-display text-2xl font-bold tabular-nums">{value}</div>
      {sub ? <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  );
}