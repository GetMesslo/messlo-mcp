import * as z from "zod";
import { textResult } from "../utils/text.js";

export function registerAgentTools(server, client) {
  server.registerTool(
    "messlo_list_agents",
    {
      description:
        "List staff agents (for assign_agent automation nodes and chat assignment).",
      inputSchema: {
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(20),
        search: z.string().optional(),
      },
    },
    async ({ page, limit, search }) => {
      const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) qs.set("search", search);
      return textResult(await client.get(`/api/agent/all?${qs}`));
    }
  );

  server.registerTool(
    "messlo_get_agent",
    {
      description: "Get agent by id.",
      inputSchema: { agent_id: z.string() },
    },
    async ({ agent_id }) => {
      return textResult(await client.get(`/api/agent/${agent_id}`));
    }
  );

  server.registerTool(
    "messlo_list_teams",
    {
      description: "List teams (team_id required when creating agents).",
      inputSchema: {
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(100).optional().default(20),
      },
    },
    async ({ page, limit }) => {
      const qs = new URLSearchParams({ page: String(page), limit: String(limit) });
      return textResult(await client.get(`/api/teams?${qs}`));
    }
  );

  server.registerTool(
    "messlo_create_agent",
    {
      description: "Create a staff agent user.",
      inputSchema: {
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
        country_code: z.string().describe("e.g. +91"),
        phone: z.string(),
        team_id: z.string(),
        note: z.string().optional(),
        extra: z.record(z.unknown()).optional(),
      },
    },
    async ({ extra, ...body }) => {
      return textResult(
        await client.post("/api/agent/create", { ...body, ...(extra || {}) })
      );
    }
  );

  server.registerTool(
    "messlo_update_agent_status",
    {
      description: "Enable or disable an agent.",
      inputSchema: {
        agent_id: z.string(),
        status: z.boolean(),
      },
    },
    async ({ agent_id, status }) => {
      return textResult(
        await client.put(`/api/agent/${agent_id}/update/status`, { status })
      );
    }
  );

  server.registerTool(
    "messlo_assign_chat",
    {
      description:
        "Assign a WhatsApp conversation to an agent (or reassign). Use contact_id from messlo_list_chats.",
      inputSchema: {
        contact_id: z.string(),
        whatsapp_phone_number_id: z.string(),
        agent_id: z.string().optional(),
        chatbot_id: z.string().optional(),
      },
    },
    async ({ contact_id, whatsapp_phone_number_id, agent_id, chatbot_id }) => {
      if (!agent_id && !chatbot_id) {
        return textResult({
          error: "Provide agent_id or chatbot_id",
        });
      }
      return textResult(
        await client.post("/api/whatsapp/assign-chat", {
          contact_id,
          whatsapp_phone_number_id,
          agent_id,
          chatbot_id,
        })
      );
    }
  );
}
