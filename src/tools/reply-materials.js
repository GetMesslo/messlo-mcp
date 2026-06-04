import * as z from "zod";
import { textResult } from "../utils/text.js";

export function registerReplyMaterialTools(server, client) {
  server.registerTool(
    "messlo_list_reply_materials",
    {
      description:
        "List saved reply materials (text, image, document, flow, …) for a WABA. Use reply _id in message bots and sequence steps.",
      inputSchema: {
        waba_id: z.string(),
        search: z.string().optional(),
        page: z.number().int().min(1).optional(),
        limit: z.number().int().min(1).max(100).optional(),
      },
    },
    async ({ waba_id, search, page, limit }) => {
      const qs = new URLSearchParams({ waba_id });
      if (search) qs.set("search", search);
      if (page) qs.set("page", String(page));
      if (limit) qs.set("limit", String(limit));
      return textResult(await client.get(`/api/reply-materials?${qs}`));
    }
  );
}
