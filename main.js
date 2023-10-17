// This is the entrypoint for the Cloudflare worker. Its separate from the worker itself so that we can instrument it with OpenTelemetry
import { trace } from '@opentelemetry/api'
import { instrument } from '@microlabs/otel-cf-workers'
import envHandler from './environment_handler';

const handler = {
  async fetch(request, env, ctx) {
    return envHandler.handleRequest(request, env, ctx)
  },
}

const config = (env, _trigger) => {

  const headSampler = {
    acceptRemote: false, //Whether to accept incoming trace contexts
    ratio: env.TRACE_RATIO ? parseFloat(env.TRACE_RATIO) : env.ENVIRONMENT == 'production' ? 0.05 : 1.0,
  }

  const fetchConf = (request) => {
    return new URL(request.url).hostname != new URL(env.OTEL_ENDPOINT).hostname
  }

  return {
    exporter: env.OTEL_ENDPOINT ? {
      url: env.OTEL_ENDPOINT,
    } : new ConsoleSpanExporter(),
    sampling: headSampler,
    fetch: {
      includeTraceContext: fetchConf,
    },
    service: {
      name: 'tarkov-api',
      namespace: `tarkov-dev.${env.ENVIRONMENT}`,
      version: env.TAPI_COMMIT_REF || 'unknown'
    },
  }
};

export default instrument(handler, config)