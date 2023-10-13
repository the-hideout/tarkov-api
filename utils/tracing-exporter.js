import { ExportResultCode } from '@opentelemetry/core';
import { createExportTraceServiceRequest } from '@opentelemetry/otlp-transformer';

export class SimpleHttpJsonExporter {
  constructor(endpointUrl) {
    this._endpointUrl = endpointUrl;
    this._ongoingExports = []; // Add an array to keep track of ongoing exports
  }

  export(spans, resultCallback) {
    let traceServiceRequest = createExportTraceServiceRequest(spans, true);
    traceServiceRequest = this._postprocessTimestamps(traceServiceRequest);

    const exportRequest = new Request(this._endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(traceServiceRequest),
    });
    const exportPromise = fetch(exportRequest)
      .then(async (response) => {
        const text = await response.text();
        if (response.ok) {
          resultCallback({ code: ExportResultCode.SUCCESS });
        } else {
          resultCallback({
            code: ExportResultCode.FAILED,
            error: new Error(`HTTP error ${response.status}`),
          });
        }
      })
      .catch((error) => {
        resultCallback({
          code: ExportResultCode.FAILED,
          error: error,
        });
      })
      .finally(() => {
        this._ongoingExports = this._ongoingExports.filter(p => p !== exportPromise);
      });

    this._ongoingExports.push(exportPromise); // Push the export promise to the ongoingExports array
  }

  shutdown() {
    // Wait for all ongoing exports to complete before resolving the shutdown promise
    return Promise.all(this._ongoingExports);
  }

  _postprocessTimestamps(traceServiceRequest) {
    // For each span, convert the start and end times to nanosecond epoch timestamps
    traceServiceRequest.resourceSpans.forEach((resourceSpan) => {
      resourceSpan.scopeSpans.forEach((scopeSpan) => {
        scopeSpan.spans.forEach((span) => {
          span.startTimeUnixNano = this._postprocessTimestamp(span.startTimeUnixNano);
          span.endTimeUnixNano = this._postprocessTimestamp(span.endTimeUnixNano);
          // For each event
          span.events.forEach((event) => {
            // Convert the event timestamp to a nanosecond epoch timestamp
            event.timeUnixNano = this._postprocessTimestamp(event.timeUnixNano);
          });
        });
      });
    });
    return traceServiceRequest;
  }

  _postprocessTimestamp(timestamp) {
    return Int64HiLoToString(timestamp.high, timestamp.low);
  }
}

// Due to compat node_compat limitations in Cloudflare Workers, we have to do some extra work to convert this properly.
// CC BY-SA 4.0
// Source: https://stackoverflow.com/a/68311517
// Author: https://stackoverflow.com/users/3547717/
function Int64HiLoToString(hi, lo) {
  hi >>>= 0; lo >>>= 0;
  var sign = "";
  if (hi & 0x80000000) {
    sign = "-";
    lo = (0x100000000 - lo) >>> 0;
    hi = 0xffffffff - hi + +(lo === 0);
  }
  var dhi = ~~(hi / 0x5af4), dhirem = hi % 0x5af4;
  var dlo = dhirem * 0x100000000 + dhi * 0xef85c000 + lo;
  dhi += ~~(dlo / 0x5af3107a4000);
  dlo %= 0x5af3107a4000;
  var slo = "" + dlo;
  if (dhi) {
    slo = "000000000000000000".slice(0, 14 - slo.length) + dlo;
    return sign + dhi + slo;
  } else {
    return sign + slo;
  }
}