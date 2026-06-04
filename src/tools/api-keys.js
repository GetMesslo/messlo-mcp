import * as z from "zod";
import { textResult } from "../utils/text.js";

export function registerApiKeyTools(server, client) {
  server.registerTool(
    "messlo_create_api_key",
    {
      description:
        "Create a new Messlo REST API key. The full key is returned ONCE — copy it to .env and MESSLO_API_KEY in Cursor MCP settings immediately.",
      inputSchema: {
        name: z.string().min(1).describe("Label for this key, e.g. production-backend"),
      },
    },
    async ({ name }) => {
      const result = await client.post("/api/api-keys", { name });
      return textResult({
        ...result,
        important:
          "Copy api_key now — it will not be shown again. Update MESSLO_API_KEY in your MCP config or .env.",
        cursor_mcp_hint: {
          env: { MESSLO_API_KEY: result.api_key ? "<paste api_key here>" : undefined },
        },
      });
    }
  );

  server.registerTool(
    "messlo_list_api_keys",
    {
      description: "List API keys (prefix only; full secrets are never stored).",
      inputSchema: {
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(10),
      },
    },
    async ({ page, limit }) => {
      const result = await client.get(
        `/api/api-keys?page=${page}&limit=${limit}`
      );
      return textResult(result);
    }
  );

  server.registerTool(
    "messlo_delete_api_key",
    {
      description:
        "Permanently delete one or more API keys. Requires confirm=true.",
      inputSchema: {
        ids: z.array(z.string()).min(1).describe("API key document IDs"),
        confirm: z
          .boolean()
          .describe("Must be true to confirm deletion"),
      },
    },
    async ({ ids, confirm }) => {
      if (!confirm) {
        return textResult({
          error: "Set confirm=true to delete API keys.",
          ids,
        });
      }
      const result = await client.post("/api/api-keys/delete", { ids });
      return textResult(result);
    }
  );

  server.registerTool(
    "messlo_list_api_logs",
    {
      description: "List recent API request logs for your account.",
      inputSchema: {
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(10),
      },
    },
    async ({ page, limit }) => {
      const result = await client.get(
        `/api/api-keys/logs?page=${page}&limit=${limit}`
      );
      return textResult(result);
    }
  );
}
