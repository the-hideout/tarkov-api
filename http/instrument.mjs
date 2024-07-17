// Import with `import * as Sentry from "@sentry/node"` if you are using ESM
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  release: `tarkov-api@${process.env.DEPLOY_REF || 'local'}`,
  dsn: process.env.SENTRY_DSN || '',
  integrations: [
    nodeProfilingIntegration(),
  ],
  // Performance Monitoring
  tracesSampleRate: process.env.SENTRY_TRACE_RATE || 0,

  // Set sampling rate for profiling - this is relative to tracesSampleRate
  profilesSampleRate: process.env.SENTRY_PROFILE_RATE || 0,
});