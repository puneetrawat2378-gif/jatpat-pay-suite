import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/dashboard/StubPage";

export const Route = createFileRoute("/dashboard/customers")({
  component: () => <StubPage title="Customers" desc="Customer profiles, payment history and lifetime value." />,
});
