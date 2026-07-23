import { createFileRoute } from "@tanstack/react-router";
import { StubPage } from "@/components/dashboard/StubPage";

export const Route = createFileRoute("/dashboard/developers")({
  component: () => <StubPage title="Developer Portal" desc="API reference, SDK downloads and code samples." />,
});
