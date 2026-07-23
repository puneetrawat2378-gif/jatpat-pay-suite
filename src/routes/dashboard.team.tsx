import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { listTeamMembers } from "@/lib/merchant.functions";
import { useMerchantContext } from "@/hooks/useMerchantContext";
import { UserCog } from "lucide-react";

export const Route = createFileRoute("/dashboard/team")({
  component: TeamPage,
});

const ROLE_TONE: Record<string, string> = {
  owner: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  admin: "bg-electric/20 text-electric border-electric/30",
  developer: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
  finance: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
  support: "bg-amber-500/20 text-amber-300 border-amber-500/30",
};

function TeamPage() {
  const { data: ctx } = useMerchantContext();
  const listFn = useServerFn(listTeamMembers);
  const { data: members } = useQuery({ queryKey: ["team_members"], queryFn: () => listFn() });

  const isOwner = ctx?.roles?.includes("owner");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <UserCog className="h-6 w-6 text-electric" /> Team & Roles
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Manage who can access this Jatpat Pay merchant. Roles enforce backend permissions.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase text-muted-foreground bg-muted/30">
            <tr>
              <th className="px-4 py-2 text-left">User ID</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Joined</th>
            </tr>
          </thead>
          <tbody>
            {(members ?? []).map((m: any) => (
              <tr key={m.id} className="border-t border-border">
                <td className="px-4 py-2 font-mono text-xs">{m.user_id.slice(0, 8)}…</td>
                <td className="px-4 py-2">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${ROLE_TONE[m.role]}`}>
                    {m.role}
                  </span>
                </td>
                <td className="px-4 py-2 text-muted-foreground text-xs">{new Date(m.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-sm text-muted-foreground">
        <strong className="text-foreground">Invitations coming soon.</strong> Only the merchant owner can add or remove team members. You are {isOwner ? "the owner" : "not the owner"} of this merchant.
        <ul className="mt-3 space-y-1 text-xs list-disc list-inside">
          <li><strong>Owner</strong> — full access, can change payment mode, provider, roles.</li>
          <li><strong>Admin</strong> — operational access, can edit business + international status.</li>
          <li><strong>Developer</strong> — API keys, webhooks, create payment links.</li>
          <li><strong>Finance</strong> — refunds, currencies, transactions.</li>
          <li><strong>Support</strong> — read-only transactions and customer lookup.</li>
        </ul>
      </div>
    </div>
  );
}
