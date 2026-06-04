import * as z from "zod";
import { textResult } from "../utils/text.js";

export function registerKanbanTools(server, client) {
  server.registerTool(
    "messlo_list_kanban_funnels",
    {
      description:
        "List sales/lead kanban pipelines (contact funnels for CRM stages).",
      inputSchema: {
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(20),
        search: z.string().optional(),
        funnel_type: z.string().optional().describe("e.g. contact"),
      },
    },
    async ({ page, limit, search, funnel_type }) => {
      const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) qs.set("search", search);
      if (funnel_type) qs.set("funnelType", funnel_type);
      return textResult(await client.get(`/api/kanban-funnels?${qs}`));
    }
  );

  server.registerTool(
    "messlo_get_kanban_funnel",
    {
      description: "Get funnel with stages.",
      inputSchema: { funnel_id: z.string() },
    },
    async ({ funnel_id }) => {
      return textResult(await client.get(`/api/kanban-funnels/${funnel_id}`));
    }
  );

  server.registerTool(
    "messlo_move_kanban_item",
    {
      description: "Move a contact (or item) to another stage in a kanban funnel.",
      inputSchema: {
        funnel_id: z.string(),
        to_stage_id: z.string(),
        global_item_id: z.string().optional(),
        item_id: z.string().optional(),
        position: z.number().int().optional(),
      },
    },
    async ({ funnel_id, ...body }) => {
      return textResult(
        await client.post(`/api/kanban-funnels/${funnel_id}/items/move`, body)
      );
    }
  );

  server.registerTool(
    "messlo_contact_kanban_action",
    {
      description:
        "Process contact pipeline action (alternative to move; body matches funnel service).",
      inputSchema: {
        action: z.record(z.unknown()).describe("Funnel action payload from Messlo API"),
      },
    },
    async ({ action }) => {
      return textResult(await client.post("/api/contacts/funnel/action", action));
    }
  );
}
