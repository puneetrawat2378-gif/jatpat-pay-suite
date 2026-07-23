/**
 * TanStack Query hook for the current merchant context.
 * Cached across the dashboard shell — all dashboard pages read the same context.
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMerchantContext } from "@/lib/merchant.functions";
import { setPaymentMode } from "@/lib/settings.functions";
import { toast } from "sonner";

export function useMerchantContext() {
  const fetchCtx = useServerFn(getMerchantContext);
  return useQuery({
    queryKey: ["merchant", "context"],
    queryFn: () => fetchCtx(),
    staleTime: 30_000,
  });
}

export function useSetPaymentMode() {
  const call = useServerFn(setPaymentMode);
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (mode: "test" | "live") => call({ data: { mode } }),
    onSuccess: () => {
      toast.success("Payment mode updated");
      qc.invalidateQueries({ queryKey: ["merchant", "context"] });
    },
    onError: (e: any) => toast.error(e?.message ?? "Could not update mode"),
  });
}
