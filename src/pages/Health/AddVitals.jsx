import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Activity, Droplets, Heart, Weight } from "lucide-react";
import apiEndPoints, { BASE_URL } from "../../constants/apiEndpoints";

const schema = z.object({
  systolic: z.coerce.number().min(60).max(240).optional().or(z.literal("")),
  diastolic: z.coerce.number().min(30).max(160).optional().or(z.literal("")),
  sugar: z.coerce.number().min(30).max(600).optional().or(z.literal("")),
  weight: z.coerce.number().min(20).max(300).optional().or(z.literal("")),
  when: z.string().min(1),
  note: z.string().max(200).optional(),
});

const presets = [
  { label: "Morning fasting", vals: { note: "Morning fasting" } },
  { label: "Post-meal", vals: { note: "Post-meal reading" } },
  { label: "Before sleep", vals: { note: "Before sleep" } },
  { label: "After walk", vals: { note: "After a brisk walk" } },
];

export default function AddVitals() {
  const { t } = useApp();
  const navigate = useNavigate();
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { when: new Date().toISOString().slice(0, 16) },
  });
  const { register, handleSubmit, setValue, formState } = form;

  const submit = handleSubmit(async (values) => {
    try {
      const token = Cookies.get("token");
      // NOTE: /health/add-vitals is declared in apiEndpoints.js but not yet implemented on
      // the backend. Wired here per the agreed approach so it works once the backend ships it.
      await axios.post(`${BASE_URL}${apiEndPoints.addVitals}`, values, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(t("vitals.saved"));
      form.reset({ when: new Date().toISOString().slice(0, 16) });
      navigate("/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Couldn't save vitals — backend endpoint not available yet");
    }
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">{t("vitals.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Log BP, sugar and weight so we can chart your progress.
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => setValue("note", p.vals.note)}
            className="rounded-full border bg-card px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      <form onSubmit={submit} className="rounded-2xl border bg-card p-6 space-y-6">
        <div className="grid gap-6 sm:grid-cols-2">
          <FieldGroup icon={Heart} title="Blood pressure" hint="mmHg">
            <div className="flex gap-2">
              <Input placeholder="Systolic" inputMode="numeric" {...register("systolic")} />
              <span className="self-center text-muted-foreground">/</span>
              <Input placeholder="Diastolic" inputMode="numeric" {...register("diastolic")} />
            </div>
          </FieldGroup>
          <FieldGroup icon={Droplets} title="Blood sugar" hint="mg/dL">
            <Input placeholder="e.g. 96" inputMode="numeric" {...register("sugar")} />
          </FieldGroup>
          <FieldGroup icon={Weight} title="Weight" hint="kg">
            <Input placeholder="e.g. 66.5" inputMode="decimal" {...register("weight")} />
          </FieldGroup>
          <FieldGroup icon={Activity} title="Date & time">
            <Input type="datetime-local" {...register("when")} />
          </FieldGroup>
        </div>

        <div className="grid gap-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Note</Label>
          <Textarea rows={3} placeholder="Anything worth remembering…" {...register("note")} />
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="ghost" onClick={() => form.reset()}>Clear</Button>
          <Button type="submit" disabled={formState.isSubmitting}>
            {formState.isSubmitting ? "Saving…" : "Save vitals"}
          </Button>
        </div>
      </form>
    </div>
  );
}

function FieldGroup({ icon: Icon, title, hint, children }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </div>
        {hint ? <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}
