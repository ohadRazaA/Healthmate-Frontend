import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Upload,
  Brain,
  FileText,
  ShieldCheck,
  Activity,
  Languages,
  MessageSquareText,
  Lock,
  Heart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useApp } from "@/lib/app-context";


export default function Landing() {
  const { t, theme, toggleTheme } = useApp();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Heart className="h-5 w-5" />
            </div>
            <span className="font-display text-lg font-bold">HealthMate</span>
          </Link>
          <nav className="ml-6 hidden gap-6 text-sm text-muted-foreground md:flex">
            <a href="#how" className="hover:text-foreground">How it works</a>
            <a href="#features" className="hover:text-foreground">Features</a>
            <a href="#privacy" className="hover:text-foreground">Privacy</a>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="hidden h-9 w-9 place-items-center rounded-md border sm:grid"
            >
              {theme === "dark" ? "☀︎" : "☾"}
            </button>
            <Button asChild variant="ghost" className="hidden sm:inline-flex">
              <Link to="/auth">{t("cta.login")}</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">{t("cta.signup")}</Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="gradient-hero relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full border bg-background/70 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
              <Languages className="h-3.5 w-3.5 text-primary" />
              English · Roman Urdu
            </span>
            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {t("hero.sub")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button asChild size="lg" className="h-12 px-6">
                <Link to="/auth">
                  {t("cta.getStarted")} <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 px-6">
                <Link to="/dashboard">See a live demo</Link>
              </Button>
            </div>
            <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-success" />
              End-to-end encryption · JWT auth · Your reports stay private
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative"
          >
            <div className="card-elevated rounded-3xl border bg-card p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <FileText className="h-4 w-4" /> CBC report · Jun 24
                </div>
                <span className="rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
                  Analyzed
                </span>
              </div>
              <h3 className="mt-3 font-display text-lg font-semibold">AI summary</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Mildly low hemoglobin and slightly elevated WBC — likely a recent viral response or mild
                iron deficiency.
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                <Pill tone="warn" label="Hb 10.8" sub="low" />
                <Pill tone="bad" label="WBC 12.4" sub="high" />
                <Pill tone="ok" label="Platelets 260" sub="normal" />
              </div>
              <div className="mt-5 rounded-xl border bg-muted/40 p-3 text-xs text-muted-foreground">
                <MessageSquareText className="mb-1 inline h-3.5 w-3.5 text-primary" /> Ask your doctor:
                should I run an iron studies panel to confirm?
              </div>
            </div>
            <div className="absolute -bottom-6 -left-6 hidden rounded-2xl border bg-card p-4 shadow-xl sm:block">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Activity className="h-4 w-4 text-primary" /> BP trend
              </div>
              <div className="mt-2 flex items-end gap-1">
                {[8, 10, 9, 12, 11, 10, 9].map((h, i) => (
                  <div
                    key={i}
                    className="w-2 rounded-t bg-primary/70"
                    style={{ height: `${h * 4}px` }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">{t("how.title")}</h2>
          <p className="mt-3 text-muted-foreground">
            From an unreadable PDF to a summary you can actually use — in three steps.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Upload, tKey: "how.s1" },
            { icon: Brain, tKey: "how.s2" },
            { icon: FileText, tKey: "how.s3" },
          ].map((s, i) => (
            <motion.div
              key={s.tKey}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="rounded-2xl border bg-card p-6"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div className="mt-2 text-xs font-semibold text-primary">Step {i + 1}</div>
              <h3 className="mt-1 font-display text-lg font-semibold">{t(`${s.tKey}.t`)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{t(`${s.tKey}.d`)}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="features" className="bg-muted/30 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-display text-3xl font-bold sm:text-4xl">Everything in one place</h2>
            <p className="mt-3 text-muted-foreground">
              A calm, private, bilingual space for your health records and daily vitals.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: FileText,
                t: "Report vault",
                d: "Every lab, X-ray and prescription — searchable, encrypted, forever.",
              },
              {
                icon: Brain,
                t: "AI summaries",
                d: "Plain-language explanations of abnormal values and next steps.",
              },
              {
                icon: Activity,
                t: "Manual vitals",
                d: "Log BP, sugar, weight in seconds. See trends in beautiful charts.",
              },
              {
                icon: MessageSquareText,
                t: "Doctor questions",
                d: "AI drafts smart questions so you never leave the clinic confused.",
              },
              {
                icon: Languages,
                t: "Bilingual",
                d: "Switch between English and Roman Urdu with one tap, anywhere in the app.",
              },
              {
                icon: ShieldCheck,
                t: "Private by design",
                d: "JWT-secured sessions, encrypted storage, zero third-party ads.",
              },
            ].map((f) => (
              <div key={f.t} className="rounded-2xl border bg-card p-6">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <f.icon className="h-4 w-4" />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold">{f.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="privacy" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 rounded-3xl border bg-card p-8 lg:grid-cols-2 lg:p-12">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Lock className="h-3.5 w-3.5" /> Privacy first
            </span>
            <h2 className="mt-4 font-display text-3xl font-bold">Your health, your data.</h2>
            <p className="mt-3 text-muted-foreground">
              We use JWT-based authentication, encrypt every report at rest, and never sell or share
              your medical data. AI processing is used only to summarize what you upload.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-success" /> AES-256 encryption at rest</li>
              <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-success" /> JWT session tokens with refresh rotation</li>
              <li className="flex items-start gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 text-success" /> Delete-account wipes reports permanently</li>
            </ul>
          </div>
          <div className="rounded-2xl border-2 border-dashed border-warning/50 bg-warning/10 p-6">
            <h3 className="font-display text-lg font-semibold text-warning-foreground">
              Important disclaimer
            </h3>
            <p className="mt-2 text-sm text-warning-foreground/90">
              HealthMate's AI is for <strong>understanding only</strong>, not a substitute for medical
              advice. Always consult a qualified doctor for diagnosis, treatment, or medication
              decisions.
            </p>
            <p className="mt-3 text-sm text-warning-foreground/90">
              HealthMate ki AI sirf <strong>samajhne</strong> ke liye hai — doctor ka mashwara zaroori
              hai.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t bg-background">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Heart className="h-4 w-4 text-primary" />
            © 2026 HealthMate. Built with care.
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Pill({ tone, label, sub }) {
  const cls =
    tone === "bad"
      ? "bg-destructive/12 text-destructive border-destructive/30"
      : tone === "warn"
      ? "bg-warning/15 text-warning-foreground border-warning/30"
      : "bg-success/12 text-success border-success/30";
  return (
    <div className={`rounded-lg border px-2 py-1.5 text-center ${cls}`}>
      <div className="font-semibold">{label}</div>
      <div className="text-[10px] opacity-70">{sub}</div>
    </div>
  );
}
