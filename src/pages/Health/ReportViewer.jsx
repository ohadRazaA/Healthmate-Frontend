import { Link, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { StatusBadge } from "@/components/StatusBadge";
import { AbnormalChip } from "@/components/AbnormalChip";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { EmptyState } from "@/components/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { useApp } from "@/lib/app-context";
import { format, parseISO } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowUpRight, Download, FileText, MessageSquareText, Salad, Ban, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFetchData } from "../../hooks/useFetchData";
import apiEndPoints, { BASE_URL } from "../../constants/apiEndpoints";
import { useCallback, useEffect, useRef, useState } from "react";

function getExtension(url) {
  try {
    const u = new URL(url, window.location.origin);
    const parts = u.pathname.split(".");
    if (parts.length > 1) {
      return "." + parts[parts.length - 1];
    }
  } catch {
    const m = url.match(/\.([a-z0-9]+)(?:[?#]|$)/i);
    if (m) return "." + m[1];
  }
  return "";
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default function ReportViewer() {
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTalking, setIsTalking] = useState(false);
  const chatSectionRef = useRef(null);
  const historyLoadedRef = useRef(false);
  const { fileId } = useParams();
  const { lang } = useApp();
  const token = Cookies.get("token");

  const { data, isLoading, isError } = useFetchData(
    `report-${fileId}`,
    `${BASE_URL}${apiEndPoints.getFileInsights}/${fileId}`,
    {},
    { Authorization: `Bearer ${token}` },
    {
      refetchInterval: (query) => (query.state.data?.data?.status === "processing" ? 3000 : false),
    }
  );

  const report = data?.data;

  // Load any previously-saved conversation for this report once, so a page refresh doesn't
  // wipe the chat. Guarded by a ref (not just messages.length === 0) so it can't accidentally
  // re-run and clobber an in-progress conversation on a later refetch (e.g. the processing-status
  // poll above).
  useEffect(() => {
    if (historyLoadedRef.current) return;
    if (!report?.chatHistory?.length) return;
    setMessages(
      report.chatHistory.map((m) => ({ from: m.role === "user" ? "user" : "ai", text: m.content }))
    );
    historyLoadedRef.current = true;
  }, [report?.chatHistory]);

  // Posts a question, auto-retrying on genuine network failures (fetch's TypeError — the
  // browser couldn't complete the request at all, e.g. "Failed to fetch"). Server-returned
  // errors (4xx/5xx with a message) are NOT retried here — those are real answers from the
  // backend and retrying blindly wouldn't change them.
  const postQuestion = useCallback(
    async (question, attempt = 0) => {
      const MAX_NETWORK_RETRIES = 2;
      try {
        const resp = await fetch(`${BASE_URL}${apiEndPoints.getFileInsights}/${fileId}/query`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ question }),
        });

        let json = null;
        try {
          json = await resp.json();
        } catch {
          // non-JSON body, fall through with json = null
        }

        if (!resp.ok) {
          const err = new Error(json?.message || "Could not get a reply");
          err.kind = "server";
          throw err;
        }

        return json?.reply || json?.message || "(No reply)";
      } catch (err) {
        const isNetworkFailure = err instanceof TypeError;
        if (isNetworkFailure && attempt < MAX_NETWORK_RETRIES) {
          await sleep(400 * (attempt + 1)); // 400ms, then 800ms
          return postQuestion(question, attempt + 1);
        }
        if (isNetworkFailure) {
          const networkErr = new Error("Connection issue — check your internet and try again.");
          networkErr.kind = "network";
          throw networkErr;
        }
        throw err;
      }
    },
    [fileId, token]
  );

  const sendQuestion = useCallback(
    async (question, { isRetryOf } = {}) => {
      const trimmed = question.trim();
      if (!trimmed || report?.status !== "analyzed" || isTalking) return;

      setIsTalking(true);

      if (isRetryOf != null) {
        // Retrying a previously-failed reply: drop the old error bubble instead of stacking a
        // duplicate user message (it's already shown above the error bubble).
        setMessages((m) => m.filter((_, i) => i !== isRetryOf));
      } else {
        setMessages((m) => [...m, { from: "user", text: trimmed }]);
        setChatInput("");
      }

      chatSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

      try {
        const reply = await postQuestion(trimmed);
        setMessages((m) => [...m, { from: "ai", text: reply }]);
      } catch (err) {
        setMessages((m) => [
          ...m,
          {
            from: "ai",
            text: err.message || String(err),
            error: true,
            kind: err.kind || "server",
            question: trimmed,
          },
        ]);
      } finally {
        setIsTalking(false);
      }
    },
    [isTalking, postQuestion, report?.status]
  );

  const retryMessage = useCallback(
    (index) => {
      const msg = messages[index];
      if (!msg?.question) return;
      sendQuestion(msg.question, { isRetryOf: index });
    },
    [messages, sendQuestion]
  );

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 rounded-2xl" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || (!isLoading && !report)) {
    return (
      <EmptyState
        icon={<FileText className="h-6 w-6" />}
        title="Couldn't load this report"
        description="This screen needs the /health/file backend endpoint, which isn't live yet."
        action={{ label: "Back to dashboard", onClick: () => (window.location.href = "/dashboard") }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Button asChild variant="ghost" size="icon" aria-label="Back">
            <Link to="/dashboard"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div className="min-w-0">
            <div className="text-xs text-muted-foreground">
              {report.type} · {format(parseISO(report.date), "MMMM d, yyyy")}
            </div>
            <h1 className="truncate font-display text-2xl font-bold sm:text-3xl">{report.title}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={report.status} />
          {report.fileUrl ? (
            <Button asChild variant="outline" size="sm">
              <a href={report.fileUrl} download={report.title + getExtension(report.fileUrl)}>
                <Download className="mr-1 h-4 w-4" /> PDF
              </a>
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              <Download className="mr-1 h-4 w-4" /> PDF
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border bg-card p-4 min-h-72 flex flex-col">
          <div className="text-xs font-medium text-muted-foreground">File preview</div>
          <div className="mt-3 flex flex-1 items-center justify-center rounded-xl border-2 border-dashed bg-linear-to-br from-muted/40 to-background">
            <div className="text-center">
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-medium">{report.title}{report.fileUrl && getExtension(report.fileUrl)}</p>
              <p className="text-xs text-muted-foreground">Rendered preview would appear here.</p>
              {report.fileUrl ? (
                <a
                  href={report.fileUrl}
                  download={report.title + getExtension(report.fileUrl)}
                  className="text-xs text-primary hover:underline"
                >
                  Download original file
                </a>
              ) : (
                <p className="text-xs text-muted-foreground">Preview not available</p>
              )}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border bg-card p-5 space-y-5 min-h-72">
          {report.status === "processing" ? (
            <div className="rounded-xl border bg-primary/5 p-4 text-sm text-primary">
              We're analyzing this report. Check back in a moment.
            </div>
          ) : report.status === "failed" ? (
            <div className="rounded-xl border bg-destructive/5 p-4 text-sm text-destructive">
              {report.analysisError || "We couldn't analyze this report automatically."} You can still view/download the
              original file, or try re-uploading a clearer copy.
            </div>
          ) : (
            <>
              <div>
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-primary">
                  <MessageSquareText className="h-3.5 w-3.5" /> Plain-language summary
                </div>
                <p className="text-sm leading-relaxed">{lang === "en" ? report.summaryEn : report.summaryUr}</p>
              </div>

              {report.abnormal?.length > 0 ? (
                <div>
                  <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Key values</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {report.abnormal.map((v) => <AbnormalChip key={v.name} v={v} />)}
                  </div>
                </div>
              ) : null}

              <Tabs defaultValue="questions" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="questions">Questions</TabsTrigger>
                  <TabsTrigger value="diet">Diet</TabsTrigger>
                  <TabsTrigger value="remedies">Home care</TabsTrigger>
                </TabsList>

                <TabsContent value="questions" className="mt-4">
                  {(report.questions?.length > 0) ? (
                    <ul className="space-y-2 text-sm">
                      {(report.questions ?? []).map((q, i) => (
                        <li key={i}>
                          <button
                            type="button"
                            onClick={() => sendQuestion(q)}
                            disabled={isTalking}
                            className="flex w-full gap-3 rounded-xl border bg-muted/30 p-3 text-left transition-colors hover:border-primary/40 hover:bg-primary/5 disabled:opacity-60"
                          >
                            <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-[10px] font-bold text-primary">
                              {i + 1}
                            </span>
                            <span>{q}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-muted/50 bg-muted/10 p-4 text-sm text-muted-foreground">
                      No questions available yet.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="diet" className="mt-4 grid gap-3 sm:grid-cols-2">
                  {(report.eat?.length > 0 || report.avoid?.length > 0) ? (
                    <>
                      <List icon={Salad} title="Foods to eat" tone="success" items={report.eat ?? []} />
                      <List icon={Ban} title="Foods to avoid" tone="destructive" items={report.avoid ?? []} />
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-muted/50 bg-muted/10 p-4 text-sm text-muted-foreground col-span-full">
                      No diet recommendations for this report.
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="remedies" className="mt-4">
                  {(report.remedies?.length > 0) ? (
                    <List icon={Leaf} title="Home care" tone="primary" items={report.remedies ?? []} />
                  ) : (
                    <div className="rounded-2xl border border-dashed border-muted/50 bg-muted/10 p-4 text-sm text-muted-foreground">
                      No home care suggestions for this report.
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <DisclaimerBanner />
            </>
          )}
        </div>
      </div>

      <div ref={chatSectionRef} className="rounded-2xl border bg-card p-5 space-y-5">
        <div>
          <div className="mb-2 text-xs font-medium text-muted-foreground">Ask the AI (beta)</div>

          <div className="space-y-2 mb-3 min-h-8">
            {messages.length === 0 && !isTalking ? (
              <p className="text-sm text-muted-foreground">
                Tap a suggested question above or type your own to start a conversation.
              </p>
            ) : null}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[75%] rounded-2xl p-3 text-sm shadow-sm ${m.from === "user"
                    ? "rounded-br-none bg-primary text-white"
                    : m.error
                    ? "rounded-bl-none bg-destructive/5 text-destructive border border-destructive/20"
                    : "rounded-bl-none bg-muted/10 text-muted-foreground"
                    }`}
                >
                  {m.error ? (
                    <div className="space-y-2">
                      <p>
                        {m.kind === "network" ? "⚠️ " : ""}
                        {m.text}
                      </p>
                      <button
                        type="button"
                        onClick={() => retryMessage(i)}
                        disabled={isTalking}
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
            {isTalking ? (
              <div className="flex justify-start">
                <Skeleton className="h-10 w-48 rounded-2xl" />
              </div>
            ) : null}
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
              placeholder={
                report.status === "analyzed"
                  ? "Ask a question about this report"
                  : report.status === "processing"
                  ? "Still analyzing this report — try again shortly"
                  : "This report couldn't be analyzed, so it can't be discussed yet"
              }
              disabled={report.status !== "analyzed" || isTalking}
              className="w-full min-h-14 rounded-full border border-muted/30 bg-background px-4 py-5 pr-14 mt-4 text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
              rows={2}
            />
            <button
              disabled={report.status !== "analyzed" || isTalking || !chatInput.trim()}
              onClick={() => sendQuestion(chatInput)}
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-primary text-white shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function List({ icon: Icon, title, items, tone }) {
  const cls =
    tone === "success" ? "bg-success/10 text-success" :
      tone === "destructive" ? "bg-destructive/10 text-destructive" :
        "bg-primary/10 text-primary";
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className={`grid h-7 w-7 place-items-center rounded-lg ${cls}`}>
          <Icon className="h-4 w-4" />
        </span>
        {title}
      </div>
      <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
        {items.map((x) => (
          <li key={x} className="flex items-start gap-2">
            <span className="mt-1.5 h-1 w-1 rounded-full bg-current opacity-50" />
            {x}
          </li>
        ))}
      </ul>
    </div>
  );
}