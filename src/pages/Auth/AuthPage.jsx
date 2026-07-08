import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useApp } from "@/lib/app-context";
import apiEndPoints, { BASE_URL } from "../../constants/apiEndpoints";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "At least 6 characters"),
});
const signupSchema = z.object({
  firstName: z.string().min(1, "Enter your first name"),
  lastName: z.string().min(1, "Enter your last name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "At least 8 characters"),
});

export default function AuthPage({ initialMode = "login" }) {
  const [mode, setMode] = useState(initialMode);
  const { t } = useApp();

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="gradient-hero relative hidden flex-col justify-between border-r p-10 lg:flex">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Heart className="h-5 w-5" />
          </div>
          <span className="font-display text-lg font-bold">HealthMate</span>
        </Link>
        <div className="max-w-md">
          <h2 className="font-display text-4xl font-extrabold leading-tight">{t("hero.title")}</h2>
          <p className="mt-4 text-muted-foreground">{t("hero.sub")}</p>
          <div className="mt-8 grid gap-3">
            <Perk icon={Sparkles} title="AI summaries in plain language" />
            <Perk icon={ShieldCheck} title="Private, encrypted, always yours" />
          </div>
        </div>
        <div className="text-xs text-muted-foreground">
          "HealthMate ne meri report samajhne mein kaafi madad ki." — Sana, Karachi
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="flex items-center gap-2 lg:hidden">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Heart className="h-4 w-4" />
            </div>
            <span className="font-display font-bold">HealthMate</span>
          </Link>
          <div className="ml-auto"><LanguageToggle /></div>
        </div>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6 py-8">
          <div className="mb-6 inline-flex self-start rounded-lg border bg-muted/60 p-1">
            {["login", "signup"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
                  mode === m ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          <h1 className="font-display text-3xl font-bold">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {mode === "login"
              ? "Log in to view your reports and vitals."
              : "Start understanding your reports in minutes."}
          </p>

          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="mt-6"
            >
              {mode === "login" ? <LoginForm /> : <SignupForm />}
            </motion.div>
          </AnimatePresence>

          <p className="mt-8 text-center text-xs text-muted-foreground">
            By continuing you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

function Perk({ icon: Icon, title }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border bg-card/70 px-4 py-3 backdrop-blur">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-sm">{title}</span>
    </div>
  );
}

function LoginForm() {
  const navigate = useNavigate();
  const form = useForm({ resolver: zodResolver(loginSchema) });
  const { register, handleSubmit, formState } = form;

  const submit = handleSubmit(async ({ email, password }) => {
    try {
      const res = await axios.post(`${BASE_URL}${apiEndPoints.login}`, { email, password });
      const type = res?.data?.data?.type;

      if (!res.data.data.isVerified || res.data.data.TwoFAEnabled) {
        navigate("/otp-verification", {
          state: { email, page: "login", type, id: res?.data?.data?._id },
        });
        return;
      }
      if (res.data.token) {
        Cookies.set("token", res.data.token);
        toast.success("Signed in");
        navigate(type === "admin" ? "/admin-dashboard" : "/dashboard");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  });

  return (
    <form onSubmit={submit} className="grid gap-4">
      <Field label="Email" error={formState.errors.email?.message}>
        <Input type="email" autoComplete="email" {...register("email")} />
      </Field>
      <Field label="Password" error={formState.errors.password?.message}>
        <Input type="password" autoComplete="current-password" {...register("password")} />
      </Field>
      <div className="text-right text-xs">
        <Link to="/forgot-password" className="text-primary hover:underline">
          Forgot password?
        </Link>
      </div>
      <Button type="submit" disabled={formState.isSubmitting} className="h-11">
        {formState.isSubmitting ? "Signing in…" : (<>Log in <ArrowRight className="ml-1 h-4 w-4" /></>)}
      </Button>
    </form>
  );
}

function SignupForm() {
  const navigate = useNavigate();
  const form = useForm({ resolver: zodResolver(signupSchema) });
  const { register, handleSubmit, formState } = form;

  const submit = handleSubmit(async ({ firstName, lastName, email, password }) => {
    try {
      const res = await axios.post(`${BASE_URL}${apiEndPoints.signup}`, {
        firstName,
        lastName,
        email,
        password,
      });
      const type = res?.data?.data?.type;
      toast.success("Account created — verify your email");
      navigate("/otp-verification", {
        state: { email, page: "signup", type, id: res?.data?.data?._id },
      });
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  });

  return (
    <form onSubmit={submit} className="grid gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Field label="First name" error={formState.errors.firstName?.message}>
          <Input autoComplete="given-name" placeholder="Ayesha" {...register("firstName")} />
        </Field>
        <Field label="Last name" error={formState.errors.lastName?.message}>
          <Input autoComplete="family-name" placeholder="Khan" {...register("lastName")} />
        </Field>
      </div>
      <Field label="Email" error={formState.errors.email?.message}>
        <Input type="email" autoComplete="email" placeholder="you@example.com" {...register("email")} />
      </Field>
      <Field label="Password" error={formState.errors.password?.message}>
        <Input type="password" autoComplete="new-password" {...register("password")} />
      </Field>
      <Button type="submit" disabled={formState.isSubmitting} className="h-11">
        {formState.isSubmitting ? "Creating…" : "Create account"}
      </Button>
    </form>
  );
}

function Field({ label, error, children }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
