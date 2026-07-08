import { Link, Outlet, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Upload,
  Activity,
  ListOrdered,
  Settings,
  Heart,
  Menu,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { useContext, useState } from "react";
import { useApp } from "@/lib/app-context";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AuthContext } from "../../context api/AuthContext";

const items = [
  { to: "/dashboard", icon: LayoutDashboard, key: "nav.dashboard" },
  { to: "/upload", icon: Upload, key: "nav.upload" },
  { to: "/timeline", icon: ListOrdered, key: "nav.timeline" },
  { to: "/vitals", icon: Activity, key: "nav.vitals" },
  { to: "/settings", icon: Settings, key: "nav.settings" },
];

function NavList({ onNavigate }) {
  const { t } = useApp();
  const { pathname } = useLocation();
  return (
    <nav className="flex flex-col gap-1">
      {items.map(({ to, icon: Icon, key }) => {
        const active = pathname === to;
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden />
            {t(key)}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <Link to="/dashboard" className="flex items-center gap-2">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Heart className="h-5 w-5" aria-hidden />
      </div>
      <div className="leading-tight">
        <div className="font-display text-base font-bold">HealthMate</div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Health companion
        </div>
      </div>
    </Link>
  );
}

function ThemeButton() {
  const { theme, toggleTheme } = useApp();
  return (
    <Button
      variant="outline"
      size="icon"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="h-9 w-9"
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

export function AppShell({ children }) {
  const [open, setOpen] = useState(false);
  const { data: response, logout } = useContext(AuthContext);
  // /auth/me responds with { data: user }, and useFetchData hands back the raw response
  // body — so the actual user object is one level deeper than it looks.
  const user = response?.data;
  const fullName = user ? `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() : "";
  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((p) => p[0]?.toUpperCase())
      .slice(0, 2)
      .join("") || "?";

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r bg-sidebar px-4 py-6 lg:flex lg:flex-col">
        <Brand />
        <div className="mt-8">
          <NavList />
        </div>
        <div className="mt-auto space-y-3">
          <div className="rounded-xl border bg-card p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-full bg-accent text-accent-foreground font-semibold text-sm">
                {initials}
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{fullName || "…"}</div>
                <div className="truncate text-xs text-muted-foreground">{user?.email ?? ""}</div>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" /> Log out
          </button>
        </div>
      </aside>

      {/* Top bar */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b bg-background/80 px-4 py-3 backdrop-blur lg:pl-72 lg:pr-8">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-6">
            <Brand />
            <div className="mt-6">
              <NavList onNavigate={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
        <div className="lg:hidden">
          <Brand />
        </div>
        <div className="ml-auto flex items-center gap-2">
          <LanguageToggle />
          <ThemeButton />
        </div>
      </header>

      <main className="pb-24 lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">{children ?? <Outlet />}</div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur lg:hidden">
        <div className="grid grid-cols-5">
          {items.map(({ to, icon: Icon, key }) => (
            <MobileNavLink key={to} to={to} Icon={Icon} labelKey={key} />
          ))}
        </div>
      </nav>
    </div>
  );
}

function MobileNavLink({ to, Icon, labelKey }) {
  const { t } = useApp();
  const { pathname } = useLocation();
  const active = pathname === to;
  return (
    <Link
      to={to}
      className={`flex flex-col items-center justify-center gap-1 py-2.5 text-[10px] font-medium ${
        active ? "text-primary" : "text-muted-foreground"
      }`}
    >
      <Icon className="h-5 w-5" aria-hidden />
      {t(labelKey)}
    </Link>
  );
}
