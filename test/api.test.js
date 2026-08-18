const test = require('node:test');
const assert = require('node:assert/strict');
const { app } = require('../index');
const packageJson = require('../package.json');

function listen() {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => resolve(server));
  });
}

function close(server) {
  return new Promise((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
}

function csvForm() {
  const form = new FormData();
  form.append(
    'file',
    new Blob(['name,city\nAda,London\nAlan,Manchester\n'], { type: 'text/csv' }),
    'people.csv'
  );
  return form;
}

test('health endpoint reports the package version', async (t) => {
  const server = await listen();
  t.after(() => close(server));
  const { port } = server.address();

  const response = await fetch(`http://127.0.0.1:${port}/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, 'ok');
  assert.equal(body.version, packageJson.version);
});

test('CSV upload converts to JSON and JSONL without caching content', async (t) => {
  const server = await listen();
  t.after(() => close(server));
  const { port } = server.address();

  const jsonResponse = await fetch(`http://127.0.0.1:${port}/api/files/upload?format=json`, {
    method: 'POST',
    body: csvForm()
  });
  const jsonBody = await jsonResponse.json();

  assert.equal(jsonResponse.status, 200);
  assert.equal(jsonBody.length, 2);
  assert.match(jsonBody[0].text, /Ada/);
  assert.equal(jsonResponse.headers.get('x-document-count'), '2');
  assert.equal(jsonResponse.headers.get('cache-control'), 'no-store');

  const jsonlResponse = await fetch(`http://127.0.0.1:${port}/api/files/upload?format=jsonl`, {
    method: 'POST',
    body: csvForm()
  });
  const lines = (await jsonlResponse.text()).trim().split('\n');

  assert.equal(jsonlResponse.status, 200);
  assert.equal(lines.length, 2);
  assert.equal(JSON.parse(lines[1]).metadata.sourceType, 'csv');
  assert.equal(jsonlResponse.headers.get('cache-control'), 'no-store');
});

test('rejects a fake PDF by content signature', async (t) => {
  const server = await listen();
  t.after(() => close(server));
  const { port } = server.address();
  const form = new FormData();
  form.append('file', new Blob(['this is not a pdf'], { type: 'application/pdf' }), 'fake.pdf');

  const response = await fetch(`http://127.0.0.1:${port}/api/files/upload`, {
    method: 'POST',
    body: form
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.match(body.error, /not a valid PDF header/);
});

test('rejects malformed numeric query parameters instead of partially parsing them', async (t) => {
  const server = await listen();
  t.after(() => close(server));
  const { port } = server.address();

  const response = await fetch(`http://127.0.0.1:${port}/api/files/upload?chunkSize=1200oops`, {
    method: 'POST',
    body: csvForm()
  });
  const body = await response.json();

  assert.equal(response.status, 400);
  assert.match(body.error, /chunkSize must be an integer/);
});

test('optional API key protects API routes while leaving health public', async (t) => {
  const previousApiKey = process.env.API_KEY;
  process.env.API_KEY = 'test-api-key-1234567890';
  t.after(() => {
    if (previousApiKey === undefined) delete process.env.API_KEY;
    else process.env.API_KEY = previousApiKey;
  });

  const server = await listen();
  t.after(() => close(server));
  const { port } = server.address();

  const healthResponse = await fetch(`http://127.0.0.1:${port}/health`);
  assert.equal(healthResponse.status, 200);

  const unauthorized = await fetch(`http://127.0.0.1:${port}/api/files/upload`, {
    method: 'POST',
    body: csvForm()
  });
  assert.equal(unauthorized.status, 401);
  assert.equal(unauthorized.headers.get('cache-control'), 'no-store');

  const bearerAuthorized = await fetch(`http://127.0.0.1:${port}/api/files/upload`, {
    method: 'POST',
    headers: { Authorization: 'Bearer test-api-key-1234567890' },
    body: csvForm()
  });
  assert.equal(bearerAuthorized.status, 200);

  const headerAuthorized = await fetch(`http://127.0.0.1:${port}/api/files/upload`, {
    method: 'POST',
    headers: { 'X-API-Key': 'test-api-key-1234567890' },
    body: csvForm()
  });
  assert.equal(headerAuthorized.status, 200);
});
