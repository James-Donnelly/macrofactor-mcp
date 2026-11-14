// Header credentials avoid putting secrets into request URLs. The legacy query/path
// forms remain supported for existing iPhone Shortcuts and MCP clients.
export function ingestToken(request: Request): string | null {
  return request.headers.get("x-ingest-secret") || new URL(request.url).searchParams.get("token");
}

export function authenticatedMcpPath(request: Request, token?: string): string | null {
  if (!token) return null;
  const path = new URL(request.url).pathname;
  if (path === "/mcp" && request.headers.get("authorization") === `Bearer ${token}`) return path;
  if (path === `/mcp/${token}`) return path;
  return null;
}
