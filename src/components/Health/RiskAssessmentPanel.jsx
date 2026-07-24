import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Cookies from "js-cookie";
import { AlertTriangle, ArrowUpRight, HeartPulse, RefreshCw, ShieldCheck, ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { useFetchData } from "../../hooks/useFetchData";
import apiEndPoints, { BASE_URL } from "../../constants/apiEndpoints";
import {
  useLatestPrediction,
  useTriggerPrediction,
  useRiskChatHistory,
  useSendRiskChatMessage,
} from "../../hooks/useRiskPrediction";

// Visual treatment per risk level string returned by the model (see MODEL/main.py risk_mapping).
const LEVEL_STYLES = {
  "Healthy Range": { cls: "bg-success/10 text-success border-success/30", Icon: ShieldCheck },
  "Low Concern": { cls: "bg-primary/10 text-primary border-primary/30", Icon: ShieldCheck },
  "Needs Attention": { cls: "bg-warning/15 text-warning-foreground border-warning/30", Icon: ShieldAlert },
  "High Attention Required": { cls: "bg-destructive/10 text-destructive border-destructive/30", Icon: AlertTriangle },
};
const DEFAULT_LEVEL_STYLE = { cls: "bg-muted text-muted-foreground border-border", Icon: HeartPulse };

function RiskBadge({ level }) {
  const { cls, Icon } = LEVEL_STYLES[level] ?? DEFAULT_LEVEL_STYLE;
  return (
    <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold ${cls}`}>
      <Icon className="h-4 w-4" aria-hidden />
      {level}
    </span>
  );
}

export default function RiskAssessmentPanel() {
  const token = Cookies.get("token");

  const { data: dashboardData } = useFetchData(
    "dashboard",
    `${BASE_URL}${apiEndPoints.getDashboard}`,
    {},
    { Authorization: `Bearer ${token}` }
  );
  const reports = dashboardData?.data?.reports ?? [];
  const vitals = dashboardData?.data?.vitals ?? [];
  const hasVitals = vitals.length > 0;

  const sortedReports = useMemo(
    () => [...reports].sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)),
    [reports]
  );

  // Default to the most recently uploaded report; falls back to vitals-only automatically
  // whenever there are no reports at all.
  const [selectedReportId, setSelectedReportId] = useState(null);
  useEffect(() => {
    if (selectedReportId === null && sortedReports.length > 0) {
      setSelectedReportId(sortedReports[0]._id);
    }
  }, [sortedReports, selectedReportId]);

  const selectedReport = sortedReports.find((r) => r._id === selectedReportId) || null;
  const reportUnavailable = sortedReports.length === 0;

  // --- Prediction ---
  const { data: predictionData, isLoading: predictionLoading } = useLatestPrediction();
  const prediction = predictionData?.data;
  const triggerPrediction = useTriggerPrediction();

  const handleRunPrediction = useCallback(() => {
    triggerPrediction.mutate(undefined);
  }, [triggerPrediction]);

  // --- Chat ---
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const historyLoadedRef = useRef(false);
  const chatEndRef = useRef(null);
  const { data: historyData } = useRiskChatHistory();
  const sendMessage = useSendRiskChatMessage();

  useEffect(() => {
    if (historyLoadedRef.current) return;
    const history = historyData?.data;
    if (!history?.length) return;
    setMessages(history.map((m) => ({ from: m.role === "user" ? "user" : "ai", text: m.content })));
    historyLoadedRef.current = true;
  }, [historyData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, sendMessage.isPending]);

  const canChat = prediction?.status === "completed";

  const sendQuestion = useCallback(
    async (question, { isRetryOf } = {}) => {
      const trimmed = question.trim();
      if (!trimmed || !canChat || sendMessage.isPending) return;

      if (isRetryOf != null) {
        setMessages((m) => m.filter((_, i) => i !== isRetryOf));
      } else {
        setMessages((m) => [...m, { from: "user", text: trimmed }]);
        setChatInput("");
      }

      try {
        const json = await sendMessage.mutateAsync({ question: trimmed, reportId: selectedReportId });
        setMessages((m) => [...m, { from: "ai", text: json?.reply || "(No reply)" }]);
      } catch (err) {
        setMessages((m) => [
          ...m,
          { from: "ai", text: err.message || String(err), error: true, question: trimmed },
        ]);
      }
    },
    [canChat, sendMessage, selectedReportId]
  );

  const retryMessage = (index) => {
    const msg = messages[index];
    if (!msg?.question) return;
    sendQuestion(msg.question, { isRetryOf: index });
  };

  return (
    <section className="w-full rounded-2xl border bg-card p-5 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
            <HeartPulse className="h-3.5 w-3.5" /> Risk assessment
          </div>
          <p className="mt-1 text-sm text-muted-foreground">Based on your most recently recorded vitals.</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRunPrediction}
          disabled={!hasVitals || triggerPrediction.isPending || prediction?.status === "pending"}
        >
          <RefreshCw className={`mr-1.5 h-3.5 w-3.5 ${triggerPrediction.isPending ? "animate-spin" : ""}`} />
          {prediction ? "Re-run prediction" : "Run prediction"}
        </Button>
      </div>

      {/* Risk display */}
      {!hasVitals ? (
        <div className="rounded-xl border border-dashed bg-muted/10 p-4 text-sm text-muted-foreground">
          Add your vitals to get a risk assessment.
        </div>
      ) : predictionLoading ? (
        <Skeleton className="h-16 w-full rounded-xl" />
      ) : !prediction || prediction.status === "pending" ? (
        <div className="flex items-center gap-3 rounded-xl border bg-primary/5 p-4 text-sm text-primary">
          <RefreshCw className="h-4 w-4 animate-spin shrink-0" />
          {prediction ? "Analyzing your vitals — this updates automatically." : "No prediction yet — run one to see your risk level."}
        </div>
      ) : prediction.status === "failed" ? (
        <div className="rounded-xl border bg-destructive/5 p-4 text-sm text-destructive space-y-2">
          <p>{prediction.error || "We couldn't generate a prediction. The model may be temporarily unavailable."}</p>
          <button
            type="button"
            onClick={handleRunPrediction}
            className="text-xs font-medium underline underline-offset-2 hover:text-destructive/80"
          >
            Tap to retry
          </button>
        </div>
      ) : (
        <div className="rounded-xl border bg-muted/10 p-4 space-y-2">
          <RiskBadge level={prediction.level} />
          <p className="text-sm leading-relaxed text-foreground">{prediction.message}</p>
        </div>
      )}

      {/* Report selector */}
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs font-medium text-muted-foreground shrink-0">Chat context:</span>
        {reportUnavailable ? (
          <span className="text-xs text-muted-foreground">Vitals only (no reports uploaded yet)</span>
        ) : (
          <Select value={selectedReportId ?? undefined} onValueChange={setSelectedReportId}>
            <SelectTrigger className="h-8 w-auto min-w-56 text-xs">
              <SelectValue placeholder="Select a report" />
            </SelectTrigger>
            <SelectContent>
              {sortedReports.map((r) => (
                <SelectItem key={r._id} value={r._id}>
                  {r.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <span className="text-xs text-muted-foreground">+ latest vitals</span>
      </div>

      {/* Chat interface */}
      <div className="space-y-3 border-t pt-4">
        <div className="text-xs font-medium text-muted-foreground">Ask about your risk assessment</div>

        <div className="space-y-2 min-h-8 max-h-80 overflow-y-auto pr-1">
          {messages.length === 0 && !sendMessage.isPending ? (
            <p className="text-sm text-muted-foreground">
              {canChat ? "Ask a question about your risk level or vitals." : "Run a prediction to start chatting."}
            </p>
          ) : null}
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] rounded-2xl p-3 text-sm shadow-sm ${
                  m.from === "user"
                    ? "rounded-br-none bg-primary text-white"
                    : m.error
                    ? "rounded-bl-none bg-destructive/5 text-destructive border border-destructive/20"
                    : "rounded-bl-none bg-muted/10 text-muted-foreground"
                }`}
              >
                {m.error ? (
                  <div className="space-y-2">
                    <p>{m.text}</p>
                    <button
                      type="button"
                      onClick={() => retryMessage(i)}
                      disabled={sendMessage.isPending}
                      className="text-xs font-medium underline underline-offset-2 hover:text-destructive/80 disabled:opacity-60"
                    >
                      Tap to retry
                    </button>
                  </div>
                ) : (
                  m.text
                )}
              </div>
            </div>
          ))}
          {sendMessage.isPending ? (
            <div className="flex justify-start">
              <Skeleton className="h-10 w-48 rounded-2xl" />
            </div>
          ) : null}
          <div ref={chatEndRef} />
        </div>

        <div className="relative">
          <textarea
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendQuestion(chatInput);
              }
            }}
            placeholder={canChat ? "Ask about your risk level or vitals" : "Run a prediction to enable chat"}
            disabled={!canChat || sendMessage.isPending}
            className="w-full min-h-14 rounded-full border border-muted/30 bg-background px-4 py-5 pr-14 text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            rows={2}
          />
          <button
            disabled={!canChat || sendMessage.isPending || !chatInput.trim()}
            onClick={() => sendQuestion(chatInput)}
            className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-primary text-white shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            aria-label="Send message"
          >
            <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <DisclaimerBanner subtle />
    </section>
  );
}
