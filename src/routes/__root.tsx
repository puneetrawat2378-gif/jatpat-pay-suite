import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import "../lib/fonts";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-hero px-4">
      <div className="max-w-md text-center">
        <div className="text-8xl font-bold text-gradient">404</div>
        <h2 className="mt-4 text-2xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has moved.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-lg bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please try again or head back to the homepage.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-lg bg-gradient-brand px-5 py-2.5 text-sm font-semibold text-white"
          >
            Try again
          </button>
          <a
            href="/"
            className="rounded-lg border border-border bg-background px-5 py-2.5 text-sm font-semibold hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Jatpat Pay — Payments. Jatpat. Anywhere." },
      {
        name: "description",
        content:
          "Jatpat Pay is a premium payment platform for modern businesses. Accept payments, create payment links, track transactions and prepare for global payment acceptance.",
      },
      { property: "og:title", content: "Jatpat Pay — Payments. Jatpat. Anywhere." },
      {
        property: "og:description",
        content:
          "Jatpat Pay is a premium payment platform for modern businesses. Accept payments, create payment links, track transactions and prepare for global payment acceptance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Jatpat Pay — Payments. Jatpat. Anywhere." },
      { name: "twitter:description", content: "Jatpat Pay is a premium payment platform for modern businesses. Accept payments, create payment links, track transactions and prepare for global payment acceptance." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c56a6eb1-1f76-4082-8c96-a836d714fcb3/id-preview-9cc0de8f--2c03c782-dbad-4744-87b7-7cc0f385e4ea.lovable.app-1784699557482.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/c56a6eb1-1f76-4082-8c96-a836d714fcb3/id-preview-9cc0de8f--2c03c782-dbad-4744-87b7-7cc0f385e4ea.lovable.app-1784699557482.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.png", type: "image/png" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
