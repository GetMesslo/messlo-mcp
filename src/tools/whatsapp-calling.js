import * as z from "zod";
import { textResult } from "../utils/text.js";

export function registerWhatsAppCallingTools(server, client) {
  server.registerTool(
    "messlo_get_call_settings",
    {
      description:
        "Get WhatsApp Calling settings for a phone number (MongoDB phone_number_id from messlo_list_connections).",
      inputSchema: {
        phone_number_id: z.string(),
      },
    },
    async ({ phone_number_id }) => {
      const qs = new URLSearchParams({ phone_number_id });
      return textResult(
        await client.get(`/api/whatsapp/calling/settings?${qs}`)
      );
    }
  );

  server.registerTool(
    "messlo_update_call_settings",
    {
      description: "Update WhatsApp Calling settings for a phone number.",
      inputSchema: {
        phone_number_id: z.string(),
        extra: z
          .record(z.unknown())
          .optional()
          .describe("Settings fields to update (enabled, hours, etc.)"),
      },
    },
    async ({ phone_number_id, extra }) =>
      textResult(
        await client.post("/api/whatsapp/calling/settings", {
          phone_number_id,
          ...(extra || {}),
        })
      )
  );

  server.registerTool(
    "messlo_list_call_agents",
    {
      description: "List WhatsApp call agents.",
      inputSchema: {
        page: z.number().int().min(1).optional(),
        limit: z.number().int().min(1).max(100).optional(),
        search: z.string().optional(),
      },
    },
    async ({ page, limit, search }) => {
      const qs = new URLSearchParams();
      if (page) qs.set("page", String(page));
      if (limit) qs.set("limit", String(limit));
      if (search) qs.set("search", search);
      const q = qs.toString();
      return textResult(
        await client.get(`/api/whatsapp/calling/agents${q ? `?${q}` : ""}`)
      );
    }
  );

  server.registerTool(
    "messlo_get_call_agent",
    {
      description: "Get one call agent by id.",
      inputSchema: {
        agent_id: z.string(),
      },
    },
    async ({ agent_id }) =>
      textResult(await client.get(`/api/whatsapp/calling/agents/${agent_id}`))
  );

  server.registerTool(
    "messlo_create_call_agent",
    {
      description: "Create a WhatsApp call agent.",
      inputSchema: {
        name: z.string(),
        email: z.string().optional(),
        phone: z.string().optional(),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async ({ extra, ...fields }) =>
      textResult(
        await client.post("/api/whatsapp/calling/agents", {
          ...fields,
          ...(extra || {}),
        })
      )
  );

  server.registerTool(
    "messlo_update_call_agent",
    {
      description: "Update a call agent by id.",
      inputSchema: {
        agent_id: z.string(),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async ({ agent_id, extra }) =>
      textResult(
        await client.put(`/api/whatsapp/calling/agents/${agent_id}`, extra || {})
      )
  );

  server.registerTool(
    "messlo_delete_call_agents",
    {
      description:
        "Soft-delete call agents by ids. Requires confirm: true.",
      inputSchema: {
        ids: z.array(z.string()).min(1),
        confirm: z.boolean().optional(),
      },
    },
    async ({ ids, confirm }) => {
      if (!confirm) {
        return textResult({
          error: "Set confirm: true to delete call agents.",
        });
      }
      return textResult(
        await client.delete("/api/whatsapp/calling/agents", { ids })
      );
    }
  );

  server.registerTool(
    "messlo_assign_call_agent",
    {
      description: "Assign a call agent to a contact.",
      inputSchema: {
        contact_id: z.string(),
        agent_id: z.string(),
      },
    },
    async (body) =>
      textResult(await client.post("/api/whatsapp/calling/assign-agent", body))
  );

  server.registerTool(
    "messlo_assign_call_agent_bulk",
    {
      description:
        "Bulk assign a call agent to contacts and/or contacts matching tags.",
      inputSchema: {
        agent_id: z.string(),
        contact_ids: z.array(z.string()).optional(),
        tag_ids: z.array(z.string()).optional(),
      },
    },
    async (body) =>
      textResult(
        await client.post("/api/whatsapp/calling/assign-agent-bulk", body)
      )
  );

  server.registerTool(
    "messlo_remove_call_agent",
    {
      description: "Remove call agent assignment from a contact.",
      inputSchema: {
        contact_id: z.string(),
      },
    },
    async ({ contact_id }) =>
      textResult(
        await client.delete(`/api/whatsapp/calling/remove-agent/${contact_id}`)
      )
  );

  server.registerTool(
    "messlo_list_call_logs",
    {
      description: "List WhatsApp call logs.",
      inputSchema: {
        page: z.number().int().min(1).optional(),
        limit: z.number().int().min(1).max(100).optional(),
        search: z.string().optional(),
        agentId: z.string().optional(),
        contact_id: z.string().optional(),
        phone_number_id: z.string().optional(),
      },
    },
    async (params) => {
      const qs = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) qs.set(key, String(value));
      }
      const q = qs.toString();
      return textResult(
        await client.get(`/api/whatsapp/calling/logs${q ? `?${q}` : ""}`)
      );
    }
  );

  server.registerTool(
    "messlo_get_call_log",
    {
      description: "Get one call log by id.",
      inputSchema: {
        log_id: z.string(),
      },
    },
    async ({ log_id }) =>
      textResult(await client.get(`/api/whatsapp/calling/logs/${log_id}`))
  );

  server.registerTool(
    "messlo_get_call_transcription",
    {
      description: "Get transcription for a call log.",
      inputSchema: {
        log_id: z.string(),
      },
    },
    async ({ log_id }) =>
      textResult(
        await client.get(`/api/whatsapp/calling/logs/${log_id}/transcription`)
      )
  );
}
