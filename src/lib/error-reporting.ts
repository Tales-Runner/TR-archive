/**
 * Lightweight error-reporting helper.
 *
 * When NEXT_PUBLIC_SENTRY_DSN is set and @sentry/nextjs is installed,
 * errors are forwarded to Sentry. Otherwise they are logged to the
 * console so development stays quiet.
 */

interface ErrorContext {
  /** Where the error originated (e.g. "api/notices", "CostumeCatalog") */
  source?: string;
  /** Arbitrary metadata attached to the report */
  extra?: Record<string, unknown>;
}

interface SentryLike {
  withScope: (cb: (scope: {
    setTag: (k: string, v: string) => void;
    setExtras: (e: Record<string, unknown>) => void;
  }) => void) => void;
  captureException: (err: unknown) => void;
  captureMessage: (msg: string, level: string) => void;
}

let _sentry: SentryLike | null = null;
let _sentryChecked = false;

async function getSentry(): Promise<SentryLike | null> {
  if (_sentryChecked) return _sentry;
  _sentryChecked = true;
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) return null;
  try {
    // Dynamic require — only resolves when @sentry/nextjs is installed.
    // Using a variable prevents TypeScript from resolving the module at compile time.
    const mod = "@sentry/nextjs";
    _sentry = await (Function(`return import("${mod}")`)() as Promise<SentryLike>);
    return _sentry;
  } catch {
    // @sentry/nextjs is not installed — fall back silently
    return null;
  }
}

/**
 * Report an error to the configured error-tracking service (Sentry)
 * or fall back to `console.error` during development.
 */
export async function reportError(
  error: unknown,
  context?: ErrorContext,
): Promise<void> {
  const sentry = await getSentry();

  if (sentry?.withScope) {
    sentry.withScope((scope) => {
      if (context?.source) scope.setTag("source", context.source);
      if (context?.extra) scope.setExtras(context.extra);
      if (error instanceof Error) {
        sentry.captureException(error);
      } else {
        sentry.captureMessage(String(error), "error");
      }
    });
    return;
  }

  // Fallback: structured console output
  if (context?.source) {
    console.error(`[${context.source}]`, error, context.extra ?? "");
  } else {
    console.error(error, context?.extra ?? "");
  }
}
