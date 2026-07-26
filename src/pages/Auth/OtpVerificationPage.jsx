import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Heart, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import apiEndPoints, { BASE_URL } from "../../constants/apiEndpoints";

export default function OtpVerificationPage() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Backend allows 3 resends per rolling 10-minute window (see authController.resendOtpController)
  // — resendsRemaining/cooldownSecs mirror that so the button disables itself accordingly instead
  // of just hammering the endpoint and surfacing a raw 429.
  const [resending, setResending] = useState(false);
  const [resendsRemaining, setResendsRemaining] = useState(3);
  const [cooldownSecs, setCooldownSecs] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (cooldownSecs <= 0) return;
    const timer = setInterval(() => setCooldownSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldownSecs]);

  const handleChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,6}$/.test(value)) {
      setOtp(value);
      setError("");
    }
  };

  const handleResend = async () => {
    const email = location?.state?.email;
    if (!email || resending || cooldownSecs > 0) return;
    try {
      setResending(true);
      const res = await axios.post(`${BASE_URL}${apiEndPoints.resendOtp}`, { email });
      toast.success(res.data?.message || "A new OTP has been sent.");
      if (typeof res.data?.resendsRemaining === "number") {
        setResendsRemaining(res.data.resendsRemaining);
      }
      if (res.data?.cooldownMs) {
        setCooldownSecs(Math.ceil(res.data.cooldownMs / 1000));
      }
    } catch (err) {
      // 429 (too many attempts) and 502 (email service down) both come back with a clear
      // `message` from resendOtpController — surface it directly instead of a generic failure.
      toast.error(err.response?.data?.message || "Could not resend the OTP. Please try again.");
      if (typeof err.response?.data?.resendsRemaining === "number") {
        setResendsRemaining(err.response.data.resendsRemaining);
      }
      if (err.response?.data?.retryAfterMs) {
        setCooldownSecs(Math.ceil(err.response.data.retryAfterMs / 1000));
      }
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError("OTP must be exactly 6 digits.");
      return;
    }
    try {
      setSubmitting(true);
      const res = await axios.post(`${BASE_URL}${apiEndPoints.verifyOTP}`, {
        email: location?.state?.email,
        otp,
        id: location?.state?.id,
      });

      if (res.data.token) {
        Cookies.set("token", res.data.token);
        toast.success("Account verified");
        navigate(location?.state?.type === "admin" ? "/admin-dashboard" : "/dashboard");
      } else {
        toast.error(res.data.message || "Verification failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify OTP. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-2xl border bg-card p-8 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground">
            <Heart className="h-4 w-4" />
          </div>
          <span className="font-display font-bold">HealthMate</span>
        </div>
        <h1 className="font-display text-2xl font-bold">Verify your email</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Enter the 6-digit code we sent to {location?.state?.email || "your email"}.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-4">
          <div className="grid gap-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Verification code</Label>
            <Input
              value={otp}
              onChange={handleChange}
              inputMode="numeric"
              maxLength={6}
              placeholder="123456"
              className="text-center text-lg tracking-[0.5em]"
            />
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>
          <Button type="submit" disabled={otp.length !== 6 || submitting} className="h-11">
            {submitting ? "Verifying…" : "Verify OTP"}
          </Button>
        </form>

        <div className="mt-4 text-center text-xs text-muted-foreground">
          Didn't get a code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending || cooldownSecs > 0}
            className="font-medium text-primary hover:underline disabled:cursor-not-allowed disabled:opacity-60 disabled:no-underline"
          >
            {resending
              ? "Sending…"
              : cooldownSecs > 0
              ? `Try again in ${Math.floor(cooldownSecs / 60)}:${String(cooldownSecs % 60).padStart(2, "0")}`
              : "Resend OTP"}
          </button>
          {cooldownSecs === 0 && resendsRemaining < 3 ? (
            <span className="block mt-1">{resendsRemaining} resend{resendsRemaining === 1 ? "" : "s"} left</span>
          ) : null}
        </div>

        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-success" />
          Your session stays encrypted end-to-end.
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Wrong email? <Link to="/" className="text-primary hover:underline">Start over</Link>
        </p>
      </div>
    </div>
  );
}
