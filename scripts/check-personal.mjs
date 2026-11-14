import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const base = process.env.MF_BASE_URL || JSON.parse(readFileSync(new URL('../.local/connection.json', import.meta.url), 'utf8')).baseUrl;
const secrets = JSON.parse(readFileSync(new URL('../.local/secrets.json', import.meta.url), 'utf8'));
for (const [path, init, expected] of [
  ['/mcp', { method: 'POST' }, 401],
  ['/mcp', { method: 'POST', headers: { Authorization: 'Bearer wrong' } }, 401],
  ['/pending', {}, 401],
  ['/today', { method: 'POST' }, 401],
  ['/upload-export', { method: 'POST' }, 401],
]) {
  const res = await fetch(base + path, init);
  assert.equal(res.status, expected, `${path}: ${await res.text()}`);
  console.log(`${path}: ${expected} PASS`);
}
const client = new Client({ name: 'personal-setup-verification', version: '1.0.0' });
try {
  await client.connect(new StreamableHTTPClientTransport(new URL(base + '/mcp'), {
    requestInit: { headers: { Authorization: `Bearer ${secrets.MCP_TOKEN}` } },
  }));
  const { tools } = await client.listTools();
  assert(tools.some(t => t.name === 'log_food'));
  assert(tools.some(t => t.name === 'get_pending_logs'));
  console.log(`Authenticated MCP connection: ${tools.length} tools PASS`);
  for (const name of ['data_status', 'get_today', 'get_pending_logs']) {
    const result = await client.callTool({ name, arguments: {} });
    assert(!result.isError, `${name} returned an MCP error`);
    const text = result.content.filter(x => x.type === 'text').map(x => x.text).join('\n');
    console.log(`${name}: ${text.slice(0, 1500)}`);
  }
} finally {
  await client.close();
}
