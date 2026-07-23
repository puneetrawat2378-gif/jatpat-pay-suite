import { createFileRoute, Link, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard, Receipt, CreditCard, Link2, Users, Globe2,
  RefreshCcw, LineChart, Terminal, Webhook, Settings, LogOut,
  Menu, X, Shield, Coins, UserCog, Rocket, ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { useMerchantContext, useSetPaymentMode } from "@/hooks/useMerchantContext";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Jatpat Pay" }] }),
  component: DashboardLayout,
});

const nav = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/dashboard/transactions", label: "Transactions", icon: Receipt },
  { to: "/dashboard/payment-links", label: "Payment Links", icon: Link2 },
  { to: "/dashboard/customers", label: "Customers", icon: Users },
  { to: "/dashboard/international", label: "International", icon: Globe2 },
  { to: "/dashboard/refunds", label: "Refunds", icon: RefreshCcw },
  { to: "/dashboard/analytics", label: "Analytics", icon: LineChart },
] as const;

const devNav = [
  { to: "/dashboard/developers", label: "Developers", icon: Terminal },
  { to: "/dashboard/webhooks", label: "Webhooks", icon: Webhook },
] as const;

const settingsNav = [
  { to: "/dashboard/team", label: "Team", icon: UserCog },
  { to: "/dashboard/settings/currencies", label: "Currencies", icon: Coins },
  { to: "/dashboard/settings/provider", label: "Payment Provider", icon: CreditCard },
  { to: "/dashboard/live-mode", label: "Live Mode", icon: Rocket },
  { to: "/dashboard/business", label: "Business Settings", icon: Settings },
] as const;

function DashboardLayout() {
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [authUser, setAuthUser] = useState<{ email?: string; name?: string } | null>(null);
  const [open, setOpen] = useState(false);
  const { data: ctx } = useMerchantContext();
  const setMode = useSetPaymentMode();

  const mode = ctx?.settings?.payment_mode ?? "test";

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        navigate({ to: "/login" });
        return;
      }
      setAuthUser({
        email: data.user.email ?? "",
        name: (data.user.user_metadata?.full_name as string) ?? data.user.email?.split("@")[0] ?? "Merchant",
      });
    });
  }, [navigate]);

  async function signOut() {
    await supabase.auth.signOut();
    toast.success("Signed out");
    navigate({ to: "/" });
  }

  const isActive = (to: string, exact?: boolean) =>
    exact ? path === to : path.startsWith(to);

  const merchantName = ctx?.merchant?.business_name;
  const displayName = ctx?.profile?.display_name ?? authUser?.name;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-4">
        <Logo variant="dark" />
        {merchantName && (
          <div className="mt-2 px-1 text-xs text-sidebar-foreground/60 truncate">
            {merchantName}
          </div>
        )}
      </div>

      <div className="px-4">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-sidebar-accent border border-sidebar-border">
          {(["test", "live"] as const).map((m) => (
            <button
              key={m}
              disabled={setMode.isPending || m === mode}
              onClick={() => setMode.mutate(m)}
              className={`flex-1 text-xs font-semibold py-1.5 rounded-md transition ${
                mode === m
                  ? m === "live"
                    ? "bg-gradient-brand text-white"
                    : "bg-warning text-warning-foreground"
                  : "text-sidebar-foreground/60 hover:text-sidebar-foreground"
              }`}
            >
              {m === "test" ? "TEST MODE" : "LIVE"}
            </button>
          ))}
        </div>
        {mode === "test" && (
          <div className="mt-2 text-[10px] text-sidebar-foreground/50 flex items-center gap-1">
            <Shield className="h-3 w-3" /> No real money moves in test mode
          </div>
        )}
        {mode === "live" && (
          <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="h-3 w-3" /> Live mode active
          </div>
        )}
      </div>

      <nav className="flex-1 mt-4 px-2 space-y-0.5 overflow-y-auto">
        {nav.map((n) => (
          <NavItem key={n.to} to={n.to} label={n.label} Icon={n.icon} active={isActive(n.to, "exact" in n && n.exact)} onClick={() => setOpen(false)} />
        ))}
        <SectionLabel>Developers</SectionLabel>
        {devNav.map((n) => (
          <NavItem key={n.to} to={n.to} label={n.label} Icon={n.icon} active={isActive(n.to)} onClick={() => setOpen(false)} />
        ))}
        <SectionLabel>Settings</SectionLabel>
        {settingsNav.map((n) => (
          <NavItem key={n.to} to={n.to} label={n.label} Icon={n.icon} active={isActive(n.to)} onClick={() => setOpen(false)} />
        ))}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="h-8 w-8 rounded-full bg-gradient-brand flex items-center justify-center text-white text-sm font-bold">
            {displayName?.[0]?.toUpperCase() ?? "M"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-sidebar-foreground truncate">{displayName}</div>
            <div className="text-[11px] text-sidebar-foreground/50 truncate">
              {ctx?.roles?.[0] ?? ""}{ctx?.roles?.[0] ? " · " : ""}{authUser?.email}
            </div>
          </div>
          <Button size="icon" variant="ghost" className="h-8 w-8 text-sidebar-foreground/70 hover:text-white" onClick={signOut}>
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border flex-col">
        {sidebarContent}
      </aside>

      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 bg-sidebar">{sidebarContent}</div>
          <button className="flex-1 bg-black/60" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 h-14 bg-background/80 backdrop-blur border-b border-border flex items-center justify-between px-4 lg:px-6">
          <button className="lg:hidden" onClick={() => setOpen(true)}>
            {open ? <X /> : <Menu />}
          </button>
          <div className="flex-1 lg:flex-none" />
          <div className="flex items-center gap-2">
            <span className={`text-[11px] font-mono px-2 py-1 rounded-md ${mode === "live" ? "bg-gradient-brand text-white" : "bg-warning/20 text-warning border border-warning/30"}`}>
              {mode === "live" ? "LIVE" : "TEST MODE"}
            </span>
          </div>
        </header>

        {mode === "test" && (
          <div className="bg-warning/10 border-b border-warning/30 px-4 lg:px-8 py-2.5 text-xs lg:text-sm text-warning-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 shrink-0 text-warning" />
            <span>
              <span className="font-semibold">Jatpat Pay is currently running in Test Mode.</span>{" "}
              Test payments do not move real money.
            </span>
          </div>
        )}

        <main className="p-4 lg:p-8 max-w-[1600px]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({ to, label, Icon, active, onClick }: any) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
        active ? "bg-sidebar-primary/15 text-white" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
      }`}
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  );
}
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="pt-4 pb-1 px-3 text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-bold">
      {children}
    </div>
  );
}
