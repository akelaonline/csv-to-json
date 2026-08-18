const test = require('node:test');
const assert = require('node:assert/strict');
const { app } = require('../index');

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

test('health endpoint reports v2', async (t) => {
  const server = await listen();
  t.after(() => close(server));
  const { port } = server.address();

  const response = await fetch(`http://127.0.0.1:${port}/health`);
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(body.status, 'ok');
  assert.equal(body.version, '2.0.0');
});

test('CSV upload converts to JSON and JSONL', async (t) => {
  const server = await listen();
  t.after(() => close(server));
  const { port } = server.address();

  const makeForm = () => {
    const form = new FormData();
    form.append('file', new Blob(['name,city\nAda,London\nAlan,Manchester\n'], { type: 'text/csv' }), 'people.csv');
    return form;
  };

  const jsonResponse = await fetch(`http://127.0.0.1:${port}/api/files/upload?format=json`, {
    method: 'POST',
    body: makeForm()
  });
  const jsonBody = await jsonResponse.json();

  assert.equal(jsonResponse.status, 200);
  assert.equal(jsonBody.length, 2);
  assert.match(jsonBody[0].text, /Ada/);
  assert.equal(jsonResponse.headers.get('x-document-count'), '2');

  const jsonlResponse = await fetch(`http://127.0.0.1:${port}/api/files/upload?format=jsonl`, {
    method: 'POST',
    body: makeForm()
  });
  const lines = (await jsonlResponse.text()).trim().split('\n');

  assert.equal(jsonlResponse.status, 200);
  assert.equal(lines.length, 2);
  assert.equal(JSON.parse(lines[1]).metadata.sourceType, 'csv');
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
