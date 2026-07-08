import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { useApp } from "@/lib/app-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { UploadCloud, FileText, X, Sparkles, CheckCircle2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import apiEndPoints, { BASE_URL } from "../../constants/apiEndpoints";

export default function UploadReport() {
  const { t } = useApp();
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [phase, setPhase] = useState("idle");
  const [progress, setProgress] = useState(0);
  const [reportType, setReportType] = useState("Lab");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [notes, setNotes] = useState("");
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const onFile = (f) => {
    if (!f) return;
    setFile(f);
  };

  const start = async () => {
    if (!file) return toast.error("Please select a file first");
    setPhase("uploading");
    setProgress(0);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("reportType", reportType);
      formData.append("date", date);
      formData.append("notes", notes);

      const token = Cookies.get("token");
      const res = await axios.post(`${BASE_URL}${apiEndPoints.uploadReport}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (evt) => {
          if (evt.total) setProgress(Math.round((evt.loaded / evt.total) * 100));
        },
      });

      setPhase("analyzing");
      const reportId = res?.data?.data?.id ?? res?.data?.data?._id;
      setPhase("done");
      toast.success("Report uploaded");
      setTimeout(() => {
        if (reportId) navigate(`/reports/${reportId}`);
        else navigate("/timeline");
      }, 700);
    } catch (error) {
      // NOTE: /health/upload-report is declared in apiEndpoints.js but not yet implemented
      // on the backend, so this request will fail until that endpoint exists.
      toast.error(error.response?.data?.message || "Upload failed — backend endpoint not available yet");
      setPhase("idle");
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">{t("upload.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add a lab report, scan or prescription — we'll produce a plain-language summary.
        </p>
      </header>

      <div className="rounded-2xl border bg-card p-6">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            onFile(e.dataTransfer.files?.[0]);
          }}
          onClick={() => inputRef.current?.click()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
            dragging ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf,image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
            <UploadCloud className="h-6 w-6" />
          </div>
          <p className="mt-3 font-medium">{t("upload.drop")}</p>
          <p className="mt-1 text-xs text-muted-foreground">{t("upload.types")}</p>
        </div>

        {file ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border bg-muted/40 p-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-background">
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{file.name}</div>
              <div className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setFile(null)} aria-label="Remove file">
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="grid gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Report type</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {["Lab", "X-ray", "Ultrasound", "Prescription", "Other"].map((v) => (
                  <SelectItem key={v} value={v}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Date</Label>
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 grid gap-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Notes (optional)</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any symptoms or context to help the AI understand this report…"
            rows={3}
          />
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <DisclaimerBanner subtle />
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={() => { setFile(null); setPhase("idle"); }}>Reset</Button>
          <Button onClick={start} disabled={phase !== "idle"}>
            {phase === "idle" ? "Upload & analyze" : phase === "uploading" ? `Uploading ${progress}%` : phase === "analyzing" ? t("upload.analyzing") : "Done"}
          </Button>
        </div>
      </div>

      {phase === "uploading" ? (
        <div className="rounded-2xl border bg-card p-5">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span>Uploading…</span>
            <span className="tabular-nums text-muted-foreground">{progress}%</span>
          </div>
          <div className="h-2 rounded-full bg-muted overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : null}

      {phase === "analyzing" ? (
        <div className="rounded-2xl border bg-card p-5">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            {t("upload.analyzing")}
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ) : null}

      {phase === "done" ? (
        <div className="rounded-2xl border border-success/40 bg-success/10 p-5 text-sm flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-success" />
          <span>Upload complete. Opening report…</span>
        </div>
      ) : null}
    </div>
  );
}
