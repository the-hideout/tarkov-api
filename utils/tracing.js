const { Resource } = require('@opentelemetry/resources');
const {
  BatchSpanProcessor,
  SimpleSpanProcessor,
  BasicTracerProvider,
  TraceIdRatioBasedSampler,
  ConsoleSpanExporter,
} = require('@opentelemetry/sdk-trace-base');
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { SimpleHttpJsonExporter } = require('./tracing-exporter');
const {
  SemanticResourceAttributes,
} = require('@opentelemetry/semantic-conventions');
const { AsyncLocalStorageContextManager } = require('@opentelemetry/context-async-hooks');

let serviceName = 'tarkov-api';
// Set the service namespace to environment variable if exists, else development
let serviceNamespace = typeof ENVIRONMENT !== 'undefined' ? ENVIRONMENT : 'development';
// Set the service version to environment variable if exists, else unknown
let serviceVersion = typeof VERSION !== 'undefined' ? VERSION : 'unknown';
// Set the sample rate to environment variable if exists, else 100% for development, and 5% for production
let traceSampleRate = typeof TRACE_SAMPLE_RATE !== 'undefined' ? parseFloat(TRACE_SAMPLE_RATE) : (serviceNamespace === 'production' ? 0.05 : 1);

let resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    [SemanticResourceAttributes.SERVICE_NAMESPACE]: serviceNamespace,
    [SemanticResourceAttributes.SERVICE_VERSION]: serviceVersion,
  }),
);

const provider = new BasicTracerProvider({
  resource: resource,
  sampler: new TraceIdRatioBasedSampler(traceSampleRate),
});

let _exporter = null;

if (OTEL_ENDPOINT) {
  let otelURL = `${OTEL_ENDPOINT}`

  //Exporter, the part that takes traces and sends them to the collector
  // let collectorOptions = {
  //   url: otelURL,
  //   concurrencyLimit: 10,
  //   headers: {
  //     'User-Agent': 'tarkov-api',
  //   }
  // };
  // exporter = new OTLPTraceExporter(collectorOptions);
  _exporter = new SimpleHttpJsonExporter(otelURL);

  //provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
  provider.addSpanProcessor(new BatchSpanProcessor(_exporter, {
    // The maximum queue size. After the size is reached spans are dropped.
    maxQueueSize: 1000,
    // The interval between two consecutive exports
    scheduledDelayMillis: 500,
  }));

  console.log(`Tracing enabled: ${otelURL}, ${traceSampleRate}`);
} else {
  _exporter = new ConsoleSpanExporter();

  console.log(`Tracing enabled: console, ${traceSampleRate}`);
}

provider.addSpanProcessor(new SimpleSpanProcessor(_exporter, {
  // The maximum queue size. After the size is reached spans are dropped.
  maxQueueSize: 100,
  // The maximum batch size of every export. It must be smaller or equal to maxQueueSize.
  maxExportBatchSize: 1,
  // The interval between two consecutive exports
  scheduledDelayMillis: 250,
  // How long the export can run before it is cancelled
  exportTimeoutMillis: 1000,
}));

provider.register({
  contextManager: new AsyncLocalStorageContextManager(),
});

const exporter = _exporter;

const tracer = provider.getTracer(serviceName, serviceVersion);

// Export the tracer so it can be used in other modules
module.exports.tracer = tracer;

// Export the provider so it can be used in other modules
module.exports.provider = provider;

// Export the exporter so it can be used in other modules
module.exports.exporter = exporter;
