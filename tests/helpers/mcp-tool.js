/**
 * Invoke MCP tool handlers directly (same path as tools/call, without stdio transport).
 */
export async function callMcpTool(server, name, args = {}) {
  const tool = server._registeredTools?.[name];
  if (!tool?.handler) {
    throw new Error(`MCP tool not registered: ${name}`);
  }
  return tool.handler(args);
}

/** Parse JSON from messlo textResult content. */
export function parseToolJson(result) {
  const text = result?.content?.[0]?.text;
  if (text === undefined || text === null) {
    throw new Error("Tool result has no text content");
  }
  try {
    return JSON.parse(text);
  } catch {
    return { _raw: text };
  }
}

export function listRegisteredToolNames(server) {
  return Object.keys(server._registeredTools || {}).sort();
}
