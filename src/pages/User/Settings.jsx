import { useContext, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useApp } from "@/lib/app-context";
import { toast } from "sonner";
import { DisclaimerBanner } from "@/components/DisclaimerBanner";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Shield, LogOut, KeyRound } from "lucide-react";
import { AuthContext } from "../../context api/AuthContext";
import apiEndPoints, { BASE_URL } from "../../constants/apiEndpoints";

export default function Settings() {
  const { t, theme, toggleTheme } = useApp();
  const { data, isLoading, logout } = useContext(AuthContext);
  const user = data?.data;

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [saving, setSaving] = useState(false);

  if (user && firstName === "" && lastName === "" && user.firstName) {
    setFirstName(user.firstName);
    setLastName(user.lastName ?? "");
  }

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  const changePassword = async () => {
    if (!currentPassword || !newPassword) {
      toast.error("Enter your current and new password");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }
    try {
      setChangingPassword(true);
      const token = Cookies.get("token");
      await axios.put(
        `${BASE_URL}${apiEndPoints.changePassword}`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
    } catch (error) {
      toast.error(error.response?.data?.message || "Couldn't change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const token = Cookies.get("token");
      // NOTE: /health/profile is declared in apiEndpoints.js but not yet implemented on the
      // backend. Wired here so it works once that endpoint ships.
      await axios.put(
        `${BASE_URL}${apiEndPoints.updateProfile}`,
        { firstName, lastName, phone, dob },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Profile updated");
    } catch (error) {
      toast.error(error.response?.data?.message || "Couldn't save — backend endpoint not available yet");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="font-display text-3xl font-bold">{t("settings.title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your profile, appearance and privacy.</p>
      </header>

      <Section title="Profile">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="First name">
            <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isLoading} />
          </Field>
          <Field label="Last name">
            <Input value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isLoading} />
          </Field>
          <Field label="Email">
            <Input type="email" value={user?.email ?? ""} disabled />
          </Field>
          <Field label="Phone">
            <Input placeholder="+92 300 0000000" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Date of birth">
            <Input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
          </Field>
        </div>
        <div className="mt-4 flex justify-end">
          <Button onClick={saveProfile} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
        </div>
      </Section>

      <Section title="Preferences">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">Language</div>
            <p className="text-xs text-muted-foreground">Switch UI between English and Roman Urdu.</p>
          </div>
          <LanguageToggle />
        </div>
        <div className="mt-6 flex items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium">Dark mode</div>
            <p className="text-xs text-muted-foreground">Easier on the eyes at night.</p>
          </div>
          <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
        </div>
      </Section>

      <Section title="Security" icon={Shield}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Current password">
            <Input
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
            />
          </Field>
          <Field label="New password">
            <Input
              type="password"
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
            />
          </Field>
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={changePassword}
            disabled={changingPassword}
          >
            <KeyRound className="mr-1 h-4 w-4" /> {changingPassword ? "Updating…" : "Update password"}
          </Button>
        </div>
        <div className="mt-6">
          <button
            onClick={logout}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-destructive hover:underline"
          >
            <LogOut className="h-3.5 w-3.5" /> Log out
          </button>
        </div>
      </Section>

      <Section title="Privacy & data">
        <p className="text-sm text-muted-foreground">
          Your reports are encrypted at rest and never shared with third parties.
        </p>
        <div className="mt-6">
          <DisclaimerBanner />
        </div>
      </Section>
    </div>
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <section className="rounded-2xl border bg-card p-6">
      <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
        {Icon ? <Icon className="h-4 w-4 text-primary" /> : null}
        {title}
      </h2>
      {children}
    </section>
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