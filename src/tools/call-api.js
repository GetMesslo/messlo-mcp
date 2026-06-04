import * as z from "zod";
import { textResult } from "../utils/text.js";
import { isPathAllowed } from "./allowlist.js";

export function registerCallApiTool(server, client) {
  server.registerTool(
    "messlo_call_api",
    {
      description:
        "Call any allowed Messlo API path (/api/* or /v1/auth/*). Blocked: admin, billing webhooks. DELETE requires confirm=true.",
      inputSchema: {
        method: z.enum(["GET", "POST", "PUT", "PATCH", "DELETE"]),
        path: z.string().describe("e.g. /api/whatsapp/connections"),
        body: z.record(z.unknown()).optional(),
        confirm: z
          .boolean()
          .optional()
          .describe("Required true for DELETE"),
      },
    },
    async ({ method, path, body, confirm }) => {
      if (!isPathAllowed(path)) {
        return textResult({
          error: "Path not allowed",
          path,
          allowed: "/api/* and /v1/auth/* (excluding admin/billing webhooks)",
        });
      }

      if (method === "DELETE" && !confirm) {
        return textResult({
          error: "Set confirm=true for DELETE requests",
          path,
        });
      }

      const result = await client.request(method, path, body);
      return textResult(result);
    }
  );
}
