// Plain CommonJS Express 5 app. No framework, no ESM, no loader hook.
const { sdk, printTree } = require('./telemetry.cjs');
const express = require('express');

const app = express();
app.use(express.json());
app.get('/users/:id', (req, res) => res.json({ id: req.params.id }));

const server = app.listen(0, '127.0.0.1', async () => {
  const { port } = server.address();
  await fetch(`http://127.0.0.1:${port}/users/42`);
  server.close();
  await sdk.shutdown();
  printTree();
});
