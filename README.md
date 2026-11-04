# otel-express5-router-repro

A plain CommonJS Express 5 app with `getNodeAutoInstrumentations()` defaults. No framework, no ESM, no loader hook. Spans stay in memory and the server span tree is printed after one request to `GET /users/42`.

Versions: express 5.3.0 (router 2.2.0), @opentelemetry/sdk-node 0.300.0, @opentelemetry/auto-instrumentations-node 0.82.0 (instrumentation-express 0.72.0, instrumentation-router 0.68.0, instrumentation-http 0.300.0), Node 24.11.

```sh
npm ci
npm start                    # defaults, both instrumentations on
npm run start:no-router      # OTEL_NODE_DISABLED_INSTRUMENTATIONS=router
npm run start:no-express     # OTEL_NODE_DISABLED_INSTRUMENTATIONS=express
```

## Output

Defaults:

```
http: GET /users/:id  [http.route=/users/:id]
  router: middleware - patched  [http.route=/]
    express: middleware - jsonParser
  router: middleware - patched  [http.route=/users/:id]
    express: request handler - /users/:id  [http.route=/users/:id]
      router: request handler - /users/:id  [http.route=/users/:id]
```

Router disabled:

```
http: GET /users/:id  [http.route=/users/:id]
  express: middleware - jsonParser
  express: request handler - /users/:id  [http.route=/users/:id]
```

Express disabled:

```
http: GET
  router: middleware - jsonParser  [http.route=/]
  router: request handler - /users/:id  [http.route=/users/:id]
```
