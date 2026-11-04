// Starts the SDK with getNodeAutoInstrumentations() defaults. Spans are kept in memory, nothing is sent anywhere.
// OTEL_NODE_DISABLED_INSTRUMENTATIONS=router (or express) is read by getNodeAutoInstrumentations().
process.env.OTEL_METRICS_EXPORTER = 'none';
process.env.OTEL_LOGS_EXPORTER = 'none';

const { NodeSDK } = require('@opentelemetry/sdk-node');
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node');

const spans = [];
const exporter = {
  export(batch, done) {
    spans.push(...batch);
    done({ code: 0 });
  },
  shutdown() {
    return Promise.resolve();
  },
};

const sdk = new NodeSDK({
  serviceName: 'otel-express5-router-repro',
  traceExporter: exporter,
  instrumentations: [getNodeAutoInstrumentations()],
});
sdk.start();

function printTree() {
  const byParent = new Map();
  for (const s of spans) {
    const parent = s.parentSpanContext?.spanId ?? s.parentSpanId ?? 'root';
    if (!byParent.has(parent)) byParent.set(parent, []);
    byParent.get(parent).push(s);
  }
  // the self-request made with fetch is traced too, so start from the SERVER span instead of the trace root
  const SERVER = 1;
  const walk = (s, depth) => {
    const scope = s.instrumentationScope ?? s.instrumentationLibrary;
    const route = s.attributes['http.route'];
    const short = scope.name.replace('@opentelemetry/instrumentation-', '');
    console.log(`${'  '.repeat(depth)}${short}: ${s.name}${route ? `  [http.route=${route}]` : ''}`);
    const children = (byParent.get(s.spanContext().spanId) ?? []).sort((a, b) => a.startTime[1] - b.startTime[1]);
    for (const c of children) walk(c, depth + 1);
  };
  spans.filter((s) => s.kind === SERVER).forEach((s) => walk(s, 0));
  console.log(`(${spans.length} spans)`);
}

module.exports = { sdk, printTree };
