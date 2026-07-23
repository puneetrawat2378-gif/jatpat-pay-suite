import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({ meta: [{ title: "Reset password — Jatpat Pay" }] }),
  component: ForgotPage,
});

function ForgotPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) return toast.error(error.message);
    setSent(true);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-6">
      <div className="w-full max-w-md">
        <Logo />
        <div className="mt-8 rounded-2xl border border-border bg-card p-6 shadow-elegant">
          <h1 className="text-2xl font-bold">Reset password</h1>
          <p className="mt-1 text-sm text-muted-foreground">We'll email you a reset link.</p>

          {sent ? (
            <div className="mt-6 rounded-lg bg-success/10 text-success-foreground border border-success/20 p-4 text-sm">
              Check your inbox for the reset link.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
              </div>
              <Button className="w-full h-11 bg-gradient-brand text-white">Send reset link</Button>
            </form>
          )}
        </div>
        <div className="mt-4 text-center text-sm">
          <Link to="/login" className="text-electric hover:underline">Back to login</Link>
        </div>
      </div>
    </div>
  );
}
