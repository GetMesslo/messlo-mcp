#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { loadConfig } from "./config.js";
import { createMessloMcpServer } from "./server.js";

async function main() {
  const config = loadConfig();
  const server = createMessloMcpServer(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
