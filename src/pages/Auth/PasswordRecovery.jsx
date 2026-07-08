import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import { Heart, MailCheck, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiEndPoints, { BASE_URL } from "../../constants/apiEndpoints";

// Single component for the whole "forgot password" flow. Same two API calls either way
// (/auth/forgot-password to request an OTP, /auth/reset-password to consume it) — the
// only thing that changes is which step is showing.
// - "/forgot-password" starts on the email step.
// - "/reset-password" starts straight on the OTP + new password step (for anyone who
//   already has a code, e.g. from a bookmarked link or an old email).
export default function PasswordRecovery() {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(location.pathname === "/reset-password" ? "reset" : "request");
  const [email, setEmail] = useState("");

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Heart className="h-4 w-4" />
          </div>
          <span className="font-display font-bold">HealthMate</span>
        </div>

        {step === "request" ? (
          <RequestStep
            email={email}
            setEmail={setEmail}
            onSent={() => setStep("reset")}
          />
        ) : (
          <ResetStep
            email={email}
            setEmail={setEmail}
            onBack={() => setStep("request")}
            onDone={() => navigate("/auth")}
          />
        )}
      </div>
    </div>
  );
}

function RequestStep({ email, setEmail, onSent }) {
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");
      await axios.post(`${BASE_URL}${apiEndPoints.forgotPassword}`, { email });
      toast.success("Password reset OTP sent to your email");
      onSent();
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="font-display text-2xl font-bold">Forgot password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter your email and we'll send you a reset code.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <div className="grid gap-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Email</Label>
          <Input
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <Button type="submit" disabled={submitting} className="h-11">
          {submitting ? "Sending…" : "Send reset code"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Remember your password? <Link to="/auth" className="text-primary hover:underline">Log in</Link>
        </p>
      </form>
    </>
  );
}

function ResetStep({ email, setEmail, onBack, onDone }) {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      setSubmitting(true);
      await axios.post(`${BASE_URL}${apiEndPoints.resetPassword}`, {
        email,
        otp,
        newPassword,
      });
      toast.success("Password reset successfully");
      setDone(true);
      setTimeout(onDone, 1200);
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-success/10 text-success">
          <MailCheck className="h-6 w-6" />
        </div>
        <h1 className="mt-4 font-display text-2xl font-bold">Password reset</h1>
        <p className="mt-2 text-sm text-muted-foreground">Taking you back to log in…</p>
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back
      </button>
      <h1 className="font-display text-2xl font-bold">Reset password</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Enter the code we sent you along with your new password.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
        <Field label="Email">
          <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </Field>
        <Field label="OTP">
          <Input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} placeholder="123456" required />
        </Field>
        <Field label="New password">
          <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required />
        </Field>
        <Field label="Confirm password">
          <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
        </Field>
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <Button type="submit" disabled={submitting} className="h-11">
          {submitting ? "Resetting…" : "Reset password"}
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Remember your password? <Link to="/auth" className="text-primary hover:underline">Log in</Link>
        </p>
      </form>
    </>
  );
}

function Field({ label, children }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
