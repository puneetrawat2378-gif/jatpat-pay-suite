import { createMiddleware } from "@tanstack/react-start";
import { getRequest, getRequestHeader } from "@tanstack/react-start/server";

/**
 * Server-function middleware that logs Postgres permission-denied failures
 * (SQLSTATE 42501) with the request URL, server-fn path, caller user id,
 * and the exact function/table/relation the policy blocked.
 *
 * Look for `[permission-denied]` in server-function-logs to correlate.
 */
export const logPermissionDenied = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    try {
      return await next();
    } catch (err) {
      logIfPermissionDenied(err);
      throw err;
    }
  },
);

type MaybePgError = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
  status?: number;
  cause?: unknown;
};

function logIfPermissionDenied(err: unknown) {
  const pg = extractPgLike(err);
  const message = pg?.message ?? (err instanceof Error ? err.message : String(err));
  const isPermissionDenied =
    pg?.code === "42501" ||
    /permission denied for (?:table|function|relation|schema|view|sequence) /i.test(
      message ?? "",
    );
  if (!isPermissionDenied) return;

  const target = parseTarget(message);
  let url: string | undefined;
  let method: string | undefined;
  let userId: string | undefined;
  try {
    const req = getRequest();
    url = req.url;
    method = req.method;
  } catch {
    /* outside request context */
  }
  try {
    const auth = getRequestHeader("authorization");
    if (auth?.startsWith("Bearer ")) userId = decodeSub(auth.slice(7));
  } catch {
    /* header not available */
  }

  console.error("[permission-denied]", {
    method,
    url,
    userId,
    code: pg?.code ?? "42501",
    targetKind: target?.kind,
    targetName: target?.name,
    message,
    details: pg?.details,
    hint: pg?.hint,
  });
}

function extractPgLike(err: unknown): MaybePgError | null {
  if (err && typeof err === "object") {
    const e = err as MaybePgError;
    if (e.code || e.details || e.hint) return e;
    if (e.cause) return extractPgLike(e.cause);
  }
  return null;
}

function parseTarget(message?: string) {
  if (!message) return null;
  const m = message.match(
    /permission denied for (table|function|relation|schema|view|sequence)\s+([^\s"]+)/i,
  );
  if (!m) return null;
  return { kind: m[1].toLowerCase(), name: m[2] };
}

function decodeSub(jwt: string): string | undefined {
  const parts = jwt.split(".");
  if (parts.length < 2) return undefined;
  try {
    const payload = JSON.parse(
      Buffer.from(parts[1].replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"),
    );
    return typeof payload.sub === "string" ? payload.sub : undefined;
  } catch {
    return undefined;
  }
}