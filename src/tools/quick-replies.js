import * as z from "zod";
import { textResult } from "../utils/text.js";

export function registerQuickReplyTools(server, client) {
  server.registerTool(
    "messlo_list_quick_replies",
    {
      description:
        "List inbox quick replies (canned responses for agents). Supports {{variables}} in content.",
      inputSchema: {
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(50),
        search: z.string().optional(),
      },
    },
    async ({ page, limit, search }) => {
      const qs = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      });
      if (search) qs.set("search", search);
      return textResult(await client.get(`/api/quick-replies?${qs}`));
    }
  );

  server.registerTool(
    "messlo_create_quick_reply",
    {
      description: "Create a quick reply snippet for the inbox.",
      inputSchema: {
        content: z.string(),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async ({ content, extra }) => {
      return textResult(
        await client.post("/api/quick-replies", { content, ...(extra || {}) })
      );
    }
  );

  server.registerTool(
    "messlo_update_quick_reply",
    {
      description: "Update quick reply content.",
      inputSchema: {
        quick_reply_id: z.string(),
        content: z.string(),
      },
    },
    async ({ quick_reply_id, content }) => {
      return textResult(
        await client.put(`/api/quick-replies/${quick_reply_id}`, { content })
      );
    }
  );

  server.registerTool(
    "messlo_delete_quick_replies",
    {
      description:
        "Bulk-delete quick replies. Requires confirm: true and ids array.",
      inputSchema: {
        ids: z.array(z.string()).min(1),
        confirm: z.boolean().optional().default(false),
      },
    },
    async ({ ids, confirm }) => {
      if (!confirm) {
        return textResult({
          deleted: false,
          hint: "Set confirm: true to delete.",
          ids,
        });
      }
      return textResult(
        await client.delete("/api/quick-replies/delete", { ids })
      );
    }
  );
}
