import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/Logo";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/signup")({
  head: () => ({ meta: [{ title: "Create Account — Jatpat Pay" }] }),
  component: SignupPage,
});

function SignupPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    business_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: form.full_name,
          business_name: form.business_name,
          phone: form.phone,
        },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created — welcome to Jatpat Pay");
    nav({ to: "/dashboard" });
  }

  async function onGoogle() {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) return toast.error(result.error.message ?? "Google sign-in failed");
    if (result.redirected) return;
    nav({ to: "/dashboard" });
  }

  return (
    <div className="min-h-screen flex bg-gradient-hero">
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Logo />
          <h1 className="mt-8 text-3xl font-bold tracking-tight">Create your merchant account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Start accepting payments in minutes. No card required.
          </p>

          <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-elegant">
            <Button type="button" variant="outline" className="w-full h-11" onClick={onGoogle}>
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </Button>
            <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
              <div className="h-px flex-1 bg-border" /> or <div className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={onSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="full_name">Full name</Label>
                  <Input id="full_name" required value={form.full_name} onChange={set("full_name")} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="business_name">Business name</Label>
                  <Input id="business_name" required value={form.business_name} onChange={set("business_name")} className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={form.email} onChange={set("email")} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" type="tel" required value={form.phone} onChange={set("phone")} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" minLength={8} required value={form.password} onChange={set("password")} className="mt-1.5" />
                <div className="text-[11px] text-muted-foreground mt-1">Minimum 8 characters.</div>
              </div>
              <Button type="submit" disabled={loading} className="w-full h-11 bg-gradient-brand text-white shadow-glow mt-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create account"}
              </Button>
            </form>

            <div className="mt-4 text-[11px] text-muted-foreground text-center">
              By creating an account you agree to the Merchant Agreement and Privacy Policy.
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-electric hover:underline">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
