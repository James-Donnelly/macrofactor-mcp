import test from 'node:test';
import assert from 'node:assert/strict';
import { authenticatedMcpPath, ingestToken } from '../src/auth.ts';

const request = (path, headers = {}) => new Request(`https://example.test${path}`, { headers });

test('MCP fails closed when no server token is configured', () => {
  assert.equal(authenticatedMcpPath(request('/mcp')), null);
  assert.equal(authenticatedMcpPath(request('/mcp', { Authorization: 'Bearer anything' })), null);
});

test('MCP accepts its bearer credential only on the canonical endpoint', () => {
  assert.equal(authenticatedMcpPath(request('/mcp', { Authorization: 'Bearer correct' }), 'correct'), '/mcp');
  assert.equal(authenticatedMcpPath(request('/mcp', { Authorization: 'Bearer wrong' }), 'correct'), null);
  assert.equal(authenticatedMcpPath(request('/mcp'), 'correct'), null);
  assert.equal(authenticatedMcpPath(request('/other', { Authorization: 'Bearer correct' }), 'correct'), null);
});

test('existing secret-path connections remain compatible', () => {
  assert.equal(authenticatedMcpPath(request('/mcp/correct'), 'correct'), '/mcp/correct');
  assert.equal(authenticatedMcpPath(request('/mcp/wrong'), 'correct'), null);
});

test('iPhone header credentials work without putting a secret in the URL', () => {
  assert.equal(ingestToken(request('/pending', { 'x-ingest-secret': 'correct' })), 'correct');
  assert.equal(ingestToken(request('/pending?token=legacy')), 'legacy');
  assert.equal(ingestToken(request('/pending?token=legacy', { 'x-ingest-secret': 'header' })), 'header');
  assert.equal(ingestToken(request('/pending')), null);
});
